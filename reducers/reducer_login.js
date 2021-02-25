import _ from 'lodash';
import {persistStore} from 'redux-persist';
import * as Constants from '../constants';
import * as Utils from '../utils';

//
const INITIAL_STATE = {
    passwordLostResult: 'xx',
    loginInfo:          {
        authorizationRole: "",
        message:           "unattempted",
        success:           "unattempted"
    },
    userData:           {
        selectedCategory: Constants.ADMIN_DEFAULT_CATEGORY_NAME,
        preferences:      {
            cars: {
                categoryTitle:           Constants.ADMIN_DEFAULT_CATEGORY_TITLE,
                categoryName:            Constants.ADMIN_DEFAULT_CATEGORY_NAME,
                allBrandsMap:            [],
                allIntrinsicsMap:        [],
                preferredIntrinsicNames: [],
                preferredBrandNames:     []
            }
        },
        categoryMap:      false
    }
};
//
let userObj         = {};
let mergedSettings  = {};

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constants.LOGIN.concat(Constants.FULFILLED):
            // set some defaults if none exist
            userObj        = action.payload.data.user;
            //userObj.selectedCategory = userObj.selectedCategory;
            mergedSettings = _.merge({}, INITIAL_STATE.userData, userObj);
            // Utils.debugLogger( 'mergedSettings', mergedSettings, 'userData', userObj, 'initial', INITIAL_STATE );
            return {
                ...state,
                userData: mergedSettings
                // userData: JSON.parse(action.payload.data.user)
            };
        case Constants.LOGOUT.concat(Constants.FULFILLED):
            return {
                ...state,
                loginInfo: {
                    authorizationRole: "",
                    message:           "unattempted",
                    success:           "unattempted"
                }
            };
        case Constants.LOGOUT:
            return {
                ...state,
                loginInfo: {
                    authorizationRole: "",
                    message:           "unattempted",
                    success:           "unattempted"
                }
            };

            // persistStore(store).purge(); // ask Nicholas about this

        case Constants.CURATION_UPDATE_BRAND.concat(Constants.FULFILLED):
            return {
                ...state,
                userData: action.payload.data.user
                // userData: JSON.parse(action.payload.data.user)
            };
        //case Constants.SET_PREFERRED_BRANDS.concat(Constants.FULFILLED):
        //
        //    userObj = {};
        //    userObj.selectedCategory = userObj.selectedCategory ? userObj.selectedCategory :
        // Constants.ADMIN_DEFAULT_CATEGORY_NAME; mergedSettings = _.merge({}, INITIAL_STATE.userData, userObj); //
        // Utils.debugLogger( 'mergedSettings', mergedSettings, 'userData', userObj, 'initial', INITIAL_STATE ); return
        // { ...state, userData: mergedSettings // userData: JSON.parse(action.payload.data.user) }; case
        // Constants.SET_PREFERRED_INTRINSICS.concat(Constants.FULFILLED): userObj = action.payload.data.user;
        // userObj.selectedCategory = userObj.selectedCategory ? userObj.selectedCategory :
        // Constants.ADMIN_DEFAULT_CATEGORY_NAME; mergedSettings = _.merge({}, INITIAL_STATE.userData, userObj); //
        // Utils.debugLogger( 'mergedSettings', mergedSettings, 'userData', userObj, 'initial', INITIAL_STATE ); return
        // { ...state, userData: mergedSettings // userData: JSON.parse(action.payload.data.user) };
        case Constants.SET_CATEGORY.concat(Constants.FULFILLED):
            Utils.debugLogger('reducer_login: set_category_fulfilled', action.response.user);
            return {
                ...state,
                userData: action.response.user
            };
        case Constants.SET_LOGIN_INFO:
            return {
                ...state,
                loginInfo: action.payload
            };

        case Constants.AWS_USER_CHANGE_PASSWORD.concat(Constants.FULFILLED) :

            return {
                ...state,
                passwordChangeResult: action.payload.data.success
            };

        case Constants.AWS_USER_LOST_PASSWORD.concat(Constants.FULFILLED) :

            return {
                ...state,
                passwordLostResult: action.payload.data.success
            };

        case Constants.AWS_USER_RESET_CHANGE_PASSWORD_STATUS :

            return {
                ...state,
                passwordChangeResult: 'xx'
            };

        case Constants.AWS_USER_RESET_LOST_PASSWORD_STATUS :

            return {
                ...state,
                passwordLostResult: 'xx'
            };
        case 'FAILURE':
            Utils.debugLogger('Error(reducer)', action, action.message);
            alert(action.message);
            return {
                ...state,
                error: action.message
            };
        default:
            return state;
    }

}
