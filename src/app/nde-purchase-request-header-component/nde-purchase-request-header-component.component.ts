import {Component, ElementRef, inject} from '@angular/core';

@Component({
  selector: 'custom-nde-purchase-request-header-component',
  standalone: true,
  imports: [],
  templateUrl: './nde-purchase-request-header-component.component.html',
  styleUrl: './nde-purchase-request-header-component.component.scss'
})
export class NdePurchaseRequestHeaderComponentComponent {
    private elementRef = inject(ElementRef);
    public hostElement: HTMLElement | null = null;

    ngOnInit(): void {
        const awaitLoad = setInterval(() => {
            this.hostElement = this.findHostElement();
            const displayedTitle = this.hostElement?.querySelector('h2.request-title');
            if (!displayedTitle) {
                return;
            }

            clearInterval(awaitLoad);

            // remove the displayed title so we can replace it with a hero banner
            displayedTitle?.remove();

            const h1 = document.querySelector('h1');
            const heroHtml = `
                <div class="uq-hero">
                    <div class="uq-hero-container">
                        <div class="uq-hero__content">
                            <h1 class="uq-hero__title">Purchase Request Form</h1>
                        </div>
                    </div>
                </div>`;
            const heroTemplate = document.createElement('template');
            heroTemplate.innerHTML = heroHtml;
            !!heroTemplate && h1?.parentNode?.replaceChild(heroTemplate.content?.cloneNode(true), h1);

        }, 1000);
    }

    private findHostElement(): HTMLElement | null {
        const desiredTagName = 'nde-blank-alma-purchase-request';
        const stopTagName = 'nde-full-view'; // Don't walk too far up the tree

        const nativeEl: HTMLElement = this.elementRef.nativeElement;

        let cursor: HTMLElement | null = nativeEl;
        while (cursor) {
            // Check previous siblings at this level for nde-base-request-form
            let sibling = cursor.previousElementSibling as HTMLElement | null;
            while (sibling) {
                if (sibling.tagName.toLowerCase() === desiredTagName) {
                    return sibling;
                }
                // Also check if it's nested inside a sibling wrapper
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
