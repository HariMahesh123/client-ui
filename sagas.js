import axios                                             from "axios";
import _                                                 from "lodash";
import moment                                            from "moment";
import { hideLoading, showLoading }                      from "react-redux-loading-bar";
import { all, call, put, select, takeEvery, takeLatest } from "redux-saga/effects";
//import 'regenerator-runtime/runtime';
import * as Constants                                    from "./constants";
import * as Utils                                        from "./utils";

const ROOT_URL          = Constants.PREDICTA_SERVICES_DOMAIN;
const PREDICTA_AUTH     = Constants.PREDICTA_AUTH;
const EVENT_URL         = `${PREDICTA_AUTH}/event`;
const PUBLICATIONS_URL  = `${ROOT_URL}/publication`;
const CATEGORY_URL      = `${ROOT_URL}/category`;
const BRAND_URL         = `${ROOT_URL}/brand`;
const PRODUCT_URL       = `${ROOT_URL}/product`;
const VISUALIZATION_URL = `${ROOT_URL}/timeseries`; // uncomment for new timeseries API
const TOPICS_URL        = `${ROOT_URL}/topics`;


const EMPTY_CATEGORY_PREFS = {
	preferredBrands    : [],
	preferredIntrinsics: []
};


function* handleError( error ) {
	let msg = "";
	Utils.debugLogger( "ERROR:", error );
	// if (error.response && error.response.status) {
	// 	msg = `ERROR: [${error.response.status}]`;
	// 	Utils.debugLogger( msg, 'response:', error.response );
	// }
	//
	// if (error.msg) {
	// 	msg = error.message;
	// } else {
	// 	msg = error;
	// }
	yield put( {
		type   : "FAILURE",
		message: error
	} );
}

export function* _updatePreferences( prefs ) {
	let url = `${PREDICTA_AUTH}/preferences/update`;

	//yield call(axios.post, url, {
	//    email:       email,
	//    preferences: storedPrefs,
	//    workingSets: storedWorkingSets,
	//    events:      storedEvents
	//});

	yield call( axios.post, url, prefs );
}

export function* _setPreferredBrands( categoryId, brandIds, brandNames ) {
	yield put( {
		type   : Constants.SET_PREFERRED_BRANDS.concat( Constants.FULFILLED ),
		payload: {
			categoryId: categoryId,
			brandIds  : brandIds,
			brandNames: brandNames
		}
	} );
}

export function* _setPreferredIntrinsics( categoryId, intrinsicIds, intrinsicNames ) {
	yield put( {
		type   : Constants.SET_PREFERRED_INTRINSICS.concat( Constants.FULFILLED ),
		payload: {
			categoryId    : categoryId,
			intrinsicIds  : intrinsicIds,
			intrinsicNames: intrinsicNames
		}
	} );
}

export function* setPreference( setting, value ) {
	Utils.debugLogger( "setPreference", setting, value );


	const state = store.getState();
	const email = state.userData.loginInfo.email;

	try {
		// read the preferences

		let url      = `${PREDICTA_AUTH}/preferences/read`;
		let response = yield call( axios.post, url, {email: email} );

		let workingSets = {};
		let preferences = {};
		let events      = {};

		let workingSetsPath = "data.data.workingSets";
		let preferencesPath = "data.data.preferences";
		let eventsPath      = "data.data.events";

		if ( _.get( response, preferencesPath ) && !_.isEmpty( response.data.data.preferences.M ) ) {
			preferences = response.data.data.preferences.M;
		}

		if ( _.get( response, workingSetsPath ) && !_.isEmpty( response.data.data.workingSets.M ) ) {
			workingSets = response.data.data.workingSets.M;
		}

		if ( _.get( response, eventsPath ) && !_.isEmpty( response.data.data.events.M ) ) {
			events = response.data.data.events.M;
		}

		if ( !_.get( preferences, "settings" ) ) {
			preferences.settings = {};
		}

		preferences.settings[ setting ] = value;

		/** update preference **/
		url = `${PREDICTA_AUTH}/preferences/update`;
		response = yield call( axios.post, url, {
			email      : email,
			preferences: preferences,
			workingSets: workingSets,
			events     : events
		} );


	} catch ( error ) {
		handleError( error );
	}
}

