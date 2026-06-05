import {createFeatureSelector} from "@ngrx/store";
export const selectSearchState = createFeatureSelector<any>('Search');

export const isFullDisplayPage = () => {
    return window.location.pathname.includes('fulldisplay');
}

export const setRecordIdentifier = (uuid: string | null, prefix: string = 'record') => !!uuid ? `${prefix}-${uuid}` : `record-${uuid}-unknown`;
