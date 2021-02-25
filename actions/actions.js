import axios          from "axios";
import _              from "lodash";
import moment         from "moment";
import * as Constants from "../constants";
import * as Utils     from "../utils";
// import {call} from "redux-saga/effects";
import { all, call, put, select, takeEvery, takeLatest } from "redux-saga/effects";


const ROOT_URL          = Constants.PREDICTA_SERVICES_DOMAIN;
const AUTH              = Constants.PREDICTA_AUTH;
const EVENT_URL         = `${AUTH}/event`;
const CATEGORY_URL      = `${ROOT_URL}/category`;
const BRAND_URL         = `${ROOT_URL}/brand`;
const PRODUCT_URL       = `${ROOT_URL}/product`;
const VISUALIZATION_URL = `${ROOT_URL}/timeseries`;
const TOPICS_URL        = `${ROOT_URL}/topics`;
const SUPPORT_URL       = `${ROOT_URL}/${Constants.SUPPORTBEE_ENDPOINT}`;



// EVENTS

export function getEvents( companyName, categoryId ) {
	return {
		type   : Constants.EVENTS_READ_ALL,
		payload: {companyName: companyName, categoryId: categoryId}
	};
}

export function createEvent( payload ) {
	//axios.put(EVENT_URL, {"body": payload});
	return {
		type   : Constants.EVENT_CREATE,
		payload: {data: payload}
	};
}

export function editEvent( eventObj ) {
	//axios.put(EVENT_URL, {"body": payload});
	return {
		type   : Constants.EVENT_EDIT,
		payload: {data: eventObj}
	};
}

export function endEditEvent() {
	return {
		type: Constants.EVENT_END_EDIT.concat( Constants.FULFILLED )
	};
}

export function updateEvent( payload ) {

	// omit any empty lists
	payload = _.omitBy( payload, function ( value, key ) {
		return typeof value === "object" && !value.length || value === "";
	} );

	// convert all lists which contain numerical ids to strings
	const lists = [ "brandIdList", "intrinsicIdList", "productIdList", "publicationLocationList" ];

	_.forEach( lists, function ( list ) {
		if ( _.get( payload, `${list}.values` ) ) {
			payload[ list ] = payload[ list ].map( id => String( id ) );
		}
	} );

	return {
		type   : Constants.EVENT_UPDATE,
		payload: payload
	};
}

export function deleteEvent( hashKey ) {
	console.log( "deleteEvent", hashKey );
	return {
		type   : Constants.EVENT_DELETE,
		payload: hashKey
	};
}

export function addPublication( displayName, domainName, crawled ) {
	console.log( "addPublication", displayName, domainName, crawled );
	return {
		type   : Constants.PUBLICATION_CREATE,
		payload: {display_name: displayName, domain_name: domainName, crawled: crawled}
	};
}

export function deletePublication( id ) {
	console.log( "deletePublication", id );
	return {
		type   : Constants.PUBLICATION_DELETE,
		payload: {id: id}
	};
}

export function getPublications() {
	console.log( "getPublications");
	return {
		type   : Constants.PUBLICATION_READ_ALL,
	};
}


function getMapping( categoryId, map ) {
	return store.getState().category.categoryData.preferences[ categoryId ][ map ];
}

function brandNamesToIds( categoryId, selectedBrands ) {
	return selectedBrands.map( ( name ) => {
		return brandNameToId( categoryId, name );
	} );
}

function getIntrinsics() {
	Utils.debugLogger( "getIntrinsics", store.getState().category.categoryData.intrinsics.selectedIntrinsics );
	return store.getState().category.categoryData.intrinsics.selectedIntrinsics;
}

function getBrands() {
	Utils.debugLogger( "getBrands", store.getState().category.categoryData.brands.selectedBrands );
	return store.getState().category.categoryData.brands.selectedBrands;
}

function intrinsicNamesToIds( categoryId, selectedIntrinsics ) {
	return selectedIntrinsics.map( ( name ) => {
		return intrinsicNameToId( categoryId, name );
	} );
}

function brandNameToId( categoryId, name ) {
	return getMapping( categoryId, "allBrandsMap" )[ name ];
}

function intrinsicNameToId( categoryId, name ) {
	return getMapping( categoryId, "allIntrinsicsMap" )[ name ];
}