export function* setCategoryAsync( action ) {
	try {

		yield put( showLoading() );

		/** BEGIN **/

		/**  get the selected category ID **/
		const categoryId = action.payload.categoryId;

		/**  get the application state **/
		const state = store.getState();

		let response = null;

		/** BEGIN: get user information **************************************************************************/
		let user = {};

		// get the user's role
		const userRoleName = state.userData.loginInfo.authorizationRole;
		// get the user's categories
		let userCategories = state.userData.loginInfo.categories.split( "," );
		// get the user's email
		const userEmail    = state.userData.loginInfo.email;

		const userCompany = state.userData.loginInfo.companyName;

		//get the PERMISSIONS from the role and add these to the logged in user data
		//  a dictionary of permission objects for this user
		let userPermissions = yield call( axios.post, `${PREDICTA_AUTH}/role/read`, {roleName: userRoleName} );
		userPermissions     = userPermissions.data.data;
		const stringData    = _.mapValues( userPermissions, "S" );
		const boolData      = _.mapValues( userPermissions, "BOOL" );
		userPermissions     = _.merge( stringData, boolData );
		/** END: get user information **************************************************************************/


		/** BEGIN: get ALL categories **************************************************************************/
		let allCategories = state.nav.categories;

		if ( !allCategories.length ) { // need to get the categories
			const categoriesResponse = yield call( axios.get, `${CATEGORY_URL}/categories` );
			yield put( {
				type   : Constants.FETCH_NAVDATA.concat( Constants.FULFILLED ),
				payload: categoriesResponse
			} );

			allCategories = _.filter( categoriesResponse.data.categories, category => category.status === Constants.VERIFIED );
		}
		/** END: get ALL categories **************************************************************************/


		/** BEGIN: get the brands and intrinsics data for selected category **********************************/
		let brandsResponse = yield call( axios.get, `${ROOT_URL}/category/${categoryId}/brands` );

		yield put( {
			type   : Constants.GET_ALL_BRANDS_MAP.concat( Constants.FULFILLED ),
			payload: brandsResponse
		} );

		let _verifiedAllBrandsMap = brandsResponse.data.allBrandsMap;

		_verifiedAllBrandsMap = _.filter( _verifiedAllBrandsMap, function ( o ) {
			// only verified brands, not a child, and has intrinsics
			return ( o.status === Constants.VERIFIED && o.parent === null );
		} );


		let _verifiedIdMapping = {};

		// build filtered idMapping
		_.each( _verifiedAllBrandsMap, function ( brandObj ) {
			_verifiedIdMapping[ brandObj.brandId ] = brandObj.name;
		} );

        //let state = store.getState();
        let intrinsicType = state.category.navigationType;
        const companyname = state.userData.loginInfo.companyName;
        // get the topic associated with custom and build the idto intrinsic map for that.
        // default intrinsic is associated with the brandResponse data.
        if (intrinsicType == "intrinsics_reports")
        {
            let url1 = `${PREDICTA_AUTH}/company/read`;
            let storedPrefs = yield call(axios.post, url1, {companyName: companyname});
            // get companyID from response
            let companyId = storedPrefs.data.data.companyId.S;
            // filter.company_id = companyId; // update the filter so the API code knows about it.
            try {
                //
                let response = yield call(axios.get, `${TOPICS_URL}/${categoryId}?company_id=${companyId}`);
                // console.log("getTopicsAsync response", JSON.stringify(response));
                //  now build the idmap here
                // let custom_data = response.data;
                let custom_data = response.data;
                let custom_topics = custom_data.topics;
                let custom_idToTopicMap=  {};
                for (let i=0;i<custom_topics.length;i++) {
                    custom_idToTopicMap[custom_topics[i].topicId] = custom_topics[i].name;
                }
                brandsResponse.data.idToTopicMap = custom_idToTopicMap;
               // console.log("the dictionary ", custom_idToTopicMap);

            } catch ( error ) {
                yield call( handleError, error );
            }
        }

		let _idToTopicMap = brandsResponse.data.idToTopicMap;


		/** END: get the brands and intrinsics data for selected category **********************************/


		/** BEGIN: create the category map from the brand and intrinsic data *******************************/
		let verifiedCategoryMap = allCategories.map( o => {

			// invert, then convert id from string to number
			let verifiedAllBrandsMap = _.invert( _verifiedIdMapping );
			verifiedAllBrandsMap     = _.mapValues( verifiedAllBrandsMap, function ( o ) {
				return Number( o );
			} );

			return {
				categoryId      : o.id,
				categoryTitle   : o.title,
				allBrandsMap    : categoryId === o.id ? verifiedAllBrandsMap : {},
				allIntrinsicsMap: categoryId === o.id ? _idToTopicMap : {}
			};
		} );

		verifiedCategoryMap = _.keyBy( verifiedCategoryMap, "categoryId" ); // create dictionary with key = categoryId
																			// from array of objects
		/** if the user has permission to read all categories, get them **/
		if ( userPermissions.readAllCategories ) {
			userCategories = Object.keys( verifiedCategoryMap );
		}

		Utils.debugLogger( "setCategoryAsync: categoryMap", verifiedCategoryMap );
		/** END: create the category map from the brand and intrinsic data *******************************/


		/** BEGIN: construct user object *****************************************************************/
		user.username = `${state.userData.loginInfo.firstName}`;
		user.preferences      = verifiedCategoryMap;
		user.userCategories   = userCategories.map( category => {
			return {
				id   : user.preferences[ category ].categoryId,
				title: user.preferences[ category ].categoryTitle
			};
		} );
		user.selectedCategory = {id: categoryId, title: user.preferences[ categoryId ].categoryTitle};
		user.permissions      = userPermissions;
		user.role             = userRoleName;
		user.id               = userEmail;
		user.categoryMap      = true; // categoryMap has been read
		/** END: construct user object *****************************************************************/

		/** BEGIN: set the user data *****************************************************************/

		// this will put the response data from set category into the state (userData)
		yield put( {
			type    : Constants.SET_CATEGORY.concat( Constants.FULFILLED ),
			response: {user: user}
		} );
		/** END: set the user data *****************************************************************/


		/** BEGIN: get user preferences *****************************************************************/

			// read the preferences
		let storedPrefs = yield* _getPreferences( userEmail );

		/** get the stored working sets **/
		let storedWorkingSets = storedPrefs.workingSets;

		/** get the stored events **/

		let displayBrands       = "preferred";
		let displayIntrinsics   = "preferred";
		let verifiedPreferences = user.preferences; // categoryMap

		// this is the category map of the selected category
		const verifiedPreference = verifiedPreferences[ categoryId ];

		// this is an array of the brand names
		//TODO:remove

		const verifiedAllBrandNames = Utils.sortIgnoreCase( Object.keys( verifiedPreference.allBrandsMap ) ); // sorted keys

		// this is an array of the intrinsic names
		//TODO:remove

		const allIntrinsicNames = Utils.sortIgnoreCase( Object.keys( _.invert( verifiedPreference.allIntrinsicsMap ) ) );  // sorted
		// keys
		/** brands **/
		let verifiedAllBrandsMap         = verifiedPreference.allBrandsMap; // name:id
		let verifiedAllBrandsMapInverted = _.invert( verifiedPreference.allBrandsMap ); // id:name

		/** intrinsics **/
		let allIntrinsicsMap         = _.invert( verifiedPreference.allIntrinsicsMap ); // name:id
		let allIntrinsicsMapInverted = verifiedPreference.allIntrinsicsMap; // id:name

		// this is an array of brand ids
		const verifiedWsBrandIds = Object.keys( verifiedAllBrandsMapInverted );
		// brand ids
		// this is an array of intrinsic ids (with unnamed intrinsics removed)

		const wsIntrinsicIds = Object.keys( allIntrinsicsMapInverted );

		/** are there stored preferred brands/intrinsics? **/

		let preferredBrandIds     = _.get( storedPrefs, `preferences.categoryPreferences.${categoryId}.preferredBrands`, [] );
        let preferredIntrinsicIds = intrinsicType == "intrinsics_reports" ?  wsIntrinsicIds: _.get( storedPrefs, `preferences.categoryPreferences.${categoryId}.preferredIntrinsics`, [] );

       // let preferredIntrinsicIds = _.get( storedPrefs, `preferences.categoryPreferences.${categoryId}.preferredIntrinsics`, [] );

		if ( preferredBrandIds ) {
			yield call( setPreferredBrandsAsync, {payload: {brandIds: preferredBrandIds}} );
		}

		if ( preferredIntrinsicIds ) {
			yield call( setPreferredIntrinsicsAsync, {payload: {intrinsicIds: wsIntrinsicIds}} );
		}

		//if (!verifiedPreferredBrandNames.length) { // no preferred brands are set
		if ( !preferredBrandIds.length ) { // no preferred brands are set
			displayBrands = "all";
		}
		if ( !preferredIntrinsicIds.length ) { // no preferred intrinsics are set
			displayIntrinsics = "all";
		}

		/** BEGIN: working sets **/

 		let workingSets = Object.assign( {}, storedWorkingSets );
		let path        = `${categoryId}`;

		const workingSetExists = !_.isEmpty( storedWorkingSets ) && _.get( storedWorkingSets, path );
		if ( !workingSetExists ) { // there is no working set
			workingSets[ categoryId ] = {
				brands    : {
					default: verifiedWsBrandIds // an array of brand id's
				},
				intrinsics: {
					default: wsIntrinsicIds // an array of intrinsic id's
				}
			};
		}

		const workingSetsBrandsTable = verifiedAllBrandNames.map( name => {
			let id = verifiedAllBrandsMap[ name ];
			return {
				id      : id,
				name    : name,
				selected: workingSets[ categoryId ].brands.default.indexOf( id ) !== -1
			};
		} );

		/** END: working sets **/

		const workingSetsIntrinsicsTable = allIntrinsicNames.map( name => {
			let id = allIntrinsicsMap[ name ];
			return {
				id      : id,
				name    : name,
				selected: workingSets[ categoryId ].intrinsics.default.indexOf( id ) !== -1
			};
		} );

		let allBrandIds     = Object.keys( verifiedAllBrandsMapInverted ).map( key => Number( key ) );
		let allIntrinsicIds = Object.keys( allIntrinsicsMapInverted );

		// intersect these with the working set


		let idToNameBrandMap = verifiedAllBrandsMapInverted;
		let nameToIdBrandMap = _.invert( verifiedAllBrandsMapInverted );

		let idToNameIntrinsicsMap = allIntrinsicsMapInverted;
		let nameToIdIntrinsicMap  = _.invert( allIntrinsicsMapInverted );

		if ( workingSetExists ) {

			let wsBrandIds     = workingSets[ categoryId ].brands.default;
			let wsIntrinsicIds = workingSets[ categoryId ].intrinsics.default;

			allBrandIds     = wsBrandIds;
			allIntrinsicIds = wsIntrinsicIds;

			preferredBrandIds     = _.intersection( preferredBrandIds, allBrandIds );
			preferredIntrinsicIds = _.intersection( preferredIntrinsicIds, allIntrinsicIds );


			idToNameBrandMap = {};

			_.forEach( allBrandIds, function ( id ) {
				if ( verifiedAllBrandsMapInverted[ id ] ) {
					idToNameBrandMap[ id ] = verifiedAllBrandsMapInverted[ id ];
				}
			} );

			nameToIdBrandMap = _.invert( idToNameBrandMap );


			idToNameIntrinsicsMap = {};

			_.forEach( allIntrinsicIds, function ( id ) {
				if ( allIntrinsicsMapInverted[ id ] ) {
					idToNameIntrinsicsMap[ id ] = allIntrinsicsMapInverted[ id ];
				}
			} );

			nameToIdIntrinsicMap = _.invert( idToNameIntrinsicsMap );
		}


		// Get the events associated with this category

		const config = {
			headers: {"Content-Type": "application/json"}
		};

		yield call( getEventsAsync, {payload: {companyName: userCompany, categoryId: categoryId}} );

		let events       = store.getState().visualization.events;
		let publications = store.getState().category.categoryData.publications;
		let sentiment     = ['positive', 'negative', 'neutral'];

		const brandData = {
			allBrandIds                    : allBrandIds,
			preferredBrandIds              : preferredBrandIds,
			selectedBrandIds               : preferredBrandIds,
			displayed                      : displayBrands,
			categoryId                     : categoryId,
			allBrandsMap                   : nameToIdBrandMap, // name:id
			allBrandsMapInverted           : idToNameBrandMap, // name:
			allBrandsMapForSettings        : verifiedAllBrandsMap, // name:id
			allBrandsMapInvertedForSettings: verifiedAllBrandsMapInverted, // name:id
			rawBrandsMap                   : _.get( brandsResponse, "data.allBrandsMap", {} ) // name:id
		};

		const intrinsicData = {
			allIntrinsicIds                    : allIntrinsicIds,
			preferredIntrinsicIds              : preferredIntrinsicIds,
			selectedIntrinsicIds               : preferredIntrinsicIds,
			displayed                          : displayIntrinsics,
			categoryId                         : categoryId,
			allIntrinsicsMap                   : nameToIdIntrinsicMap, // name:id
			allIntrinsicsMapInverted           : idToNameIntrinsicsMap,// name:id
			allIntrinsicsMapForSettings        : allIntrinsicsMap, // name:id
			allIntrinsicsMapInvertedForSettings: allIntrinsicsMapInverted// name:id
		};

		const categoryData = {
			selectedCategoryId        : user.selectedCategory.id,
			selectedCategoryTitle     : user.selectedCategory.title,
			selectedCategory          : {id: user.selectedCategory.id, title: user.selectedCategory.title},
			workingSetsBrandsTable    : workingSetsBrandsTable,
			workingSetsIntrinsicsTable: workingSetsIntrinsicsTable,
			brands                    : brandData,
			intrinsics                : intrinsicData,
			preferences               : verifiedPreferences,
			events                    : events,
			publications              : publications,
            sentiment                 : sentiment
		};

		storedPrefs.preferences.selectedCategory = {
			id   : categoryId,
			title: user.preferences[ categoryId ].categoryTitle
		};

		yield call( _updatePreferences, storedPrefs );

		yield put( {
			type: Constants.SAGA_SET_CATEGORY,
			categoryData
		} );

		/** END: get user preferences *****************************************************************/


		/** BEGIN: set the time period for trends chart *****************************************************************/

		response = {
			[ categoryId ]: {
				start : moment().subtract( 52, "week" ).startOf( "week" ).format( "YYYY-MM-DD" ),
				end   : moment().format( "YYYY-MM-DD" ),
				period: "weekly"
			}
		};

		yield put( {
			type: Constants.SET_TIME_PERIOD_FOR_TRENDS.concat( Constants.FULFILLED ),
			response
		} );

		/** END: set the time period for trends chart *****************************************************************/


	} catch ( error ) {
		handleError( error );
	} finally {
		yield put( hideLoading() );
	}
}

export function* setWorkingSetsAsync( action ) {
	Utils.debugLogger( "setWorkingSetsAsync", action );
	let workingSets = action.payload;

	yield put( showLoading() );
	try {

		const state      = store.getState();
		const email      = state.userData.loginInfo.email;
		const categoryId = state.category.categoryData.selectedCategoryId;

		/** first read the preferences **/
			  // read the preferences
		let url                 = `${PREDICTA_AUTH}/preferences/read`;
		let storedPrefs         = yield call( axios.post, url, {email: email} );
		const preferences       = storedPrefs.data.data.preferences.M; // these just get read and written back
		const storedWorkingSets = storedPrefs.data.data.workingSets.M;
		const storedEvents      = storedPrefs.data.data.events.M;

		storedWorkingSets[ categoryId ] = workingSets;


		url          = `${PREDICTA_AUTH}/preferences/update`;
		let response = yield call( axios.post, url, {
			email      : email,
			preferences: preferences,
			workingSets: storedWorkingSets,
			events     : storedEvents
		} );

		/** now update the category data **/
		let categoryData    = Object.assign( {}, state.category.categoryData );
		let brandsTable     = categoryData.workingSetsBrandsTable;
		let intrinsicsTable = categoryData.workingSetsIntrinsicsTable;

		brandsTable = brandsTable.map( o => {
			o.selected = false;
			return o;
		} );

		intrinsicsTable = intrinsicsTable.map( o => {
			o.selected = false;
			return o;
		} );

		_.forEach( workingSets.brands.default, function ( id ) {
			brandsTable[ _.findIndex( brandsTable, function ( o ) {
				return o.id === id;
			} ) ].selected = true;
		} );

		_.forEach( workingSets.intrinsics.default, function ( id ) {
			intrinsicsTable[ _.findIndex( intrinsicsTable, function ( o ) {
				return o.id === id;
			} ) ].selected = true;
		} );


		/** set the selected brands / intrinsics. they must be intersected with the working set **/

		console.log( "page_settings" );

		categoryData.brands.selectedBrandIds          = _.intersection( _.filter( brandsTable, "selected" ).map( o => o.name ), categoryData.brands.selectedBrandsIds );
		categoryData.intrinsics.selectedIntrinsicIds  = _.intersection( _.filter( intrinsicsTable, "selected" ).map( o => o.name ), categoryData.intrinsics.selectedIntrinsicIds );
		categoryData.brands.preferredBrandIds         = categoryData.brands.selectedBrandIds;
		categoryData.intrinsics.preferredIntrinsicIds = categoryData.brands.selectedIntrinsicIds;

		categoryData.workingSetsBrandsTable     = brandsTable;
		categoryData.workingSetsIntrinsicsTable = intrinsicsTable;
		categoryData.brands.allBrandIds         = workingSets.brands.default.map( id => categoryData.brands.allBrandsMapInvertedForSettings[ id ] ); // get the name
		categoryData.intrinsics.allIntrinsicIds = workingSets.intrinsics.default.map( id => categoryData.intrinsics.allIntrinsicsMapInvertedForSettings[ id ] ); // get the name

		yield put( {
			type: Constants.SAGA_SET_CATEGORY,
			categoryData
		} );

	} catch ( error ) {
		handleError( error );
	} finally {
		yield put( hideLoading() );
	}
}

