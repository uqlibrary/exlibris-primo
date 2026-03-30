import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdeDisplayCourseReadingListCustomComponent } from './nde-display-course-reading-list-custom.component';

describe('NdeDisplayCourseReadingListCustomComponent', () => {
  let component: NdeDisplayCourseReadingListCustomComponent;
  let fixture: ComponentFixture<NdeDisplayCourseReadingListCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdeDisplayCourseReadingListCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdeDisplayCourseReadingListCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