export function namesToIds( categoryId, filter ) {
	// Utils.debugLogger('namesToIds: categoryId, filter, store', categoryId, filter, window.store.getState());
	if ( _.has( filter, "selectedIntrinsics" ) ) {
		filter.selectedIntrinsicIds = intrinsicNamesToIds( categoryId, filter.selectedIntrinsics );
		delete filter.selectedIntrinsics;
	}
	if ( _.has( filter, "selectedBrands" ) ) {
		filter.selectedBrandIds = brandNamesToIds( categoryId, filter.selectedBrands );
		delete filter.selectedBrands;
	}

	// look for undefined meaning translation to ids failed - HACK
	let vals = [];

	if ( filter.hasOwnProperty( "selectedIntrinsicIds" ) ) {
		vals = filter.selectedIntrinsicIds;
	}

	if ( filter.hasOwnProperty( "selectedBrandIds" ) ) {
		vals = vals.concat( filter.selectedBrandIds );
	}

	if ( vals.indexOf( undefined ) >= 0 ) {
		Utils.debugLogger( "undefined value found.", filter.selectedBrandIds, filter.selectedIntrinsicIds );
		return null;
	}

	return filter;
}

export function getBrandNames( categoryId ) {
	Utils.debugLogger( "getBrandNames", categoryId );
	const request = axios.get( `${CATEGORY_URL}/${categoryId}/brands` );
	return {
		type   : Constants.GET_BRAND_NAMES,
		payload: request
	};
}

export function fetchNavData() {
	Utils.debugLogger( "fetchNavData" );
	const request = axios.get( `${CATEGORY_URL}/categories` );
	return {
		type   : Constants.FETCH_NAVDATA,
		payload: request
	};
}

// handled by saga
export function getBrandData( categoryId ) {
	//Utils.debugLogger( 'getBrandData', categoryId );
	const state  = store.getState();
	const sort   = state.nav.brandSort[ categoryId ] ? state.nav.brandSort[ categoryId ].brands : "name";
	const filter = {
		selectedIntrinsicIds: intrinsicNamesToIds( categoryId, getIntrinsics() ),
		selectedBrandIds    : brandNamesToIds( categoryId, getBrands() ),
		sort                : sort
	};
	Utils.debugLogger( "getBrandData (sort data)", filter );
	return {
		meta   : {
			debounce: "simple"
		},
		type   : Constants.GET_BRAND_DATA,
		payload: {categoryId: categoryId, filter: filter}
	};
}

export function curationUpdateBrand( categoryId, id, currentName, form ) {
	Utils.debugLogger( "curationUpdateBrand", categoryId, currentName, form );
	const request = axios.post( `${BRAND_URL}/${categoryId}/update/${id}/${currentName}`, form );
	return {
		type   : Constants.CURATION_UPDATE_BRAND,
		payload: request
	};
}

export function setIntrinsicsByPeriodChartInterpolationType( type ) {
	Utils.debugLogger( "setIntrinsicsByPeriodChartInterpolationType", type );
	return {
		type   : Constants.SET_INTRINSICS_BY_PERIOD_CHART_INTERPOLATION_TYPE,
		payload: type
	};
}

/** PRODUCT *******************************************************************/



// export function fetchProducts( page = 1, numPerPage = 10, status = "unknown", sortBy = "name", categoryId = "waffles", brandId = null ) {
export function fetchProducts( categoryId, selectedBrandIds, selectedIntrinsicIds ) {

	console.log( "fetchProducts", categoryId, selectedBrandIds, selectedIntrinsicIds );

	return {
		type   : Constants.FETCH_PRODUCTS,
		payload: {
			categoryId          : categoryId,
			selectedBrandIds    : selectedBrandIds,
			selectedIntrinsicIds: selectedIntrinsicIds
		}
	};
}


// handled by saga
// export function fetchProducts(categoryId, selectedBrands = store.getState().brands.selectedBrands) {
// 	Utils.debugLogger("fetchProducts", categoryId, selectedBrands);
// 	const state = store.getState();
// 	const sort = state.nav.productSort[categoryId] ? state.nav.productSort[categoryId].products : "name";
// 	const filter = {
// 		perPage             : Constants.PRODUCTS_PER_PAGE,
// 		selectedIntrinsicIds: intrinsicNamesToIds(categoryId, getIntrinsics()),
// 		selectedBrandIds    : brandNamesToIds(categoryId, getBrands()),
// 		sort                : sort
// 	};
//
// 	if (_.includes(filter.selectedIntrinsicIds, undefined) || _.includes(filter.selectedBrandIds, undefined)) {
// 		return;
// 	}
// 	Utils.debugLogger("fetchProducts (sort data)", filter);
// 	return {
// 		type   : Constants.FETCH_PRODUCTS,
// 		payload: {categoryId: categoryId, filter: filter}
// 	};
// }

