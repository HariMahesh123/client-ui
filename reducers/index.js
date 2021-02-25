import {loadingBarReducer} from 'react-redux-loading-bar';
import {combineReducers} from 'redux';
import {reducer as formReducer} from 'redux-form';
import * as Constants from '../constants';
import AdminReducer from './reducer_admin';
import BrandsReducer from './reducer_get_selected_brands';
import IntrinsicReviewsReducer from './reducer_intrinsics_reviews_page';
import LoginReducer from './reducer_login';
import NavReducer from './reducer_nav';
import ProductsReducer from './reducer_products_page';
import RegisterReducer from './reducer_register';
import CategoryReducer from './reducer_set_category';
import UsersReducer from './reducer_users';
import VisualizationReducer from './reducer_visualization';
import VisualizationDataReducer from './reducer_visualization_data';
//
// this constructs the application state
const appReducer = combineReducers({
    nav:               NavReducer,
    category:          CategoryReducer,
    brands:            BrandsReducer,
    products:          ProductsReducer,
    intrinsics:        IntrinsicReviewsReducer,
    visualization:     VisualizationReducer,
    visualizationData: VisualizationDataReducer,
    userData:          LoginReducer,
    registration:      RegisterReducer,
    form:              formReducer,
    loadingBar:        loadingBarReducer,
    admin:             AdminReducer,
    users:             UsersReducer
});
// need to revert to initial state upon logout
// https://stackoverflow.com/questions/35622588/how-to-reset-the-state-of-a-redux-store
const rootReducer = (state, action) => {
    if (action.type === Constants.LOGOUT.concat(Constants.FULFILLED)) {
        state = undefined;
    }

    return appReducer(state, action);
};
//
export default rootReducer;
