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
        const hostElement = findHostElement(this.elementRef.nativeElement);
        if (window.location.pathname.startsWith('/nde/collectionDiscovery')) {
            clearExistingHero(); // so can go from citation finder to colldisc and lose citation finder header
        } else if (window.location.pathname.startsWith('/nde/home')) {
            clearExistingHero(); // so can go from citation finder to home and lose citation finder header
        } else if (window.location.pathname.startsWith('/nde/citationlinker')) {
            this.writeCitationFinderHero(hostElement);
        } else if (window.location.pathname.startsWith('/nde/dbsearch')) {
            this.writeDbSearchHero(hostElement);
        } else if (window.location.pathname.startsWith('/nde/purchaseRequest')) {
            this.writeFormHero(hostElement);
        } else if (window.location.pathname.startsWith('/nde/blankIll')) { // resource delivery request form
            this.writeFormHero(hostElement);
        }
    }

    private writeCitationFinderHero(hostElement: Element | null){
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

    private writeDbSearchHero(hostElement: Element | null){
        const params = new URLSearchParams(window.location.search);
        if (params.has("query")) {
            // only the dbsearch homepage gets a big hero header
            return;
        }

        addClassName(hostElement, 'uq-hero');

        const h1 = hostElement?.querySelector('h1');
        addClassName(h1, 'uq-hero__content');
    }

    private writeFormHero(hostElement: Element | null){
        const awaitLoad = setInterval(() => {
            const displayedTitleElement = hostElement?.querySelector('h2.request-title');
            if (!displayedTitleElement) {
                return;
            }
            clearInterval(awaitLoad);

            const heroLabel = displayedTitleElement?.textContent;

            // remove the displayed title so we can replace it with a hero banner
            displayedTitleElement?.remove();

            const uniqueStringForPageType = window.location.pathname.replace(/\//g, '');
            const newHeroElement = getHeroElement(heroLabel, uniqueStringForPageType);

            const h1 = document.querySelector('h1');
            !!newHeroElement && h1?.parentNode?.replaceChild(newHeroElement, h1);

        }, 1000);
    }

}
