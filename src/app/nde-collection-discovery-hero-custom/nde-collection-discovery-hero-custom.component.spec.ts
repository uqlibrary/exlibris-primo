import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdeCollectionDiscoveryHeroCustomComponent } from './nde-collection-discovery-hero-custom.component';

describe('NdeCollectionDiscoveryHeroCustomComponent', () => {
  let component: NdeCollectionDiscoveryHeroCustomComponent;
  let fixture: ComponentFixture<NdeCollectionDiscoveryHeroCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdeCollectionDiscoveryHeroCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdeCollectionDiscoveryHeroCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
