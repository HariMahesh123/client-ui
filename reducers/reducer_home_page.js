import * as Constants from '../constants';

//
const INITIAL_STATE = {
    quips:   [],
    stories: [],
    trends:  []
};
//
export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constants.FETCH_HOME_PAGE_DATA:
            return {
                ...state,
                quips:   action.payload.quips,
                stories: action.payload.stories,
                trends:  action.payload.trends
            };
        default:
            return state;
    }
}