//
// export function* getBrandDataAsync( action ) {
//
// 	Utils.debugLogger( "getBrandDataAsync", action );
//
// 	yield put( showLoading() );
// 	try {
// 		const response = yield call( axios.post, `${BRAND_URL}/${action.payload.categoryId}/brands`, action.payload.filter );
// 		yield put( {
// 			type    : Constants.GET_BRAND_DATA.concat( Constants.FULFILLED ),
// 			response: response
// 		} );
// 	} catch ( error ) {
// 		handleError( error );
// 	} finally {
// 		yield put( hideLoading() );
// 	}
//
// }

export function* getPublicationsAsync() {

	Utils.debugLogger( "getPublicationsAsync" );

	yield put( showLoading() );
	try {

		const payload = yield call( axios.get, `${PUBLICATIONS_URL}/` );

		yield put( {
			type    : Constants.PUBLICATION_READ_ALL.concat( Constants.FULFILLED ),
			response: payload
		} );

	} catch ( error ) {
		handleError( error );
	} finally {
		yield put( hideLoading() );
	}

}

export function* addPublicationAsync( action ) {

	Utils.debugLogger( "addPublicationAsync" );

	yield put( showLoading() );
	try {

		let payload = yield call( axios.put, `${PUBLICATIONS_URL}/`, action.payload ); //TODO: remove trailing slash

		yield put( {
			type    : Constants.PUBLICATION_CREATE.concat( Constants.FULFILLED ),
			response: payload
		} );

		payload = yield call( axios.get, `${PUBLICATIONS_URL}/` ); //TODO: remove trailing slash

		yield put( {
			type    : Constants.PUBLICATION_READ_ALL.concat( Constants.FULFILLED ),
			response: payload
		} );

	} catch ( error ) {
		handleError( error );
	} finally {
		yield put( hideLoading() );
	}

}

export function* deletePublicationAsync( action ) {

	Utils.debugLogger( "deletePublicationAsync" );

	yield put( showLoading() );
	try {

		let payload = yield call( axios.delete, `${PUBLICATIONS_URL}/${action.payload.id}` );

		yield put( {
			type    : Constants.PUBLICATION_DELETE.concat( Constants.FULFILLED ),
			response: payload
		} );

		payload = yield call( axios.get, `${PUBLICATIONS_URL}` );

		yield put( {
			type    : Constants.PUBLICATION_READ_ALL.concat( Constants.FULFILLED ),
			response: payload
		} );

	} catch ( error ) {
		handleError( error );
	} finally {
		yield put( hideLoading() );
	}

}

export function* getEventsAsync( action ) {

	Utils.debugLogger( "getEventsAsync", action );

	yield put( showLoading() );
	try {

		const companyName = action.payload.companyName;
		const categoryId  = action.payload.categoryId;

		const payload = yield call( axios.get, `${EVENT_URL}?companyName=${companyName}&categoryId=${categoryId}` );

		yield put( {
			type    : Constants.EVENTS_READ_ALL,
			response: payload
		} );

		action.type    = Constants.EVENTS_READ_ALL;
		action.payload = payload;

		yield call( chartEventAsync, action );

		console.log( "getEventsAsync: after put", response );

	} catch ( error ) {
		handleError( error );
	} finally {
		yield put( hideLoading() );
	}

}

export function* watchEventGetIntrinsicsByPeriodAsync( action ) {

	Utils.debugLogger( "watchEventGetIntrinsicsByPeriodAsync", action );

	yield put( showLoading() );

	const categoryId = action.payload.categoryId;
	const filter     = action.payload.filter;

	const url = `${VISUALIZATION_URL}/${categoryId}`;


	try {
		const response = yield call( axios.post, url, filter );

		yield put( {
			type: Constants.EVENT_GET_INTRINSICS_BY_PERIOD.concat( Constants.FULFILLED ),
			response
		} );

	} catch ( error ) {
		handleError( error );
	} finally {
		yield put( hideLoading() );
	}

}

export function* createEventAsync( action ) {

	Utils.debugLogger( "createEventAsync", action );

	yield put( showLoading() );
	try {

		const eventObj = action.payload.data;

		delete eventObj.publicationLocationList;

		yield call( axios.put, `${EVENT_URL}`, {"body": eventObj} );

		yield put( {
			type    : Constants.EVENT_CREATE.concat( Constants.FULFILLED ),
			response: eventObj
		} );

		let state = store.getState();

		yield call( getEventsAsync, {
			payload: {
				companyName: state.userData.loginInfo.companyName,
				categoryId : state.category.categoryData.selectedCategoryId
			}
		} );

	} catch ( error ) {
		handleError( error );
	} finally {
		yield put( hideLoading() );
	}

}

export function* updateEventAsync( action ) {

	Utils.debugLogger( "updateEventAsync", action );

	yield put( showLoading() );
	try {

		const body = action.payload;

		yield call( axios.put, `${EVENT_URL}`, {"body": body} );

		yield put( {
			type    : Constants.EVENT_UPDATE.concat( Constants.FULFILLED ),
			response: body
		} );

		let state = store.getState();

		yield call( getEventsAsync, {
			payload: {
				companyName: state.userData.loginInfo.companyName,
				categoryId : state.category.categoryData.selectedCategoryId
			}
		} );

	} catch ( error ) {
		handleError( error );
	} finally {
		yield put( hideLoading() );
	}

}

export function* deleteEventAsync( action ) {

	Utils.debugLogger( "deleteEventAsync", action );

	yield put( showLoading() );
	try {

		const hashKey = action.payload;

		yield call( axios.delete, `${EVENT_URL}?hashKey=${hashKey}` );

		yield put( {
			type    : Constants.EVENT_DELETE.concat( Constants.FULFILLED ),
			response: hashKey
		} );

		let state = store.getState();

		yield call( getEventsAsync, {
			payload: {
				companyName: state.userData.loginInfo.companyName,
				categoryId : state.category.categoryData.selectedCategoryId
			}
		} );

	} catch ( error ) {
		handleError( error );
	} finally {
		yield put( hideLoading() );
	}

}

export function* editEventAsync( action ) {

	Utils.debugLogger( "editEventAsync", action );

	yield put( showLoading() );
	try {

		yield put( {
			type   : Constants.EVENT_EDIT.concat( Constants.FULFILLED ),
			payload: action.payload.data
		} );
		//
		//let state = store.getState();
		//
		//yield call(getEventsAsync, {
		//	payload: {
		//		companyName: state.userData.loginInfo.companyName,
		//		categoryId: state.category.categoryData.selectedCategoryId
		//	}
		//});

	} catch ( error ) {
		handleError( error );
	} finally {
		yield put( hideLoading() );
	}

}

export function* fetchProductsAsync( action ) {
	Utils.debugLogger( "fetchProductsAsync", action );

	yield put( showLoading() );
	try {

		const brandIds = action.payload.selectedBrandIds;

		let tasks = [];

		brandIds.map( brandId => {
			let filter = {selectedIntrinsicIds: action.payload.selectedIntrinsicIds, selectedBrandIds: [ brandId ]};
			tasks.push( call( axios.post, `${PRODUCT_URL}/${action.payload.categoryId}/products`, filter ) );
		} );

		const results = yield all( tasks );

		let products = [];

		results.map( result => {
			products = products.concat( result.data.products );
		} );

		// filter out products that are not verified and are children

		products = _.filter( products, function ( product ) {

			return ( product.status >= 0 && product.parent === null );
			// return ( product.status === 1 && product.parent === null ); // COOPER: this is the correct logic
		} );

		// for ( let response of generator( brandIds ) ) console.log( response );

		yield put( {
			type    : Constants.FETCH_PRODUCTS.concat( Constants.FULFILLED ),
			response: products
		} );

	} catch ( error ) {
		handleError( error );
	} finally {
		yield put( hideLoading() );
	}
}

export function* fetchNextProductsAsync( action ) {
	Utils.debugLogger( "fetchNextProductsAsync", action );

	yield put( showLoading() );
	try {

		const filter = {
			verified        : true,
			lastEvaluatedKey: action.payload.lastEvaluatedKey + Constants.PRODUCTS_PER_PAGE
		};

		const response = yield call( axios.post, `${PRODUCT_URL}/${action.payload.categoryId}/products`, filter );
		yield put( {
			type    : Constants.FETCH_NEXT_PRODUCTS.concat( Constants.FULFILLED ),
			response: response
		} );
	} catch ( error ) {
		handleError( error );
	} finally {
		yield put( hideLoading() );
	}
}


export function* lostPasswordAsync( action ) {

	//console.log('lost password', action.payload);

	try {
		yield put( showLoading() );

		const url      = `${PREDICTA_AUTH}/user/passwordlost`;
		const response = yield call( axios.post, url, action.payload );

		yield put( {
			type   : Constants.AWS_USER_LOST_PASSWORD.concat( Constants.FULFILLED ),
			payload: response
		} );

	} catch ( error ) {
		yield call( handleError, error );
	} finally {
		yield put( hideLoading() );
	}
}

export function* resetPasswordAsync( action ) {

	try {
		yield put( showLoading() );

		const url      = `${PREDICTA_AUTH}/user/passwordreset`;
		const response = yield call( axios.post, url, {email: action.payload} );

		yield put( {
			type   : Constants.AWS_USER_RESET_PASSWORD.concat( Constants.FULFILLED ),
			payload: response
		} );

	} catch ( error ) {
		yield call( handleError, error );
	} finally {
		yield put( hideLoading() );
	}
}

export function* changePasswordAsync( action ) {

	try {
		yield put( showLoading() );

		const url      = `${PREDICTA_AUTH}/user/passwordchange`;
		const response = yield call( axios.post, url, action.payload );

		yield put( {
			type   : Constants.AWS_USER_CHANGE_PASSWORD.concat( Constants.FULFILLED ),
			payload: response
		} );

	} catch ( error ) {
		yield call( handleError, error );
	} finally {
		yield put( hideLoading() );
	}
}

export function* _getPreferences( email ) {
	let url        = `${PREDICTA_AUTH}/preferences/read`;
	const response = yield call( axios.post, url, {email: email} );
	//
	const value    = {
		email      : _.get( response, "data.data.email.S", "" ),
		preferences: _.get( response, "data.data.preferences.M", {} ),
		workingSets: _.get( response, "data.data.workingSets.M", {} )
		//event:       {}
	};

	// this is how you return a value from a function when caller performs a yield* (the * is what is required to
	// get the return value)
	return value;
}

