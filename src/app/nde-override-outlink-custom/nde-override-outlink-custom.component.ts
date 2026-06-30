import {Component, ElementRef, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {getPnx} from "../shared/getPnx";
import {findHostRecord, isFullDisplayPage, pnxInterface, selectSearchState} from "../shared/common";

@Component({
  selector: 'custom-nde-override-outlink-custom',
  standalone: true,
  imports: [],
  templateUrl: './nde-override-outlink-custom.component.html',
  styleUrl: './nde-override-outlink-custom.component.scss'
})
export class NdeOverrideOutlinkCustomComponent {
    private elementRef = inject(ElementRef);
    private store = inject(Store);
    searchState = this.store.selectSignal(selectSearchState);
    ngOnInit(): void {
        // get the current element
        const hostRecord = findHostRecord(this.elementRef, 'nde-online-availability');

        const earlistCommonParent = hostRecord?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode;
        const awaitButton = setInterval(() => {
            const button = earlistCommonParent?.querySelector('nde-online-availability button');
            if (!button) {
                return;
            }
            clearInterval(awaitButton);

            const awaitPnx = setInterval(() => {
                const item = earlistCommonParent?.querySelector('.search-result-item');

                const pnx = !!item && getPnx(this.searchState(), item);
                if (!pnx?.control?.recordid) {
                    return;
                }
                clearInterval(awaitPnx);

                if (this.isDirectLinkingAllowed(pnx)) {
                    return;
                }

                const fullRecordAnchor =  earlistCommonParent?.querySelector('a');
                if (!fullRecordAnchor?.href) {
                    return;
                }

                // we cant actually generically remove listeners - but we can start from scratch
                const clonedElement = button?.cloneNode(true);
                !!clonedElement && button?.replaceWith(clonedElement);

                if (isFullDisplayPage()) {
                    clonedElement?.addEventListener('click', function (event) {
                        // scroll to the existing View it section (this should always be present for an online resource)
                        const searchField = document.querySelector('#main-search-bar');
                        searchField?.scrollIntoView();
                    });
                } else {
                    clonedElement?.addEventListener('click', function (event) {
                        // click the link to the full result page
                        const linkToFull = earlistCommonParent?.querySelector('a');
                        !!linkToFull && linkToFull.click();
                        const searchField = document.querySelector('#main-search-bar');
                        searchField?.scrollIntoView();
                    });
                }


            }, 100);
        }, 100);
    }

    private isDirectLinkingAllowed(pnx: pnxInterface) {
        // we allow linking on CDI records, because they offer a more complex set of buttons. Minimal occurance, apparently.
        if (this.isCdiRecord(pnx)) {
            return true;
        }

        // we block direct linking on certain resource types
        // (primo links for all types, but it's a bad experience for the user)
        const typesWithNoDirectLinking = [
            "journals", "newspapers", "magazines",
            "journal", "newspaper", "magazine",
        ];
        const currentRresourceType =
            pnx?.display?.type && pnx.display.type.length > 0
                ? pnx.display.type[0]
                : "";
        if (typesWithNoDirectLinking.includes(currentRresourceType)) {
            return false;
        }

        // resources for certain types (currently certain links to espace and atom) shouldn't direct link
        const atomNoDirectLinkingAvailability = "ext_restrictedWithLink"; // atom (fryer) resources also should not have direct linking
        const espaceNoDirectLinkingAvailability = "ext_restrictedWithLink_and_physical"; // espace non-openaccess resources also should not have direct linking
        const availabilityArray =
            !!pnx?.item?.delivery?.availability && pnx.item.delivery.availability.length > 0
                ? pnx.item.delivery.availability
                : null;
        if (!!availabilityArray && availabilityArray.some((value: any) => [espaceNoDirectLinkingAvailability, atomNoDirectLinkingAvailability].includes(value))) {
            return false;
        }

        return true;
    }

    private isCdiRecord = (pnx: pnxInterface) => {
        return !!pnx?.control?.iscdi && pnx?.control?.iscdi?.length > 0 && !!pnx?.control?.iscdi[0];
    }
}
