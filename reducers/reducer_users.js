import * as Constants from '../constants';

//
const INITIAL_STATE = {
    data: []
};
//
export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constants.FETCH_USERS.concat(Constants.FULFILLED):
            return {
                ...state,
                data: action.payload.data
            };
        default:
            return state;
    }
}
