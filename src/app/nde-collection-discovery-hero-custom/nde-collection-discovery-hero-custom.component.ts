import { Component } from '@angular/core';
import {clearExistingHero} from "../shared/common";

@Component({
  selector: 'custom-nde-collection-discovery-hero-custom',
  standalone: true,
  imports: [],
  templateUrl: './nde-collection-discovery-hero-custom.component.html',
  styleUrl: './nde-collection-discovery-hero-custom.component.scss'
})
export class NdeCollectionDiscoveryHeroCustomComponent {
    ngOnInit(): void {
        clearExistingHero();
    }
}
