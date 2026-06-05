import {Component, inject, OnInit} from '@angular/core';
import {isFullDisplayPage, selectSearchState, setRecordIdentifier} from "../shared/common";
import {CourseReadingListFullFunctions} from "./CourseReadingListFullFunctions";
import {getPnx} from "../shared/getPnx";
import {Store} from "@ngrx/store";

@Component({
    selector: 'custom-nde-content-indicators-on-full-custom',
    standalone: true,
    templateUrl: './nde-content-indicators-on-full-custom.component.html',
})
export class NdeContentIndicatorsOnFullCustomComponent implements OnInit {
    private crl;

    public hostRecordIndications: HTMLElement | null = null; // The nde-record-indications element this component is attached to

    private store = inject(Store);
    searchState = this.store.selectSignal(selectSearchState);

    constructor() {
        this.crl = new CourseReadingListFullFunctions();
    }
    ngOnInit(): void {
        if (!isFullDisplayPage) {
            return;
        }

        this.crl.displayCourseReadingListIndicatorAndList();

        this.displayCulturalAdviceIndicator();
    }

    private displayCulturalAdviceIndicator = () => {
        const awaitPnx = setInterval(() => {
            const item = document.querySelector('.search-result-item');
            const pnx = getPnx(this.searchState(), item);
            if (!pnx?.control?.recordid) {
                return;
            }
            clearInterval(awaitPnx);

            const recordId = !!pnx?.control?.recordid && pnx.control.recordid; // eg 61UQ_ALMA51124881340003131
            const culturalAdviceProvided = !!pnx?.display?.lds05; // eg ["Cultural advice - Aboriginal and Torres Strait Islander peoples"]
            if (culturalAdviceProvided && !!recordId) {
                this.addCulturalAdviceIndicatorToHeader();
            }
        }, 100);
    }

    private culturalAdviceIconHtml: string =
        `<svg width="100%" height="100%" viewBox="0 0 24 24" focusable="false">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
</svg>`;

    private culturalAdviceIndicatorHtml: string =
        `<div id="ca-icon" _ngcontent-ng-caindicator="" class="record-indication-cont-ca record-indication-cont display-inline-block ng-star-inserted">
    <mat-divider _ngcontent-ng-caindicator="" role="separator" class="mat-divider nde-divider mat-divider-vertical" aria-orientation="vertical"></mat-divider>
    <div _ngcontent-ng-caindicator="" class="display-inline">
        <mat-icon _ngcontent-ng-caindicator="" role="img" class="mat-icon notranslate nde-mat-icon-size-small margin-right-small mat-icon-no-color ng-star-inserted" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="course-reading-list">
            ${this.culturalAdviceIconHtml}
        </mat-icon>
        <span _ngcontent-ng-caindicator="" class="record-indication text-uppercase" data-testid="course-reading-list">CULTURAL ADVICE</span>
    </div>
</div>`;

    private addCulturalAdviceIndicatorToHeader = () => {
        const template = document.createElement('template');
        // css file in reusable repo duplicates styles found on built in icons via _ngcontent-ng-crl indicator
        template.innerHTML = this.culturalAdviceIndicatorHtml;
        const iconlist = document.querySelector('.record-indication-wrapper');
        !!iconlist && iconlist.appendChild(template.content.cloneNode(true));
    }
}