// handled by saga
export function fetchNextProducts( categoryId, lastEvaluatedKey ) {
	//Utils.debugLogger('fetchNextProducts', categoryId, start, signature);
	return {
		type   : Constants.FETCH_NEXT_PRODUCTS,
		payload: {categoryId: categoryId, lastEvaluatedkey: lastEvaluatedKey}
	};
}

/* Returns the Raw Json for the roduct - for Utils.debugLoggering */
export function fetchProductRawJson( categoryId, id ) {
	Utils.debugLogger( "fetchNextProducts", categoryId, id );
	const response = axios.get( `${PRODUCT_URL}/${categoryId}/${id}` );
	return {
		type   : Constants.FETCH_PRODUCT_JSON,
		payload: response
	};
}

// "topicWords": [ "strong", "bitter", "bold", "Dark" ] } Exemplar data sources for a category intrinsic
export function getReviewsForIntrinsic( categoryId, intrinsicName ) {
	Utils.debugLogger( "getReviewsForIntrinsic", categoryId, intrinsicName );
	const intrinsicId = intrinsicNameToId( categoryId, intrinsicName );
	const request     = axios.get( `${DATASOURCE_URL}/category/exemplars/${categoryId}/${intrinsicId}` );
	return {
		type   : Constants.GET_REVIEWS_FOR_INTRINSIC,
		payload: request
	};
}

// Exemplar data sources for a brand  intrinsic
export function getReviewsForBrandIntrinsic( categoryId, brandId, intrinsicName ) {
	Utils.debugLogger( "getReviewsForBrandIntrinsic", categoryId, brandId, intrinsicName );
	const intrinsicId = intrinsicNameToId( categoryId, intrinsicName );
	const request     = axios.get( `${DATASOURCE_URL}/brand/exemplars/${categoryId}/${brandId}/${intrinsicId}` );
	return {
		type   : Constants.GET_REVIEWS_FOR_BRAND_INTRINISIC,
		payload: request
	};
}

// Exemplar data sources for a product intrinsic
export function getDataSourcesForProductIntrinsic( categoryId, productId, intrinsicName ) {
	Utils.debugLogger( "getDataSourcesForProductIntrinsic", categoryId, productId, intrinsicName );
	const intrinsicId = intrinsicNameToId( categoryId, intrinsicName );
	const request     = axios.get( `${DATASOURCE_URL}/product/exemplars/${categoryId}/${productId}/${intrinsicId}` );
	return {
		type   : Constants.GET_DATA_SOURCES_FOR_PRODUCT_INTRINSIC,
		payload: request
	};
}

// Get all data sources for a product:
// dataSource/exemplars/<categoryId>/<productId>/<intrinsic>/product.json
export function getAllDataSourcesForProduct( categoryId, productId ) {
	Utils.debugLogger( "getAllDataSourcesForProduct", categoryId, productId );
	const request = axios.get( `${DATASOURCE_URL}/product/${categoryId}/${productId}` );
	return {
		type   : Constants.GET_ALL_DATA_SOURCES_FOR_PRODUCT,
		payload: request
	};
}

// handled by saga
export function getVisualizationData( categoryId, filter = {} ) {

	return {
		meta   : {
			debounce: "simple"
		},
		type   : Constants.GET_VISUALIZATION_DATA,
		payload: {categoryId: categoryId, ids: namesToIds( categoryId, filter )}
	};
}

// handled by saga
export function getIntrinsicsByPeriod( categoryId, filter = {} ) {
	Utils.debugLogger( "getIntrinsicsByPeriod", categoryId, filter );
	return {
		meta   : {
			debounce: "simple"
		},
		type   : Constants.GET_INTRINSICS_BY_PERIOD,
		payload: {categoryId: categoryId, ids: namesToIds( categoryId, filter )}
	};
}

