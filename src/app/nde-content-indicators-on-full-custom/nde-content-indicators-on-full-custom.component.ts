import {Component, inject, OnInit} from '@angular/core';
import {Store} from "@ngrx/store";
import {isFullDisplayPage, selectSearchState} from "../shared/common";
import {getPnx} from "../shared/getPnx";
import {addCulturalAdviceIndicatorToHeader, pnxInterface} from "../shared/culturalAdviceIndicatorResources";
import {CourseReadingListFullFunctions} from "./CourseReadingListFullFunctions";

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

        const awaitPnx = setInterval(() => {
            const item = document.querySelector('.search-result-item');
            const pnx = getPnx(this.searchState(), item);
            if (!pnx?.control?.recordid) {
                return;
            }
            clearInterval(awaitPnx);

            this.crl.displayCourseReadingListIndicatorAndList(pnx);

            this.displayPossibleCulturalAdviceIndicator(pnx);

            this.displayPossibleCulturalAdviceBanner(pnx);
        }, 100);
    }

    private displayPossibleCulturalAdviceIndicator = (pnx: pnxInterface) => {
        const recordIdProvided = !!pnx?.control?.recordid; // eg 61UQ_ALMA51124881340003131
        const culturalAdviceProvided = !!pnx?.display?.lds05; // eg ["Cultural advice - Aboriginal and Torres Strait Islander peoples"]
        if (culturalAdviceProvided && recordIdProvided) {
            addCulturalAdviceIndicatorToHeader();
        }
    }

    private displayPossibleCulturalAdviceBanner = (pnx: pnxInterface) => {
        const recordIdProvided = !!pnx?.control?.recordid; // eg 61UQ_ALMA51124881340003131
        const culturalAdviceProvided = !!pnx?.display?.lds05; // eg ["Cultural advice - Aboriginal and Torres Strait Islander peoples"]
        if (culturalAdviceProvided && recordIdProvided) {
            const culturalAdviceBody = pnx?.display?.lds04; // eg "Aboriginal and Torres Strait Islander people are warned that this resource may contain ..."
            !!culturalAdviceBody && culturalAdviceBody.length > 0 && !!culturalAdviceBody[0] && this.addCulturalAdviceBanner(culturalAdviceBody[0]);
        }
    }

    private addCulturalAdviceBanner(displayText: string) {
        // eg "Aboriginal and Torres Strait Islander people are warned that this resource may contain images transcripts or names of Aboriginal and Torres Strait Islander people now deceased.  It may also contain historically and culturally sensitive words, terms, and descriptions."
        const displayBlockId = "culturalAdviceBanner";
        const displayBlock = document.getElementById(displayBlockId);
        if (!!displayBlock) {
            // block already exists - don't duplicate
            return;
        }

        const bannerHtml = `<div id="${displayBlockId}" class="standardWarningBanner">
    <div class="uq-icon uq-icon--standard--exclamation-triangle"></div>
<p>
    ${displayText}
</p>
</div>`;
        const bannerTemplate = document.createElement('template');
        bannerTemplate.innerHTML = bannerHtml;

        const parent = document.querySelector('nde-search-result-item-container');
        !!bannerTemplate && !!parent && parent.after(bannerTemplate.content.cloneNode(true));
    }

}
