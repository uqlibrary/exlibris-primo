import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdePurchaseRequestHeaderCustomComponent } from './nde-purchase-request-header-custom.component';

describe('NdePurchaseRequestHeaderCustomComponent', () => {
  let component: NdePurchaseRequestHeaderCustomComponent;
  let fixture: ComponentFixture<NdePurchaseRequestHeaderCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdePurchaseRequestHeaderCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdePurchaseRequestHeaderCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
