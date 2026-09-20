import {ChangeDetectionStrategy, Component, ElementRef, inject, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {from, Observable, of} from 'rxjs';
import {auditTime, distinctUntilChanged, map, shareReplay, switchMap} from 'rxjs/operators';
import {NdeStoreService} from "../services/nde-store.service";
import {
    isFullDisplayPage,
    isReturnKeyPressed,
    mouseoutTooltip,
    mouseoverTooltip,
    selectIsLoggedIn,
    selectSearchState,
} from "../shared/common";
import {MatDivider} from "@angular/material/divider";
import {MatIcon} from "@angular/material/icon";
import {Store} from '@ngrx/store';
import {talisCacheManager} from "../shared/LocalStorageCacheManager";
import {getPnx} from "../shared/getPnx";

@Component({
    selector: 'custom-nde-content-indicators-custom',
    standalone: true,
    imports: [CommonModule, MatDivider, MatIcon],
    templateUrl: './nde-content-indicators-custom.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NdeContentIndicatorsCustomComponent {
    private elementRef = inject(ElementRef);

    @Input() hostComponent!: any;

    // Reactive flag used in the template
    hasContentAdvice$: Observable<boolean> = of(false);
    hasReadingList$: Observable<boolean> = of(false);

    private store = inject(Store);
    public searchState = this.store.selectSignal(selectSearchState);
    private loggedIn = this.store.selectSignal(selectIsLoggedIn);

    panelId = `uql-course-reading-list-sidebar-panel`;
    private readonly UNSAFE_READING_LIST_BASE_URL = 'http://lr.library.uq.edu.au';
    private readonly SAFE_READING_LIST_BASE_URL = 'https://uq.rl.talis.com';
    private matExpansionHeader: HTMLElement | null = null;

    private uuid = '';

    private TALIS_DOMAIN = 'https://uq.rl.talis.com/';

    constructor(private storeSvc: NdeStoreService) {}

    ngOnInit() {
        this.uuid = self.crypto.randomUUID();
        const record$ = this.storeSvc.getRecord$(this.hostComponent).pipe(
            // Defer to next microtask so we compute *after* the store settles to the new record
            auditTime(0),
            shareReplay({bufferSize: 1, refCount: true})
        );
        // Record stream: emits whenever Fullview selected record or Listview row record changes

        // set the 'if' on the html template to true when the pnx shows cultural advice needed
        this.hasContentAdvice$ = record$.pipe(
            map((record) => this.handleCulturalAdviceDisplay()),
            distinctUntilChanged()
        );

        this.hasReadingList$ = record$.pipe(
            switchMap(() => from(this.handleReadingListIndicatorAndListDisplay())),
            distinctUntilChanged()
        );
    }

    private async handleReadingListIndicatorAndListDisplay(): Promise<boolean> {
        this.removePreviousSidebar();
        return await this.displayCourseReadingListIndicator(this.hostComponent);
    }

    public displayCourseReadingListIndicator = (pnx: any) => {
        const nativeEl: HTMLElement = this.elementRef.nativeElement;

        let listTalisUrls: Array<string> = [];

        // climb up to parent wrapping the whole header
        let item: HTMLElement | null | undefined = nativeEl;
        let found:boolean = false;
        let valid = true;
        while (!found && valid) {
            item = item?.parentElement;
            found = item?.classList.contains('search-result-item') || false;

            valid = item?.nodeName.toLowerCase() !== 'nde-app-layout'; // if we have gone too high in the tree, quit
        }
        if (found) {
            const pnx = !!item && getPnx(this.searchState(), item);
            listTalisUrls = this.getListTalisUrls(pnx);
        }

        if (!listTalisUrls || listTalisUrls.length === 0) {
            return false;
        }

        return this.getTalisDataFromAnyApiCalls(listTalisUrls);
    }

    // we want to know if any of the talis are available, so we stop once we have a single success
    private async getTalisDataFromAnyApiCalls(listTalisUrls: string[]): Promise<boolean> {
        const courseList: { [key: string]: string } = {};
        const listUrlsToCall = listTalisUrls.filter(url => url.startsWith('http'));

        const COURSE_READING_FOUND = 'hascourse';
        const NO_COURSE_READING = 'nodata';

        let talisCache = talisCacheManager.getLocalStorageCache();
        let courseFound: string = '';
        let uncachedUrls: Array<string> = [];
        listUrlsToCall.forEach(talisUrl => {
            if (courseFound !== COURSE_READING_FOUND) {
                const talisCacheEntry = talisCache[talisUrl];
                if (talisCacheEntry && typeof talisCacheEntry?.courses !== 'undefined' && talisCacheEntry?.courses !== null) {
                    // we have a reading list
                    courseFound = COURSE_READING_FOUND;
                } else if (talisCacheEntry && typeof talisCacheEntry?.expiryDate !== 'undefined') {
                    // we have an entry in cache, so we dont need to fetch, but its not a reading list
                    courseFound = NO_COURSE_READING;
                } else {
                    // not in cache, we need to fetch it
                    uncachedUrls.push(talisUrl);
                }
            }
        })
        if (courseFound === COURSE_READING_FOUND) {
            if (isFullDisplayPage()) {
                const pnx = this.hostComponent;

                const pageTitle = document.querySelector('nde-record-title h3');

                // this is bodgy, but the first record on a search shows the CRL sidebar of an actual CRL record further down the referring search list?!?!?!
                // and none of the pnx ids match!!!! :(
                // "startsWith" is because the author is included in the displayed title
                if (pnx?.display?.title && pageTitle?.innerHTML?.trim().startsWith(pnx?.display?.title)) {
                    await this.getTalisDataFromAllApiCalls(listTalisUrls);
                }
            }
            return true;
        } else if (courseFound === NO_COURSE_READING) {
            return false; // no need to fetch, but not a reading list either
        }

        if (uncachedUrls.length === 0) {
            return false; // nothing left to fetch
        }
        let hasCourses = false;
        const makeRequest = (url: string) =>
            new Promise<{ [key: string]: string }>((resolve, reject) => {
                const callbackName = `talis_cb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
                const script = document.createElement('script');

                const cleanup = () => {
                    delete (window as any)[callbackName];
                    script.remove();
                };

                (window as any)[callbackName] = (data: { [key: string]: string }) => {
                    resolve(data);
                    cleanup();
                };

                script.onerror = () => {
                    reject(new Error(`Failed to fetch: ${url}`));
                    cleanup();
                };

                script.src = `${url}?cb=${callbackName}`;
                document.head.appendChild(script);
            });

        let cacheChanged = false;
        try {
            let data: { [key: string]: string } | null = null;
            for (const url of uncachedUrls) {
                try {
                    data = await makeRequest(url);

                    talisCache[url] = talisCacheManager.formattedCacheEntry(data)
                    cacheChanged = true;

                    break; // success — stop trying further urls
                } catch (e) {
                    // this url failed, try the next one
                    talisCache[url] = talisCacheManager.formattedCacheEntry(null);
                    cacheChanged = true;
                }
            }

            for (const talisUrl in data) {
                if (!courseList[talisUrl]) {
                    courseList[talisUrl] = data[talisUrl];
                }
            }
            if (cacheChanged) {
                talisCacheManager.saveLocalStorageCache(talisCache);
            }
            if (Object.keys(courseList).length > 0) {
                hasCourses = true;
            }
        } catch (e) {
            // Promise.any throws AggregateError if ALL urls fail
            // no talis at all for this record
        }

        // we know this record has a CRL - now show the sidebar panel
        if (isFullDisplayPage() && hasCourses) {
            await this.getTalisDataFromAllApiCalls(listTalisUrls);
        }
        return hasCourses;
    }

    // that first talis api that getTalisDataFromAnyApiCalls called will now be cached, so it isn't re-called
    private async getTalisDataFromAllApiCalls(listUrls: string[]): Promise<boolean> {
        let courseList: { [key: string]: string } = {};

        const pnxId = this.hostComponent?.display?.identifier;

        const listUrlsToCall = listUrls.filter(url => url.startsWith('http'));

        // load valid (non-expired) cache entries
        let talisCache = talisCacheManager.getLocalStorageCache();

        // split urls into ones we already have cached, and ones we still need to fetch
        const pnxUrlsNeedingFetch: string[] = [];
        listUrlsToCall.forEach(talisUrl => {
            const talisCacheEntry = talisCache[talisUrl];
            if (talisCacheEntry && typeof talisCacheEntry?.courses !== 'undefined') {
                if (typeof courseList === 'undefined') {
                    courseList = {};
                }
                for (let url in talisCacheEntry?.courses) {
                    courseList[talisCacheEntry?.courses[url]] = url;
                }

            } else {
                // not in cache, we need to fetch it
                pnxUrlsNeedingFetch.push(talisUrl);
            }
        });
        const promises = pnxUrlsNeedingFetch.map(url =>
            new Promise<{ [key: string]: string } | null>((resolve) => {
                const callbackName = `talis_cb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
                const script = document.createElement('script');

                (window as any)[callbackName] = (data: { [key: string]: string }) => {
                    resolve(data);
                    cleanup();
                };

                script.onerror = () => {
                    resolve(null);
                    cleanup();
                };

                const cleanup = () => {
                    delete (window as any)[callbackName];
                    script.remove();
                };

                script.src = `${url}?cb=${callbackName}`;
                document.head.appendChild(script);
            })
        );

        let hasCourses = false;
        try {
            let cacheChanged = false;
            await Promise.allSettled(promises)
                .then(responses => {
                    responses.forEach((result, index) => {
                        const requestedUrl = pnxUrlsNeedingFetch[index];
                        if (result.status !== 'fulfilled' || !result?.value) {
                            !!requestedUrl && (talisCache[requestedUrl] = talisCacheManager.formattedCacheEntry(null));
                            cacheChanged = true;
                            return;
                        }
                        const data = result.value; // now typed as {[key: string]: string}
                        for (const talisUrl in data) {
                            const subjectCode = data[talisUrl];
                            if (!courseList[talisUrl]) {
                                !courseList[subjectCode] && (courseList[subjectCode] = talisUrl);
                            }
                        }
                        // write freshly-fetched value into localStorage cache
                        !!requestedUrl && (talisCache[requestedUrl] = talisCacheManager.formattedCacheEntry(result.value));
                        cacheChanged = true;
                    });
                }).finally(() => {
                    if (Object.keys(courseList).length > 0) {
                        hasCourses = true;

                        // sort by coursecode for display
                        courseList = Object.keys(courseList)
                            .sort()
                            .reduce((prev: {[key: string]: string}, subjCode) => {
                                    prev[subjCode] = courseList[subjCode];
                                    return prev;
                                },
                                {}
                            );

                        this.createAndAppendCourseList(courseList);
                    }
                    if (cacheChanged) {
                        talisCacheManager.saveLocalStorageCache(talisCache);
                    }
                });
        } catch (e) {
            console.log('Course reading list [full] error', e);
        }

        const newcourseList = {
            id: pnxId,
            courses: courseList,
        };
        return hasCourses;
    }

    private fixUnsafeReadingListUrl(url: string) {
        return url.replace(this.UNSAFE_READING_LIST_BASE_URL, this.SAFE_READING_LIST_BASE_URL);
    }

    private addUrlParam(url: string | string[], name: string, value: boolean | undefined) {
        const param = value !== undefined ? `${name}=${value}` : name;
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}${param}`;
    }

    private createAndAppendCourseList(talisCourses: any) {
        const isLoggedIn = this.loggedIn();

        const linkOutIcon: string =
            '<mat-icon class="linkOut" role="img" color="primary" class="mat-icon notranslate nde-mat-icon-size-default primary-stroke mat-primary ng-star-inserted" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="GES">' +
            '<svg width="16" height="16" viewBox="0 0 24 24">' +
            '<path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"></path>' +
            '</svg>' +
            '</mat-icon>';
        // arrow buttons are flipped with css, rather than having a second svg
        const showMoreLessArrow = `<svg class="showMoreLessArrow" width="100%" height="100%" viewBox="0 0 24 25" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">
                <mask id="mask0_882_2211" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="25">
                    <rect y="0.5" width="24" height="24"></rect>
                </mask>
                <g mask="url('/nde/fulldisplay?context=PC&amp;vid=61UQ_INST:61UQ_NDEUI_DALTS&amp;search_scope=61UQ_All&amp;lang=en&amp;docid=cdi_proquest_miscellaneous_3198305176#mask0_882_2211')">
                    <path d="M11.9998 15.45C11.8665 15.45 11.7415 15.4292 11.6248 15.3875C11.5081 15.3458 11.3998 15.275 11.2998 15.175L6.6998 10.575C6.51647 10.3917 6.4248 10.1583 6.4248 9.87499C6.4248 9.59166 6.51647 9.35833 6.6998 9.17499C6.88314 8.99166 7.11647 8.89999 7.3998 8.89999C7.68314 8.89999 7.91647 8.99166 8.0998 9.17499L11.9998 13.075L15.8998 9.17499C16.0831 8.99166 16.3165 8.89999 16.5998 8.89999C16.8831 8.89999 17.1165 8.99166 17.2998 9.17499C17.4831 9.35833 17.5748 9.59166 17.5748 9.87499C17.5748 10.1583 17.4831 10.3917 17.2998 10.575L12.6998 15.175C12.5998 15.275 12.4915 15.3458 12.3748 15.3875C12.2581 15.4292 12.1331 15.45 11.9998 15.45Z"></path>
                </g>
            </svg>`;
        const headerArrow = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden="true" focusable="false"><path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z"></path></svg>`;

        const buttonId = 'toggle-long-crl';
        const buttonLabelId = 'toggle-long-crl-label';
        const buttonLabelShowAll = 'Show all'; // initial value
        const buttonLabelShowLess = 'Show less';
        const maxNumberReadingListsDisplayed = 5; // when there are a lot of course, we show a 'show all' button when there are more than this number
        const crlHiddenClass = 'uql-crl-list-hidden'; // courses which are actually hidden, add/remove this classname
        const crlHideableClass = `uql-crl-list-hideable`; // courses which are > maxNumberReadingListsDisplayed, add this classname so we find it to add/remove crlHiddenClass

        // note that we don't need to make it update on change of login state
        // because log IN on prod goes through auth and reloads the page
        // and log OUT goes off to a different page
        // on sandbox (with exlibris login) this will not update on change
        const loginPrompt = (loggedIn: boolean) => !loggedIn
            ? '<div id="crl-login-banner" _ngcontent-ng-crl="" class="text-size-normal crl-login-banner">UQ login required.</div>'
            : '';
        let htmlContent = `<${this.panelId} _nghost-ng-crl="" class="ng-star-inserted">
            <nde-collapsible-box _ngcontent-ng-crl="" class="course-reading-list-container" _nghost-ng-crl="">
                <mat-expansion-panel _ngcontent-ng-crl="" tabindex="-1" class="mat-expansion-panel mat-elevation-z0 mat-expanded mat-expansion-panel-animations-enabled">
                    <mat-expansion-panel-header _ngcontent-ng-crl="" role="button"
                            class="mat-expansion-panel-header mat-focus-indicator with-tooltip-anchor mat-expanded"
                            aria-labelledby="title.Course Reading Lists" id="mat-expansion-panel-header-crl"
                            tabindex="0" aria-controls="cdk-accordion-child-crl" aria-expanded="true"
                            aria-disabled="false">
                        <span class="mat-content" id="crl-sidebar-heading-wrapper">
                            <h2 _ngcontent-ng-crl="" id="title.Course Reading Lists">Course Reading Lists</h2>
                            <span _ngcontent-ng-crl="" mattooltipposition="below" aria-hidden="true"
                                class="mat-mdc-tooltip-trigger tooltip-anchor" aria-describedby="cdk-describedby-message-ng-crl"
                                cdk-describedby-host="ng-1">
                            </span>
                        </span>
                        <span id="uql-mat-expansion-panel-header-button" class="mat-expansion-indicator ng-star-inserted">
                            ${headerArrow}
                        </span>
                    </mat-expansion-panel-header>
                    <div class="mat-expansion-panel-content-wrapper">
                        <div role="region" id="uql-accordion-child-crl" class="mat-expansion-panel-content" id="cdk-accordion-child-crl" aria-labelledby=mat-expansion-panel-header-crl">
                            <div class="mat-expansion-panel-body">
                                ${loginPrompt(isLoggedIn)}
                                <p _ngcontent-ng-crl="" id="search-within-desc" class="mat-body-medium">This resource is listed on</p>
                                <ul class="course-resource-list">`;
        let numberOfReadingLists = 0;
        for (const [displayName, url] of Object.entries(talisCourses) as [string, string][]) {
            let linkedUrl = this.fixUnsafeReadingListUrl(url);
            linkedUrl = this.addUrlParam(linkedUrl, 'login', true);
            const className = numberOfReadingLists < maxNumberReadingListsDisplayed ? 'uql-crl-list-constant': `${crlHideableClass} ${crlHiddenClass}`;
            htmlContent += `<li class="uql-crl-list ${className}">
                <a class="uql-crl-list-item" href="${linkedUrl}" target="_blank">
                    <span>${displayName}</span>
                    ${linkOutIcon}
                </a></li>`;
            numberOfReadingLists++;
        }
        htmlContent += `</ul>`;
        if (numberOfReadingLists > maxNumberReadingListsDisplayed) {
            htmlContent += `
<div class="toggle-show-all-button">
    <button id="${buttonId}" _ngcontent-ng-crl="" mat-button="" data-qa="full-display-crl-show-more-btn" mat-ripple-loader-class-name="mat-mdc-button-ripple" class="mdc-button mat-mdc-button mat-unthemed mat-mdc-button-base" aria-label="Click for more suggestions">
        <span class="mat-mdc-button-persistent-ripple mdc-button__ripple"></span>
        <span class="mdc-button__label">
            <span _ngcontent-ng-crl="" class="button-label flex-row">
                <span id="${buttonLabelId}">
                    ${buttonLabelShowAll}
                </span>
                <mat-icon _ngcontent-ng-crl="" role="img" class="toggle-long-crl-icon mat-icon notranslate mat-icon-no-color ng-star-inserted" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="Arrow-down-black">
                    ${showMoreLessArrow}
                </mat-icon>
            </span>
        </span>
        <span class="mat-focus-indicator"></span>
        <span class="mat-mdc-button-touch-target"></span>
        <span class="mat-ripple mat-mdc-button-ripple"></span>
    </button>
</div>`;
        }
        htmlContent += `</div>
                </div>
            </div>
        </mat-expansion-panel>
    </nde-collapsible-box>
</uql-course-reading-list-sidebar-panel>`;
        const template = document.createElement('template');
        template.innerHTML = htmlContent;

        const that = this;

        let targetElement = document.querySelector('nde-full-display-side-bar');
        // if the sidebar doesn't exist then this page has no sidebar children so we have to create it
        if (!targetElement) {
            const parentElement = document.querySelector('.full-view-content');
            if (!parentElement) {
                // should always exist
                return;
            }

            const sidebarHtmlWrapper =
                `<div _ngcontent-ng-crl="" class="flex-column full-view-right-content ng-star-inserted" id="createdSidebar">
                    <nde-full-display-side-bar _ngcontent-ng-crl=""></nde-full-display-side-bar>
                </div>`;
            const sidebarTemplate = document.createElement('template');
            sidebarTemplate.innerHTML = sidebarHtmlWrapper;
            !!sidebarTemplate && parentElement?.appendChild(sidebarTemplate.content.cloneNode(true));

            targetElement = document.querySelector('nde-full-display-side-bar');
        }

        // Insert the course list as the first child of the target element
        !!targetElement && targetElement.prepend(template.content.cloneNode(true));

        // handle the "Show all" / "Show less" button click when there are many courses
        const longToggleButton = document.getElementById(buttonId);
        const longToggleButtonLabel = document.getElementById(buttonLabelId);
        !!longToggleButton && longToggleButton.addEventListener('click', function (event) {
            const hiddenCRL = document.querySelectorAll(`.${crlHiddenClass}`);
            if (hiddenCRL?.length > 0) {
                // hiding the entries - show them
                hiddenCRL.forEach(c => c.classList.remove(crlHiddenClass))
                !!longToggleButtonLabel && (longToggleButtonLabel.innerHTML = buttonLabelShowLess);
                !!longToggleButton && !longToggleButton.classList.contains('noneHidden') && longToggleButton.classList.add('noneHidden');
            } else {
                // visible entries - hide them
                const hideableCRL = document.querySelectorAll(`.${crlHideableClass}`);
                hideableCRL?.forEach(c => c.classList.add(crlHiddenClass));
                !!longToggleButtonLabel && (longToggleButtonLabel.innerHTML = buttonLabelShowAll);

                const sidebarWrapper = document.getElementById('crl-sidebar-heading-wrapper');
                if (!!sidebarWrapper && !that.isVisible(sidebarWrapper)) {
                    // scroll the top into view, IF the top is currently off the page (rather than leaving it floating in the middle of the page)
                    document.getElementById('mat-expansion-panel-header-crl')?.scrollIntoView();
                }
                !!longToggleButton && longToggleButton.classList.contains('noneHidden') && longToggleButton.classList.remove('noneHidden');
            }
        });

        this.matExpansionHeader = document.getElementById('mat-expansion-panel-header-crl');

        // when they tab into the panel header, give it a big border and background colour
        !!this.matExpansionHeader && this.matExpansionHeader.addEventListener("focusin", (event) => {
            if (!!this.matExpansionHeader) {
                !this.matExpansionHeader.classList.contains('cdk-focused') && this.matExpansionHeader.classList.add('cdk-focused')
                !this.matExpansionHeader.classList.contains('cdk-keyboard-focused') && this.matExpansionHeader.classList.add('cdk-keyboard-focused')
            }
        })
        !!this.matExpansionHeader && this.matExpansionHeader.addEventListener("focusout", (event) => {
            this.removeClickStyles();
        })

        const crlTooltipId = 'crlLabel';

        // handle the collapse-expand of the panel, mimicking the built-in
        !!this.matExpansionHeader && this.matExpansionHeader.addEventListener('mousedown', function (event) {
            event.preventDefault();
            that.togglePanel(crlTooltipId);
        });
        !!this.matExpansionHeader && this.matExpansionHeader.addEventListener('keydown', function (event) {
            if (!isReturnKeyPressed(event)) {
                return;
            }
            event.preventDefault();
            that.togglePanel(crlTooltipId);
        });

        // supply tooltip on hover
        const panelToggleButton = document.getElementById('uql-mat-expansion-panel-header-button');
        !!this.matExpansionHeader && this.matExpansionHeader.addEventListener('mouseover', function () {
            const listArea1 = document.getElementById('uql-accordion-child-crl');
            let mouseOverPrefix = listArea1?.style.visibility === 'hidden' ? 'Expand' : 'Collapse';
            const mouseOverLabel = `${mouseOverPrefix} Course reading lists`;
            !!panelToggleButton && mouseoverTooltip(panelToggleButton, mouseOverLabel, crlTooltipId);
        });
        !!this.matExpansionHeader && this.matExpansionHeader.addEventListener('mouseout', function () {
            mouseoutTooltip(crlTooltipId);
        });

        // now watch for the original sidebar to appear - if it does, move our element and delete our sidebar
        const waitOnSuppliedSidebar = setInterval(() => {
            const suppliedSidebar = document.querySelector('.full-view-right-content:not(#createdSidebar)');
            if (!suppliedSidebar) {
                return;
            }
            clearInterval(waitOnSuppliedSidebar);

            const ourCrlPanel = document.querySelector('uql-course-reading-list-sidebar-panel');
            !!ourCrlPanel && suppliedSidebar?.insertBefore(ourCrlPanel, suppliedSidebar.firstChild);
        }, 100);
    }

    private isVisible(elm: HTMLElement | Element,) {
        const rect = elm.getBoundingClientRect();
        const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
        return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
    }

    private removeClickStyles = () => {
        if (!!this.matExpansionHeader) {
            this.matExpansionHeader.classList.contains('cdk-focused') && this.matExpansionHeader.classList.remove('cdk-focused')
            this.matExpansionHeader.classList.contains('cdk-keyboard-focused') && this.matExpansionHeader.classList.remove('cdk-keyboard-focused')
        }
    }
    private togglePanel = (crlTooltipId: any) => {
        const panel = document.querySelector('uql-course-reading-list-sidebar-panel');

        const listArea = document.getElementById('uql-accordion-child-crl');

        const panelHeader = panel?.querySelector('mat-expansion-panel-header');
        panelHeader?.classList.toggle('mat-expanded');

        if (!!listArea) {
            panelHeader?.setAttribute('aria-expanded', listArea.style.visibility === 'hidden' ? 'true' : 'false');
            listArea.style.visibility = listArea.style.visibility === 'hidden' ? 'visible' : 'hidden';
            listArea.style.unicodeBidi = listArea.style.height === '0px' ? '' : 'isolate';
            listArea.style.height = listArea.style.height === '0px' ? '' : '0px';
        }

        this.removeClickStyles();

        mouseoutTooltip(crlTooltipId);
    }

    private removePreviousSidebar = () => {
        if (!isFullDisplayPage()) {
            return;
        }
        // if we are next-prev between pages, remove the old CRL sidebar
        const previousReadingListSidebar = document.querySelectorAll(this.panelId);
        previousReadingListSidebar?.length > 0 && previousReadingListSidebar.forEach(b => b.remove());

        // if removing that leaves the sidebar empty, remove it too
        const ndeSidebar = document.querySelector('div.full-view-right-content:has(> nde-full-display-side-bar)');
        // we cant do a straight "no children" because they include all these dumb '<!---->' in there! :(
        if (!!ndeSidebar && !ndeSidebar?.innerHTML?.toString().includes('nde-collapsible-box')) {
            // no contents now, remove the sidebar too
            ndeSidebar.remove();
        }
    }

    // a record needs a cultural advice label if the record has a lds04 entry
    private handleCulturalAdviceDisplay(): boolean {
        // remove the banner if it's left over from a previous view
        // (eg search, then record with CA, then next-record-arrow to record without CA)
        const bannerId = `culturalAdviceBanner`;
        const previousCulturalAdviceBanner = document.getElementById(bannerId);
        !!previousCulturalAdviceBanner && previousCulturalAdviceBanner.remove();

        const needsCulturalAdvice = !!this.hostComponent?.display?.lds04 ?? null;

        // add a banner to the page if it's a full record
        if (isFullDisplayPage() && needsCulturalAdvice) {
            const html = `
<div id="${bannerId}" class="standardWarningBanner" data-testid="cultural-advice-banner">
    <div class="uq-icon uq-icon--standard--exclamation-triangle"></div>
    <p>${this.hostComponent.display.lds04}</p>
</div>`;
            const template = document.createElement('template');
            template.innerHTML = html;
            const parentElement = document.querySelector(`nde-search-result-item-container`);
            !!parentElement && parentElement.appendChild(template.content.cloneNode(true));
        }
        return needsCulturalAdvice;
    }

    private getListTalisUrls = (pnx: any) => {
        // Material types that should not use ISBN/ISSN lookups
        const RESTRICTED_CHECK_LIST = [
                'article',
                'book_chapter',
                'conference_paper',
                'conference_proceeding',
                'dataset',
                'design',
                'government_document',
                'magazinearticle',
                'magazine_article',
                'market_research',
                'newsletterarticle',
                'newsletter_article',
                'newspaper_article',
                'patent',
                'questionnaire',
                'reference_entry',
                'report',
                'review',
                'web_resource',
                'working_paper',
            ];
        const list: string[] = [];

        const materialType = pnx?.display?.type?.[0];
        const isRestrictedCheckType = RESTRICTED_CHECK_LIST.includes(materialType);
        const lcnPattern = (r: string) => {
            return `${this.TALIS_DOMAIN}lcn/${r}/lists.json`;
        }

        // LCN (Library Control Number)
        console.log('###', this.uuid,'crl: pnx=', pnx);
        if (pnx?.control?.sourcerecordid?.length > 0) {
            pnx.control.sourcerecordid.forEach((r: string) => {
                list.push(lcnPattern(r));
            });
        }
        if (pnx?.display?.dedupmemberids?.length > 0) {
            pnx.display.dedupmemberids.forEach((r: string) => {
                if (!list.includes(lcnPattern(r))) {
                    list.push(lcnPattern(r));
                }
            });
        }
        if (pnx?.display?.mms?.length > 0) {
            pnx.display.mms.forEach((r: string) => {
                if (!list.includes(lcnPattern(r))) {
                    list.push(lcnPattern(r));
                }
            });
        }

        // DOI
        if (pnx?.addata?.doi?.length > 0) {
            pnx.addata.doi.forEach((r: string) => {
                list.push(`${this.TALIS_DOMAIN}doi/${r}/lists.json`);
            });
        }

        // EISBN (Electronic ISBN)
        if (!isRestrictedCheckType && pnx?.addata?.eisbn?.length > 0) {
            pnx.addata.eisbn.forEach((r: string) => {
                const isbn = r.replace(/[^0-9X]+/gi, '');
                if ([10, 13].includes(isbn.length)) {
                    list.push(`${this.TALIS_DOMAIN}eisbn/${isbn}/lists.json`);
                }
            });
        }

        // ISBN
        if (!isRestrictedCheckType && pnx?.addata?.isbn?.length > 0) {
            pnx.addata.isbn.forEach((r: string) => {
                const isbn = r.replace(/[^0-9X]+/gi, '');
                if ([10, 13].includes(isbn.length)) {
                    list.push(`${this.TALIS_DOMAIN}isbn/${isbn}/lists.json`);
                }
            });
        }

        // EISSN (Electronic ISSN)
        if (!isRestrictedCheckType && pnx?.addata?.eissn?.length > 0) {
            pnx.addata.eissn.forEach((r: string) => {
                list.push(`${this.TALIS_DOMAIN}eissn/${r}/lists.json`);
            });
        }

        // ISSN
        if (!isRestrictedCheckType && pnx?.addata?.issn?.length > 0) {
            pnx.addata.issn.forEach((r: string) => {
                list.push(`${this.TALIS_DOMAIN}issn/${r}/lists.json`);
            });
        }

        console.log('###', this.uuid,'crl: list=', list);
        return list;
    }
}
