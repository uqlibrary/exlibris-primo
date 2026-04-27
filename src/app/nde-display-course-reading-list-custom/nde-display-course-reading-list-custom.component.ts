import {Component, inject, OnInit} from '@angular/core';
// import {HttpClient, HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';
// import {NgIf} from '@angular/common';
import {createFeatureSelector, Store} from '@ngrx/store';
import {getPnx} from "../shared/getPnx";

interface TalisCourse {
    url: string;
    displayName: string;
}

// Selector
export const selectSearchState = createFeatureSelector<any>('Search');

@Component({
    selector: 'custom-nde-display-course-reading-list-custom',
    standalone: true,
    // imports: [NgIf], // required here if used in the html template
    templateUrl: './nde-display-course-reading-list-custom.component.html',
    // imports: [
    //     HttpClientModule,
    //     HttpClientJsonpModule,
    // ],
})
export class NdeDisplayCourseReadingListCustomComponent implements OnInit {
    private store = inject(Store);
    // private http = inject(HttpClient);
    searchState = this.store.selectSignal(selectSearchState);

    courses: TalisCourse[] = [];
    showReadingLists = false;

    private readonly TALIS_DOMAIN = 'https://uq.rl.talis.com/';
    private readonly UNSAFE_READING_LIST_BASE_URL = 'http://lr.library.uq.edu.au';
    private readonly SAFE_READING_LIST_BASE_URL = 'https://uq.rl.talis.com';

