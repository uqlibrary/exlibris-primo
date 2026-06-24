import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdeAccountInfoLinksCustomComponent } from './nde-account-info-links-custom.component';

describe('NdeAccountInfoLinksCustomComponent', () => {
  let component: NdeAccountInfoLinksCustomComponent;
  let fixture: ComponentFixture<NdeAccountInfoLinksCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdeAccountInfoLinksCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdeAccountInfoLinksCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
