import {Component, ElementRef, inject} from '@angular/core';

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
        const awaitLoad = setInterval(() => {
            const hostElement = this.findHostElement('nde-fetch-item', 'nde-full-view');
            const displayedTitleElement = hostElement?.querySelector('h1');
            const heroLabel = displayedTitleElement?.textContent;
            if (!displayedTitleElement) {
                return;
            }

            clearInterval(awaitLoad);

            // remove the displayed title so we can replace it with a hero banner
            displayedTitleElement?.remove();

            const heroHtml = `
                <div class="uq-hero">
                    <div class="uq-hero-container">
                        <div class="uq-hero__content">
                            <h1 class="uq-hero__title">${heroLabel}</h1>
                        </div>
                    </div>
                </div>`;
            const heroTemplate = document.createElement('template');
            heroTemplate.innerHTML = heroHtml;
            const newHeroElement = heroTemplate.content?.cloneNode(true);

            !!heroTemplate && hostElement?.parentNode?.insertBefore(newHeroElement, hostElement);
        }, 1000);
    }

    private findHostElement(desiredTagName: string, stopTagName: string): HTMLElement | null {
        // console.log('### desiredTagName=', desiredTagName);
        // console.log('### this.elementRef=', this.elementRef);
        // console.log('### this.elementRef.nativeElement=', this.elementRef.nativeElement);
        let cursor: HTMLElement | null = this.elementRef.nativeElement;
        while (cursor) {
            // Check previous siblings at this level for nde-base-request-form
            let sibling = cursor.previousElementSibling as HTMLElement | null;
            // console.log('### ',desiredTagName, ': sibling=', sibling);
            while (sibling) {
                if (sibling.tagName.toLowerCase() === desiredTagName) {
                    return sibling;
                }
                // Also check if it's nested inside a sibling wrapper
                // because the 'after" element is generally a sibling
                const nested = sibling.querySelector(desiredTagName);
                if (nested) {
                    return nested as HTMLElement;
                }
                sibling = sibling.previousElementSibling as HTMLElement | null;
            }

            // Move up one level and try again
            cursor = cursor.parentElement;

            if (
                cursor?.tagName.toLowerCase().startsWith(stopTagName) ||
                cursor?.tagName.toLowerCase() === 'body'
            ) {
                break;
            }
        }

        return null;
    }
}
