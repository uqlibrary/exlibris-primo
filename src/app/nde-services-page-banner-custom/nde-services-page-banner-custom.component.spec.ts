import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdeServicesPageBannerCustomComponent } from './nde-services-page-banner-custom.component';

describe('NdeServicesPageBannerCustomComponent', () => {
  let component: NdeServicesPageBannerCustomComponent;
  let fixture: ComponentFixture<NdeServicesPageBannerCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdeServicesPageBannerCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdeServicesPageBannerCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
