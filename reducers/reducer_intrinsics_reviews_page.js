import * as Constants from '../constants';

//
const INITIAL_STATE = {
    intrinsicsData:                [],
    reviewsForBrandIntrinsicsData: []
};
//
export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constants.GET_REVIEWS_FOR_INTRINSIC.concat(Constants.FULFILLED):
            return {
                ...state,
                exemplars:  action.payload.data.exemplars,
                terms:      action.payload.data.terms,
                topicWords: action.payload.data.topicWords,
                wordScores: action.payload.data.wordScores
            };
        case Constants.GET_REVIEWS_FOR_BRAND_INTRINISIC.concat(Constants.FULFILLED):
            return {
                ...state,
                exemplars:  action.payload.data.exemplars,
                terms:      action.payload.data.terms,
                topicWords: action.payload.data.topicWords,
                wordScores: action.payload.data.wordScores
            };
        default:
            return state;
    }
}
