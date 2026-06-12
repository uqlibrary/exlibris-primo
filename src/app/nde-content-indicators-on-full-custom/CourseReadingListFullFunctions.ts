import {inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectSearchState} from "../shared/common";
import {pnxInterface} from "../shared/culturalAdviceIndicatorResources";
import {courseReadingListIndicatorHtml, getListTalisUrls} from "../shared/courseReadingListResources";

interface TalisCourse {
    url: string;
    displayName: string;
}

const mouseoverTooltip = (button: HTMLElement, mouseOverlabel: string) => {
    const rect = button?.getBoundingClientRect();
    const pix = 15 * mouseOverlabel.length;

    const tooltipLeft = rect?.left ? rect?.left - (pix / 4) : pix / 4;
    const tooltipTop = (rect?.top ?? 0) + 32;

    const toolTipHtml = `<uql-tooltip class="cdk-overlay-connected-position-bounding-box" dir="ltr" style="top: 0px; left: 0px; height: 100%; width: 100%;">
    <div id="cdk-overlay-1" class="cdk-overlay-pane mat-mdc-tooltip-panel-below mat-mdc-tooltip-panel" style="top: ` + tooltipTop + `px; left: ` + tooltipLeft + `px; transform: translateY(8px);">
        <mat-tooltip-component aria-hidden="true" class="ng-star-inserted">
            <div class="mdc-tooltip mat-mdc-tooltip mat-mdc-tooltip-show" style="transform-origin: center top;">
                <div class="mat-mdc-tooltip-surface mdc-tooltip__surface">` + mouseOverlabel + `</div>
            </div>
        </mat-tooltip-component>
    </div>
</uql-tooltip>`;
    const template = document.createElement('template');
    !!template && (template.innerHTML = toolTipHtml);
    const parent = document.querySelector('.cdk-overlay-container');
    !!template && parent?.appendChild(template.content.cloneNode(true));
}

const mouseoutTooltip = () => {
    const tooltip = document.querySelector('uql-tooltip');
    !!tooltip && tooltip.remove();
}

export class CourseReadingListFullFunctions {
    private store = inject(Store);
    searchState = this.store.selectSignal(selectSearchState);

    private readonly UNSAFE_READING_LIST_BASE_URL = 'http://lr.library.uq.edu.au';
    private readonly SAFE_READING_LIST_BASE_URL = 'https://uq.rl.talis.com';

    private courses: TalisCourse[] = [];
    private showReadingLists = false;

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

