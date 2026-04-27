
const TALIS_DOMAIN = 'https://uq.rl.talis.com/';

// Material types that should not use ISBN/ISSN lookups
const RESTRICTED_CHECK_LIST = [
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

export const getListTalisUrls = (pnx: any, uid: string = '') => {
    const list: string[] = [];

    const materialType = pnx?.display?.type?.[0];
    const isRestrictedCheckType = RESTRICTED_CHECK_LIST.includes(materialType);

    // LCN (Library Control Number)
    if (pnx?.control?.sourcerecordid?.length > 0) {
        pnx.control.sourcerecordid.forEach((r: string) => {
            // console.log(uid, "CRL:: getListTalisUrls LCN - pnx?.control?.sourcerecordid r=", r);
            list.push(`${TALIS_DOMAIN}lcn/${r}/lists.json`);
        });
    }

    // DOI
    if (pnx?.addata?.doi?.length > 0) {
        pnx.addata.doi.forEach((r: string) => {
            list.push(`${TALIS_DOMAIN}doi/${r}/lists.json`);
        });
    }

    // EISBN (Electronic ISBN)
    if (!isRestrictedCheckType && pnx?.addata?.eisbn?.length > 0) {
        pnx.addata.eisbn.forEach((r: string) => {
            const isbn = r.replace(/[^0-9X]+/gi, '');
            if ([10, 13].includes(isbn.length)) {
                list.push(`${TALIS_DOMAIN}eisbn/${isbn}/lists.json`);
            }
        });
    }

    // ISBN
    if (!isRestrictedCheckType && pnx?.addata?.isbn?.length > 0) {
        pnx.addata.isbn.forEach((r: string) => {
            const isbn = r.replace(/[^0-9X]+/gi, '');
            if ([10, 13].includes(isbn.length)) {
                list.push(`${TALIS_DOMAIN}isbn/${isbn}/lists.json`);
            }
        });
    }

    // EISSN (Electronic ISSN)
    if (!isRestrictedCheckType && pnx?.addata?.eissn?.length > 0) {
        pnx.addata.eissn.forEach((r: string) => {
            list.push(`${TALIS_DOMAIN}eissn/${r}/lists.json`);
        });
    }

    // ISSN
    if (!isRestrictedCheckType && pnx?.addata?.issn?.length > 0) {
        pnx.addata.issn.forEach((r: string) => {
            list.push(`${TALIS_DOMAIN}issn/${r}/lists.json`);
        });
    }

    return list;
}

// _course_reading_icon.scss file in reusable repo duplicates looknfeel of built in primo icons via _ngcontent-ng-crlindicator
export const CRLiconHtml = `<div id="crl-icon" _ngcontent-ng-crlindicator="" class="record-indication-cont-crl record-indication-cont display-inline-block ng-star-inserted">
    <mat-divider _ngcontent-ng-crlindicator="" role="separator" class="mat-divider nde-divider mat-divider-vertical" aria-orientation="vertical"></mat-divider>
    <div _ngcontent-ng-crlindicator="" class="display-inline">
        <mat-icon _ngcontent-ng-crlindicator="" role="img" class="mat-icon notranslate nde-mat-icon-size-small margin-right-small mat-icon-no-color ng-star-inserted" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="course-reading-list">
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">
                <path d="M4 10h3v7H4zm6.5 0h3v7h-3zM2 19h20v3H2zm15-9h3v7h-3zm-5-9L2 6v2h20V6z"></path>
            </svg>
        </mat-icon>
        <span _ngcontent-ng-crlindicator="" class="record-indication text-uppercase" data-testid="course-reading-list">COURSE READING LIST</span>
    </div>
</div>`;
