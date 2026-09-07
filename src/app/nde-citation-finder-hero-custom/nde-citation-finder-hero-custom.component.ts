import {Component, ElementRef, inject} from '@angular/core';
import {findHostElement, getHeroElement} from "../shared/common";

@Component({
    selector: 'custom-nde-citation-finder-hero-component',
    standalone: true,
    imports: [],
    templateUrl: './nde-citation-finder-hero-custom.component.html',
    styleUrl: './nde-citation-finder-hero-custom.component.scss'
})
export class NdeCitationFinderHeroCustomComponent {
    private elementRef = inject(ElementRef);

    ngOnInit(): void {
        const hostElement = findHostElement(this.elementRef.nativeElement);
        const displayedTitleElement = hostElement?.querySelector('h1');
        const heroLabel = displayedTitleElement?.textContent;
        if (!displayedTitleElement) {
            return;
        }


        // remove the displayed title so we can replace it with a hero banner
        displayedTitleElement?.remove();

        const newHeroElement = getHeroElement(heroLabel, 'citationfinder');

        !!newHeroElement && hostElement?.parentNode?.insertBefore(newHeroElement, hostElement);
    }
}
