import * as Constants from "../constants";
import _              from "lodash";

//
const INITIAL_STATE = {
	lastEvaluatedKey               : 0,
	products                       : [],
	dataSourcesForProductIntrinsics: [],
	allDataSourcesForProducts      : []
};
//
export default function ( state = INITIAL_STATE, action ) {
	switch ( action.type ) {
		case Constants.FETCH_PRODUCTS.concat( Constants.FULFILLED ):
		case Constants.FETCH_NEXT_PRODUCTS.concat( Constants.FULFILLED ):

			let products        = action.response;

			const selectorOptions = products.map( product => {
				return {
					key  : String( product.productId ),
					text : product.name,
					value: String( product.productId )
				};
			} );

			return {
				...state,
				data: {
					list           : products,
					selectorOptions: _.orderBy( selectorOptions, "text" )
				}
			};
		case Constants.FETCH_PRODUCT_JSON.concat( Constants.FULFILLED ):
			return {
				...state,
				json: action.payload.data.json
			};
		case Constants.GET_ALL_DATA_SOURCES_FOR_PRODUCT.concat( Constants.FULFILLED ):
			return {
				...state,
				dataSources: action.payload.data.dataSources
			};
		case Constants.GET_DATA_SOURCES_FOR_PRODUCT_INTRINSIC.concat( Constants.FULFILLED ):
			return {
				...state,
				exemplars : action.payload.data.exempars,
				terms     : action.payload.data.terms,
				topicWords: action.payload.data.topicWords,
				wordScores: action.payload.data.wordScores
			};
		default:
			return state;
	}
}