                        // TODO: if/when sidebar becomes available
                        // addCRLButtontoSidebar();
                    }
                });

            // Populate the courses array for display
            this.courses = Object.entries(courseList).map(([url, displayName]) => ({
                url: url.startsWith(this.UNSAFE_READING_LIST_BASE_URL)
                    ? url.replace(this.UNSAFE_READING_LIST_BASE_URL, this.SAFE_READING_LIST_BASE_URL)
                    : url,
                displayName,
            }));
            this.showReadingLists = this.courses.length > 0;
            /* END needed? */

        } catch (e) {
            console.log('Course reading list [full] error', e);
        }
    }

    private createAndAppendCourseList(talisCourses: { [s: string]: unknown; } | ArrayLike<unknown>) {
        // TODO or remove
        // // in rare instances prm-service-details-after fires twice. When it does, we get 2 CRL. Block this.
        // const CRLSectionAlreadyAdded = document.getElementById('full-view-section-courseReadingLists');
        // if (!!CRLSectionAlreadyAdded) { // place the check this late to prevent race conditions
        //     return;
        // }

        const linkOutIcon: string =
            '<mat-icon style="height: 20px; width: 18px;" role="img" color="primary" class="mat-icon notranslate nde-mat-icon-size-default primary-stroke mat-primary ng-star-inserted" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="GES">' +
            '<svg width="16" height="16" viewBox="0 0 24 24">' +
            '<path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"></path>' +
            '</svg>' +
            '</mat-icon>';

        const showAllButtonLabel = 'Show all';
        const showLessButtonLabel = 'Show less';
        const maxNumberReadingListsDisplayed = 8; // when there are a lot of course, we show a 'show all' button when there are more than this number
        const crlHiddenClass = 'uql-crl-list-hidden'; // courses which are actually hidden, add/remove this classname
        const crlHideableClass = `uql-crl-list-hideable`; // courses which are > maxNumberReadingListsDisplayed, find this to add/remove crlHiddenClass

        const targetElement = document.querySelector('nde-full-display-side-bar');

        let htmlContent = `<nde-full-display-crl _nghost-ng-crl="" class="ng-star-inserted">
            <nde-collapsible-box _ngcontent-ng-crl="" class="course-reading-list-container" _nghost-ng-crl="">
                <mat-expansion-panel _ngcontent-ng-crl="" class="mat-expansion-panel mat-elevation-z0 mat-expanded mat-expansion-panel-animations-enabled">
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
                                <p _ngcontent-ng-crl="" id="search-within-desc" class="mat-body-medium">This resource is on the Reading list for these subjects:</p>
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
            htmlContent += `<div class="toggle-show-all-button"><button id="toggle-long-crl" class="collapsed"><span>${showAllButtonLabel}</span><span style="display: none">Show less</span></button></div>`;
        }
        htmlContent += `</div>
                </div>
            </div>
        </mat-expansion-panel>
    </nde-collapsible-box>
</nde-full-display-crl>`;
        const template = document.createElement('template');
        template.innerHTML = htmlContent;

        // Insert the course list as the first child of the target element
        !!targetElement && targetElement.prepend(template.content.cloneNode(true));

        // handle the show-all show-less click when there are many courses
        const longToggleButton = document.getElementById('toggle-long-crl');
        !!longToggleButton && longToggleButton.addEventListener('click', function (event) {
            const hiddenCRL = document.querySelectorAll(`.${crlHiddenClass}`);
            if (hiddenCRL?.length > 0) {
                // hiding the entries - show them
                hiddenCRL.forEach(c => c.classList.remove(crlHiddenClass))
                longToggleButton.innerHTML = showLessButtonLabel;
            } else {
                // visible entries - hide them
                const hideableCRL = document.querySelectorAll(`.${crlHideableClass}`);
                hideableCRL?.forEach(c =>  c.classList.add(crlHiddenClass))
                longToggleButton.innerHTML = showAllButtonLabel
                // scroll the top into view, rather than leaving it floating in the midle of the page
                document.getElementById('mat-expansion-panel-header-crl')?.scrollIntoView();
            }
        });

        // handle the collapse-expand of the panel, mimicking the build-in
        let mouseOverPrefix = 'Collapse';
        const panelToggleButton = document.getElementById('uql-mat-expansion-panel-header-button');
        !!panelToggleButton && panelToggleButton.addEventListener('click', function (event) {
            event.preventDefault();

            const panel = document.querySelector('nde-full-display-crl');

            const listArea = document.getElementById('uql-accordion-child-crl');

            const panelHeader = panel?.querySelector('mat-expansion-panel-header');
            panelHeader?.classList.toggle('mat-expanded');

            if (!!listArea) {
                console.log('crl## visibility=', !!listArea && listArea.style.visibility);
                console.log('crl## height=', !!listArea && listArea.style.height);
                panelHeader?.setAttribute(
                    'aria-expanded',
                    listArea.style.visibility === 'hidden' ? 'true' : 'false'
                )
                mouseOverPrefix = !!listArea && listArea.style.visibility === 'hidden' ? 'Collapse' : 'Expand';
                listArea.style.visibility = listArea.style.visibility === 'hidden' ? 'visible' : 'hidden';

                listArea.style.unicodeBidi = listArea.style.height === '0px' ? '' : 'isolate';
                listArea.style.height = listArea.style.height === '0px' ? '' : '0px';
            }
        });
        const listArea = document.getElementById('uql-accordion-child-crl');
        !!panelToggleButton && panelToggleButton.addEventListener('mouseover', function (event) {
            const mouseOverLabel = `${mouseOverPrefix} Course reading lists`;
            mouseoverTooltip(panelToggleButton, mouseOverLabel);
        });

        !!panelToggleButton && panelToggleButton.addEventListener('mouseout', function (event) {
            mouseoutTooltip();
        });
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
    }
}
