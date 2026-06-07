export type pnxInterface = { control: { recordid: any; }; display: { lds05: any; }; };

const culturalAdviceIconHtml: string =
    `<svg width="100%" height="100%" viewBox="0 0 24 24" focusable="false">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
</svg>`;

export const culturalAdviceIndicatorHtml = (uuid: string)=> `<div id="ca-icon" _ngcontent-ng-ca${uuid}indicator="" class="record-indication-cont-ca record-indication-cont display-inline-block ng-star-inserted">
    <mat-divider _ngcontent-ngca${uuid}indicator="" role="separator" class="mat-divider nde-divider mat-divider-vertical" aria-orientation="vertical"></mat-divider>
    <div _ngcontent-ngca${uuid}indicator="" class="display-inline">
        <mat-icon _ngcontent-ngca${uuid}indicator="" role="img" class="mat-icon notranslate nde-mat-icon-size-small margin-right-small mat-icon-no-color ng-star-inserted" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="course-reading-list">
            ${culturalAdviceIconHtml}
        </mat-icon>
        <span _ngcontent-ngca${uuid}indicator="" class="record-indication text-uppercase" data-testid="course-reading-list">CULTURAL ADVICE</span>
    </div>
</div>`;

export const addCulturalAdviceIndicatorToHeader = () => {
    const template = document.createElement('template');
    // css file in reusable repo duplicates styles found on built in icons via _ngcontent-ng-crl indicator
    template.innerHTML = culturalAdviceIndicatorHtml(self.crypto.randomUUID());
    const iconlist = document.querySelector('.record-indication-wrapper');
    !!iconlist && iconlist.appendChild(template.content.cloneNode(true));
}