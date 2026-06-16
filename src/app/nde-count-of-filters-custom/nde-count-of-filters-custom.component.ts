import {Component, ElementRef, inject} from '@angular/core';
import {currentEnvironmentId} from "../shared/common";

interface SearchResponse {
    facets: [{
        name: string,
        values: {
            value: string,
            count: number,
        }[],
    }] | undefined
}

@Component({
    selector: 'custom-nde-count-of-filters-custom',
    standalone: true,
    imports: [],
    templateUrl: './nde-count-of-filters-custom.component.html',
    styleUrl: './nde-count-of-filters-custom.component.scss'
})
export class NdeCountOfFiltersCustomComponent {
    private elementRef = inject(ElementRef);
    private elementRoot: HTMLElement | null = null;

    ngOnInit(): void {
        this.elementRoot = this.findHostRecordIndications();
        const standardHtml = '<span class="filter-results-count ng-star-inserted">(RECORD_COUNT)</span>';

        // get all entries that are missing the count display (in practice this is New records only - Show only has no displayed count, but doesn't provide the data in the aria-label)
        // similar, but not identical code below in addCountsOnShowOnly
        const lines = this.elementRoot?.querySelectorAll('nde-filters-value label.mdc-label:has(button.facet-name):not(:has(button.facet-name + span.filter-results-count))');
        lines?.forEach(line => {
            const button = line?.querySelector('button');
            const label = button?.getAttribute('aria-label');
            if (label?.endsWith('search results')) {
                const recordCount = label
                    ?.replace(/[^\d,]/g, '') // remove non numeric values
                    ?.trim() || '';
                const newHtml = standardHtml.replace('RECORD_COUNT', this.numberWithCommas(recordCount));

                const htmlTemplate = document.createElement('template');
                htmlTemplate.innerHTML = newHtml;
                !!htmlTemplate && button?.after(htmlTemplate.content.cloneNode(true));
            }
         })

        this.addCountsOnShowOnly();
    }

    async fetchAPI(urlPath: string, headers: object = {}): Promise<any> {
        /* istanbul ignore next */
        const options = {
            'Content-Type': 'application/json',
            ...headers,
        };

        let urlPrefix = 'https://api.library.uq.edu.au/$VERSION$/primo/something'; // TBA
        let urlSuffix = '';
        const vidParam = currentEnvironmentId();
        // const productionDomain = "search.library.uq.edu.au";
        // if (window.location.hostname === productionDomain) {
        //     if (vidParam === '61UQ_INST:61UQ_APPDEV') {
        //         urlPrefix = urlPrefix.replace('$VERSION$', 'v1');
        //     } else {
        //         urlPrefix = urlPrefix.replace('$VERSION$', 'staging');
        //     }
        // } else if (window.location.hostname === 'localhost') { // localhost
            urlPrefix = 'https://api-ap.hosted.exlibrisgroup.com/primo/v1/search';
            // no api key in code - use by param or counts wont be called
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('sp')) {
                const apiKey = urlParams.get('sp');
                urlSuffix = '&apikey=' + apiKey;
            }
        // } else { // sandbox domain
        //     urlPrefix = urlPrefix.replace('$VERSION$', 'staging');
        // }

        const finalUrl = urlPrefix + urlPath + urlSuffix;
        let response;
        try {
            response = await fetch(finalUrl, {
                headers: options,
            });
        } catch (e) {
            console.log('[NCFC03]', 'fail: ', finalUrl, e);
        }

        if (!response?.ok) {
            let message = 'An error has occurred: ';
            message += !!response ? `${response?.status} ${response?.statusText}` : 'unknown';
            window.location.hostname === 'localhost' && console.log('[NCFC02]: ' + message);
            throw new Error(`An error has occured: ${message}`);
        }
        return await response?.json();
    }

    /*
     * in the filter sidebar, there are various groups that show counts for each filter type
     * this is a useful indicator to users of what size data that filter would return
     * on one of them the "Show only" doesnt provide the count - but the Primo Search api provides, so here we call it
     * refs:
     * API key management: https://developers.exlibrisgroup.com/manage/keys/
     * swagger doc https://developers.exlibrisgroup.com/console/?url=/wp-content/uploads/primo/openapi/primoSearch.json
     * console: https://developers.exlibrisgroup.com/console/?url=/wp-content/uploads/primo/openapi/primoSearch.json#//get%2Fprimo%2Fv1%2Fsearch
     * api doc: https://developers.exlibrisgroup.com/alma/apis/
     * general: https://developers.exlibrisgroup.com/primo/apis/
     */
    async addCountsOnShowOnly() {
        // this needs to be fancied to take all the current url parameters, per the api spec
        const url = '?vid=61UQ_INST%3A61UQ_NDEUI_DALTS&tab=61UQ_All&scope=61UQ_All&q=title%2Ccontains%2Ccows&newspapersActive=true' +
        '&pcAvailability=true&lang=eng&offset=0&limit=10&sort=rank&getMore=0&conVoc=true&inst=61UQ_INST&skipDelivery=true' +
        '&disableSplitFacets=true';

        const showOnlySectionId = 'tlevel'; // the label that matches the "Show only" page section we want to add Counts to

        const html = '<span class="filter-results-count ng-star-inserted">(RECORD_COUNT)</span>';

        await this.fetchAPI(url, {})
            .then((response: SearchResponse) => {
                // similar, but not identical code above in ngOnInit
                response?.facets?.find(f => f.name === showOnlySectionId)?.values?.forEach(record => {
                    const label = record?.value;
                    const recordCount = record?.count
                        ?.toString()
                        ?.replace(/[^\d,]/g, '') // remove non-numeric values
                        ?.trim() || '';

                    if (!!label && !!recordCount) {
                        const newHtml = html.replace('RECORD_COUNT', this.numberWithCommas(recordCount));

                        // find the page element to insert the count into
                        const button = document.querySelector(`nde-search-filters-side-nav [data-qa="tlevel.${label}"]`)

                        const htmlTemplate = document.createElement('template');
                        htmlTemplate.innerHTML = newHtml;
                        !!htmlTemplate && button?.after(htmlTemplate.content.cloneNode(true));
                    }
                });
            })
            .catch((error) => {
                console.log('[NCFC01] error loading primo search api ', error);
            });
    }

    private findHostRecordIndications(soughtElement: string = 'nde-search-filters-side-nav'): HTMLElement | null {
        const nativeEl: HTMLElement = this.elementRef.nativeElement;

        let cursor: HTMLElement | null = nativeEl;
        while (cursor) {
            // Check previous siblings at this level for nde-search-filters-side-nav
            let sibling = cursor.previousElementSibling as HTMLElement | null;
            while (sibling) {
                if (sibling.tagName.toLowerCase() === soughtElement) {
                    return sibling;
                }
                // Also check if it's nested inside a sibling wrapper
                const nested = sibling.querySelector(soughtElement);
                if (nested) {
                    return nested as HTMLElement;
                }
                sibling = sibling.previousElementSibling as HTMLElement | null;
            }

            // Move up one level and try again
            cursor = cursor.parentElement;

            // don't walk too far up the tree if not found
            if (cursor?.tagName.toLowerCase() === 'main' || cursor?.tagName.toLowerCase() === 'body') {
                break;
            }
        }

        return null;
    }

    // Source - https://stackoverflow.com/a/2901298
    // Posted by Elias Zamaria, modified by community. See post 'Timeline' for change history
    // Retrieved 2026-06-09, License - CC BY-SA 4.0
    private numberWithCommas = (x:string): string => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}