export function* setPreferredBrandsAsync( action ) {
	Utils.debugLogger( "setPreferredBrandsAsync", action );

	try {
		let state   = store.getState();
		const email = state.userData.loginInfo.email;

		// this is how you get a return value from a generator function in saga
		// get _prePreferences returns a value
		let prefObj    = yield* _getPreferences( email );
		let categoryId = action.payload.categoryId;

		prefObj.email                                                             = email;
		prefObj.preferences.categoryPreferences                                   = _.get( prefObj, "preferences.categoryPreferences", {} );
		prefObj.preferences.categoryPreferences[ categoryId ]                     = _.get( prefObj, `preferences.categoryPreferences.${categoryId}`, EMPTY_CATEGORY_PREFS );
		prefObj.preferences.categoryPreferences[ categoryId ].preferredIntrinsics = _.get( prefObj, `preferences.categoryPreferences.${categoryId}.preferredIntrinsics`, [] );
		prefObj.preferences.categoryPreferences[ categoryId ].preferredBrands     = action.payload.brandIds;

		//console.log('updated brands prefs', prefObj);

		yield call( _updatePreferences, prefObj );
		yield call( _setPreferredBrands, categoryId, action.payload.brandIds, action.payload.brandNames );

	} catch ( error ) {
		yield call( handleError, error );
	}
}

export function* setPreferredIntrinsicsAsync( action ) {
	Utils.debugLogger( "setPreferredIntrinsicsAsync", action );

	try {

		let state   = store.getState();
		const email = state.userData.loginInfo.email;

		let prefObj    = yield* _getPreferences( email );
		let categoryId = action.payload.categoryId;

		prefObj.email                                                             = email;
		prefObj.preferences.categoryPreferences                                   = _.get( prefObj, "preferences.categoryPreferences", {} );
		prefObj.preferences.categoryPreferences[ categoryId ]                     = _.get( prefObj, `preferences.categoryPreferences.${categoryId}`, EMPTY_CATEGORY_PREFS );
		prefObj.preferences.categoryPreferences[ categoryId ].preferredBrands     = _.get( prefObj, `preferences.categoryPreferences.${categoryId}.preferredBrands`, [] );
		prefObj.preferences.categoryPreferences[ categoryId ].preferredIntrinsics = action.payload.intrinsicIds;

		//console.log('updated intrinsics prefs', prefObj);

		yield call( _updatePreferences, prefObj );
		yield call( _setPreferredIntrinsics, categoryId, action.payload.intrinsicIds, action.payload.intrinsicNames );

	} catch ( error ) {
		yield call( handleError, error );
	}
}

/** chart APIs **/

export function* getVisualizationData( categoryId, filter, companyname, intrinsictype ) {
	Utils.debugLogger( "getChartIntrinsicWhitespaceAnalysisData (intrinsics whitespace)", categoryId, filter );

	const _filter  = Object.assign( {}, filter, {categoryId: categoryId, verified: true} );
	const settings = Object.assign( {}, filter.settings );
	delete filter.settings;

    if (intrinsictype == "global_intrinsics_reports") {
        companyname = "Predicta";
    }

    let url1                = `${PREDICTA_AUTH}/company/read`;
    let storedPrefs         = yield call( axios.post, url1, {companyName: companyname} );
    // get companyID from response
    let companyId         = storedPrefs.data.data.companyId.S;

    let url = `${VISUALIZATION_URL}/${categoryId}?company_id=${companyId}`;

	// const url = `${VISUALIZATION_URL}/${categoryId}`;
	try {
		//console.log('made service call: waiting for reply', url, new Date());
		const response = yield call( axios.post, url, filter );
		//console.log('received reponse: ', url, new Date());

		response.data._selections = _filter;
		response.data._settings   = settings;

		yield put( {
			type: Constants.GET_VISUALIZATION_DATA.concat( Constants.FULFILLED ),
			response
		} );
	} catch ( error ) {
		handleError( error );
	}
}

export function* getChartIntrinsicWhitespaceAnalysisData( categoryId, filter ) {
	Utils.debugLogger( "Unimplmented: getChartIntrinsicWhitespaceAnalysisData (intrinsics whitespace)", categoryId, filter );

	// const _filter  = Object.assign( {}, filter, {categoryId: categoryId} );
	// const settings = Object.assign( {}, filter.settings );
	// delete filter.settings;
    //
	// const url = `${VISUALIZATION_URL}/${categoryId}/brand/concentration`;
	// try {
	// 	const response = yield call( axios.post, url, filter );
    //
	// 	response.data._selections = _filter;
	// 	response.data._settings   = settings;
    //
	// 	yield put( {
	// 		type: Constants.GET_CHART_INTRINSIC_WHITESPACE_ANALYSIS_DATA.concat( Constants.FULFILLED ),
	// 		response
	// 	} );
	// } catch ( error ) {
	// 	handleError( error );
	// }
}

export function* getChartIntrinsicComparisonData( categoryId, filter ) {
	Utils.debugLogger( "Unimplmented: getChartIntrinsicComparisonData (intrinsics normalized)", categoryId, filter );

	// const _filter  = Object.assign( {}, filter, {categoryId: categoryId} );
	// const settings = Object.assign( {}, filter.settings );
	// delete filter.settings;
    //
	// const url = `${VISUALIZATION_URL}/${categoryId}/brand/concentration?normalized=true`;
	// try {
	// 	const response = yield call( axios.post, url, filter );
    //
	// 	response.data._selections = _filter;
	// 	response.data._settings   = settings;
    //
	// 	yield put( {
	// 		type: Constants.GET_CHART_INTRINSIC_COMPARISONS_DATA.concat( Constants.FULFILLED ),
	// 		response
	// 	} );
	// } catch ( error ) {
	// 	handleError( error );
	// }
}

export function* getChartBrandComparisonData( categoryId, filter ) {
	Utils.debugLogger( "Unimplmented: getChartBrandComparisonData", categoryId, filter );

	// const _filter  = Object.assign( {}, filter, {categoryId: categoryId} );
	// const settings = Object.assign( {}, filter.settings );
	// delete filter.settings;
    //
	// const url = `${VISUALIZATION_URL}/${categoryId}/intrinsic/concentration?normalized=true`;
	// try {
	// 	const response = yield call( axios.post, url, filter );
    //
	// 	response.data._selections = _filter;
	// 	response.data._settings   = settings;
    //
	// 	yield put( {
	// 		type: Constants.GET_CHART_BRAND_COMPARISONS_DATA.concat( Constants.FULFILLED ),
	// 		response
	// 	} );
	// } catch ( error ) {
	// 	handleError( error );
	// }
}

export function* getChartBrandWhitespaceAnalysisData( categoryId, filter ) {
	Utils.debugLogger( "Unimplmented: getChartBrandWhitespaceAnalysisData", categoryId, filter );

	// const _filter  = Object.assign( {}, filter, {categoryId: categoryId} );
	// const settings = Object.assign( {}, filter.settings );
	// delete filter.settings;
    //
	// const url = `${VISUALIZATION_URL}/${categoryId}/intrinsic/concentration`;
	// try {
	// 	const response = yield call( axios.post, url, filter );
    //
	// 	response.data._selections = _filter;
	// 	response.data._settings   = settings;
    //
	// 	yield put( {
	// 		type: Constants.GET_CHART_WHITESPACE_ANALYSIS_DATA.concat( Constants.FULFILLED ),
	// 		response
	// 	} );
    //
    //
	// } catch ( error ) {
	// 	handleError( error );
	// }
}

/** Topics Editor **/
export function* getTopicsAsync( action ) {

    //let categoryId = action.payload;
    let url1                = `${PREDICTA_AUTH}/company/read`;
    let topicData           = action.payload;

    let state = store.getState();
    const intrinsicType = state.category.navigationType;

    if (intrinsicType == "global_intrinsics_reports") {
        topicData.companyName = "Predicta";
    }
    let storedPrefs       = yield call (axios.post, url1, {companyName: topicData.companyName} );

    // axios.post( url1, {companyName: companyname} );
    // get companyID from response

    let companyId         = storedPrefs.data.data.companyId.S;
    let categoryId = action.payload.categoryId;

    try {
        //
        const response = yield call( axios.get, `${TOPICS_URL}/${categoryId}?company_id=${companyId}` );
        // console.log( "getTopicsAsync response", JSON.stringify(response) );

        yield put( {
            type    : Constants.GET_CHART_TOPICS.concat( Constants.FULFILLED ),
            response: response
        } );
    } catch ( error ) {
        yield call( handleError, error );
    }
}

export function* updateTopicsAsync( action ) {

    let url1                = `${PREDICTA_AUTH}/company/read`;
    let topicData           = action.payload;

    let state = store.getState();
    const intrinsicType = state.category.navigationType;

    if (intrinsicType == "global_intrinsics_reports") {
        topicData.companyName = "Predicta";
    }
    let storedPrefs       = yield call (axios.post, url1, {companyName: topicData.companyName} );
    let companyId         = storedPrefs.data.data.companyId.S;
    topicData.filterObj.filter.company_id = companyId;

    // console.log("the value of filterdata", JSON.stringify(topicData.filterObj))
    let response = yield call (axios.post, `${TOPICS_URL}/${topicData.categoryId}?company_id=${companyId}`,topicData.filterObj );
    yield put ( {
        type   : Constants.UPDATE_TOPICS.concat(Constants.FULFILLED),
        payload: response
    });


}

export function* createTopicAsync(action)
{
    let url1                = `${PREDICTA_AUTH}/company/read`;
    let topicData           = action.payload;

    let state = store.getState();
    const intrinsicType = state.category.navigationType;

    if (intrinsicType == "global_intrinsics_reports") {
        topicData.companyName = "Predicta";
    }
    let storedPrefs       = yield call (axios.post, url1, {companyName: topicData.companyName} );
    // axios.post( url1, {companyName: companyname} );
    // get companyID from response

    let companyId         = storedPrefs.data.data.companyId.S;
    topicData.filterObj.filter.company_id = companyId;
    // console.log("the value of filterdata", JSON.stringify(topicData.filterObj))

    // const request = axios.put( `${TOPICS_URL}/${topicData.categoryId}?companyId=${companyId}`, topicData.filter );
    const response = yield call (axios.put, `${TOPICS_URL}/${topicData.categoryId}?company_id=${companyId}`, topicData.filterObj );

    //let respnsedata = request.data;
    yield put ( {
        type   : Constants.CREATE_TOPIC.concat(Constants.FULFILLED),
        payload: response
    });

}



export function* deleteTopicAsync(action)
{
    let url1                = `${PREDICTA_AUTH}/company/read`;
    let topicData           = action.payload;

    let state = store.getState();
    const intrinsicType = state.category.navigationType;

    if (intrinsicType == "global_intrinsics_reports") {
        topicData.companyName = "Predicta";
    }
    let storedPrefs       = yield call (axios.post, url1, {companyName: topicData.companyName} );
    let companyId         = storedPrefs.data.data.companyId.S;
    topicData.filterObj.filter.company_id = companyId;

    // console.log("the value of filterdata", JSON.stringify(topicData.filterObj))
    let response = yield call (axios.delete, `${TOPICS_URL}/${topicData.categoryId}/${topicData.filterObj.id}?company_id=${companyId}`,topicData.filterObj );
    yield put ( {
        type   : Constants.DELETE_TOPIC.concat(Constants.FULFILLED),
        payload: response
    });

}