export function getIntrinsicsByPeriodForEvents( categoryId, filter = {} ) {
	Utils.debugLogger( "getIntrinsicsByPeriod", categoryId, filter );
	return {
		type   : Constants.EVENT_GET_INTRINSICS_BY_PERIOD,
		payload: {categoryId: categoryId, filter: filter}
	};
}

export function setIntrinsicsByPeriodDateRange( categoryId, filter = {}, range ) {
	Utils.debugLogger( "setIntrinsicsByPeriod", categoryId, filter, range );
	return {
		type   : Constants.SET_INTRINSICS_BY_PERIOD_DATE_RANGE,
		payload: {categoryId: categoryId, filter: filter, range}
	};
}

export function getChartBrandComparisonData( categoryId, filter = {} ) {
	Utils.debugLogger( "Unimplmented: getChartBrandComparisonData", filter );

	// const request = axios.post( `${VISUALIZATION_URL}/${categoryId}/intrinsic/concentration?normalized=true`, namesToIds( categoryId, filter ) );
	// return {
	// 	meta   : {
	// 		debounce: "simple"
	// 	},
	// 	type   : Constants.GET_CHART_BRAND_COMPARISONS_DATA,
	// 	payload: request
	// };
}

// handled by saga
export function getChartWhitespaceAnalysisData( categoryId, filter = {} ) {
	Utils.debugLogger( "getChartWhitespaceAnalysisData", filter );
	return {
		type   : Constants.GET_CHART_WHITESPACE_ANALYSIS_DATA,
		payload: {categoryId: categoryId, ids: namesToIds( categoryId, filter )}
	};
}

// handled by saga
export function getChartIntrinsicComparisonData( categoryId, filter = {} ) {
	Utils.debugLogger( "Unimplmented: getChartIntrinsicComparisonData", filter );

	// const request = axios.post( `${VISUALIZATION_URL}/${categoryId}/brand/concentration?normalized=true`, namesToIds( categoryId, filter ) );
	// return {
	// 	meta   : {
	// 		debounce: "simple"
	// 	},
	// 	type   : Constants.GET_CHART_INTRINSIC_COMPARISONS_DATA,
	// 	payload: {categoryId: categoryId, ids: namesToIds( categoryId, filter )}
	// };
}

export function getChartIntrinsicWhitespaceAnalysisData( categoryId, filter = {} ) {
	Utils.debugLogger( "Unimplmented: getChartIntrinsicWhitespaceAnalysisData", filter );

	// const request = axios.post( `${VISUALIZATION_URL}/${categoryId}/brand/concentration`, namesToIds( categoryId, filter ) );
	// return {
	// 	meta   : {
	// 		debounce: "simple"
	// 	},
	// 	type   : Constants.GET_CHART_INTRINSIC_WHITESPACE_ANALYSIS_DATA,
	// 	payload: request
	// };
}

// handled by saga
export function getChartChartScatterPlotData( categoryId, filter = {} ) {
	Utils.debugLogger( "getChartChartScatterPlotData", filter );
	// const request = axios.post( `${VISUALIZATION_URL}/${categoryId}/intrinsic/products`, namesToIds( categoryId,
	// filter ) );
	return {
		meta   : {
			debounce: "simple"
		},
		type   : Constants.GET_CHART_SCATTER_PLOT,
		payload: {categoryId: categoryId, ids: namesToIds( categoryId, filter )}
	};
}

export function getProductSentimentByWeek( categoryId, productId ) {
	Utils.debugLogger( "Unimplmented: getProductSentimentByWeek", categoryId, productId );

	// const request = axios.get( `${VISUALIZATION_URL}/product/sentiment/${categoryId}/${productId}` );
	// return {
	// 	type   : Constants.GET_PRODUCT_SENTIMENT_PRODUCT_BY_WEEK,
	// 	payload: request
	// };
}

export function getIntrinsicsByPeriodForRadarChart( categoryId, filter = {} ) {
	Utils.debugLogger( "getIntrinsicsByPeriodForRadarChart", categoryId, filter );
	return {
		type   : Constants.GET_INTRINSICS_BY_PERIOD_FOR_RADAR,
		payload: {categoryId: categoryId, ids: namesToIds( categoryId, filter )}
	};
}

export function getIntrinsicsByPeriodForTrends( categoryId, filter = {} ) {
	Utils.debugLogger( "getIntrinsicsByPeriodForTrends", categoryId, filter );
	return {
		type   : Constants.GET_INTRINSICS_BY_PERIOD_FOR_TRENDS,
		payload: {categoryId: categoryId, ids: namesToIds( categoryId, filter )}
	};
}

