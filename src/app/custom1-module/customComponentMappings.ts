import {NdeReportAProblemCustomComponent} from "../nde-report-a-problem-custom/nde-report-a-problem-custom.component";
import {
  NdeUpdateAccountMenuCustomComponent
} from "../nde-update-account-menu-custom/nde-update-account-menu-custom.component";
import {
    NdeDisplayCourseReadingListCustomComponent
} from "../nde-display-course-reading-list-custom/nde-display-course-reading-list-custom.component";
import {
    NdeDisplayCourseReadingListOnBriefCustomComponent
} from "../nde-display-course-reading-list-on-brief-custom/nde-display-course-reading-list-on-brief-custom.component";
import {NdeCountOfFiltersCustomComponent} from "../nde-count-of-filters-custom/nde-count-of-filters-custom.component";

export const selectorComponentMap = new Map<string, any>([

  ['nde-full-display-service-container-after', NdeReportAProblemCustomComponent],
  ['nde-user-area-after', NdeUpdateAccountMenuCustomComponent],
  ['nde-full-display-container-after', NdeDisplayCourseReadingListCustomComponent],
  ['nde-record-indications-after', NdeDisplayCourseReadingListOnBriefCustomComponent],
  ['nde-filters-group-after', NdeCountOfFiltersCustomComponent],
]);
