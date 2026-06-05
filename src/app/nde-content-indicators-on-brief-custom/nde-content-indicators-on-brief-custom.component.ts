import {Component, ElementRef, inject} from '@angular/core';
import {createFeatureSelector, Store} from '@ngrx/store';
import {getPnx} from "../shared/getPnx";
import {CRLiconHtml, getListTalisUrls} from "../shared/getListTalisUrls";
import {isFullDisplayPage} from "../shared/common";

export const selectSearchState = createFeatureSelector<any>('Search');

@Component({
  selector: 'custom-nde-content-indicators-on-brief-custom',
  standalone: true,
  imports: [],
  templateUrl: './nde-content-indicators-on-brief-custom.component.html',
})
export class NdeContentIndicatorsOnBriefCustomComponent {
    private store = inject(Store);
    searchState = this.store.selectSignal(selectSearchState);

    private elementRef = inject(ElementRef);
    /** The nde-record-indications element this component is attached to */
    private hostRecordIndications: HTMLElement | null = null;
    private uuid: string | null = null;

    private createRecordIdentifier = (uuid: string | null) => !!uuid ? `record-${uuid}` : 'record-unknown';

    ngOnInit(): void {
        if (isFullDisplayPage()) {
            return;
        }

        // get the current element
        this.hostRecordIndications = this.findHostRecordIndications();
        this.uuid = self.crypto.randomUUID();
        // set an id attribute on element
        !!this.hostRecordIndications && (this.hostRecordIndications.id = this.createRecordIdentifier(this.uuid));


        this.displayReadingListIndicator();
    }

    // get this element
    private findHostRecordIndications(): HTMLElement | null {
        const nativeEl: HTMLElement = this.elementRef.nativeElement;

        let cursor: HTMLElement | null = nativeEl;
        while (cursor) {
            // Check previous siblings at this level for nde-record-indications
            let sibling = cursor.previousElementSibling as HTMLElement | null;
            while (sibling) {
                if (sibling.tagName.toLowerCase() === 'nde-record-indications') {
                    return sibling;
                }
                // Also check if it's nested inside a sibling wrapper
                const nested = sibling.querySelector('nde-record-indications');
                if (nested) {
                    return nested as HTMLElement;
                }
                sibling = sibling.previousElementSibling as HTMLElement | null;
            }

            // Move up one level and try again
            cursor = cursor.parentElement;

            // Stop at the record container — don't walk too far up the tree
            if (
                cursor?.tagName.toLowerCase().startsWith('nde-full-view') ||
                cursor?.tagName.toLowerCase() === 'body'
            ) {
                break;
            }
        }

        return null;
    }

    private isFullDisplayPage(): boolean {
        return window.location.pathname.includes('fulldisplay');
    }

    private displayReadingListIndicator = () => {
        const that = this;
        const awaitPnx = setInterval(() => {
            // get the ultimate parent of this brief result
            const item = this.hostRecordIndications?.parentElement?.parentElement?.parentElement;
            const pnx = !!item && getPnx(this.searchState(), item);
            if (!pnx?.control?.recordid) { // pnx not ready yet
                return;
            }

            clearInterval(awaitPnx);

            // pnx data now available
            const recIdEl = item?.querySelector( '[data-recordid]') || item?.querySelector( 'a[ng-href*="docid="], a[href*="docid="], a[href*="doc="]');
            const recId = !!recIdEl && (recIdEl.getAttribute( 'data-recordid') || recIdEl.getAttribute( 'docid') || ((recIdEl.getAttribute( 'href') || '').match(/(?:docid|doc)=([^&]+)/) || [])[1]);
            if (!recId) {
                // should never happen?
                return;
            }

            const listTalisUrls = getListTalisUrls(pnx, String(that.uuid));
            if (!listTalisUrls || listTalisUrls.length === 0) {
                return;
            }

            !!listTalisUrls && listTalisUrls.length > 0 && this.getTalisDataFromAnyApiCalls(listTalisUrls);
        }, 1000);
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
        template.innerHTML = CRLiconHtml;

        const builtinIconlist = document.querySelector(`#${this.createRecordIdentifier(this.uuid)} .record-indication-wrapper`);
        !!builtinIconlist && builtinIconlist.appendChild(template.content.cloneNode(true));
    }
}
