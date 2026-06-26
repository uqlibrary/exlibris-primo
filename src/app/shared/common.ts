import {ElementRef} from '@angular/core';
import {createFeatureSelector} from "@ngrx/store";
export const selectSearchState = createFeatureSelector<any>('Search');

export type pnxInterface = { control: { recordid: any; }; display: { lds05: any; lds04?: any; type: any }; item: {delivery: { availability: any }}; };

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

function isKeyPressed(e: any, charKeyInput: string, numericKeyInput: number) {
    const keyNumeric = e.charCode || e.keyCode;
    const keyChar = e.key || e.code;
    return keyChar === charKeyInput || keyNumeric === numericKeyInput;
}
export function isReturnKeyPressed(e: any) {
    return isKeyPressed(e, 'Enter', 13);
}

export function findHostRecord(elementRef: ElementRef, soughtElement: string = 'nde-search-filters-side-nav'): HTMLElement | null {
    const nativeEl: HTMLElement = elementRef.nativeElement;

    let cursor: HTMLElement | null = nativeEl;
    while (cursor) {
        // Check previous siblings at this level for nde-search-filters-side-nav
        let sibling = cursor.previousElementSibling as HTMLElement | null;
        while (sibling) {
            if (sibling.tagName.toLowerCase() === soughtElement) {
                return sibling;
            }
            // Also check if it's nested inside a sibling wrapper
            const nested = sibling.querySelector(soughtElement);
            if (nested) {
                return nested as HTMLElement;
            }
            sibling = sibling.previousElementSibling as HTMLElement | null;
        }

        // Move up one level and try again
        cursor = cursor.parentElement;

        // don't walk too far up the tree if not found
        if (cursor?.tagName.toLowerCase() === 'main' || cursor?.tagName.toLowerCase() === 'body') {
            break;
        }
    }

    return null;
}