export function* getSentimentcountsByPeriod(categoryId, filter, companyname, intrinsictype)
{

    const _filter  = Object.assign( {}, filter, {categoryId: categoryId, verified: true} );
    const settings = Object.assign( {}, filter.settings );
    delete filter.settings;

    let url1                = `${PREDICTA_AUTH}/company/read`;
    // let topicData           = action.payload;

    let topicData = {filter:
            {selectedBrandIds: _filter.selectedBrandIds,
            lastEvaluatedKey: null,
            selectedIntrinsicIds: null,
            perPage: null,
            offset: null,
            sort: null,
            verified: null,
            company_id: "default",
            isGet:true}}

    //let state = store.getState();
   // const intrinsicType = state.category.navigationType;

    if (intrinsictype == "global_intrinsics_reports") {
    	companyname = "Predicta";
	}

    let storedPrefs       = yield call (axios.post, url1, {companyName: companyname} );
    let companyId         = storedPrefs.data.data.companyId.S;
    topicData.filter.company_id = companyId;

    try {
        let response = yield call (axios.post, `${TOPICS_URL}/${categoryId}`,topicData );

        response.data._selections = _filter;
        response.data._settings   = settings;
        response.data._selections.company_id = companyId;

        yield put( {
            type: Constants.GET_TOPICS_SENTIMENT_COUNTS.concat( Constants.FULFILLED ),
            response
        } );
    } catch ( error ) {
        handleError( error );
    }
}


export function* getPositiveSentimentCountsByPeriod(categoryId, filter, companyname, intrinsictype) {

    const _filter  = Object.assign( {}, filter, {categoryId: categoryId, verified: true} );
    const settings = Object.assign( {}, filter.settings );
    delete filter.settings;

    let url1                = `${PREDICTA_AUTH}/company/read`;
    // let topicData           = action.payload;

    let topicData = {filter:
            {selectedBrandIds: _filter.selectedBrandIds,
                lastEvaluatedKey: null,
                selectedIntrinsicIds: null,
                perPage: null,
                offset: null,
                sort: null,
                verified: null,
                company_id: "default",
                isGet:true}}

    //let state = store.getState();
    // const intrinsicType = state.category.navigationType;

    if (intrinsictype == "global_intrinsics_reports") {
        companyname = "Predicta";
    }

    let storedPrefs       = yield call (axios.post, url1, {companyName: companyname} );
    let companyId         = storedPrefs.data.data.companyId.S;
    topicData.filter.company_id = companyId;

    try {
        let response = yield call (axios.post, `${TOPICS_URL}/${categoryId}`,topicData );

        response.data._selections = _filter;
        response.data._settings   = settings;
        response.data._selections.company_id = companyId;

        yield put( {
            type: Constants.GET_POSITIVE_TOPICS_SENTIMENT_COUNTS.concat( Constants.FULFILLED ),
            response
        } );
    } catch ( error ) {
        handleError( error );
    }

}

export function* getNegativeSentimentCountsByPeriod(categoryId, filter, companyname, intrinsictype) {

    const _filter  = Object.assign( {}, filter, {categoryId: categoryId, verified: true} );
    const settings = Object.assign( {}, filter.settings );
    delete filter.settings;

    let url1                = `${PREDICTA_AUTH}/company/read`;

    let topicData = {filter:
            {selectedBrandIds: _filter.selectedBrandIds,
                lastEvaluatedKey: null,
                selectedIntrinsicIds: null,
                perPage: null,
                offset: null,
                sort: null,
                verified: null,
                company_id: "default",
                isGet:true}}

    if (intrinsictype == "global_intrinsics_reports") {
        companyname = "Predicta";
    }

    let storedPrefs       = yield call (axios.post, url1, {companyName: companyname} );
    let companyId         = storedPrefs.data.data.companyId.S;
    topicData.filter.company_id = companyId;

    try {
        let response = yield call (axios.post, `${TOPICS_URL}/${categoryId}`,topicData );

        response.data._selections = _filter;
        response.data._settings   = settings;
        response.data._selections.company_id = companyId;

        yield put( {
            type: Constants.GET_NEGATIVE_TOPICS_SENTIMENT_COUNTS.concat( Constants.FULFILLED ),
            response
        } );
    } catch ( error ) {
        handleError( error );
    }

}

export function* getNeutralSentimentCountsByPeriod(categoryId, filter, companyname, intrinsictype) {

    const _filter  = Object.assign( {}, filter, {categoryId: categoryId, verified: true} );
    const settings = Object.assign( {}, filter.settings );
    delete filter.settings;

    let url1                = `${PREDICTA_AUTH}/company/read`;

    let topicData = {filter:
            {selectedBrandIds: _filter.selectedBrandIds,
                lastEvaluatedKey: null,
                selectedIntrinsicIds: null,
                perPage: null,
                offset: null,
                sort: null,
                verified: null,
                company_id: "default",
                isGet:true}}


    if (intrinsictype == "global_intrinsics_reports") {
        companyname = "Predicta";
    }

    let storedPrefs       = yield call (axios.post, url1, {companyName: companyname} );
    let companyId         = storedPrefs.data.data.companyId.S;
    topicData.filter.company_id = companyId;

    try {
        let response = yield call (axios.post, `${TOPICS_URL}/${categoryId}`,topicData );

        response.data._selections = _filter;
        response.data._settings   = settings;
        response.data._selections.company_id = companyId;

        yield put( {
            type: Constants.GET_NEUTRAL_TOPICS_SENTIMENT_COUNTS.concat( Constants.FULFILLED ),
            response
        } );
    } catch ( error ) {
        handleError( error );
    }

}


export function* getIntrinsicsByPeriod( categoryId, filter, companyname, intrinsictype ) {
	// Utils.debugLogger( "getIntrinsicsByPeriod", categoryId, filter );
   //  console.log( "getIntrinsicsByPeriod", categoryId, filter );

	const _filter  = Object.assign( {}, filter, {categoryId: categoryId, verified: true} );
	const settings = Object.assign( {}, filter.settings );
	delete filter.settings;

    // potentially just show the default for now

    if (intrinsictype == "global_intrinsics_reports") {
        companyname = "Predicta";
    }

    let url1                = `${PREDICTA_AUTH}/company/read`;
    let storedPrefs         = yield call( axios.post, url1, {companyName: companyname} );
    // get companyID from response
    let companyId         = storedPrefs.data.data.companyId.S;
    filter.company_id = companyId; // update the filter so the API code knows about it.

    let url = `${VISUALIZATION_URL}/${categoryId}?company_id=${companyId}`;

	// const url = `${VISUALIZATION_URL}/${categoryId}`;
	try {
		let response = yield call( axios.post, url, filter );

		response.data._selections = _filter;
		response.data._settings   = settings;
		response.data._selections.company_id = companyId;

		yield put( {
			type: Constants.GET_INTRINSICS_BY_PERIOD.concat( Constants.FULFILLED ),
			response
		} );
	} catch ( error ) {
		handleError( error );
	}
}

export function* getIntrinsicsByPeriodForRadarChart( categoryId, filter, companyname, intrinsictype ) {
	Utils.debugLogger( "getIntrinsicsByPeriodForRadarChart", categoryId, filter );

	const _filter  = Object.assign( {}, filter, {categoryId: categoryId, verified: true} );
	const settings = Object.assign( {}, filter.settings );
	delete filter.settings;

    // potentially just show the default for now

    if (intrinsictype == "global_intrinsics_reports") {
        companyname = "Predicta";
    }

    let url1                = `${PREDICTA_AUTH}/company/read`;
    let storedPrefs         = yield call( axios.post, url1, {companyName: companyname} );
    // get companyID from response
    let companyId         = storedPrefs.data.data.companyId.S;
    filter.company_id = companyId; // update the filter so the API code knows about it.

    let url = `${VISUALIZATION_URL}/${categoryId}?company_id=${companyId}`;

	//const url = `${VISUALIZATION_URL}/${categoryId}`;

	try {
		const response = yield call( axios.post, url, filter );

		response.data._selections = _filter;
		response.data._settings   = settings;
        response.data._selections.company_id = companyId;

        yield put( {
			type: Constants.GET_INTRINSICS_BY_PERIOD_FOR_RADAR.concat( Constants.FULFILLED ),
			response
		} );
	} catch ( error ) {
		handleError( error );
	}
}

export function* getIntrinsicsByPeriodForTrends( categoryId, filter, companyname ) {
	Utils.debugLogger( "getIntrinsicsByPeriodForTrends", categoryId, filter );

	const _filter  = Object.assign( {}, filter, {categoryId: categoryId, verified: true} );
	const settings = Object.assign( {}, filter.settings );
	delete filter.settings;

	// get the companyid from Lambda HM
    // potentially just show the default for now. Probably for this we don't need it.

    let url1                = `${PREDICTA_AUTH}/company/read`;
    let storedPrefs         = yield call( axios.post, url1, {companyName: "Predicta"} );
    // get companyID from response
    const companyId         = storedPrefs.data.data.companyId.S;

    filter.company_id = companyId; // update the filter so the API code knows about it.


    const url = `${VISUALIZATION_URL}/${categoryId}?company_id=${companyId}`;

    // let response = yield call( axios.post, companyId_url, filter );

	// const url = `${VISUALIZATION_URL}/${categoryId}`;
	try {

		//console.log('made service call: waiting for reply', url, new Date());
		let response = yield call( axios.post, url, filter );
		// console.log("received reponse:",url, new Date());

		response.data._selections = _filter;
		response.data._settings   = settings;
        response.data._selections.company_id = companyId;

		yield put( {
			type: Constants.GET_INTRINSICS_BY_PERIOD_FOR_TRENDS.concat( Constants.FULFILLED ),
			response
		} );
	} catch ( error ) {
		handleError( error );
	}
}

export function* getChartChartScatterPlotData( categoryId, filter, companyname, intrinsictype) {
	Utils.debugLogger( "getChartChartScatterPlotData", categoryId, filter );

	const _filter  = Object.assign( {}, filter, {categoryId: categoryId} );
	const settings = Object.assign( {}, filter.settings );
	delete filter.settings;

    // get the companyid from Lambda HM
    // potentially just show the default for now

    if (intrinsictype == "global_intrinsics_reports") {
        companyname = "Predicta";
    }

    let url1                = `${PREDICTA_AUTH}/company/read`;
    let storedPrefs         = yield call( axios.post, url1, {companyName: companyname} );
    // get companyID from response
    const companyId         = storedPrefs.data.data.companyId.S;
    filter.company_id = companyId; // update the filter so the API code knows about it.

    const url = `${VISUALIZATION_URL}/${categoryId}?company_id=${companyId}`;

    // let response = yield call( axios.post, companyId_url, filter );

//    const url = `${VISUALIZATION_URL}/${categoryId}`;

	try {
		const response = yield call( axios.post, url, filter );

		response.data._selections = _filter;
		response.data._settings   = settings;
        response.data._selections.company_id = companyId;

        yield put( {
			type: Constants.GET_CHART_SCATTER_PLOT.concat( Constants.FULFILLED ),
			response
		} );
	} catch ( error ) {
		handleError( error );
	}
}

