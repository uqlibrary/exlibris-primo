import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdeCitationFinderHeroCustomComponent } from './nde-citation-finder-hero-custom.component';

describe('NdeCitationFinderHeroCustomComponent', () => {
  let component: NdeCitationFinderHeroCustomComponent;
  let fixture: ComponentFixture<NdeCitationFinderHeroCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdeCitationFinderHeroCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdeCitationFinderHeroCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
