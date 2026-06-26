import {createFeatureSelector} from "@ngrx/store";
export const selectSearchState = createFeatureSelector<any>('Search');

export const isFullDisplayPage = () => {
    return window.location.pathname.includes('fulldisplay');
}

export const setRecordIdentifier = (uuid: string | null, prefix: string = 'record') => !!uuid ? `${prefix}-${uuid}` : `record-${uuid}-unknown`;

export const contentIndicatorHtml = (contentIndicatorType: string, contentIndicatorIconHtml: string, testId: string, contentIndicatorLabel: string, iconSize: string): string  => {
    return `<${contentIndicatorType} _ngcontent-ng-content-indicator="" class="record-indication-cont display-inline-block ng-star-inserted">
    <mat-divider _ngcontent-ng-content-indicator="" role="separator" class="mat-divider nde-divider mat-divider-vertical" aria-orientation="vertical"></mat-divider>
    <div _ngcontent-ng-content-indicator="" class="display-inline">
        <mat-icon _ngcontent-ng-content-indicator="" role="img" class="mat-icon notranslate nde-mat-icon-size-${iconSize} mat-icon-no-color ng-star-inserted" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="course-reading-list">
            ${contentIndicatorIconHtml}
        </mat-icon>
        <span _ngcontent-ng-content-indicator="" class="record-indication text-uppercase" data-testid="${testId}">${contentIndicatorLabel}</span>
    </div>
</${contentIndicatorType}>`;
}

function isKeyPressed(e: any, charKeyInput: string, numericKeyInput: number) {
    const keyNumeric = e.charCode || e.keyCode;
    const keyChar = e.key || e.code;
    return keyChar === charKeyInput || keyNumeric === numericKeyInput;
}
export function isReturnKeyPressed(e: any) {
    return isKeyPressed(e, 'Enter', 13);
}
export const currentEnvironmentId = () => {
    let result;

    const paramName ='vid';
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(paramName)) {
        result = urlParams.get(paramName);
    } else {
        const pathSegments = window.location.pathname.split('/');
        const institutionSegment = pathSegments.find(segment =>
            segment.includes('61UQ_INST:')
        );
        result = institutionSegment || null;
    }
    return result;
}

export function getCookieValue(name: string): string|undefined     {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; ++i) {
        const pair = cookies[i].trim().split('=');
        if (!!pair[0] && pair[0] === name) {
            return !!pair[1] ? pair[1] : /* istanbul ignore next */ undefined;
        }
    }
    return undefined;
}

export const mouseoverTooltip = (hoveredElement: HTMLElement | Element, mouseOverlabel: string, toolTipId: string) => {
    const tooltipLengthPixels = 15 * mouseOverlabel.length; // 16px rem; 15 seems to give a good result
    const rect = hoveredElement?.getBoundingClientRect();
    const centreOfElement = ((rect?.right - rect?.left) / 2) + rect.left || null;
    const heightOfHoveredElement = rect?.bottom - rect?.top || 24;
    const tooltipLeft = centreOfElement ? centreOfElement - (tooltipLengthPixels / 4) : tooltipLengthPixels / 4;
    const tooltipTop = (rect?.top ?? 0) + (heightOfHoveredElement);

    const tooltipPositionStyling = `top: ` + tooltipTop + `px; left: ` + tooltipLeft + `px;`;
    const toolTipHtml = `<uql-tooltip id="${toolTipId}" class="cdk-overlay-connected-position-bounding-box" dir="ltr" style="top: 0; left: 0; height: 100%; width: 100%;">
    <div class="cdk-overlay-pane mat-mdc-tooltip-panel-below mat-mdc-tooltip-panel" style="` + tooltipPositionStyling +` transform: translateY(8px);">
        <mat-tooltip-component aria-hidden="true" class="ng-star-inserted">
            <div class="mdc-tooltip mat-mdc-tooltip mat-mdc-tooltip-show" style="transform-origin: center top;">
                <div class="mat-mdc-tooltip-surface mdc-tooltip__surface">` + mouseOverlabel + `</div>
            </div>
        </mat-tooltip-component>
    </div>
</uql-tooltip>`;
    const template = document.createElement('template');
    !!template && (template.innerHTML = toolTipHtml);
    const parent = document.querySelector('.cdk-overlay-container');
    !!template && parent?.appendChild(template.content.cloneNode(true));
}

export const mouseoutTooltip = (toolTipId: string) => {
    const tooltip = document.getElementById(toolTipId);
    !!tooltip && tooltip.remove();
}
