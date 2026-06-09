import {inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectSearchState, setRecordIdentifier} from "../shared/common";
import {courseReadingListIndicatorHtml, getListTalisUrls} from "../shared/courseReadingListResources";

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

        try {
            let data: { [key: string]: string } | null = null;
            for (const url of listUrlsToCall) {
                try {
                    data = await makeRequest(url);
                    break; // success — stop trying further urls
                } catch {
                    // this url failed, try the next one
                }
            }

            if (data) {
                for (const talisUrl in data) {
                    if (!courseList[talisUrl]) {
                        courseList[talisUrl] = data[talisUrl];
                    }
                }
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

        const builtinIconlist = document.querySelector(`#${setRecordIdentifier(this.uuid, 'crl')} .record-indication-wrapper`);
        !!builtinIconlist && builtinIconlist.appendChild(template.content.cloneNode(true));
    }
}

