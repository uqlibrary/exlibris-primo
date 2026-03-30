import { Component, OnInit, Input, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface TalisCourse {
    url: string;
    displayName: string;
}

@Component({
  selector: 'custom-nde-display-course-reading-list-custom',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nde-display-course-reading-list-custom.component.html',
  styleUrl: './nde-display-course-reading-list-custom.component.scss'
})
export class NdeDisplayCourseReadingListCustomComponent implements OnInit {
    @Input() parentCtrl: any;

    courses: TalisCourse[] = [];
    showReadingLists = false;

    private readonly TALIS_DOMAIN = 'https://uq.rl.talis.com/';
    private readonly UNSAFE_READING_LIST_BASE_URL = 'http://lr.library.uq.edu.au';
    private readonly SAFE_READING_LIST_BASE_URL = 'https://uq.rl.talis.com';

    // Material types that should not use ISBN/ISSN lookups
    private readonly RESTRICTED_CHECK_LIST = [
        'article',
        'book_chapter',
        'conference_paper',
        'conference_proceeding',
        'dataset',
        'design',
        'government_document',
        'magazinearticle',
        'magazine_article',
        'market_research',
        'newsletterarticle',
        'newsletter_article',
        'newspaper_article',
        'patent',
        'questionnaire',
        'reference_entry',
        'report',
        'review',
        'web_resource',
        'working_paper',
    ];

    constructor(
        private http: HttpClient,
        private sanitizer: DomSanitizer
    ) {}

    ngOnInit() {
        if (!this.isFullDisplayPage()) {
            return;
        }

        this.displayReadingListIndicator();
    }

    private isFullDisplayPage(): boolean {
        return window.location.pathname.includes('fulldisplay');
    }

    private async displayReadingListIndicator() {
        const item = this.parentCtrl?.item;
        if (!item) {
            return;
        }

        const listTalisUrls = this.getListTalisUrls(item);
        if (!listTalisUrls || listTalisUrls.length === 0) {
            return;
        }

        await this.getTalisDataFromAllApiCalls(listTalisUrls);
    }

    private async getTalisDataFromAllApiCalls(listUrls: string[]) {
        const courseList: { [key: string]: string } = {};

        const listUrlsToCall = listUrls.filter(url => url.startsWith('http'));

        // Create JSONP requests for each URL
        const promises = listUrlsToCall.map(url =>
            this.http.jsonp(url, 'cb').toPromise()
                .catch(err => {
                    console.warn('Failed to fetch Talis data from:', url, err);
                    return null;
                })
        );

        try {
            const responses = await Promise.allSettled(promises);

            responses.forEach((result) => {
                if (result.status === 'fulfilled' && result.value) {
                    const data = result.value as any;
                    for (const talisUrl in data) {
                        const subjectCode = data[talisUrl];
                        if (!courseList[talisUrl]) {
                            courseList[talisUrl] = subjectCode;
                        }
                    }
                }
            });

            if (Object.keys(courseList).length > 0) {
                this.processCourseList(courseList);
            }
        } catch (error) {
            console.error('Error fetching Talis reading lists:', error);
        }
    }

    private processCourseList(courseList: { [key: string]: string }) {
        // Sort by course code for display
        const sortable: [string, string][] = [];

        for (const talisUrl in courseList) {
            const subjectCode = courseList[talisUrl];
            sortable.push([talisUrl, subjectCode]);
        }

        sortable.sort((a, b) => {
            return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0;
        });

        this.courses = sortable.map(entry => ({
            url: this.fixUnsafeReadingListUrl(this.addUrlParam(entry[0], 'login', 'true')),
            displayName: entry[1]
        }));

        this.showReadingLists = true;
    }

    private fixUnsafeReadingListUrl(url: string): string {
        return url.replace(this.UNSAFE_READING_LIST_BASE_URL, this.SAFE_READING_LIST_BASE_URL);
    }

    private addUrlParam(url: string, name: string, value: string): string {
        const param = `${name}=${value}`;
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}${param}`;
    }

    private getListTalisUrls(item: any): string[] {
        const list: string[] = [];

        const materialType = item?.pnx?.display?.type?.[0];
        const isRestrictedCheckType = this.RESTRICTED_CHECK_LIST.includes(materialType);

        // LCN (Library Control Number)
        if (item?.pnx?.control?.sourcerecordid?.length > 0) {
            item.pnx.control.sourcerecordid.forEach((r: string) => {
                list.push(`${this.TALIS_DOMAIN}lcn/${r}/lists.json`);
            });
        }

        // DOI
        if (item?.pnx?.addata?.doi?.length > 0) {
            item.pnx.addata.doi.forEach((r: string) => {
                list.push(`${this.TALIS_DOMAIN}doi/${r}/lists.json`);
            });
        }

        // EISBN (Electronic ISBN)
        if (!isRestrictedCheckType && item?.pnx?.addata?.eisbn?.length > 0) {
            item.pnx.addata.eisbn.forEach((r: string) => {
                const isbn = r.replace(/[^0-9X]+/gi, '');
                if ([10, 13].includes(isbn.length)) {
                    list.push(`${this.TALIS_DOMAIN}eisbn/${isbn}/lists.json`);
                }
            });
        }

        // ISBN
        if (!isRestrictedCheckType && item?.pnx?.addata?.isbn?.length > 0) {
            item.pnx.addata.isbn.forEach((r: string) => {
                const isbn = r.replace(/[^0-9X]+/gi, '');
                if ([10, 13].includes(isbn.length)) {
                    list.push(`${this.TALIS_DOMAIN}isbn/${isbn}/lists.json`);
                }
            });
        }

        // EISSN (Electronic ISSN)
        if (!isRestrictedCheckType && item?.pnx?.addata?.eissn?.length > 0) {
            item.pnx.addata.eissn.forEach((r: string) => {
                list.push(`${this.TALIS_DOMAIN}eissn/${r}/lists.json`);
            });
        }

        // ISSN
        if (!isRestrictedCheckType && item?.pnx?.addata?.issn?.length > 0) {
            item.pnx.addata.issn.forEach((r: string) => {
                list.push(`${this.TALIS_DOMAIN}issn/${r}/lists.json`);
            });
        }

        return list;
    }
}
