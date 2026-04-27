type PnxState = { entities: { [x: string]: { pnx: any; }; }; };

// get the pnx data (alma data about the record)
// based on https://github.com/jeremymcwilliams/nde-get-pnx-custom/blob/main/nde-get-pnx-custom.component.ts
// the pnx supplies a array of results, that maps to the results down the page (one for full results, a number for brief)
export const getPnx = (state: PnxState, item: any) => {

    const recordIdElement = item?.querySelector( '[data-recordid]') || item?.querySelector( 'a[ng-href*="docid="], a[href*="docid="], a[href*="doc="]');
    const recordId = recordIdElement?.getAttribute( 'data-recordid') || recordIdElement?.getAttribute( 'docid') || ((recordIdElement?.getAttribute( 'href') || '').match(/(?:docid|doc)=([^&]+)/) || [])[1];

    return state?.entities?.[recordId]?.pnx;
}
