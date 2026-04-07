type PnxState = { entities: { [x: string]: { pnx: any; }; }; };

// get the pnx data (alma data about the record)
export const getPnx = (state: PnxState) => {
    const ids = Object.keys(state.entities || {});
    if (ids.length <= 0) {
        return null;
    }
    if (!ids[0]) {
        return null;
    }
    const id0 = ids[0];
    return state?.entities?.[id0]?.pnx;
}
