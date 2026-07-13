import {inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {isReturnKeyPressed, mouseoverTooltip, mouseoutTooltip, pnxInterface, selectSearchState} from "../shared/common";
import {courseReadingListIndicatorHtml, getListTalisUrls} from "../shared/courseReadingListResources";

const TALIS_CACHE_KEY = 'uqlTalisCourseList';
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // prod
const TEN_MINUTES_MS = 10 * 60 * 1000; // debug, maybe sandbox?
const CACHE_LENGTH_MS = TEN_MINUTES_MS;

interface CacheEntry {
    date: number;
    courseCode: string;
}
type Cache = Record<string, CacheEntry>;

class LocalStorageCacheManager {
    private static instance: LocalStorageCacheManager;
    private static expiryPeriodMilliseconds: number;
    private static cacheName: string;
    private cache: Cache = {};

    // fallback mutex chain, used only if navigator.locks isn't available
    private fallbackLocks: Map<string, Promise<void>> = new Map();

    // no constructor on singleton
    private constructor() {}

    public static getInstance(cacheName: string, expiryPeriodMilliseconds: number): LocalStorageCacheManager {
        this.expiryPeriodMilliseconds = expiryPeriodMilliseconds;
        this.cacheName = cacheName;

        if (!LocalStorageCacheManager.instance) {
            LocalStorageCacheManager.instance = new LocalStorageCacheManager();
        }
        return LocalStorageCacheManager.instance;
    }

    public saveLocalStorageCache(cache: Cache) {
        try {
            console.log('cch### saveLocalStorageCache cache=', LocalStorageCacheManager.cacheName, cache);
            localStorage.setItem(LocalStorageCacheManager.cacheName, JSON.stringify(cache));
        } catch (e) {
            // localStorage might be full or unavailable; fail silently
        }
    }

    // write all the talis entries in one local storage entry
    public getLocalStorageCache(): any {
        try {
            if (Object.keys(this.cache).length === 0) {
                this.cache = JSON.parse(localStorage.getItem(LocalStorageCacheManager.cacheName) || '') || {};
                console.log('cch### getLocalStorageCache 1 read cache=', this.cache);
            } else {
                console.log('cch### getLocalStorageCache 1 cache known=', this.cache);
            }
        } catch (e) {
            this.cache = {};
        }

        let changed = this.cleanCacheList();
        if (changed) {
            console.log('cch### getLocalStorageCache 3 updating cache=', this.cache);
            this.saveLocalStorageCache(this.cache);
        }
        return this.cache;
    }

    // strip out anything older than the defined expiry period (initial planning: one day)
    private cleanCacheList = () => {
        const now = Date.now();
        let changed = false;
        for (const url in this.cache) {
            if (!this.cache[url] || !this.cache[url].date || (now - this.cache[url].date) >  LocalStorageCacheManager.expiryPeriodMilliseconds) {
                console.log('cch### getLocalStorageCache 2 clearing', this.cache[url]);
                delete this.cache[url];
                changed = true;
            } else {
                console.log('cch### getLocalStorageCache 2 cache valid for:', this.cache[url].date, url);
            }
        }
        return changed;
    }
}
const cacheManager = LocalStorageCacheManager.getInstance(TALIS_CACHE_KEY, CACHE_LENGTH_MS);

export class CourseReadingListFullFunctions {
    private store = inject(Store);
    searchState = this.store.selectSignal(selectSearchState);

    private readonly UNSAFE_READING_LIST_BASE_URL = 'http://lr.library.uq.edu.au';
    private readonly SAFE_READING_LIST_BASE_URL = 'https://uq.rl.talis.com';

    private matExpansionHeader: HTMLElement | null = null;

    public displayCourseReadingListIndicatorAndList = (pnx: pnxInterface) => {
        const listTalisUrls = getListTalisUrls(pnx);
        if (!listTalisUrls || listTalisUrls.length === 0) {
            return;
        }

        if (!!listTalisUrls && listTalisUrls.length > 0) {
            this.getTalisDataFromAllApiCalls(listTalisUrls, pnx);
        }
    }

    private async getTalisDataFromAllApiCalls(listUrls: string[], pnx: any) {
        let courseList: { [key: string]: string } = {};
        const listUrlsToCall = listUrls.filter(url => url.startsWith('http'));

        // load valid (non-expired) cache entries
        let talisCache = cacheManager.getLocalStorageCache();
        // talisCache = cacheManager.cleanCacheList();

        // split urls into ones we already have cached, and ones we still need to fetch
        const pnxUrlsNeedingFetch: string[] = [];
        listUrlsToCall.forEach(talisUrl => {
            const talisCacheElement = talisCache[talisUrl];
            if (talisCacheElement && typeof talisCacheElement?.courses !== 'undefined') {
                if (typeof courseList === 'undefined') {
                    courseList = {};
                }
                for (let url in talisCacheElement?.courses) {
                    courseList[talisCacheElement?.courses[url]] = url;
                }

            } else {
                // not in cache, we need to fetch it
                pnxUrlsNeedingFetch.push(talisUrl);
            }
            // courseList = Object.keys(courseList)
            //     .sort()
            //     // .reduce((prev, subjCode) => {
            //     .reduce((prev: {[key: string]: string}, subjCode) => {
            //             prev[subjCode] = courseList[subjCode];
            //             return prev;
            //         },
            //         {}
            //     );
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

        try {
            let cacheChanged = false;
            await Promise.allSettled(promises)
                .then(responses => {
                    responses.forEach((result, index) => {
                        if (result.status !== 'fulfilled' || !result?.value) {
                            return;
                        }
                        const data = result.value; // now typed as {[key: string]: string}
                        for (const talisUrl in data) {
                            const subjectCode = data[talisUrl];
                            if (!courseList[talisUrl]) {
                                !courseList[subjectCode] && (courseList[subjectCode] = talisUrl);
                            }

                            // write freshly-fetched value into localStorage cache
                            const requestedUrl = pnxUrlsNeedingFetch[index];
                            if (!!requestedUrl) {
                                talisCache[requestedUrl] = {
                                    courses: result.value,
                                    date: Date.now()
                                }
                                cacheChanged = true;
                            }
                        }
                    });
                }).finally(() => {
                    if (Object.keys(courseList).length > 0) {
                        this.addCourseResourceIndicatorToHeader();

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
                        cacheManager.saveLocalStorageCache(talisCache);
                    }
                });
        } catch (e) {
            console.log('Course reading list [full] error', e);
        }
    }

    private createAndAppendCourseList(talisCourses: { [s: string]: string; } | ArrayLike<unknown>) {
        const linkOutIcon: string =
            '<mat-icon style="height: 20px; width: 18px;" role="img" color="primary" class="mat-icon notranslate nde-mat-icon-size-default primary-stroke mat-primary ng-star-inserted" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="GES">' +
            '<svg width="16" height="16" viewBox="0 0 24 24">' +
            '<path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"></path>' +
            '</svg>' +
            '</mat-icon>';

        const buttonId = 'toggle-long-crl';
        const buttonLabelId = 'toggle-long-crl-label';
        const buttonLabelShowAll = 'Show all'; // initial value
        const buttonLabelShowLess = 'Show less';
        const maxNumberReadingListsDisplayed = 5; // when there are a lot of course, we show a 'show all' button when there are more than this number
        const crlHiddenClass = 'uql-crl-list-hidden'; // courses which are actually hidden, add/remove this classname
        const crlHideableClass = `uql-crl-list-hideable`; // courses which are > maxNumberReadingListsDisplayed, add this classname so we find it to add/remove crlHiddenClass

        const targetElement = document.querySelector('nde-full-display-side-bar');

        let htmlContent = `<uql-course-reading-list-sidebar-panel _nghost-ng-crl="" class="ng-star-inserted">
            <nde-collapsible-box _ngcontent-ng-crl="" class="course-reading-list-container" _nghost-ng-crl="">
                <mat-expansion-panel _ngcontent-ng-crl="" tabindex="-1" class="mat-expansion-panel mat-elevation-z0 mat-expanded mat-expansion-panel-animations-enabled">
                    <mat-expansion-panel-header _ngcontent-ng-crl="" role="button"
                            class="mat-expansion-panel-header mat-focus-indicator with-tooltip-anchor mat-expanded"
                            aria-labelledby="title.Course Reading Lists" id="mat-expansion-panel-header-crl"
                            tabindex="0" aria-controls="cdk-accordion-child-crl" aria-expanded="true"
                            aria-disabled="false">
                        <span class="mat-content">
                            <h2 _ngcontent-ng-crl="" id="title.Course Reading Lists">Course Reading Lists</h2>
                            <span _ngcontent-ng-crl="" mattooltipposition="below" aria-hidden="true"
                                class="mat-mdc-tooltip-trigger tooltip-anchor" aria-describedby="cdk-describedby-message-ng-crl"
                                cdk-describedby-host="ng-1">
                            </span>
                        </span>
                        <span id="uql-mat-expansion-panel-header-button" class="mat-expansion-indicator ng-star-inserted">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden="true" focusable="false"><path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z"></path></svg>
                        </span>
                    </mat-expansion-panel-header>
                    <div class="mat-expansion-panel-content-wrapper">
                        <div role="region" id="uql-accordion-child-crl" class="mat-expansion-panel-content" id="cdk-accordion-child-crl" aria-labelledby=mat-expansion-panel-header-crl">
                            <div class="mat-expansion-panel-body">
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
        if (numberOfReadingLists >= maxNumberReadingListsDisplayed) {
            htmlContent += `<div class="toggle-show-all-button">
    <button id="${buttonId}" _ngcontent-ng-crl="" mat-button="" data-qa="full-display-crl-show-more-btn" mat-ripple-loader-class-name="mat-mdc-button-ripple" class="mdc-button mat-mdc-button mat-unthemed mat-mdc-button-base" aria-label="Click for more suggestions">
        <span class="mat-mdc-button-persistent-ripple mdc-button__ripple"></span>
        <span class="mdc-button__label">
            <span _ngcontent-ng-crl="" class="button-label flex-row">
                <span id="${buttonLabelId}">
                    ${buttonLabelShowAll}
                </span>
                <mat-icon _ngcontent-ng-crl="" role="img" class="toggle-long-crl-icon mat-icon notranslate mat-icon-no-color ng-star-inserted" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="Arrow-down-black">
                    <svg width="100%" height="100%" viewBox="0 0 24 25" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">
                        <mask id="mask0_882_2211" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="25">
                            <rect y="0.5" width="24" height="24"></rect>
                        </mask>
                        <g mask="url('/nde/fulldisplay?context=PC&amp;vid=61UQ_INST:61UQ_NDEUI_DALTS&amp;search_scope=61UQ_All&amp;lang=en&amp;docid=cdi_proquest_miscellaneous_3198305176#mask0_882_2211')">
                            <path d="M11.9998 15.45C11.8665 15.45 11.7415 15.4292 11.6248 15.3875C11.5081 15.3458 11.3998 15.275 11.2998 15.175L6.6998 10.575C6.51647 10.3917 6.4248 10.1583 6.4248 9.87499C6.4248 9.59166 6.51647 9.35833 6.6998 9.17499C6.88314 8.99166 7.11647 8.89999 7.3998 8.89999C7.68314 8.89999 7.91647 8.99166 8.0998 9.17499L11.9998 13.075L15.8998 9.17499C16.0831 8.99166 16.3165 8.89999 16.5998 8.89999C16.8831 8.89999 17.1165 8.99166 17.2998 9.17499C17.4831 9.35833 17.5748 9.59166 17.5748 9.87499C17.5748 10.1583 17.4831 10.3917 17.2998 10.575L12.6998 15.175C12.5998 15.275 12.4915 15.3458 12.3748 15.3875C12.2581 15.4292 12.1331 15.45 11.9998 15.45Z"></path>
                        </g>
                    </svg>
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

        // Insert the course list as the first child of the target element
        !!targetElement && targetElement.prepend(template.content.cloneNode(true));

        // handle the "Show all" / "Show less" button click when there are many courses
        const longToggleButton = document.getElementById(buttonId);
        const longToggleButtonLabel = document.getElementById(buttonLabelId);
        // const longToggleButtonIcon = document.getElementById('toggle-long-crl-icon');
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
                hideableCRL?.forEach(c =>  c.classList.add(crlHiddenClass))
                !!longToggleButtonLabel && (longToggleButtonLabel.innerHTML = buttonLabelShowAll);
                // !!longToggleButtonIcon && (longToggleButtonIcon.style.transform = 'rotate(180deg)');
                // scroll the top into view, rather than leaving it floating in the midle of the page
                document.getElementById('mat-expansion-panel-header-crl')?.scrollIntoView();
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

        const that = this;
        const crlTooltipId = 'crlLabel';
        let mouseOverPrefix = 'Collapse';

        // handle the collapse-expand of the panel, mimicking the built-in
        !!this.matExpansionHeader && this.matExpansionHeader.addEventListener('mousedown', function (event) {
            event.preventDefault();
            mouseOverPrefix = that.togglePanel(mouseOverPrefix, crlTooltipId);
        });
        !!this.matExpansionHeader && this.matExpansionHeader.addEventListener('keydown', function (event) {
            if (!isReturnKeyPressed(event)) {
                return;
            }
            event.preventDefault();
            mouseOverPrefix = that.togglePanel(mouseOverPrefix, crlTooltipId);
        });

        // supply tooltip on hover
        const panelToggleButton = document.getElementById('uql-mat-expansion-panel-header-button');
        const mouseOverLabel = `${mouseOverPrefix} Course reading lists`;
        !!this.matExpansionHeader && this.matExpansionHeader.addEventListener('mouseover', function (event) {
            !!panelToggleButton && mouseoverTooltip(panelToggleButton, mouseOverLabel, crlTooltipId);
        });
        !!this.matExpansionHeader && this.matExpansionHeader.addEventListener('mouseout', function (event) {
            mouseoutTooltip(crlTooltipId);
        });
    }

    private removeClickStyles = () => {
        if (!!this.matExpansionHeader) {
            this.matExpansionHeader.classList.contains('cdk-focused') && this.matExpansionHeader.classList.remove('cdk-focused')
            this.matExpansionHeader.classList.contains('cdk-keyboard-focused') && this.matExpansionHeader.classList.remove('cdk-keyboard-focused')
        }
    }
    private togglePanel = (mouseOverPrefix: string, crlTooltipId: string) => {
        const panel = document.querySelector('uql-course-reading-list-sidebar-panel');

        const listArea = document.getElementById('uql-accordion-child-crl');

        const panelHeader = panel?.querySelector('mat-expansion-panel-header');
        panelHeader?.classList.toggle('mat-expanded');

        if (!!listArea) {
            panelHeader?.setAttribute('aria-expanded', listArea.style.visibility === 'hidden' ? 'true' : 'false'
            )
            mouseOverPrefix = !!listArea && listArea.style.visibility === 'hidden' ? 'Collapse' : 'Expand';
            listArea.style.visibility = listArea.style.visibility === 'hidden' ? 'visible' : 'hidden';

            listArea.style.unicodeBidi = listArea.style.height === '0px' ? '' : 'isolate';
            listArea.style.height = listArea.style.height === '0px' ? '' : '0px';
        }

        this.removeClickStyles();

        mouseoutTooltip(crlTooltipId);
        return mouseOverPrefix;
    }

    private fixUnsafeReadingListUrl(url: string) {
        return url.replace(this.UNSAFE_READING_LIST_BASE_URL, this.SAFE_READING_LIST_BASE_URL);
    }

    private addUrlParam(url: string | string[], name: string, value: boolean | undefined) {
        const param = value !== undefined ? `${name}=${value}` : name;
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}${param}`;
    }

    private addCourseResourceIndicatorToHeader() {
        const template = document.createElement('template');
        // _course_reading_icon.scss file in reusable repo duplicates styles found on built in icons via _ngcontent-ng-crl indicator
        template.innerHTML = courseReadingListIndicatorHtml();
        const iconlist = document.querySelector('.record-indication-wrapper');
        !!iconlist && iconlist.appendChild(template.content.cloneNode(true));

        // supply tooltip on hover
        const crlTooltipId = `crl-icon-tooltip-full`;
        const CRLIndicator = document.querySelector('nde-record-indications uql-course-resource-content-indicator');
        const mouseOverLabel = 'This resource is on a course reading list';
        !!CRLIndicator && CRLIndicator.addEventListener('mouseover', function (event) {
            mouseoverTooltip(CRLIndicator, mouseOverLabel, crlTooltipId);
        });
        !!CRLIndicator && CRLIndicator.addEventListener('mouseout', function (event) {
            mouseoutTooltip(crlTooltipId);
        });
    }
}
