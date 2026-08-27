import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdePurchaseRequestHeaderComponentComponent } from './nde-purchase-request-header-component.component';

describe('NdePurchaseRequestHeaderComponentComponent', () => {
  let component: NdePurchaseRequestHeaderComponentComponent;
  let fixture: ComponentFixture<NdePurchaseRequestHeaderComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdePurchaseRequestHeaderComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdePurchaseRequestHeaderComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