    // Material types that should not use ISBN/ISSN lookups
    private readonly RESTRICTED_CHECK_LIST = [
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

    // constructor(
    //     private http: HttpClient
    // ) {
    //     console.log('CRL:: constructor');
    // }

    ngOnInit(): void {
        console.log('CRL:: start');
        if (!this.isFullDisplayPage()) {
            return;
        }
        console.log('CRL:: is full display page');

        this.displayReadingListIndicator();
    }

    private isFullDisplayPage(): boolean {
        return window.location.pathname.includes('fulldisplay');
    }

    private displayReadingListIndicator = () => {
        console.log('CRL:: displayReadingListIndicator');
        const awaitPnx = setInterval(() => {
            // once the pnx data is available, get the talis url list
            const pnx = getPnx(this.searchState(), 'CRL');
            console.log('CRL:: displayReadingListIndicator pnx=', pnx);
            if (!pnx?.control?.recordid) {
                return;
            }
            clearInterval(awaitPnx);
            console.log('CRL:: pnx=', pnx);

            const listTalisUrls = this.getListTalisUrls(pnx);
            console.log("CRL:: listTalisUrls=", listTalisUrls);
            if (!listTalisUrls || listTalisUrls.length === 0) {
                return;
            }
            !!listTalisUrls && listTalisUrls.length > 0 && this.getTalisDataFromAllApiCalls(listTalisUrls, pnx);
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
                    console.warn('CRL:: Failed to fetch Talis data from:', url);
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
                            console.log('CRL:: talis result=', result);
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

                        // TODO ADD CRL ICON TO TOP BLOCK
                        const recordid = pnx.control.recordid; // eg 61UQ_ALMA51124881340003131
                        if (!!recordid) {
                            // const waitForJIElement = setInterval(() => {
                            //     const journalIndicationElement = document.querySelector('.full-view-container prm-search-result-journal-indication-line');
                            //     if (!journalIndicationElement) {
                            //         return;
                            //     }
                            //     clearInterval(waitForJIElement);
                            //     addCourseResourceIndicatorToHeader(recordid, "full", null, journalIndicationElement);
                            // }, 100);
                        }

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
                });;

            /* needed? */
            console.log('CRL:: courseList=', courseList);

            // Populate the courses array for display
            this.courses = Object.entries(courseList).map(([url, displayName]) => ({
                url: url.startsWith(this.UNSAFE_READING_LIST_BASE_URL)
                    ? url.replace(this.UNSAFE_READING_LIST_BASE_URL, this.SAFE_READING_LIST_BASE_URL)
                    : url,
                displayName,
            }));
            this.showReadingLists = this.courses.length > 0;
            console.log('CRL:: courses=', this.courses);
            /* END needed? */

        } catch (e) {
            console.log('CRL:: error', e);
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
        `<div class="nde-full-display-service-container ng-star-inserted crl-list-area">
            <div>
                <div role="separator" class="mat-divider nde-divider full-display-divider mat-divider-horizontal" aria-orientation="horizontal"></div>
                <h2 class="visually-hidden">Course reading lists</h2>
                <mat-expansion-panel id="uql-mat-expansion-panel" hidetoggle="" class="mat-expanded mat-expansion-panel-animations-enabled"> <!-- mat-expansion-panel -->
                    <mat-expansion-panel-header id="uql-mat-expansion-panel-header-button" _ngcontent-ng-c562330857="" role="button" class="crl-mat-expansion-panel-header mat-expansion-panel-header mat-focus-indicator mat-expanded mat-expansion-toggle-indicator-after" aria-labelledby="crl-label" tabindex="0" aria-controls="crl-mat-expansion-panel" aria-expanded="true" aria-disabled="false">
                        <span class="mat-content mat-content-hide-toggle">
                            <mat-panel-title _ngcontent-ng-c562330857="" class="mat-expansion-panel-header-title">
                                <span _ngcontent-ng-c562330857="" class="title-first-upper mat-title-medium" id=crl-label">Course reading lists</span>
                            </mat-panel-title>
                            <mat-panel-description _ngcontent-ng-c562330857="" class="mat-expansion-panel-header-description">
                                <mat-icon id="uql-hide-crl-area" role="img" color="primary" class="uql-hide-crl-area mat-icon notranslate nde-mat-icon-size-default primary-stroke mat-primary ng-star-inserted" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="Remove">
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
        
                    <!-- class="mat-expansion-panel mat-expanded mat-expansion-panel-animations-enabled" -->
                    <mat-expansion-panel id="crl-mat-expansion-panel" class="mat-expansion-panel-content-wrapper mat-expansion-panel-animations-enabled">
                        <div role="region" class="uql-accordion-child-crl" id="uql-accordion-child-crl" aria-labelledby="uql-mat-expansion-panel-header-button"> <!-- mat-expansion-panel-content -->
                            <div class="mat-expansion-panel-body">
                                <div class="ng-star-inserted">
                                    <div class="mat-title-small links-container flex-column gap-05 ng-star-inserted">
                                        <ul class="course-resource-list">`;
        for (const [url, displayName] of Object.entries(talisCourses)) {
            htmlContent += '<li>' +
                `<a class="uql-crl-list-item" href="${url}" target="_blank">` + //  button-as-link link-alt-color md-button md-primoExplore-theme md-ink-ripple
                `<span>${displayName}</span>` +
                '<mat-icon style="height: 18px; width: 18px;" role="img" color="primary" class="mat-icon notranslate nde-mat-icon-size-default primary-stroke mat-primary ng-star-inserted" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="GES">' +
                '<svg width="16" height="16" viewBox="0 0 24 24">' +
                '<path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"></path>' +
                '</svg>' +
                '</mat-icon>' +
                '</a>' +
                '</li>';
        }
        htmlContent += '' +
            "</ul>" +
            '</div>';

        // Create a temporary container to attach the HTML
        const tempContainer = document.createElement('div');
        // !!tempContainer && tempContainer.classList.add('full-view-section');
        !!tempContainer && tempContainer.classList.add('full-view-section', 'readingListCitations');
        !!tempContainer && (tempContainer.id = "full-view-section-courseReadingLists");
        !!tempContainer && (tempContainer.tabIndex = -1);
        tempContainer.innerHTML = htmlContent;
        console.log('CRL:: createAndAppendCourseList tempContainer=', tempContainer);

        // Insert the course list as the first child of the target element
        !!targetElement && targetElement.appendChild(tempContainer);

        const CRLToggleButton = document.getElementById('uql-mat-expansion-panel-header-button');
        !!CRLToggleButton && CRLToggleButton.addEventListener('click', function (event) {
            event.preventDefault();

            const listArea = document.getElementById('uql-accordion-child-crl');
            if (!!listArea) {
                // listArea.style.display = listArea.style.display === 'none' ? 'block' : 'none';
                console.log('listArea.style.visibility=', listArea.style.visibility);
                listArea.style.visibility = listArea.style.visibility === 'hidden' ? 'visible' : 'hidden';
            }

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

    private getListTalisUrls(pnx: any): string[] {
        console.log("CRL:: getListTalisUrls pnx=", pnx);
        const list: string[] = [];

        const materialType = pnx?.display?.type?.[0];
        const isRestrictedCheckType = this.RESTRICTED_CHECK_LIST.includes(materialType);

        // LCN (Library Control Number)
        console.log("CRL:: getListTalisUrls LCN - pnx?.control?.sourcerecordid=", pnx?.control?.sourcerecordid);
        if (pnx?.control?.sourcerecordid?.length > 0) {
            pnx.control.sourcerecordid.forEach((r: string) => {
                list.push(`${this.TALIS_DOMAIN}lcn/${r}/lists.json`);
            });
        }

        // DOI
        console.log("CRL:: getListTalisUrls DOI - pnx?.addata?.doi=", pnx?.addata?.doi);
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
        console.log("CRL:: getListTalisUrls list=", list);

        return list;
    }

    private addCourseResourceIndicatorToHeader() {
        const template = document.createElement('template');
        // _course_reading_icon.scss file in reusable repo duplicates styles found on built in icons via _ngcontent-ng-crlindicator
        template.innerHTML = `<div _ngcontent-ng-crlindicator="" class="record-indication-cont-crl record-indication-cont display-inline-block ng-star-inserted">
            <mat-divider _ngcontent-ng-crlindicator="" role="separator" class="mat-divider nde-divider mat-divider-vertical" aria-orientation="vertical"></mat-divider>
            <div _ngcontent-ng-crlindicator="" class="display-inline">
                <mat-icon _ngcontent-ng-crlindicator="" role="img" class="mat-icon notranslate nde-mat-icon-size-small margin-right-small mat-icon-no-color ng-star-inserted" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="course-reading-list">
                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">
                        <path d="M4 10h3v7H4zm6.5 0h3v7h-3zM2 19h20v3H2zm15-9h3v7h-3zm-5-9L2 6v2h20V6z"></path>
                    </svg>
                </mat-icon>
                <span _ngcontent-ng-crlindicator="" class="record-indication text-uppercase">COURSE READING LIST</span>
            </div>
        </div>`;
        const iconlist = document.querySelector('.record-indication-wrapper');
        !!iconlist && iconlist.appendChild(template.content.cloneNode(true));
    }
}