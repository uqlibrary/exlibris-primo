// 'pnx fetch' copied from https://github.com/jeremymcwilliams/nde-get-pnx-custom/blob/main/nde-get-pnx-custom.component.ts

import {Component, inject, OnInit} from '@angular/core';
import {NgIf} from '@angular/common';
import {createFeatureSelector, Store} from '@ngrx/store';

// Selector
export const selectSearchState = createFeatureSelector<any>('Search');

@Component({
  selector: 'custom-nde-report-a-problem-custom',
  standalone: true,
  imports: [NgIf], // required here if used in the html template
  templateUrl: './nde-report-a-problem-custom.component.html',
})
export class NdeReportAProblemCustomComponent implements OnInit {
  private store = inject(Store);
  searchState = this.store.selectSignal(selectSearchState);

  // must declare the properties with its type and an initial value
  show: boolean = true;
  targeturl: string = '';

  ngOnInit(): void {
    // we only want the button to appear once
    const getExistingButton = document.getElementById('report-a-problem-wrapper');
    if (!!getExistingButton) {
      console.log('found', getExistingButton);
      return;
    }

    // get the pnx data (alma data about the record)
    const state = this.searchState();
    const ids = Object.keys(state.entities || {});
    if (ids.length <= 0) {
      return;
    }
    let id0 = !!ids[0] ? ids[0] : null;
    const pnx = !!id0 ? state?.entities?.[id0]?.pnx : null;
    if (!pnx) {
      return;
    }

    let recordId: string = "";
    if (!!pnx?.control?.recordid && pnx.control.recordid.length > 0 && pnx.control.recordid[0]) {
      recordId = encodeURIComponent(pnx.control.recordid[0]);
    }
    if (recordId === "") {
      if (!!pnx?.search?.recordid) {
        recordId = encodeURIComponent(pnx.search.recordid);
      }
    }
    if (recordId === '') {
      if (this.getDocId() !== '') {
        recordId = this.getDocId();
      }
    }

    let recordTitle = '';
    if (!!pnx?.search?.title && pnx.search.title.length > 0 && !!pnx.search.title[0]) {
      recordTitle = encodeURIComponent(pnx.search.title[0]);
    }
    if (recordTitle === '' && !!pnx?.display?.title && pnx.display.title.length > 0 && !!pnx.display.title[0]) {
      recordTitle = encodeURIComponent(pnx.display.title[0]);
    }

    if (recordTitle !== '') {
      const maxNumberCharCRMCanAccept = 239;
      recordTitle = recordTitle.trim().substring(0, maxNumberCharCRMCanAccept);
    }
    if (recordId === "" || recordTitle === "") {
      return;
    }

    let crmDomain = "https://uqcurrent--tst1.custhelp.com";
    const productionDomain = "search.library.uq.edu.au";
    if (window.location.hostname === productionDomain) {
      crmDomain = "https://support.my.uq.edu.au";
    }

    this.targeturl =
      crmDomain +
      "/app/library/contact/report_problem/true/incidents.subject/" +
      recordTitle +
      "/incidents.c$summary/" +
      recordId;
  }

  private getDocId = (): string => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('docid')) {
      return urlParams.get('docid') + '';
    }
    return '';
  }
}
