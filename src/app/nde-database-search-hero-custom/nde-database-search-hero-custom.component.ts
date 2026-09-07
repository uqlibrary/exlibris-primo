import {Component, ElementRef, inject} from '@angular/core';
import {addClassName, findHostElement} from "../shared/common";

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
        const hostElement = findHostElement(this.elementRef.nativeElement);

        const className = 'uq-hero';
        addClassName(hostElement, className);

        const h1 = hostElement?.querySelector('h1');
        addClassName(h1, 'uq-hero__content');
    }
}
