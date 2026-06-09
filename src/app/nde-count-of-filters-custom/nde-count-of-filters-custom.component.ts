import {Component, ElementRef, inject} from '@angular/core';

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
        const standardHtml = '<span class="filter-results-count ng-star-inserted">(RECORD_COUNT)</span>'

        // get all entries that are missing the count display (in practice this is New records only - Show only has no displayed count, but doesn't provide the data in the aria-label)
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
    }

    private findHostRecordIndications(soughtElement: string = 'nde-filters-group'): HTMLElement | null {
        const nativeEl: HTMLElement = this.elementRef.nativeElement;

        let cursor: HTMLElement | null = nativeEl;
        while (cursor) {
            // Check previous siblings at this level for nde-filters-group
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
