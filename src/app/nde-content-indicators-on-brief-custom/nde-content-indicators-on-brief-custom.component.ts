import {Component, ElementRef, inject} from '@angular/core';
import {isFullDisplayPage, setRecordIdentifier} from "../shared/common";
import {CourseReadingListBriefFunctions} from "./CourseReadingListBriefFunctions";
import {getPnx} from "../shared/getPnx";
import {addCulturalAdviceIndicatorToHeader, pnxInterface} from "../shared/culturalAdviceIndicatorResources";

@Component({
  selector: 'custom-nde-content-indicators-on-brief-custom',
  standalone: true,
  imports: [],
  templateUrl: './nde-content-indicators-on-brief-custom.component.html',
})
export class NdeContentIndicatorsOnBriefCustomComponent {
    private elementRef = inject(ElementRef);
    private crl;
    public hostRecordIndications: HTMLElement | null = null; // The nde-record-indications element this component is attached to

    constructor() {
        this.crl = new CourseReadingListBriefFunctions();
    }
    ngOnInit(): void {
        if (isFullDisplayPage()) {
            return;
        }

        // get the current element
        this.hostRecordIndications = this.findHostRecordIndications();
        this.crl.uuid = self.crypto.randomUUID();

        // set an id attribute on element
        !!this.hostRecordIndications && (this.hostRecordIndications.id = setRecordIdentifier(this.crl.uuid, 'crl'));

        const awaitPnx = setInterval(() => {
            // get the ultimate parent of this brief result
            const item = this.hostRecordIndications?.parentElement?.parentElement?.parentElement;
            const pnx = !!item && getPnx(this.crl.searchState(), item);
            if (!pnx?.control?.recordid) { // pnx not ready yet
                return;
            }

            clearInterval(awaitPnx);

            this.crl.displayCourseReadingListIndicator(pnx, item);

            this.displayCulturalAdviceIndicator(pnx, item);

        }, 1000);
    }

    private displayCulturalAdviceIndicator(pnx: pnxInterface, item: HTMLElement | null | undefined) {
        console.log('crl## displayCulturalAdviceIndicator');
        const recordId = !!pnx?.control?.recordid; // eg 61UQ_ALMA51124881340003131
        const culturalAdviceProvided = !!pnx?.display?.lds05; // eg ["Cultural advice - Aboriginal and Torres Strait Islander peoples"]
        if (!!item && culturalAdviceProvided && recordId) {
            addCulturalAdviceIndicatorToHeader(item);
        }
    }

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
}
