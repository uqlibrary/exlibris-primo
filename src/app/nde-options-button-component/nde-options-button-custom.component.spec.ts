import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdeOptionsButtonCustom } from './nde-options-button-custom.component';

describe('NdeOptionsButtonCustom', () => {
  let component: NdeOptionsButtonCustom;
  let fixture: ComponentFixture<NdeOptionsButtonCustom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdeOptionsButtonCustom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdeOptionsButtonCustom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
