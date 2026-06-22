import {contentIndicatorHtml} from "./common";

export type pnxInterface = { control: { recordid: any; }; display: { lds05: any; lds04?: any; }; };

const culturalAdviceIconHtml: string =
    `<svg width="100%" height="100%" viewBox="0 0 24 24" focusable="false">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
</svg>`;

// _content_indicator_icon.scss file in reusable repo duplicates looknfeel of built in primo icons via _ngcontent-ng-content-indicator
export const culturalAdviceIndicatorHtml = (uuid: string)=> {
    const contentIndicatorIconHtml = culturalAdviceIconHtml;
    const testId = 'cultural-advice-icon-label';
    const contentIndicatorLabel = "CULTURAL ADVICE";
    return contentIndicatorHtml(contentIndicatorIconHtml, testId, contentIndicatorLabel, 'medium');
}

export const addCulturalAdviceIndicatorToHeader = (_item?: HTMLElement) => {
    const item = !!_item ? _item : document;
    const template = document.createElement('template');
    // CSS file in reusable repo duplicates styles found on built in icons via _ngcontent-ng-crl indicator
    template.innerHTML = culturalAdviceIndicatorHtml(self.crypto.randomUUID());
    const iconList = item.querySelector('.record-indication-wrapper');
    !!iconList && iconList.appendChild(template.content.cloneNode(true));
}

export const displayPossibleCulturalAdviceIndicator = (pnx: pnxInterface) => {
    const recordIdProvided = !!pnx?.control?.recordid; // eg 61UQ_ALMA51124881340003131
    const culturalAdviceProvided = !!pnx?.display?.lds05; // eg ["Cultural advice - Aboriginal and Torres Strait Islander peoples"]
    if (culturalAdviceProvided && recordIdProvided) {
        addCulturalAdviceIndicatorToHeader();
    }
}

const addCulturalAdviceBanner = (displayText: string) => {
    // eg "Aboriginal and Torres Strait Islander people are warned that this resource may contain images transcripts or names of Aboriginal and Torres Strait Islander people now deceased.  It may also contain historically and culturally sensitive words, terms, and descriptions."
    const displayBlockId = "culturalAdviceBanner";
    const displayBlock = document.getElementById(displayBlockId);
    if (!!displayBlock) {
        // block already exists - don't duplicate
        return;
    }

    const bannerHtml = `<div id="${displayBlockId}" class="standardWarningBanner">
    <div class="uq-icon uq-icon--standard--exclamation-triangle"></div>
<p>
    ${displayText}
</p>
</div>`;
    const bannerTemplate = document.createElement('template');
    bannerTemplate.innerHTML = bannerHtml;

    const parent = document.querySelector('nde-search-result-item-container');
    !!bannerTemplate && !!parent && parent.after(bannerTemplate.content.cloneNode(true));
}

export const displayPossibleCulturalAdviceBanner = (pnx: pnxInterface) => {
    const recordIdProvided = !!pnx?.control?.recordid; // eg 61UQ_ALMA51124881340003131
    const culturalAdviceProvided = !!pnx?.display?.lds05; // eg ["Cultural advice - Aboriginal and Torres Strait Islander peoples"]
    if (culturalAdviceProvided && recordIdProvided) {
        const culturalAdviceBody = pnx?.display?.lds04; // eg "Aboriginal and Torres Strait Islander people are warned that this resource may contain ..."
        !!culturalAdviceBody && culturalAdviceBody.length > 0 && !!culturalAdviceBody[0] && addCulturalAdviceBanner(culturalAdviceBody[0]);
    }
}
