import {inject} from '@angular/core';
import {createFeatureSelector, Store} from '@ngrx/store';
import {getPnx} from "../shared/getPnx";
import {CRLiconHtml, getListTalisUrls} from "../shared/getListTalisUrls";

// Selector
const selectSearchState = createFeatureSelector<any>('Search');

interface TalisCourse {
    url: string;
    displayName: string;
}

export class CourseReadingListFullFunctions {
    private store = inject(Store);
    searchState = this.store.selectSignal(selectSearchState);

    private readonly UNSAFE_READING_LIST_BASE_URL = 'http://lr.library.uq.edu.au';
    private readonly SAFE_READING_LIST_BASE_URL = 'https://uq.rl.talis.com';

    private courses: TalisCourse[] = [];
    private showReadingLists = false;

    protected displayCourseReadingListIndicatorAndList = () => {
        const awaitPnx = setInterval(() => {
            // once the pnx data is available, get the talis url list
            const item = document.querySelector('.search-result-item');
            const pnx = getPnx(this.searchState(), item);
            if (!pnx?.control?.recordid) {
                return;
            }
            clearInterval(awaitPnx);

            const listTalisUrls = getListTalisUrls(pnx);
            if (!listTalisUrls || listTalisUrls.length === 0) {
                return;
            }

            if (!!listTalisUrls && listTalisUrls.length > 0) {
                this.getTalisDataFromAllApiCalls(listTalisUrls, pnx);
            }
        }, 1000);
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

        const targetElement = document.querySelector('nde-full-display-container mat-accordion');

        // we use this approach rather than "put this in the angular .html" because we need this block _in the flow_ for layout reasons, not stuck at the bottom
        let htmlContent = '' +
            `<div id="nui.brief.results.tabs.crl" _ngcontent-ng-crl="" tabindex="-1" class="ng-star-inserted crl-list-area">
    <nde-full-display-service-container _ngcontent-ng-crl="" _nghost-ng-crl="" class="ng-star-inserted">
        <div _ngcontent-ng-crl="">
            <h2 _ngcontent-ng-crl="" class="visually-hidden">Course reading lists</h2>
            <mat-expansion-panel id="uql-mat-expansion-panel" _ngcontent-ng-crl="" hidetoggle="" class="mat-expansion-panel mat-expanded mat-expansion-panel-animations-enabled">
                <mat-expansion-panel-header id="uql-mat-expansion-panel-header-button" _ngcontent-ng-crl="" role="button" class="mat-expansion-panel-header mat-focus-indicator mat-expanded mat-expansion-toggle-indicator-after" aria-labelledby="title-nui.brief.results.tabs.crl" tabindex="0" aria-controls="cdk-accordion-child-4" aria-expanded="true" aria-disabled="false">
                    <span class="mat-content mat-content-hide-toggle">
                        <mat-panel-title _ngcontent-ng-crl="" class="mat-expansion-panel-header-title">
                            <span id="crl-label" data-testid="course-reading-list" _ngcontent-ng-crl="" class="title-first-upper mat-title-medium" >Course reading lists</span>
                        </mat-panel-title>
                        <mat-panel-description _ngcontent-ng-crl="" class="mat-expansion-panel-header-description">
                            <mat-icon id="uql-hide-crl-area" _ngcontent-ng-crl="" role="img" color="primary" class="uql-hide-crl-area mat-icon notranslate nde-mat-icon-size-default primary-stroke mat-primary ng-star-inserted" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="Remove">
                                <svg width="100%" height="100%" viewBox="0 0 16 2" fill="none" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">
                                    <path d="M0 1H16" stroke-width="2"></path>
                                </svg>
                            </mat-icon>
                            <mat-icon id="uql-show-crl-area" style="display: none" role="img" color="primary" class="uql-show-crl-area mat-icon notranslate nde-mat-icon-size-default primary-stroke line-height-normal mat-primary ng-star-inserted" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="Add">
                                <svg width="100%" height="100%" viewBox="0 0 16 16" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">
                                    <path d="M0 8H16" stroke-width="2"></path>
                                    <path d="M8 0L8 16" stroke-width="2"></path>
                                </svg>
                            </mat-icon>   
                        </mat-panel-description>
                    </span>
                </mat-expansion-panel-header>
                <div class="mat-expansion-panel-content-wrapper">
                    <div id="uql-accordion-child-crl" role="region" class="uql-accordion-child-crl mat-expansion-panel-content" aria-labelledby="mat-expansion-panel-header-3">
                        <div class="mat-expansion-panel-body">
                            <nde-full-display-crl _ngcontent-ng-crl="" _nghost-ng-crl="" class="ng-star-inserted">
                                <div _ngcontent-ng-crl="" data-qa="full_display_crl_online_crl" class="mat-title-small crl-container flex-column gap-05 ng-star-inserted">
                                <ul class="course-resource-list">`;
        for (const [url, displayName] of Object.entries(talisCourses)) {
            htmlContent += '<li>' +
                `<a class="uql-crl-list-item" href="${url}" target="_blank">` + //  button-as-link link-alt-color md-button md-primoExplore-theme md-ink-ripple
                `<span>${displayName}</span>` +
                '<mat-icon style="height: 20px; width: 18px;" role="img" color="primary" class="mat-icon notranslate nde-mat-icon-size-default primary-stroke mat-primary ng-star-inserted" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="GES">' +
                '<svg width="16" height="16" viewBox="0 0 24 24">' +
                '<path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"></path>' +
                '</svg>' +
                '</mat-icon>' +
                '</a>' +
                '</li>';
        }
        htmlContent += '' +
            `</ul>
                              </div>
                            </nde-full-display-crl>
                        </div>
                    </div>
                </div>
            </mat-expansion-panel>
        </div>
    </nde-full-display-service-container>`;

        // Create a temporary container to attach the HTML
        const tempContainer = document.createElement('div');
        !!tempContainer && (tempContainer.id = "full-view-section-courseReadingLists");
        !!tempContainer && tempContainer.classList.add('full-view-section', 'readingListCitations');
        !!tempContainer && (tempContainer.tabIndex = -1);
        tempContainer.innerHTML = htmlContent;

        // Insert the course list as the first child of the target element
        !!targetElement && targetElement.appendChild(tempContainer);

        const CRLToggleButton = document.getElementById('uql-mat-expansion-panel-header-button');
        !!CRLToggleButton && CRLToggleButton.addEventListener('click', function (event) {
            event.preventDefault();

            const listArea = document.getElementById('uql-accordion-child-crl');
            !!listArea && (listArea.style.visibility = listArea.style.visibility === 'hidden' ? 'visible' : 'hidden');

            const crlAreaButton_hideIcon = document.getElementById('uql-hide-crl-area');
            if (!!crlAreaButton_hideIcon) {
                crlAreaButton_hideIcon.style.display = crlAreaButton_hideIcon.style.display === 'none' ? 'block' : 'none';
            }

            const crlAreaButton_showIcon = document.getElementById('uql-show-crl-area');
            const crlButton = document.getElementById('uql-mat-expansion-panel-header-button');
            const matExpansionPanel = document.getElementById('uql-mat-expansion-panel');
            const matExpansionPanelContentWrapper = document.getElementById('mat-expansion-panel-content-wrapper');
            if (!!crlAreaButton_showIcon) {
                if (crlAreaButton_showIcon.style.display === 'none') {
                    crlAreaButton_showIcon.style.display = 'block'
                    // !!crlButton && !crlButton.classList.contains('uqlHoverGrey') && crlButton.classList.add('uqlHoverGrey');
                    !!matExpansionPanel && matExpansionPanel.classList.contains('mat-expanded') && matExpansionPanel.classList.remove('mat-expanded');
                    !!crlButton && crlButton.classList.contains('mat-expanded') && crlButton.classList.remove('mat-expanded');
                    !!matExpansionPanelContentWrapper && matExpansionPanelContentWrapper.classList.contains('mat-expanded') && matExpansionPanelContentWrapper.classList.remove('mat-expanded');


                    !!crlButton && crlButton.setAttribute('aria-expanded', 'false');
                } else {
                    crlAreaButton_showIcon.style.display = 'none';
                    // !!crlButton && crlButton.classList.contains('uqlHoverGrey') && crlButton.classList.remove('uqlHoverGrey');
                    !!matExpansionPanel && !matExpansionPanel.classList.contains('mat-expanded') && matExpansionPanel.classList.add('mat-expanded');
                    !!crlButton && !crlButton.classList.contains('mat-expanded') && crlButton.classList.add('mat-expanded');
                    !!matExpansionPanelContentWrapper && !matExpansionPanelContentWrapper.classList.contains('mat-expanded') && matExpansionPanelContentWrapper.classList.add('mat-expanded');

                    !!crlButton && crlButton.setAttribute('aria-expanded', 'true');
                }
            }

            return false;
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
        template.innerHTML = CRLiconHtml;
        const iconlist = document.querySelector('.record-indication-wrapper');
        !!iconlist && iconlist.appendChild(template.content.cloneNode(true));
    }
}
