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

        // get all entries that are missing the count display and include the amount in the aria label
        const lines = this.elementRoot?.querySelectorAll('nde-filters-value label.mdc-label:has(button.facet-name):not(:has(button.facet-name + span.filter-results-count))');
        lines?.forEach(line => {
            const button = line?.querySelector('button');
            const label = button?.getAttribute('aria-label');
            if (label?.endsWith('search results')) {
                // similar, but not identical code below in addCountsOnShowOnly
                const recordCount = label
                    ?.replace(/[^\d,]/g, '') // remove non numeric values
                    ?.trim() || '';
                const newHtml = standardHtml.replace('RECORD_COUNT', this.numberWithCommas(recordCount));

                const htmlTemplate = document.createElement('template');
                htmlTemplate.innerHTML = newHtml;
                !!htmlTemplate && button?.after(htmlTemplate.content.cloneNode(true));
                // we could do all this in the primo search api code below, but it is very slow and this is fast, so get the same data quicker where possible
            }
         })

        this.addCountsOnShowOnly();
    }

    async fetchAPI(urlParamString: string, headers: object = {}): Promise<any> {
        /* istanbul ignore next */
        const options = {
            'Content-Type': 'application/json',
            ...headers,
        };

        let urlPrefix = 'https://api.library.uq.edu.au/$ENV$/alma/search'; // TBA
        const urlPrefixStaging = urlPrefix.replace('$ENV$', 'staging');
        let urlSuffix = '';
        const productionDomain = "search.library.uq.edu.au";
        // standard arrangement: prod-prod calls prod. Everything else (prod-appdev, prod-dac, sandbox-*) calls staging
        if (window.location.hostname === productionDomain) {
            if (currentEnvironmentId() === '61UQ_INST:61UQ_APPDEV') { // prod-appdev env
                urlPrefix = urlPrefix.replace('$ENV$', 'v1');
            } else {
                urlPrefix = urlPrefixStaging;
            }
        } else if (window.location.hostname === 'localhost') { // nde development environment
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('supplyapikey')) {
                // retain the option to call the api directly
                const apiKey = urlParams.get('supplyapikey');
                urlPrefix = 'https://api-ap.hosted.exlibrisgroup.com/primo/v1/search';
                urlSuffix = '&apikey=' + apiKey;
            } else {
                urlPrefix = urlPrefixStaging;
            }
        } else { // sandbox domain
            urlPrefix = urlPrefixStaging;
        }

        const finalUrl = urlPrefix + '?' + urlParamString + urlSuffix;
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
     * swagger doc: https://developers.exlibrisgroup.com/console/?url=/wp-content/uploads/primo/openapi/primoSearch.json
     * console: https://developers.exlibrisgroup.com/console/?url=/wp-content/uploads/primo/openapi/primoSearch.json#//get%2Fprimo%2Fv1%2Fsearch
     * api doc: https://developers.exlibrisgroup.com/alma/apis/
     * general: https://developers.exlibrisgroup.com/primo/apis/
     * api response sample json: https://developers.exlibrisgroup.com/wp-content/uploads/primo/openapi/primoSearch.json
     */
    async addCountsOnShowOnly() {
        const showOnlySectionId = 'tlevel'; // the label that matches the "Show only" page section we want to add Counts to

        const html = '<span class="filter-results-count ng-star-inserted">(RECORD_COUNT)</span>';

        const params = this.getApiParams();
        await this.fetchAPI(params, {})
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

    private getApiParams = () => {
        let paramString = 'vid=' + currentEnvironmentId() + '&inst=61UQ_INST'; // required parameters

        const urlParams = new URLSearchParams(location.search);

        let multiIncludeFacets: string[] = [];
        let multiExcludeFacets: string[] = [];
        urlParams?.forEach((value, key) => {
            if (key === 'mfacet' || key === 'facet') {
                if (value?.includes(',include,')) {
                    const newIncludeFacet = 'facet_' + value
                        .replaceAll(',', '%2C');
                    multiIncludeFacets.push(newIncludeFacet);
                }
                if (value?.includes(',exclude,')) {
                    const newExcludeFacet = 'facet_' + value
                        ?.replace('exclude', 'exact')
                        .replaceAll(',', '%2C');
                    multiExcludeFacets.push(newExcludeFacet);
                }
            }
        });
        if (multiIncludeFacets.length === 1) {
            paramString += `&qInclude=${(multiIncludeFacets.pop())}`;
        } else if (multiIncludeFacets.length > 0) {
            paramString += `&multiFacets=${multiIncludeFacets.join('%7C%2C%7C')}`;
        }
        if (multiExcludeFacets.length === 1) {
            paramString += `&qExclude=${(multiExcludeFacets.pop())}`;
        } else if (multiExcludeFacets.length > 0) {
            paramString += `&qExclude=${multiExcludeFacets.join('%7C%2C%7C')}`;
        }

        if (urlParams.has('query')) {
            let searchTerm = urlParams.get('query');
            if (!searchTerm?.includes(',')) {
                searchTerm = `any,contains,${searchTerm}`
            }
            paramString += `&q=${searchTerm}`; // required parameter
        }

        const apiKeys = {
            // format - api key: FE url key
            "offset": "offset",
            "tab": "tab",  // required parameter
            "scope": "search_scope", // required parameter
            "pcAvailability": "pcAvailability",
            "searchInFulltext": "searchInFulltext",
        }
        for (let [apiKey, FEkey] of Object.entries(apiKeys)) {
            if (urlParams.has(FEkey)) {
                paramString += `&${apiKey}=${urlParams.get(FEkey)}`;
            }
        }

        return paramString;
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
