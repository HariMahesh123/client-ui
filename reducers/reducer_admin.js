import * as Constants from '../constants';

//
const INITIAL_STATE = {
    activeKey: Constants.ADMIN_TAB_VIEW_USERS,
    id:        null
};
//
export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constants.SET_SELECTED_ADMIN_TAB:
            return {
                ...state,
                activeKey: action.payload
            };
        case Constants.ADMIN_UPDATE_USER:
            return {
                ...state,
                id: action.payload
            };
        default:
            return state;
    }
}
