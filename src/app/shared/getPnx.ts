type PnxState = { entities: { [x: string]: { pnx: any; }; }; };

// get the pnx data (alma data about the record)
// based on https://github.com/jeremymcwilliams/nde-get-pnx-custom/blob/main/nde-get-pnx-custom.component.ts
export const getPnx = (state: PnxState, source: String = 'rap') => {
    (source !== 'rap') && console.log('getPnx', source, ' state=', state);
    const ids = Object.keys(state.entities || {});
    if (ids.length <= 0) {
        return null;
    }
    if (!ids[0]) {
        return null;
    }
    const id0 = ids[0];
    const pnx = state?.entities?.[id0]?.pnx;
    (source !== 'rap') && console.log('getPnx', source, ' return', pnx);
    return pnx;
}
