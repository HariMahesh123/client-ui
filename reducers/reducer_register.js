import * as Constants from '../constants';

//
const INITIAL_STATE = {
    data: {status: 'NONE'}
};
//
export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constants.REGISTER.concat(Constants.FULFILLED):
            return {
                data: action.payload.data
            };
        default:
            return state;
    }
}