export function setTimePeriodforTrends( categoryId, period ) {
	Utils.debugLogger( "setTimePeriodforTrends", categoryId, period );

	let start = null;

	switch ( period ) {
		case "weekly":
			start = moment().subtract( 52, "week" ).startOf( "week" ).format( "YYYY-MM-DD" );
			break;
		case "monthly":
			start = moment().subtract( 12, "month" ).startOf( "month" ).format( "YYYY-MM-DD" );
			break;
		case "quarterly":
			start = moment().subtract( 12, "month" ).startOf( "month" ).format( "YYYY-MM-DD" );
			break;
		case "yearly":
			start = "2014-01-01";  // no data before then
			break;
			break;
		default:
			break;
	}


	let filter = {
		end   : moment().format( "YYYY-MM-DD" ),
		period: period
	};

	if ( start ) {
		filter.start = start;
	}

	const obj = {
		[ categoryId ]: filter
	};

	return {
		type   : Constants.SET_TIME_PERIOD_FOR_TRENDS,
		payload: obj
	};
}


/** TOPICS ********************************************************************/
export function getTopics( categoryId, companyname ) {
	Utils.debugLogger( "getTopics", categoryId );
	// const request = axios.get( `${TOPICS_URL}/${categoryId}` );
	return {
		type   : Constants.GET_CHART_TOPICS,
		payload: {categoryId: categoryId, companyName:companyname}
	};
}

export function updateTopics( categoryId,companyname, obj ) {
	//Utils.debugLogger( "updateTopics", categoryId, config );
	//const request = axios.post( `${TOPICS_URL}/${categoryId}`, filterData );
	return {
		type   : Constants.UPDATE_TOPICS,
        payload: {categoryId: categoryId, companyName:companyname,filterObj: obj}
		//payload: request
	};
}

// PUT /topics/create/{categoryId}
export function createTopic( categoryId, companyname, obj ) {
	Utils.debugLogger( "createTopic", categoryId );

	return {
		type   : Constants.CREATE_TOPIC,
        payload: {categoryId: categoryId, companyName: companyname, filterObj: obj}
	};
}

// DELETE /topics/delete/{categoryId}/{topicId}
export function deleteTopic( categoryId,companyname, obj) {
	//Utils.debugLogger( "deleteTopic", categoryId, topicId );
	//const request = axios.delete( `${TOPICS_URL}/${categoryId}/${topicId}` );
	return {
		type   : Constants.DELETE_TOPIC,
		payload: {categoryId: categoryId, companyName: companyname, filterObj: obj}
		//payload: request
	};
}

//Sentiment
/*
export function getTopicSentimentCounts( categoryId, companyname, obj ) {
    return {
        type   : Constants.GET_TOPICS_SENTIMENT_COUNTS,
        payload: {categoryId: categoryId, companyName:companyname, filterObj:obj}
    };
}
*/
/** SESSION *******************************************************************/

export function fetchUserData() {
	return {
		type: Constants.FETCH_USER_DATA
	};
}

export function login( obj ) {
	// Utils.debugLogger( 'login', obj );
	return {
		type   : Constants.LOGIN,
		payload: obj
	};
}

export function logout() {
	Utils.debugLogger( "logout" );
	//const request = axios.post(`${SESSION_URL}/delete`);
	return {
		type: Constants.LOGOUT.concat( Constants.FULFILLED )
	};
}

export function setPreferredBrands( categoryId, userId, brandIds ) {
	Utils.debugLogger( "setPreferredBrands", categoryId, userId, brandIds );
	const obj = {
		brandIds  : brandIds,
		//brandNames: brandNamesToIds(categoryId, brandIds),//TODO:use utility function (this works but it is backwards)
		categoryId: categoryId,
		id        : userId
	};
	return {
		type   : Constants.SET_PREFERRED_BRANDS,
		payload: obj
	};
}

export function setPreferredIntrinsics( categoryId, userId, intrinsicIds ) {
	Utils.debugLogger( "setPreferredIntrinsics", categoryId, userId, intrinsicIds );
	const obj = {
		intrinsicIds: intrinsicIds,
		//intrinsicNames: intrinsicNamesToIds(categoryId, intrinsicIds), //TODO:use utility function (this works but it
		// is backwards)
		categoryId  : categoryId,
		id          : userId
	};

	//const request = axios.post(
	//    `${SESSION_URL}/intrinsics/preferred`
	//    , obj);
	return {
		type   : Constants.SET_PREFERRED_INTRINSICS,
		payload: obj
	};
}

