import {Component, ElementRef, inject} from '@angular/core';
import {addClassName, clearExistingHero, findHostElement, getHeroElement} from "../shared/common";

@Component({
  selector: 'custom-nde-hero-block-custom',
  standalone: true,
  imports: [],
  templateUrl: './nde-hero-block-custom.component.html',
  styleUrl: './nde-hero-block-custom.component.scss'
})
export class NdeHeroBlockCustomComponent {
    private elementRef = inject(ElementRef);

    ngOnInit(): void {
        if (window.location.pathname.startsWith('/nde/collectionDiscovery')) {
            clearExistingHero();
        } else if (window.location.pathname.startsWith('/nde/citationlinker')) {
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
        } else if (window.location.pathname.startsWith('/nde/dbsearch')) {
            const hostElement = findHostElement(this.elementRef.nativeElement);

            const params = new URLSearchParams(window.location.search);
            if (!params.has("query")) {
                // only the dbsearch homepage gets a big hero header
                addClassName(hostElement, 'uq-hero');

                const h1 = hostElement?.querySelector('h1');
                addClassName(h1, 'uq-hero__content');
            }
        } else if (window.location.pathname.startsWith('/nde/purchaseRequest') || window.location.pathname.startsWith('/nde/blankIll')) {
            const awaitLoad = setInterval(() => {
                let hostElement = findHostElement(this.elementRef.nativeElement);
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

                const uniqueStringForPageType = window.location.pathname.replace(/\//g, '');
                const newHeroElement = getHeroElement(heroLabel, uniqueStringForPageType);

                const h1 = document.querySelector('h1');
                !!newHeroElement && h1?.parentNode?.replaceChild(newHeroElement, h1);

            }, 1000);
        }
    }
}
