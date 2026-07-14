import {inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {mouseoutTooltip, mouseoverTooltip, selectSearchState, setRecordIdentifier} from "../shared/common";
import {courseReadingListIndicatorHtml, getListTalisUrls} from "../shared/courseReadingListResources";
import {talisCacheManager} from "../shared/LocalStorageCacheManager";

export class CourseReadingListBriefFunctions {
    private store = inject(Store);
    public searchState = this.store.selectSignal(selectSearchState);

    public uuid: string | null = null;

    public displayCourseReadingListIndicator = (pnx: any, item: any) => {
            const recIdEl = item?.querySelector('[data-recordid]') || item?.querySelector('a[ng-href*="docid="], a[href*="docid="], a[href*="doc="]');
            const recId = !!recIdEl && (recIdEl.getAttribute('data-recordid') || recIdEl.getAttribute('docid') || ((recIdEl.getAttribute('href') || '').match(/(?:docid|doc)=([^&]+)/) || [])[1]);
            if (!recId) {
                // should never happen?
                return;
            }

            const listTalisUrls = getListTalisUrls(pnx, String(this.uuid));
            if (!listTalisUrls || listTalisUrls.length === 0) {
                return;
            }

            !!listTalisUrls && listTalisUrls.length > 0 && this.getTalisDataFromAnyApiCalls(listTalisUrls);
    }

    // we want to know if any of the talis are available, so we stop once we have a single success
    private async getTalisDataFromAnyApiCalls(listUrls: string[]) {
        const courseList: { [key: string]: string } = {};
        const listUrlsToCall = listUrls.filter(url => url.startsWith('http'));

        const COURSE_READING_FOUND = 'hascourse';
        const NO_COURSE_READING = 'nodata';

        let talisCache = talisCacheManager.getLocalStorageCache();
        let found: string = '';
        let uncachedUrls: Array<string> = [];
        listUrlsToCall.forEach(talisUrl => {
            if (found !== COURSE_READING_FOUND) {
                const talisCacheEntry = talisCache[talisUrl];
                if (talisCacheEntry && typeof talisCacheEntry?.courses !== 'undefined' && talisCacheEntry?.courses !== null) {
                    // we have a reading list
                    found = COURSE_READING_FOUND;
                } else if (talisCacheEntry && typeof talisCacheEntry?.expiryDate !== 'undefined') {
                    // we have an entry in cache, so we dont need to fetch, but its not a reading list
                    found = NO_COURSE_READING;
                } else {
                    // not in cache, we need to fetch it
                    uncachedUrls.push(talisUrl);
                }
            }
        })
        if (found === COURSE_READING_FOUND) {
            this.showCourseResourceIndicator(); // no need to fetch - show indicator
            return;
        } else if (found === NO_COURSE_READING) {
            return; // no need to fetch, but not a reading list either
        }
        if (uncachedUrls.length === 0) {
            return; // nothing left to fetch
        }

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
                this.showCourseResourceIndicator();
            }
        } catch (e) {
            // Promise.any throws AggregateError if ALL urls fail
            // no talis at all for this record
        }
    }

    private showCourseResourceIndicator() {
        const template = document.createElement('template');
        template.innerHTML = courseReadingListIndicatorHtml();

        const recordIdentifier = setRecordIdentifier(this.uuid, 'crl');
        const builtinIconlist = document.querySelector(`#${recordIdentifier} .record-indication-wrapper`);
        !!builtinIconlist && builtinIconlist.appendChild(template.content.cloneNode(true));

        // supply tooltip on hover
        const crlTooltipId = `crl-icon-tooltip-${this.uuid}`;
        const CRLIndicator = document.querySelector(`nde-record-indications#${recordIdentifier} uql-course-resource-content-indicator`);
        const mouseOverLabel = 'This resource is on a course reading list';
        !!CRLIndicator && CRLIndicator.addEventListener('mouseover', function (event) {
            mouseoverTooltip(CRLIndicator, mouseOverLabel, crlTooltipId);
        });
        !!CRLIndicator && CRLIndicator.addEventListener('mouseout', function (event) {
            mouseoutTooltip(crlTooltipId);
        });
    }
}