// handled by saga
export function setCategory( categoryId, userId ) {
	Utils.debugLogger( "setSelectedCategory", categoryId, userId );
	return {
		type   : Constants.SET_CATEGORY,
		payload: {categoryId: categoryId, userId: userId}
	};
}

/******************************************************************************/
export function productSetThreshhold( count, categoryId ) {
	Utils.debugLogger( "productSetThreshhold", count, categoryId );
	return {
		type   : Constants.SET_PRODUCT_THRESHOLD,
		payload: count
	};
}

export function reviewSetThreshhold( count, categoryId ) {
	Utils.debugLogger( "reviewSetThreshhold", count, categoryId );
	return {
		type   : Constants.SET_REVIEW_THRESHOLD,
		payload: count
	};
}

// sort by brand
export function setBrandSortType( type, categoryId ) {
	Utils.debugLogger( "setBrandSortType", type, categoryId );
	let obj           = {};
	obj[ categoryId ] = {
		"brands": type
	};
	return {
		type   : Constants.SET_BRAND_SORT_TYPE,
		payload: obj
	};
}

// sort by product
export function setProductSortType( type, categoryId ) {
	Utils.debugLogger( "setProductSortType", type, categoryId );
	let obj           = {};
	obj[ categoryId ] = {
		"products": type
	};
	return {
		type   : Constants.SET_PRODUCT_SORT_TYPE,
		payload: obj
	};
}

// export function setBrandNames( allBrands, preferredBrands,  displayed ) {
//export function setBrandNames(allBrands, preferredBrands, selectedBrands, displayed, categoryName) {
//    Utils.debugLogger('setBrandNames', allBrands, preferredBrands, selectedBrands, displayed);
//    return {
//        type      : Constants.SET_BRAND_NAMES,
//        brandNames: {
//            allBrands      : allBrands,
//            preferredBrands: preferredBrands,
//            // displayedBrands: displayedBrands,
//            selectedBrands : selectedBrands,
//            displayed      : displayed,
//            categoryName   : categoryName
//        }
//    };
//}

export function setBrandNames( allBrandIds, preferredBrandIds, selectedBrandIds, displayed, categoryId ) {
	//Utils.debugLogger('setBrandNames', allBrands, preferredBrands, selectedBrands, displayed);
	return {
		type   : Constants.SET_BRAND_NAMES,
		payload: {
			allBrands      : allBrandIds,
			preferredBrands: preferredBrandIds,
			selectedBrands : selectedBrandIds,
			displayed      : displayed,
			categoryName   : categoryId
		}
	};
}

//TODO:refactor payload keys

export function setIntrinsicsNames( allIntrinsicsIds, preferredIntrinsicIds, selectedIntrinsicIds, displayed, categoryId ) {
	//Utils.debugLogger('setIntrinsicsNames', allIntrinsicsIds, preferredIntrinsicIds, selectedIntrinsicIds, displayed,
	// categoryId);

	return {
		type   : Constants.SET_INTRINSICS_NAMES,
		payload: {
			allIntrinsics       : allIntrinsicsIds,
			preferredIntrinsics : preferredIntrinsicIds,
			selectedIntrinsics  : selectedIntrinsicIds,
			selectedIntrinsicIds: selectedIntrinsicIds,
			displayed           : displayed,
			categoryName        : categoryId
		}
	};
}

// a brand is clicked in the checkbox list
export function brandClicked( brandObj ) {
	Utils.debugLogger( "brandClicked", brandObj );
	return {
		type   : Constants.BRAND_CLICKED,
		payload: brandObj /* name, checked */
	};
}

// an intrinsic is clicked in the checkbox list
export function intrinsicClicked( intrinsicObj ) {
	Utils.debugLogger( "intrinsicClicked", intrinsicObj );
	return {
		type   : Constants.INTRINSIC_CLICKED,
		payload: intrinsicObj /* name, checked */
	};
}