/** chart event **/
export function* chartEventAsync( action ) {

	Utils.debugLogger( "chartEventAsync", action );

	yield put( showLoading() );

	try {


		let doPut = true;

		if (
			action.type === Constants.EVENTS_READ_ALL ||
			action.type === Constants.SET_BRAND_NAMES ||
			action.type === Constants.SET_INTRINSICS_NAMES ||
			action.type === Constants.SET_SELECTED_CHART ||
			action.type === Constants.SET_COMPARISON_CHART_TYPE ||
			action.type === Constants.SET_LANDSCAPE_CHART_TYPE ||
			action.type === Constants.SET_LANDSCAPE_CHART_VIEW ||
			action.type === Constants.SET_INTRINSICS_CHART_TYPE ||
			action.type === Constants.SET_INTRINSICS_BY_PERIOD_CHART_SCALE ||
			action.type === Constants.SET_INTRINSICS_BY_PERIOD_CHART_SORT ||
			action.type === Constants.SET_INTRINSICS_BY_PERIOD_CHART_TYPE ||
			action.type === Constants.SET_RADAR_CHART_TYPE ||
			action.type === Constants.SET_RADAR_CHART_SCALED ||
			action.type === Constants.SET_RADAR_CHART_STACKED ||
			action.type === Constants.SET_RADAR_COMPARISON_TYPE ||
			action.type === Constants.SET_RADAR_CHART_PERIOD ||
			action.type === Constants.SET_TIME_PERIOD_FOR_TRENDS ||
			action.type === Constants.SAGA_SET_CATEGORY ||
			action.type === Constants.SET_INTRINSICS_BY_PERIOD_DATE_RANGE ||
			action.type === Constants.SET_INTRINSICS_BY_PERIOD_CHART_INTERPOLATION_TYPE ||
            action.type === Constants.SET_RADAR_CHART_DATES ) {

			doPut = false;

			yield put( {
				type    : action.type.concat( Constants.FULFILLED ),
				response: action.payload
			} );


			if ( action.type === Constants.SET_SELECTED_CHART ) {
				yield call( setPreference, "selectedChart", action.payload );
			}
		}

		if ( action.type === Constants.SAGA_SET_CATEGORY ) {
			doPut = false;
		}

		let state = store.getState();

		const comparisonTitle = state.visualization.comparisonChart.type === "brands" ? "Brands" : "Intrinsics";

		/** chart configurations - add the config to settings **/
		const charts = {
			[ Constants.CHART_TRENDS ]                          : {
				minBrands    : 1,
				minIntrinsics: 1,
				maxBrands    : 1,
				attrs        : {
					// title :      `Landscape Analysis (${this.props.selectedCategory.title})`,
					title: "Trends"
				}
			},
			[ Constants.CHART_LANDSCAPE ]                       : {
				minBrands    : 0,
				minIntrinsics: state.visualization.landscapeChartView === "all" ? 0 : 2,
				attrs        : {
					// title :      `Landscape Analysis (${this.props.selectedCategory.title})`,
					title     : "Landscape Analysis",
					//data      : this.props.landscapeChartView === 'all' ? this.props.chartData_landscape :
					// this.getSelectedIntrinsicValues(selectedIntrinsics, this.props.chartData_landscape),
					xaxisTitle: "Brands",
					yaxisTitle: "Percentage",
					type      : state.visualization.landscapeChartType
				}
			},
			[ Constants.CHART_BRAND_COMPARISON ]                : {
				minBrands    : 1,
				minIntrinsics: 1,
				attrs        : {
					//data      : this.getComparisonData(),
					// title: `Compare ${comparisonTitle} (${this.props.selectedCategory.title})`,
					title     : `Compare ${comparisonTitle}`,
					xaxisTitle: comparisonTitle,
					yaxisTitle: "Percentage",
					stacked   : state.visualization.comparisonChart.stacked
				}
			},
			[ Constants.CHART_BRAND_COMPARISON_WHITESPACE ]     : {
				minBrands    : 1,
				minIntrinsics: 1,
				attrs        : {
					// data: state.visualizationData.whiteSpace,
					//data      : this.props.chartData_brandsWhiteSpace,
					// title: `Brand Whitespace Analysis (${this.props.selectedCategory.title})`,
					title     : "Brand Whitespace Analysis",
					xaxisTitle: "Brands",
					yaxisTitle: "Percentage"
				}
			},
			[ Constants.CHART_INTRINSICS_COMPARISON ]           : {
				minBrands    : 1,
				minIntrinsics: 1,
				attrs        : {
					//data      : this.props.chartData_intrinsicsComparisons,
					title     : `Intrinsics Comparison (${state.category.categoryData.selectedCategory.title})`,
					xaxisTitle: "Intrinsics",
					yaxisTitle: "Percentage"
				}
			},
			[ Constants.CHART_INTRINSICS_COMPARISON_WHITESPACE ]: {
				minBrands    : 1,
				minIntrinsics: 1,
				attrs        : {
					//data      : this.props.chartData_intrinsicsWhiteSpace,
					title     : `Intrinsics Whitespace Analysis  (${state.category.categoryData.selectedCategory.title})`,
					xaxisTitle: "Intrinsics",
					yaxisTitle: "Percentage"
				}
			},
			[ Constants.CHART_INTRINSICS_BY_PERIOD ]            : {
				minBrands    : 1,
				maxBrands    : 10,
				minIntrinsics: 1,
				// maxIntrinsics : 4,
				attrs        : {
					//data : true,
					title: `Intrinsics by Period (${state.category.categoryData.selectedCategory.title})`
				}
			},
			[ Constants.CHART_RADAR ]                           : {
				minBrands    : ( state.visualization.radarComparisonType === "intrinsics" ) ? 1 : 3,
				minIntrinsics: ( state.visualization.radarComparisonType === "intrinsics" ) ? 3 : 1,
				attrs        : {
					//data : true,
					title: `Radar (${state.category.categoryData.selectedCategory.title})`
				}
			},
			[ Constants.CHART_SCATTERPLOT ]                     : {
				minBrands    : 1,
				maxBrands    : 1,
				minIntrinsics: 3,
				maxIntrinsics: 3,
				attrs        : {
					//data : this.props.chartData_scatterPlot,
					title: `Scatter Plot (${state.category.categoryData.selectedCategory.title})`
				}
			},
            [ Constants.CHART_SENTIMENTCOUNTS_BY_PERIOD ]            : {
                    minBrands    : 1,
                    maxBrands    : 10,
                    minIntrinsics: 1,
                    maxIntrinsics : 1,
                    attrs        : {
                        //data : true,
                        title: `Sentiment Counts by Period (${state.category.categoryData.selectedCategory.title})`
                    }
                },
                [ Constants.CHART_POSITIVE_SENTIMENTCOUNTS_BY_PERIOD ]            : {
            	minBrands    : 1,
                maxBrands    : 10,
                minIntrinsics: 1,
                maxIntrinsics : 1,
                attrs        : {
                //data : true,
                title: `Sentiment Counts by Period (${state.category.categoryData.selectedCategory.title})`
            }
        },
            [ Constants.CHART_NEGATIVE_SENTIMENTCOUNTS_BY_PERIOD ]            : {
                minBrands    : 1,
                maxBrands    : 10,
                minIntrinsics: 1,
                maxIntrinsics : 1,
                attrs        : {
                    //data : true,
                    title: `Sentiment Counts by Period (${state.category.categoryData.selectedCategory.title})`
                }
            },
            [ Constants.CHART_NEUTRAL_SENTIMENTCOUNTS_BY_PERIOD ]            : {
                minBrands    : 1,
                maxBrands    : 10,
                minIntrinsics: 1,
                maxIntrinsics : 1,
                attrs        : {
                    //data : true,
                    title: `Sentiment Counts by Period (${state.category.categoryData.selectedCategory.title})`
                }
            }
		};

		const chartConfig = charts[ state.visualization.selectedChart ];

		//yield put({
		//    type: Constants.SET_CHART_CONFIG,
		//    response: chartConfig
		//});


		const settings = {
			events                                  : state.visualization.events,
			allBrandIds                             : state.category.categoryData.brands.allBrandIds,
			allIntrinsicIds                         : state.category.categoryData.intrinsics.allIntrinsicIds,
			//allIntrinsicNames:                        state.category.categoryData.intrinsics.allIntrinsicNames,
			// /** **/
			comparisonChart                         : state.visualization.comparisonChart,
			intrinsicsByPeriod                      : state.visualizationData.intrinsicsByPeriod,
			intrinsicsByPeriodDateRange             : state.visualization.intrinsicsByPeriodDateRange,
            intrinsicsGlobalCustomType              : state.category.intrinsicsGlobalCustomType,
			intrinsicsByPeriodStacked               : state.visualization.intrinsicsByPeriodStacked,
			intrinsicsChartType                     : state.visualization.selectedChartType,
			chartSort                               : state.visualization.chartSort,
			chartScale                              : state.visualization.chartScale,
			intrinsicsByPeriodChartType             : state.visualization.intrinsicsByPeriodChartType,
			intrinsicsByPeriodChartInterpolationType: state.visualization.intrinsicsByPeriodChartInterpolationType,
			brandData                               : state.brands.brandData,
			intrinsicsValues                        : [],
			landscapeChartType                      : state.visualization.landscapeChartType,
			landscapeChartView                      : state.visualization.landscapeChartView,
			navigationType                          : state.category.navigationType,
			radarChartDates                         : state.visualization.radarChartDates,
			radarChartPeriod                        : state.visualization.radarChartPeriod,
			radarChartScaled                        : state.visualization.radarChartScaled,
			radarChartStacked                       : state.visualization.radarChartStacked,
			radarComparisonType                     : state.visualization.radarComparisonType,
			trendsChartPeriod                       : state.visualization.trendsChartPeriod,
			radarChartType                          : state.visualization.radarChartType,
			//
			selectedBrandIds                        : state.category.categoryData.brands.selectedBrandIds,
			selectedIntrinsicIds                    : state.category.categoryData.intrinsics.selectedIntrinsicIds,
			//
			//selectedIntrinsicNames:
			// state.category.categoryData.intrinsics.selectedIntrinsics.map(id =>
			// state.category.categoryData.intrinsics.allIntrinsicsMapInverted[id]),
			selectedChart                           : state.visualization.selectedChart,
			selectionType                           : state.visualization.selectionType,
			selectedCategory                        : state.category.categoryData.selectedCategory,
			chartConfig                             : chartConfig,
            companyName                             : state.userData.loginInfo.companyName
		};

		// console.log("*****the GLOBAL CUSTOM INTRINSICS*****", settings.navigationType, settings.companyName );
		//console.error('chartEventAsync (saga)', settings);

		let filter = {
			selectedBrandIds    : settings.selectedBrandIds,
			selectedIntrinsicIds: settings.selectedIntrinsicIds,
			settings            : settings,
            company_id          : "default"
		};
		// get the chart configuration

		let validSelection = true;

		try {
			const chartConfig   = settings.chartConfig;
			const numBrands     = settings.selectedBrandIds.length;
			const numIntrinsics = settings.selectedIntrinsicIds.length;

			validSelection = numBrands >= chartConfig.minBrands && numIntrinsics >= chartConfig.minIntrinsics;

			if ( chartConfig.hasOwnProperty( "maxBrands" ) ) { // maxBrands may not be set
				validSelection = validSelection && numBrands <= chartConfig.maxBrands;
			}
			if ( chartConfig.hasOwnProperty( "maxIntrinsics" ) ) { // maxIntrinsics may not be set
				validSelection = validSelection && numIntrinsics <= chartConfig.maxIntrinsics;
			}
			// get the data for the selected chart type

			// console.error('validSelection, selectedChart', validSelection, settings.selectedChart);
		} catch ( error ) {
			console.error( "no chart configuration data" );
		}

		settings.validSelection = validSelection;

		// don't do an API call if there is not a valid selection of brands and intrinsics
		if ( validSelection ) {

			const categoryId = settings.selectedCategory.id;

			switch ( settings.selectedChart ) {
				case Constants.CHART_TRENDS:

					filter.timeSeries = settings.trendsChartPeriod[ categoryId ];

					yield getIntrinsicsByPeriodForTrends( categoryId, filter, settings.companyName );
					break;
				case Constants.CHART_LANDSCAPE:
					yield getVisualizationData( categoryId, filter,settings.companyName, settings.navigationType );
					break;
				case Constants.CHART_BRAND_COMPARISON: // 2 - brand comparison whitespace
					switch ( settings.comparisonChart.type ) {
						case "brands":
							if ( settings.comparisonChart.normalize && settings.selectedIntrinsicIds.length > 1 ) {
								yield getChartBrandComparisonData( categoryId, filter );
							} else {
								yield getChartBrandWhitespaceAnalysisData( categoryId, filter );
							}
							break;
						case "intrinsics":
							//  && settings.selectedIntrinsics.length > 1
							if ( settings.comparisonChart.normalize && settings.selectedBrandIds.length > 1 ) {
								yield getChartIntrinsicComparisonData( categoryId, filter );
							} else {
								yield getChartIntrinsicWhitespaceAnalysisData( categoryId, filter );
							}
							break;
						default:
							break;
					}
					break;
				case Constants.CHART_INTRINSICS_BY_PERIOD: // 6

					filter.timeSeries = {
						period: "weekly",
						start : "2014-01-01"
					};


					// if the action was to set time period "SET_INTRINSICS_BY_PERIOD_DATE_RANGE", check to see if
					// we already have data if so, only filter the data, do not retrieve it again this is just an
					// optimization


					let dataNeeded = true;
					let dataExists = _.get( state, "visualizationData.data.chart.intrinsicsByPeriodRawData.brands" );

					dataExists = typeof dataExists !== "undefined";
                   //  console.log('dataNeeded***** dataexists***', dataNeeded, action.type, dataExists);


                    // determine if data should be read
					if ( ( dataExists ) && (
							action.type === "SET_INTRINSICS_BY_PERIOD_DATE_RANGE" ||
							action.type === "SET_INTRINSICS_CHART_TYPE" ||
							action.type === Constants.SET_INTRINSICS_BY_PERIOD_CHART_SCALE ||
							action.type === Constants.SET_INTRINSICS_BY_PERIOD_CHART_SORT ||
							action.type === "SET_INTRINSICS_BY_PERIOD_CHART_INTERPOLATION_TYPE"
						) ) {
						dataNeeded = false;
					}
                   //  console.log('dataNeeded*****', dataNeeded, action.type);


					if ( dataNeeded ) {
						// console.log('dataNeeded**** 2', dataNeeded), action.type;
						yield getIntrinsicsByPeriod( categoryId, filter,settings.companyName, settings.navigationType );
					} else {

						let response            = {};
						response.data           = state.visualizationData.data.chart.intrinsicsByPeriodRawData;
						response.data._settings = settings;

						yield put( {
							type: Constants.GET_INTRINSICS_BY_PERIOD.concat( Constants.FULFILLED ),
							response
						} );
					}

					break;

				case Constants.CHART_RADAR: // 7

					if ( state.visualization.radarChartType === "periodic" ) {
						filter.timeSeries = {
							period: settings.radarChartPeriod,
							start : settings.radarChartDates.start,
							end   : settings.radarChartDates.end
						};
					}


					filter.timeSeries = {
						period: settings.radarChartPeriod,
						start : "2014-01-01",
						end   : moment().format( "YYYY-MM-DD" )
					};

					yield getIntrinsicsByPeriodForRadarChart( categoryId, filter, settings.companyName, settings.navigationType );

					break;

				case Constants.CHART_SCATTERPLOT: //8
					yield getChartChartScatterPlotData( categoryId, filter,settings.companyName, settings.navigationType );
					break;

                case Constants.CHART_SENTIMENTCOUNTS_BY_PERIOD: //9
                    yield getSentimentcountsByPeriod( categoryId, filter,settings.companyName, settings.navigationType );
                    break;

                case Constants.CHART_POSITIVE_SENTIMENTCOUNTS_BY_PERIOD: //10
                    yield getPositiveSentimentCountsByPeriod( categoryId, filter,settings.companyName, settings.navigationType );
                    break;
                case Constants.CHART_NEGATIVE_SENTIMENTCOUNTS_BY_PERIOD: //11
                    yield getNegativeSentimentCountsByPeriod( categoryId, filter,settings.companyName, settings.navigationType );
                    break;
                case Constants.CHART_NEUTRAL_SENTIMENTCOUNTS_BY_PERIOD: //12
                    yield getNeutralSentimentCountsByPeriod( categoryId, filter,settings.companyName, settings.navigationType );
                    break;
				default:
			}
		}
		/** just update settings **/

		if ( !validSelection ) {
			yield put( {
				type    : Constants.CHART_UPDATE_SETTINGS.concat( Constants.FULFILLED ),
				response: settings
			} );
		}

		// these will be fulfilled
		if ( doPut ) {
			yield put( {
				type    : action.type.concat( Constants.FULFILLED ),
				response: action.payload
			} );
		}

		yield;

	} catch ( error ) {
		handleError( error );
	} finally {
		yield put( hideLoading() );
	}
}

