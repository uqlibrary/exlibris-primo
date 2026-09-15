import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Observable, of} from 'rxjs';
import {auditTime, distinctUntilChanged, map, shareReplay} from 'rxjs/operators';
import {NdeStoreService} from "../services/nde-store.service";
import {isFullDisplayPage} from "../shared/common";
import {MatDivider} from "@angular/material/divider";
import {MatIcon} from "@angular/material/icon";

@Component({
    selector: 'custom-nde-content-indicators-cultural-advice-custom',
    standalone: true,
    imports: [CommonModule, MatDivider, MatIcon],
    templateUrl: './nde-content-indicators-cultural-advice-custom.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NdeContentIndicatorsCulturalAdviceCustomComponent {
    @Input() hostComponent!: any;

    // Reactive flag used in the template
    hasContentAdvice$: Observable<boolean> = of(false);

    constructor(private storeSvc: NdeStoreService) {}

    // TODO also add banner!!

    ngOnInit() {
        const record$ = this.storeSvc.getRecord$(this.hostComponent).pipe(
            // Defer to next microtask so we compute *after* the store settles to the new record
            auditTime(0),
            shareReplay({bufferSize: 1, refCount: true})
        );
        // Record stream: emits whenever Fullview selected record or Listview row record changes

        // set the 'if' on the html template to true when the pnx shows cultural advice needed
        this.hasContentAdvice$ = record$.pipe(
            map((record) => this.handleCulturalAdviceAdvisement()),
            distinctUntilChanged()
        );
    }

    // a record needs a cultural advice label if the record has a lds04 entry
    private handleCulturalAdviceAdvisement(): boolean {
        // remove the banner if it's left over from a previous view
        // (eg search, then record with CA, then next-record-arrow to record without CA)
        const bannerId = `culturalAdviceBanner`;
        const previousCulturalAdviceBanner = document.getElementById(bannerId);
        !!previousCulturalAdviceBanner && previousCulturalAdviceBanner.remove();

        const needsCulturalAdvice = !!this.hostComponent?.display?.lds04 ?? null;

        // add a banner to the page if it's a full record
        if (isFullDisplayPage() && needsCulturalAdvice) {
            const html = `
<div id="${bannerId}" class="standardWarningBanner" data-testid="cultural-advice-banner">
    <div class="uq-icon uq-icon--standard--exclamation-triangle"></div>
    <p>${this.hostComponent.display.lds04}</p>
</div>`;
            const template = document.createElement('template');
            template.innerHTML = html;
            const parentElement = document.querySelector(`nde-search-result-item-container`);
            !!parentElement && parentElement.appendChild(template.content.cloneNode(true));
        }
        return needsCulturalAdvice;
    }
}