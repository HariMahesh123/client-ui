import * as Constants from '../constants';

const INITIAL_STATE = {
    selectedBrands:      [],
    allBrands:           [],
    preferredBrands:     [],
    displayedBrands:     [],
    brandsChecked:       [],
    allIntrinsics:       [],
    selectedIntrinsics:  [],
    preferredIntrinsics: [],
    displayedIntrinsics: [],
    intrinsicsChecked:   [],
    brandData:           [],
    categoryName:        '',
    brandSummary:        {
        productCount:    0,
        dataSourceCount: 0,
        intrinsics:      {}
    }
};
//
export default function (state = INITIAL_STATE, action) {

    switch (action.type) {
        case Constants.GET_BRAND_NAMES.concat(Constants.FULFILLED):
            return {
                ...state,
                selectedBrands:     [],
                allBrands:          action.payload.data.names.sort(),
                brandNameMapping:   action.payload.data.nameMapping,
                brandIdMapping:     action.payload.data.idMapping,
                selectedIntrinsics: []
            };
        case Constants.GET_BRAND_DATA.concat(Constants.FULFILLED):
            return {
                ...state,
                brandData: action.payload.data.brands
            };
        case Constants.GET_BRAND_INTRINSICS.concat(Constants.FULFILLED):
            return {
                ...state,
                allIntrinsics:        action.payload.data.names.sort(),
                intrinsicNameMapping: action.payload.data.nameMapping,
                intrinsicIdMapping:   action.payload.data.idMapping
            };
        default:
            return state;
    }
}