export function setNavigationType( name ) {
	Utils.debugLogger( "setNavigationType", name );
	return {
		type   : Constants.SET_NAVIGATION_TYPE,
		payload: name
	};
}
// HM
//export function setIntrinsicsGlobalCustomType(intrinsics_global_custom) {
//    Utils.debugLogger( "setIntrinsicsGlobalCustom", intrinsics_global_custom);
//    return {
//        type   : Constants.SET_INTRINSICS_GLOBAL_CUSTOM_TYPE,
//        payload: intrinsics_global_custom
//    };
//}

export function setRefineByType( name ) {
	Utils.debugLogger( "setRefineByType", name );
	return {
		type   : Constants.SET_REFINE_BY_TYPE,
		payload: name
	};
}

export function setSelectedChart( chart ) {
	Utils.debugLogger( "setSelectedChart", chart );
	return {
		type   : Constants.SET_SELECTED_CHART,
		payload: chart
	};
}

export function setComparisonChartType( type, normalize, stacked ) {
	Utils.debugLogger( "setComparisonChartType", type, normalize, stacked );
	const obj = {
		type     : type,
		normalize: normalize,
		stacked  : stacked
	};
	return {
		type   : Constants.SET_COMPARISON_CHART_TYPE,
		payload: obj
	};
}

export function setChartConfig( config ) {
	Utils.debugLogger( "setChartConfig", config );
	return {
		type   : Constants.SET_CHART_CONFIG,
		payload: config
	};
}

export function setLandscapeChartType( type ) {
	Utils.debugLogger( "onLandscapeChartTypeSelected", type );
	return {
		type   : Constants.SET_LANDSCAPE_CHART_TYPE,
		payload: type
	};
}

export function setLandscapeChartView( type ) {
	Utils.debugLogger( "landscapeChartView", type );
	return {
		type   : Constants.SET_LANDSCAPE_CHART_VIEW,
		payload: type
	};
}

export function setSelectionType( type ) { // brand comparison - all intrinsics or selected intrinsics
	Utils.debugLogger( "setSelectionType", type );
	return {
		type   : Constants.SET_CHARTS_SELECTION_TYPE,
		payload: type
	};
}

export function setIntrinsicsChartType( type ) { // line/bar
	Utils.debugLogger( "setIntrinsicsChartType", type );
	return {
		type   : Constants.SET_INTRINSICS_CHART_TYPE,
		payload: type
	};
}

export function setChartScale( type ) { // line/bar
	Utils.debugLogger( "setChartScale", type );
	return {
		type   : Constants.SET_INTRINSICS_BY_PERIOD_CHART_SCALE,
		payload: type
	};
}

export function setChartSort( type ) { // line/bar
	Utils.debugLogger( "setChartSort", type );
	return {
		type   : Constants.SET_INTRINSICS_BY_PERIOD_CHART_SORT,
		payload: type
	};
}

export function setIntrinsicsByPeriodChartType( type ) { // brands/intrinsics
	Utils.debugLogger( "setIntrinsicsByPeriodChartType", type );
	return {
		type   : Constants.SET_INTRINSICS_BY_PERIOD_CHART_TYPE,
		payload: type
	};
}

export function setTopicsSortOrder( sortOrder ) {
	Utils.debugLogger( "setTopicsSortOrder", sortOrder );
	return {
		type   : Constants.TOPICS_SET_SORT_ORDER,
		payload: sortOrder
	};
}

export function setRadarChartType( type ) { // cumulative or periodic
	Utils.debugLogger( "setRadarChartType", type );
	return {
		type   : Constants.SET_RADAR_CHART_TYPE,
		payload: type
	};
}

export function setRadarChartStacked( stacked ) { // cumulative or periodic
	Utils.debugLogger( "setRadarChartStacked", stacked );
	return {
		type   : Constants.SET_RADAR_CHART_STACKED,
		payload: stacked
	};
}

export function setRadarComparisonType( type ) { // cumulative or periodic
	Utils.debugLogger( "setRadarComparisonType", type );
	return {
		type   : Constants.SET_RADAR_COMPARISON_TYPE,
		payload: type
	};
}

export function setIntrinsicsByPeriodStacked( stacked ) { // cumulative or periodic
	Utils.debugLogger( "setIntrinsicsByPeriodStacked", stacked );
	return {
		type   : Constants.SET_INTRINSICS_BY_PERIOD_STACKED,
		payload: stacked
	};
}

export function setRadarChartScaled( scaled ) { // cumulative or periodic
	Utils.debugLogger( "setRadarChartScaled", scaled );
	return {
		type   : Constants.SET_RADAR_CHART_SCALED,
		payload: scaled
	};
}