export function* fetchUserDataAsync( action ) {
	const state = store.getState();
	const email = state.userData.loginInfo.email;

	if ( !email ) {
		return;
	}

	/** get the USER **/
	let url      = `${PREDICTA_AUTH}/user/read`;
	let userData = yield call( axios.post, url, {email: email} );

	userData = userData.data.data;

	Utils.debugLogger( "loginAsync: user/read", userData );

	let stringData = _.mapValues( userData, "S" );
	let boolData   = _.mapValues( userData, "BOOL" );
	userData       = _.merge( stringData, boolData );

	userData.role = userData.authorizationRole;
	// delete userData.authorizationRole;

	userData.success = "true";

	/** set the USER **/
	yield put( {
		type   : Constants.SET_LOGIN_INFO,
		payload: userData
	} );

	//console.log('setlogin info', userData);

	url             = `${PREDICTA_AUTH}/preferences/read`;
	let preferences = yield call( axios.post, url, {email: email} );

	//console.log('read prefs', preferences);

	if ( !userData.categories.length ) {
		response.data.message = "No categories configured for this user";
		throw new Error( "No categories configured for this user" ); // COOPER: thow of exception caught locally
	}

	let categoryId        = userData.categories.split( "," )[ 0 ];
	let parsedPreferences = {};


	if ( _.get( preferences, "data.data.preferences.M" ) ) {
		parsedPreferences = preferences.data.data.preferences.M;
		if ( parsedPreferences.hasOwnProperty( "selectedCategory" ) ) {
			categoryId = parsedPreferences.selectedCategory.id;
		}
	}

	yield put( {
		type   : Constants.SET_CATEGORY,
		payload: {categoryId: categoryId, userId: null}
	} );
}

export function* loginAsync( action ) {
	try {

		yield put( showLoading() );

		/** LOGIN **/
		let url      = `${PREDICTA_AUTH}/user/login`;
		let response = yield call( axios.post, url, action.payload );

		Utils.debugLogger( "loginAsync login", url, response );

		let authorized = false;

		if ( response.data.hasOwnProperty( "errorMessage" ) ) {
			response.data.message = `${response.data.errorMessage.split( ":" )[ 1 ]} - ${response.data.errorMessage.split( ":" )[ 2 ]}`;
			throw new Error( response.data.errorMessage );
		} else {
			authorized = true;
		}


		const email = action.payload.email;

		response.data.success = authorized;

		if ( authorized ) {
			response.data.message = "Login successful";
		}


		const obj = {
			success: authorized ? "true" : "false",
			message: response.data.message,
			email  : email
		};

		/** set the USER **/
		yield put( {
			type   : Constants.SET_LOGIN_INFO,
			payload: obj
		} );

		/** there is a watcher that will call fetchUserDataAsync **/
		if ( authorized ) {
			yield put( {
				type: Constants.FETCH_USER_DATA
			} );
		}

	} catch ( error ) {
		console.error( "Login failed" );
		yield call( handleError, error );
	} finally {
		yield put( hideLoading() );
	}
}

/** watch events that require data to be loaded for charts **/


export function* watchChartEvent() {
	//Utils.debugLogger('redux-saga is running watchChartEvent');
	yield takeLatest( Constants.CHART_EVENT, chartEventAsync );
}

export function* watchBrandClicked() {
	//Utils.debugLogger('redux-saga is running watchBrandClicked');
	yield takeLatest( Constants.BRAND_CLICKED, chartEventAsync );
}

export function* watchIntrinsicClicked() {
	//Utils.debugLogger('redux-saga is running watchIntrinsicClicked');
	yield takeLatest( Constants.INTRINSIC_CLICKED, chartEventAsync );
}

export function* watchSelectedChart() {
	//Utils.debugLogger('redux-saga is running watchSelectedChart');
    // console.log("In WatchSelectedChart***")
	yield takeLatest( Constants.SET_SELECTED_CHART, chartEventAsync );
}

export function* watchRadarChartType() {
	//Utils.debugLogger('redux-saga is running watchRadarChartType');
	yield takeLatest( Constants.SET_RADAR_CHART_TYPE, chartEventAsync );
}

export function* watchRadarChartPeriod() {
	//Utils.debugLogger('redux-saga is running watchRadarChartPeriod');
	yield takeLatest( Constants.SET_RADAR_CHART_PERIOD, chartEventAsync );
}

export function* watchRadarChartDates() {
	//Utils.debugLogger('redux-saga is running watchRadarChartDates');
	yield takeLatest( Constants.SET_RADAR_CHART_DATES, chartEventAsync );
}

export function* watchTimePeriodForTrends() {
	//Utils.debugLogger('redux-saga is running watchTimePeriodForTrends');
	yield takeLatest( Constants.SET_TIME_PERIOD_FOR_TRENDS, chartEventAsync );
}

export function* watchComparisonChartType() {
	//Utils.debugLogger('redux-saga is running watchComparisonChartType');
	yield takeLatest( Constants.SET_COMPARISON_CHART_TYPE, chartEventAsync );
}

export function* watchLandScapeChartType() {
	//Utils.debugLogger('redux-saga is running watchLandScapeChartType');
	yield takeLatest( Constants.SET_LANDSCAPE_CHART_TYPE, chartEventAsync );
}

export function* watchLandScapeChartView() {
	//Utils.debugLogger('redux-saga is running watchLandScapeChartView');
	yield takeLatest( Constants.SET_LANDSCAPE_CHART_VIEW, chartEventAsync );
}

export function* watchIntrinsicsChartType() {
	//Utils.debugLogger('redux-saga is running watchLandScapeChartType');
	yield takeLatest( Constants.SET_INTRINSICS_CHART_TYPE, chartEventAsync );
}

