import {Component, OnInit} from '@angular/core';
import {isFullDisplayPage} from "../shared/common";
import {CourseReadingListFullFunctions} from "./CourseReadingListFullFunctions";

@Component({
    selector: 'custom-nde-content-indicators-on-full-custom',
    standalone: true,
    templateUrl: './nde-content-indicators-on-full-custom.component.html',
})
export class NdeContentIndicatorsOnFullCustomComponent implements OnInit {
    private crl;
    constructor() {
        this.crl = new CourseReadingListFullFunctions();
    }
    ngOnInit(): void {
        if (!isFullDisplayPage) {
            return;
        }

        this.crl.displayCourseReadingListIndicatorAndList();
    }
}
