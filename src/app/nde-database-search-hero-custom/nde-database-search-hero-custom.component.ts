import {Component, ElementRef, inject} from '@angular/core';
import {findHostElement} from "../shared/common";

@Component({
  selector: 'custom-nde-database-search-hero-custom',
  standalone: true,
  imports: [],
  templateUrl: './nde-database-search-hero-custom.component.html',
  styleUrl: './nde-database-search-hero-custom.component.scss'
})
export class NdeDatabaseSearchHeroCustomComponent {
    private elementRef = inject(ElementRef);

    ngOnInit(): void {
        const hostElement = findHostElement('nde-general-search-header', 'nde-full-view', this.elementRef.nativeElement);

        !!hostElement && !hostElement.classList.contains('uq-hero') && hostElement.classList.add('uq-hero')
        !!hostElement && (hostElement.style.height = '280px');

        const h1 = hostElement?.querySelector('h1');
        !!h1 && !h1.classList.contains('uq-hero__content') && h1.classList.add('uq-hero__content')
        !!h1 && (h1.style.maxWidth = '16ch'); //shrink the title area to give more space tot he search field
    }
}
