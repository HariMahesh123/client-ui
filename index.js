import "babel-polyfill";
import React    from "react";
import ReactDOM from "react-dom";

import { Provider }                              from "react-redux";
import { browserHistory, Router }                from "react-router";
import { applyMiddleware, compose, createStore } from "redux";
import createDebounce                            from "redux-debounce";
import { createPersistor, getStoredState }       from "redux-persist";
import promiseMiddleware                         from "redux-promise-middleware";
import createSagaMiddleware                      from "redux-saga";
import thunk                                     from "redux-thunk";
import "../node_modules/bootstrap/dist/css/bootstrap-theme.css";

import "../node_modules/bootstrap/dist/css/bootstrap.css";
import "../node_modules/react-bootstrap-daterangepicker/css/daterangepicker.css";
import "../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
// import "../node_modules/react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "../node_modules/semantic-ui-css/semantic.min.css";
import "../node_modules/nw-react-slider/dist/nw-react-slider.min.css";
import "../node_modules/react-dates/initialize";
import "../node_modules/react-dates/lib/css/_datepicker.css";
import "../static/css/style.css";
import * as Constants                            from "./constants";
import analyticsMiddleware                       from "./middleware/analytics";
import reducers                                  from "./reducers";
import routes                                    from "./routes";

import { rootSaga } from "./sagas";

//console.log('env', process.env);

// debounce - wait (ms)
const config = {
	simple: 400
};

const debouncer = createDebounce( config );

// create the saga middleware
const sagaMiddleware = createSagaMiddleware();

// if the Redux DevTools Chrome Extensions is available, use it (for debugging)
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const middlewares = [ thunk, debouncer, sagaMiddleware, promiseMiddleware() ];

if ( Constants.GA_TRACKING_ID ) {
	middlewares.push( analyticsMiddleware );
}

const persistConfig = {whitelist: [ "userData" ]};

getStoredState( persistConfig, ( err, restoredState ) => {
	const preloadedState = restoredState.userData ?
		{
			userData         : {loginInfo: restoredState.userData.loginInfo},
			visualizationData: restoredState.visualizationData
		} : {};
	const store          = createStore(
		reducers,
		preloadedState,
		composeEnhancers(
			applyMiddleware( ...middlewares )
		)
	);
	const persistor      = createPersistor( store, persistConfig );

	sagaMiddleware.run( rootSaga );

	ReactDOM.render(
		<Provider store={ window.store = store }>
			<Router
				history={ browserHistory }
				routes={ routes }/>
		</Provider>, document.querySelector( ".container-fluid" )
	);
} );
