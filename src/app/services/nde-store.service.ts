import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { switchMap, distinctUntilChanged } from 'rxjs/operators';
// import { selectFullviewRecord, selectListviewRecord } from '../store/nde-selectors';

import { createSelector, createFeatureSelector } from '@ngrx/store';

// Minimal shape definitions (refine types if you have them)
interface SearchState {
    entities: Record<string, any>;
}
interface FullDisplayState {
    selectedRecordId: string | null;
}

// 1) Feature selectors (names used by NDE app)
const selectSearchState = createFeatureSelector<SearchState>('Search');
const selectFullDisplayState = createFeatureSelector<FullDisplayState>('full-display');

// 2) All records keyed by docid/recordid
const selectSearchEntities = createSelector(
    selectSearchState,
    (state) => state?.entities ?? {}
);

// 3) Fullview selected record ID
const selectFullviewRecordId = createSelector(
    selectFullDisplayState,
    (state) => state?.selectedRecordId ?? null
);

// 4) Fullview record (includes pnx/display)
const selectFullviewRecord = createSelector(
    selectFullviewRecordId,
    selectSearchEntities,
    (recordId, entities) => (recordId ? entities[recordId] : null)
);

// 5) Parameterized listview record selector
const selectListviewRecord = (recordId: string | null) =>
    createSelector(selectSearchEntities, (entities) =>
        recordId ? entities[recordId] : null
    );

@Injectable({ providedIn: 'root' })
export class NdeStoreService {
    constructor(private store: Store) {}

    /**
     * Returns an Observable of the current record:
     * - In Fullview: selectFullviewRecord
     * - In Listview: use recordId from hostComponent.searchResult.pnx.control.recordid[0]
     */
    getRecord$(hostComponent: any): Observable<any> {
        const listRecordId: string | null =
            hostComponent?.searchResult?.pnx?.control?.recordid?.[0] ?? null;

        return this.store.select(selectFullviewRecord).pipe(
            switchMap((fullview) =>
                fullview
                    ? of(fullview)
                    : this.store.select(selectListviewRecord(listRecordId))
            ),
            // Basic guard to avoid emitting identical references back-to-back
            distinctUntilChanged()
        );
    }
}