export function setRadarChartDates( start, end ) {
	Utils.debugLogger( "setRadarChartDates", start, end );
	return {
		type   : Constants.SET_RADAR_CHART_DATES,
		payload: {
			start: start,
			end  : end
		}
	};
}

export function setRadarChartPeriod( period ) {
	Utils.debugLogger( "setRadarChartPeriod", period );
	return {
		type   : Constants.SET_RADAR_CHART_PERIOD,
		payload: period
	};
}

export function register( obj ) {
	Utils.debugLogger( "register", obj );
	const request = axios.post(
		`${ROOT_URL}/auth/register`
		, obj ).catch( function ( error ) {
		Utils.debugLogger( "register error", error );
		//noinspection UnnecessaryReturnStatementJS
		return;
	} );
	return {
		type   : Constants.REGISTER,
		payload: request
	};
}

export function fetchUsers() {
	return {};
}

export function setSelectedAdminTab( key ) {
	return {};
}

// formio
export function adminUpdateUser( id ) {
	return {};
}

function requestForm( name, src ) {
	return {};
}

function receiveForm( form ) {
	return {};
}

function failForm( err ) {
	return {};
}

export function fetchForm( src ) {
	return {};
}

export function getUserSettingsForm( src ) {
	return {};
}

export function getUserSettingsSubmission( src ) {
	return {};
}

export function setUserBrandsControl( val ) {
	Utils.debugLogger( "setUserBrandsControl", val );
	return {
		type   : Constants.SET_USER_BRANDS_CONTROL,
		payload: val
	};
}

export function setUserIntrinsicsControl( val ) {
	Utils.debugLogger( "setUserIntrinsicsControl", val );
	return {
		type   : Constants.SET_USER_INTRINSICS_CONTROL,
		payload: val
	};
}

/** Support Bee **/
export function showSupportForm( val ) {
	Utils.debugLogger( "showSupportForm", val );
	return {
		type   : Constants.NAV_ACTION_SUPPORT,
		payload: val
	};
}

export function resetSupportFormStatus() {
	Utils.debugLogger( "resetSupportFormStatus" );
	return {
		type   : Constants.SUBMIT_SUPPORT_FORM.concat( Constants.FULFILLED ),
		payload: {data: {status: false}}
	};
}


export function submitSupportForm( obj ) {
	Utils.debugLogger( "submitSupportForm", obj );

	const subject = `<h3>${obj.subject}</h3>`;
	const message = `<p>${obj.message}</p>`;
	const html    = subject.concat( message );

	const data = {
		"ticket": {
			"subject"              : obj.subject,
			"requester_name"       : obj.name,
			"requester_email"      : obj.email,
			"forwarding_address_id": Constants.SUPPORTBEE_FORWARDING_EMAIL_ID,
			//"notify_requester": true,
			"content"              : {
				"text": obj.message,
				"html": `<h1>${obj.subject}</h1><p>${obj.message}</p>`
			}
		}
	};

	const request = axios.post( SUPPORT_URL, data );

	return {
		type   : Constants.SUBMIT_SUPPORT_FORM,
		payload: request
	};
}

/** password **/
export function lostPassword( data ) {
	return {
		type   : Constants.AWS_USER_LOST_PASSWORD,
		payload: data
	};
}

export function resetPassword( email, oldPassword, newPassword ) {
	return {
		type   : Constants.AWS_USER_RESET_PASSWORD,
		payload: {email: email, oldPassword: oldPassword, newPassword: newPassword}
	};
}

export function changePassword( data ) {
	return {
		type   : Constants.AWS_USER_CHANGE_PASSWORD,
		//payload: {email: email, oldPassword: oldPassword, newPassword: newPassword}
		payload: data
	};
}

export function resetChangePasswordStatus() {
	return {
		type   : Constants.AWS_USER_RESET_CHANGE_PASSWORD_STATUS,
		payload: null
	};
}

export function resetLostPasswordStatus() {
	return {
		type   : Constants.AWS_USER_RESET_LOST_PASSWORD_STATUS,
		payload: null
	};
}

// handled by saga
export function setWorkingSets( workingSets ) {
	// Utils.debugLogger( 'login', obj );
	return {
		type   : Constants.SET_WORKING_SETS,
		payload: workingSets
	};
}
