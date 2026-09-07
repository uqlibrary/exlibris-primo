import {Component, ElementRef, inject} from '@angular/core';
import {findHostElement, getHeroElement} from "../shared/common";

@Component({
    selector: 'custom-nde-purchase-request-header-component',
    standalone: true,
    imports: [],
    templateUrl: './nde-purchase-request-header-custom.component.html',
    styleUrl: './nde-purchase-request-header-custom.component.scss'
})
export class NdePurchaseRequestHeaderCustomComponent {
    private elementRef = inject(ElementRef);

    ngOnInit(): void {
        const awaitLoad = setInterval(() => {
            let hostElement = findHostElement(this.elementRef.nativeElement);
            console.log('### hostElement=', hostElement);
            if (!hostElement) {
                hostElement = findHostElement(this.elementRef.nativeElement);
            }
            const displayedTitleElement = hostElement?.querySelector('h2.request-title');
            const heroLabel = displayedTitleElement?.textContent;
            if (!displayedTitleElement) {
                return;
            }

            clearInterval(awaitLoad);

            // remove the displayed title so we can replace it with a hero banner
            displayedTitleElement?.remove();

            const newHeroElement = getHeroElement(heroLabel, 'purchrequest');

            const h1 = document.querySelector('h1');
            !!newHeroElement && h1?.parentNode?.replaceChild(newHeroElement, h1);

        }, 1000);
    }
}