export function* watchSetIntrinsicsByPeriodChartType() {
	//Utils.debugLogger('redux-saga is running WatchSetIntrinsicsByPeriodChartType');
	yield takeLatest( Constants.SET_INTRINSICS_BY_PERIOD_CHART_TYPE, chartEventAsync );
}

export function* watchGetIntrinsicsByPeriod() {
	//Utils.debugLogger('redux-saga is running WatchGetIntrinsicsByPeriod');
	yield takeLatest( Constants.GET_INTRINSICS_BY_PERIOD, chartEventAsync );
}

export function* watchSetIntrinsicsByPeriodChartInterpolationType() {
	//console.log('redux-saga is running watchSetWorkingSets');
	yield takeEvery( Constants.SET_INTRINSICS_BY_PERIOD_CHART_INTERPOLATION_TYPE, chartEventAsync );
}

export function* watchSetIntrinsicsByPeriodDateRange() {
	//Utils.debugLogger('redux-saga is running WatchSetIntrinsicsByPeriodDateRange');
	yield takeLatest( Constants.SET_INTRINSICS_BY_PERIOD_DATE_RANGE, chartEventAsync );
}

// HM remove later
//export function* watchSetIntrinsicsGlobalCustomtype() {
//    //Utils.debugLogger('redux-saga is running WatchSetIntrinsicsGlobalCustomtypee');
//    yield takeLatest( Constants.SET_INTRINSICS_GLOBAL_CUSTOM, chartEventAsync );
//}

export function* watchSetCategory() {
	//Utils.debugLogger('redux-saga is running watchSetCategory');
	yield takeLatest( Constants.SET_CATEGORY, setCategoryAsync );
}

export function* watchGetBrandData() {
	//Utils.debugLogger('redux-saga is running watchGetBrandData');
	yield takeLatest( Constants.GET_BRAND_DATA, getBrandDataAsync );
}

export function* watchFetchProducts() {
	//Utils.debugLogger('redux-saga is running watchFetchProducts');
	yield takeLatest( Constants.FETCH_PRODUCTS, fetchProductsAsync );
}

export function* watchFetchNextProducts() {
	//Utils.debugLogger('redux-saga is running watchFetchNextProducts');
	yield takeLatest( Constants.FETCH_NEXT_PRODUCTS, fetchNextProductsAsync );
}

export function* watchGetTopics() {
	//Utils.debugLogger('redux-saga is running watchGetTopics');
	yield takeLatest( Constants.GET_CHART_TOPICS, getTopicsAsync );
}
//HM
export function* watchCreateTopic() {
    //Utils.debugLogger('redux-saga is running watchGetTopics');
    yield takeEvery( Constants.CREATE_TOPIC, createTopicAsync );
}

//DN
export function* watchDeleteTopic() {
    Utils.debugLogger("******redux-saga is running watchdeleteTopics*****");
    yield takeEvery( Constants.DELETE_TOPIC, deleteTopicAsync );
}

export function* watchUpdateTopic() {
    Utils.debugLogger("******redux-saga is running watchUpdateTopic*****");
    yield takeEvery( Constants.UPDATE_TOPICS, updateTopicsAsync );
}
/*
export function* watchSentimentTopicsAsync() {
    //Utils.debugLogger('redux-saga is running watchGetTopics');
    yield takeEvery( Constants.GET_TOPICS_SENTIMENT_COUNTS, sentimentTopicsAsync );
}*/

export function* watchSetBrandNames() {
	//Utils.debugLogger('redux-saga is running watchSetBrandNames');
	yield takeLatest( Constants.SET_BRAND_NAMES, chartEventAsync );
}

export function* watchSetIntrinsicsNames() {
	//Utils.debugLogger('redux-saga is running watchSetIntrinsicsNames');
	yield takeLatest( Constants.SET_INTRINSICS_NAMES, chartEventAsync );
}

export function* watchFetchUserData() {
	//Utils.debugLogger('redux-saga is running watchFetchUserData');
	yield takeLatest( Constants.FETCH_USER_DATA, fetchUserDataAsync );
}

export function* watchLogin() {
	//Utils.debugLogger('redux-saga is running watchLogin');
	yield takeLatest( Constants.LOGIN, loginAsync );
}

// intrinsics by period
export function* watchSetIntrinsicsByPeriodChartScale() {
	//Utils.debugLogger('redux-saga is running watchSetIntrinsicsByPeriodChartScale');
	yield takeLatest( Constants.SET_INTRINSICS_BY_PERIOD_CHART_SCALE, chartEventAsync );
}

export function* watchSetIntrinsicsByPeriodChartSort() {
	//Utils.debugLogger('redux-saga is running watchSetIntrinsicsByPeriodChartSort');
	yield takeLatest( Constants.SET_INTRINSICS_BY_PERIOD_CHART_SORT, chartEventAsync );
}

// radar
export function* watchRadarChartScaled() {
	//Utils.debugLogger('redux-saga is running watchRadarChartScaled');
	yield takeLatest( Constants.SET_RADAR_CHART_SCALED, chartEventAsync );
}

export function* watchRadarChartStacked() {
	//Utils.debugLogger('redux-saga is running watchRadarChartStacked');
	yield takeLatest( Constants.SET_RADAR_CHART_STACKED, chartEventAsync );
}

export function* watchRadarSetComparisonType() {
	//Utils.debugLogger('redux-saga is running watchRadarSetComparisonType');
	yield takeLatest( Constants.SET_RADAR_COMPARISON_TYPE, chartEventAsync );
}

export function* watchSubmitSupportForm() {
	//Utils.debugLogger('redux-saga is running watchSubmitSupportForm');
	yield takeLatest( Constants.SUBMIT_SUPPORT_FORM, chartEventAsync );
}

export function* watchSagaSetCategory() {
	//Utils.debugLogger('redux-saga is running watchSagaSetCategory');
	yield takeLatest( Constants.SAGA_SET_CATEGORY, chartEventAsync );
}

export function* watchSetPreferredBrands() {
	//Utils.debugLogger('redux-saga is running watchSetPreferredBrands');
	yield takeLatest( Constants.SET_PREFERRED_BRANDS, setPreferredBrandsAsync );
}

export function* watchSetPreferredIntrinsics() {
	//Utils.debugLogger('redux-saga is running watchSetPreferredIntrinsics');
	yield takeLatest( Constants.SET_PREFERRED_INTRINSICS, setPreferredIntrinsicsAsync );
}

export function* watchLostPassword() {
	//console.log('redux-saga is running watchLostPassword');
	yield takeEvery( Constants.AWS_USER_LOST_PASSWORD, lostPasswordAsync );
}

export function* watchChangetPassword() {
	//console.log('redux-saga is running watchResetPassword');
	yield takeEvery( Constants.AWS_USER_CHANGE_PASSWORD, changePasswordAsync );
}

export function* watchResetPassword() {
	//console.log('redux-saga is running watchResetPassword');
	yield takeEvery( Constants.AWS_USER_RESET_PASSWORD, resetPasswordAsync );
}

export function* watchSetWorkingSets() {
	//console.log('redux-saga is running watchSetWorkingSets');
	yield takeEvery( Constants.SET_WORKING_SETS, setWorkingSetsAsync );
}

export function* watchGetEvents() {
	//console.log('redux-saga is running watchGetEvents');
	yield takeEvery( Constants.EVENTS_READ_ALL, getEventsAsync );
}

export function* watchUpdateEvent() {
	//console.log('redux-saga is running watchUpdateEvent');
	yield takeEvery( Constants.EVENT_UPDATE, updateEventAsync );
}

export function* watchCreateEvent() {
	//console.log('redux-saga is running watchUpdateEvent');
	yield takeEvery( Constants.EVENT_CREATE, createEventAsync );
}

export function* watchDeleteEvent() {
	//console.log('redux-saga is running watchDeleteEvent');
	yield takeEvery( Constants.EVENT_DELETE, deleteEventAsync );
}

export function* watchEditEvent() {
	//console.log('redux-saga is running watchEditEvent');
	yield takeEvery( Constants.EVENT_EDIT, editEventAsync );
}

export function* watchAddPublication() {
	//console.log('redux-saga is running watchAddPublication');
	yield takeEvery( Constants.PUBLICATION_CREATE, addPublicationAsync );
}

export function* watchDeletePublication() {
	//console.log('redux-saga is running watchDeletePublication');
	yield takeEvery( Constants.PUBLICATION_DELETE, deletePublicationAsync );
}

export function* watchGetPublications() {
	//console.log('redux-saga is running watchDeletePublication');
	yield takeEvery( Constants.PUBLICATION_READ_ALL, getPublicationsAsync );
}

export function* watchEventGetIntrinsicsByPeriod() {
	//console.log('redux-saga is running watchEditEvent');
	yield takeEvery( Constants.EVENT_GET_INTRINSICS_BY_PERIOD, watchEventGetIntrinsicsByPeriodAsync );
}

function* watchAndLog() {
	yield takeEvery( "*", function* logger( action ) {
		const state = yield select();

		Utils.debugLogger( "action", action );
		Utils.debugLogger( "state after", state );
	} );
}

/** root saga **/
export function* rootSaga() {
	yield [
		//
		// chart related
		watchIntrinsicsChartType(),
		watchSetIntrinsicsByPeriodChartType(),
		watchGetIntrinsicsByPeriod(),
		watchBrandClicked(),
		watchChartEvent(),
		watchComparisonChartType(),
		//watchFetchBrandSummary(),
		watchFetchNextProducts(),
		watchFetchProducts(),
		watchGetTopics(),
		watchIntrinsicClicked(),
		watchLandScapeChartType(),
		watchLandScapeChartView(),
		watchFetchUserData(),
		watchLogin(),
		watchRadarChartDates(),
		watchRadarChartPeriod(),
		watchRadarChartScaled(),
		watchRadarChartStacked(),
		watchRadarChartType(),
		watchSelectedChart(),
		watchSetBrandNames(),
		watchSetCategory(),
		watchSetIntrinsicsNames(),
		watchSagaSetCategory(),
		watchTimePeriodForTrends(),
		watchRadarSetComparisonType(),
		/** watch brand/intrinisic prefs **/
		watchSetPreferredBrands(),
		watchSetPreferredIntrinsics(),
		/** end **/
		watchLostPassword(),
		watchChangetPassword(),
		watchResetPassword(),
		watchSetWorkingSets(),
		watchSetIntrinsicsByPeriodDateRange(),
		watchSetIntrinsicsByPeriodChartInterpolationType(),
		watchSetIntrinsicsByPeriodChartScale(),
		watchSetIntrinsicsByPeriodChartSort(),
		watchGetEvents(),
		watchUpdateEvent(),
		watchDeleteEvent(),
		watchCreateEvent(),
		watchEditEvent(),
		watchEventGetIntrinsicsByPeriod(),
		watchAddPublication(),
		watchDeletePublication(),
		watchGetPublications(),
        watchDeleteTopic(),
        watchCreateTopic(),
        watchUpdateTopic()
        //watchSentimentTopicsAsync()


		// watchAndLog()
	];
}
