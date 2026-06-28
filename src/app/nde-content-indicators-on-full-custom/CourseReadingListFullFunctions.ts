import {inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {isReturnKeyPressed, mouseoverTooltip, mouseoutTooltip, pnxInterface, selectSearchState} from "../shared/common";
import {courseReadingListIndicatorHtml, getListTalisUrls} from "../shared/courseReadingListResources";

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
        const courseList: { [key: string]: string } = {};
        const listUrlsToCall = listUrls.filter(url => url.startsWith('http'));

        const promises = listUrlsToCall.map(url =>
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
            const talisCourses = {}
            await Promise.allSettled(promises)
                .then(responses => {
                    responses.forEach((result) => {
                        if (result.status !== 'fulfilled' || !result?.value) {
                            return;
                        }
                        const data = result.value; // now typed as {[key: string]: string}
                        for (const talisUrl in data) {
                            if (!courseList[talisUrl]) {
                                courseList[talisUrl] = data[talisUrl];
                            }
                        }
                    });
                }).finally(() => {
                    if (Object.keys(courseList).length > 0) {
                        this.addCourseResourceIndicatorToHeader();

                        // sort by course code for display
                        let sortable = [];
                        for (let talisUrl in courseList) {
                            const subjectCode = courseList[talisUrl];
                            sortable.push([talisUrl, subjectCode]);
                        }
                        sortable.sort(function (a, b) {
                            return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0;
                        });
                        sortable.forEach((entry) => {
                            const subjectCode = entry[1];
                            const talisUrl = this.fixUnsafeReadingListUrl(this.addUrlParam(entry[0], 'login', true));
                            // @ts-ignore
                            talisCourses[talisUrl] = subjectCode;
                        });

                        this.createAndAppendCourseList(talisCourses);
                    }
                });
        } catch (e) {
            console.log('Course reading list [full] error', e);
        }
    }

    private createAndAppendCourseList(talisCourses: { [s: string]: unknown; } | ArrayLike<unknown>) {
        const linkOutIcon: string =
            '<mat-icon style="height: 20px; width: 18px;" role="img" color="primary" class="mat-icon notranslate nde-mat-icon-size-default primary-stroke mat-primary ng-star-inserted" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="GES">' +
            '<svg width="16" height="16" viewBox="0 0 24 24">' +
            '<path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"></path>' +
            '</svg>' +
            '</mat-icon>';

        const showAllButtonLabel = 'Show all';
        const showLessButtonLabel = 'Show less';
        const maxNumberReadingListsDisplayed = 5; // when there are a lot of course, we show a 'show all' button when there are more than this number
        const crlHiddenClass = 'uql-crl-list-hidden'; // courses which are actually hidden, add/remove this classname
        const crlHideableClass = `uql-crl-list-hideable`; // courses which are > maxNumberReadingListsDisplayed, find this to add/remove crlHiddenClass

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
        for (const [url, displayName] of Object.entries(talisCourses) as [string, string][]) {
            const className = numberOfReadingLists < maxNumberReadingListsDisplayed ? 'uql-crl-list-constant': `${crlHideableClass} ${crlHiddenClass}`;
            htmlContent += `<li class="uql-crl-list ${className}">
                <a class="uql-crl-list-item" href="${url}" target="_blank">
                    <span>${displayName}</span>
                    ${linkOutIcon}
                </a></li>`;
            numberOfReadingLists++;
        }
        htmlContent += `</ul>`;
        if (numberOfReadingLists >= maxNumberReadingListsDisplayed) {
            htmlContent += `<div class="toggle-show-all-button">
    <button id="toggle-long-crl" _ngcontent-ng-crl="" mat-button="" data-qa="full-display-crl-show-more-btn" mat-ripple-loader-class-name="mat-mdc-button-ripple" class="mdc-button mat-mdc-button mat-unthemed mat-mdc-button-base" aria-label="Click for more suggestions">
        <span class="mat-mdc-button-persistent-ripple mdc-button__ripple"></span>
        <span class="mdc-button__label">
            <span _ngcontent-ng-crl="" class="button-label flex-row">
                <span id="toggle-long-crl-label">
                    ${showAllButtonLabel}
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
        const longToggleButton = document.getElementById('toggle-long-crl');
        const longToggleButtonLabel = document.getElementById('toggle-long-crl-label');
        // const longToggleButtonIcon = document.getElementById('toggle-long-crl-icon');
        !!longToggleButton && longToggleButton.addEventListener('click', function (event) {
            const hiddenCRL = document.querySelectorAll(`.${crlHiddenClass}`);
            if (hiddenCRL?.length > 0) {
                // hiding the entries - show them
                hiddenCRL.forEach(c => c.classList.remove(crlHiddenClass))
                !!longToggleButtonLabel && (longToggleButtonLabel.innerHTML = showLessButtonLabel);
                // !!longToggleButtonIcon && (longToggleButtonIcon.style.transform = 'none');
            } else {
                // visible entries - hide them
                const hideableCRL = document.querySelectorAll(`.${crlHideableClass}`);
                hideableCRL?.forEach(c =>  c.classList.add(crlHiddenClass))
                !!longToggleButtonLabel && (longToggleButtonLabel.innerHTML = showAllButtonLabel);
                // !!longToggleButtonIcon && (longToggleButtonIcon.style.transform = 'rotate(180deg)');
                // scroll the top into view, rather than leaving it floating in the midle of the page
                document.getElementById('mat-expansion-panel-header-crl')?.scrollIntoView();
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
