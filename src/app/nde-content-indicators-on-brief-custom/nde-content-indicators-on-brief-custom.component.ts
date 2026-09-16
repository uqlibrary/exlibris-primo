import {Component, ElementRef, inject, Input} from '@angular/core';
import {Observable, of} from 'rxjs';
import {isFullDisplayPage, pnxInterface, setRecordIdentifier} from "../shared/common";
import {getPnx} from "../shared/getPnx";
import {addCulturalAdviceIndicatorToHeader} from "../shared/culturalAdviceIndicatorResources";
import {CourseReadingListFullFunctions} from "./CourseReadingListFullFunctions";
import {auditTime, distinctUntilChanged, map, shareReplay} from "rxjs/operators";
import {NdeStoreService} from "../services/nde-store.service";

@Component({
  selector: 'custom-nde-content-indicators-on-brief-custom',
  standalone: true,
  imports: [],
  templateUrl: './nde-content-indicators-on-brief-custom.component.html',
})
export class NdeContentIndicatorsOnBriefCustomComponent {
    @Input() hostComponent!: any;

    private elementRef = inject(ElementRef);
    private crl;
    public hostRecordIndications: HTMLElement | null = null; // The nde-record-indications element this component is attached to

    // Reactive flag used in the template
    hasReadingList$: Observable<boolean> = of(false);

    constructor(private storeSvc: NdeStoreService) {
        // console.log('### nde-content-indicators-on-brief construct');
        this.crl = new CourseReadingListFullFunctions();
    }
    ngOnInit(): void {
        // console.log('### nde-content-indicators-on-brief ngOnInit');
        if (!isFullDisplayPage()) {
            // console.log('### nde-content-indicators-on-brief not full skip');
            return;
        }

        const record$ = this.storeSvc.getRecord$(this.hostComponent).pipe(
            // Defer to next microtask so we compute *after* the store settles to the new record
            auditTime(0),
            shareReplay({bufferSize: 1, refCount: true})
        );
        // Record stream: emits whenever Fullview selected record or Listview row record changes

        const existingCrlPanel = document.getElementById(this.crl.panelId);
        // console.log('### createAndAppendCourseList existingCrlPanel=', existingCrlPanel);
        !!existingCrlPanel && existingCrlPanel.remove();

        // if removing that leaves the sidebar empty, remove it too
        const ndeSidebar = document.querySelector('div.full-view-right-content:has(> nde-full-display-side-bar)');
        console.log('### ndeSidebar=', ndeSidebar);
        if (!!ndeSidebar && !ndeSidebar?.innerHTML?.toString().includes('nde-collapsible-box')) {
            // no contents now, remove the sidebar too
            console.log('### ndeSidebar has no children, remove');
            ndeSidebar.remove();
        }

        const ISLOGGEDINTOBEDONE = true;
        this.hasReadingList$ = record$.pipe(
            map((record) => !isFullDisplayPage() && !!this.crl.displayCourseReadingListIndicatorAndList(this.hostComponent, ISLOGGEDINTOBEDONE)),
            distinctUntilChanged()
        );

        // get the current element
        this.hostRecordIndications = this.findHostRecordIndications();
        this.crl.uuid = self.crypto.randomUUID();

        // NEEDED?
        // set an id attribute on element
        !!this.hostRecordIndications && (this.hostRecordIndications.id = setRecordIdentifier(this.crl.uuid, 'crl'));

        const TODOISLOGGEDIN = true;
        this.crl.displayCourseReadingListIndicatorAndList(this.hostComponent, TODOISLOGGEDIN);
    }

    private displayCulturalAdviceIndicator(pnx: pnxInterface, item: HTMLElement | null | undefined) {
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
