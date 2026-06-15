import {createFeatureSelector} from "@ngrx/store";
export const selectSearchState = createFeatureSelector<any>('Search');

export const isFullDisplayPage = () => {
    return window.location.pathname.includes('fulldisplay');
}

export const setRecordIdentifier = (uuid: string | null, prefix: string = 'record') => !!uuid ? `${prefix}-${uuid}` : `record-${uuid}-unknown`;

export const contentIndicatorHtml= (contentIndicatorIconHtml: string, testId: string, contentIndicatorLabel: string, iconSize: string): string  => {
    return `<div _ngcontent-ng-content-indicator="" class="record-indication-cont display-inline-block ng-star-inserted">
    <mat-divider _ngcontent-ng-content-indicator="" role="separator" class="mat-divider nde-divider mat-divider-vertical" aria-orientation="vertical"></mat-divider>
    <div _ngcontent-ng-content-indicator="" class="display-inline">
        <mat-icon _ngcontent-ng-content-indicator="" role="img" class="mat-icon notranslate nde-mat-icon-size-${iconSize} mat-icon-no-color ng-star-inserted" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="course-reading-list">
            ${contentIndicatorIconHtml}
        </mat-icon>
        <span _ngcontent-ng-content-indicator="" class="record-indication text-uppercase" data-testid="${testId}">${contentIndicatorLabel}</span>
    </div>
</div>`;
}

function isKeyPressed(e: any, charKeyInput: string, numericKeyInput: number) {
    const keyNumeric = e.charCode || e.keyCode;
    const keyChar = e.key || e.code;
    return keyChar === charKeyInput || keyNumeric === numericKeyInput;
}
export function isReturnKeyPressed(e: any) {
    return isKeyPressed(e, 'Enter', 13);
}
