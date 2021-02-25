import _ from 'lodash';
import * as Constants from '../constants';

//
const INITIAL_STATE = {
    categories:            [],
    brandSort:             {},
    productSort:           {},
    dataSourceThreshold:   2,
    productThreshold:      2,
    userBrandsControl:     'preferred',
    userIntrinsicsControl: 'preferred',
    showSupportForm:       false,
    submissionOK:          false
};
//
export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        // case FETCH_NAVDATA:
        case Constants.FETCH_NAVDATA.concat(Constants.FULFILLED):
            let categories = action.payload.data.categories;

            categories = _.filter(categories, category => category.status === 1); // filter out all categories that are
                                                                                  // not verified

            return {
                ...state,
                categories: _.sortBy(categories, function (o) {
                    return o.title;
                })
            };
        case Constants.SET_BRAND_SORT_TYPE:
            return {
                ...state,
                brandSort: _.merge({}, state.brandSort, action.payload)
            };
        case Constants.SET_PRODUCT_SORT_TYPE:
            return {
                ...state,
                productSort: _.merge({}, state.productSort, action.payload)
            };
        case Constants.SET_BRAND_NAMES:
            if (action.payload.selectedBrands.length < 2 &&
                state.productSort[action.payload.categoryName] &&
                state.productSort[action.payload.categoryName]["products"] === "name") {
                let newSort                          = {};
                newSort[action.payload.categoryName] = {products: "rank"};
                return {
                    ...state,
                    productSort: _.merge({}, state.productSort, newSort)
                };
            }
        case Constants.SET_PRODUCT_THRESHOLD:
            return {
                ...state,
                productThreshold: action.payload
            };
        case Constants.SET_REVIEW_THRESHOLD:
            return {
                ...state,
                dataSourceThreshold: action.payload
            };
        case Constants.SET_USER_BRANDS_CONTROL:
            return {
                ...state,
                userBrandsControl: action.payload
            };
        case Constants.SET_USER_INTRINSICS_CONTROL:
            return {
                ...state,
                userIntrinsicsControl: action.payload
            };

        case Constants.NAV_ACTION_SUPPORT:
            return {
                ...state,
                showSupportForm: action.payload
            };
        case Constants.SUBMIT_SUPPORT_FORM.concat(Constants.FULFILLED):
            return {
                ...state,
                submissionOK: action.payload.data.status === "OK"
            };
        default:
            return state;
    }
}
