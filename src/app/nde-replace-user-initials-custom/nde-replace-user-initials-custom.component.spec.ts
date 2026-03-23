import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdeReplaceUserInitialsCustomComponent } from './nde-replace-user-initials-custom.component';

describe('NdeReplaceUserInitialsCustomComponent', () => {
  let component: NdeReplaceUserInitialsCustomComponent;
  let fixture: ComponentFixture<NdeReplaceUserInitialsCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdeReplaceUserInitialsCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdeReplaceUserInitialsCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
