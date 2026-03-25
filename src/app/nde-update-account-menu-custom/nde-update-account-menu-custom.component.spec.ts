import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdeUpdateAccountMenuCustomComponent } from './nde-update-account-menu-custom.component';

describe('NdeUpdateAccountMenuCustomComponent', () => {
  let component: NdeUpdateAccountMenuCustomComponent;
  let fixture: ComponentFixture<NdeUpdateAccountMenuCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdeUpdateAccountMenuCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdeUpdateAccountMenuCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
