import _              from "lodash";
import * as Constants from "../constants";

//
const INITIAL_STATE = {
	//selectedCategory: {},
	navigationType: "trends",
	refineByType  : "brands",
	categoryData  : {
		brandByIdAllBrandsMap: {},
		publications: [],
		brands      : {
			selectedBrands       : [], //TODO: remove
			selectedBrandIds     : [],
			allBrands            : [],//TODO: remove
			allBrandIds          : [],
			preferredBrands      : [],//TODO: remove
			preferredBrandIds    : [],
			displayedBrands      : [],
			allBrandsMapInverted : {},
			brandsSelectorOptions: [],
			colors               : []
		},
		intrinsics  : {
			allIntrinsics            : [],//TODO: remove
			allIntrinsicIds          : [],
			selectedIntrinsics       : [],//TODO: remove
			selectedIntrinsicIds     : [],
			preferredIntrinsics      : [],//TODO: remove
			preferredIntrinsicIds    : [],
			displayedIntrinsics      : [],
			allIntrinsicsMapInverted : {},
			intrinsicsSelectorOptions: [],
			colors                   : []
		},
		brandData   : [],
		categoryName: ""
	}
};


//
export default function ( state = INITIAL_STATE, action ) {

	let selectedCategoryId = null;
	let obj                = {};

	function setBrandOrIntrinsicTable( map, preferred, selected ) {

		let table = {};

		//console.log('names', names);

		const ids = Object.keys( map );

		_.forEach( ids, function ( id ) {
			table[ id ] = {id: id, name: map[ id ], selected: false, preferred: false};
		} );

		//TODO - test this (probably broken)
		_.forEach( preferred, function ( id ) {
			if ( table.hasOwnProperty( id ) ) {
				table[ id ].preferred = true;
			}
		} );

		_.forEach( selected, function ( id ) {
			if ( table.hasOwnProperty( id ) ) {
				table[ id ].selected = true;
			}
		} );

		//console.log('table', table);

		return table;
	}

	switch ( action.type ) {
		case Constants.SAGA_SET_CATEGORY:

			let categoryData = action.categoryData;

			const allBrandsMapInverted     = action.categoryData.brands.allBrandsMapInverted;
			const allIntrinsicsMapInverted = action.categoryData.intrinsics.allIntrinsicsMapInverted;

			let preferredIntrinsicIds = action.categoryData.intrinsics.preferredIntrinsicIds;
			let selectedIntrinsicIds  = action.categoryData.intrinsics.selectedIntrinsicIds;

			let preferredBrandIds = action.categoryData.brands.preferredBrandIds;
			let selectedBrandIds  = action.categoryData.brands.selectedBrandIds;
			publications          = action.categoryData.publications;

			categoryData.brands.brandTable = setBrandOrIntrinsicTable( allBrandsMapInverted, preferredBrandIds, selectedBrandIds );

			categoryData.intrinsics.intrinsicTable = setBrandOrIntrinsicTable( allIntrinsicsMapInverted, preferredIntrinsicIds, selectedIntrinsicIds );


			/** intrinsic colors **/

			let colors = {};
			let idx    = 0;

			const intrinsicIds = Object.keys( allIntrinsicsMapInverted ).sort();
			_.forEach( intrinsicIds, function ( id ) {
				colors[ id ] = Constants.markerColors5[ idx++ % Constants.markerColors5.length ];
			} );

			categoryData.intrinsics.colors = colors;


			colors = {};
			idx    = 0;

			/** brand colors **/

			const brandIds = Object.keys( allBrandsMapInverted ).sort( function ( a, b ) {
				return a - b;
			} );
			_.forEach( brandIds, function ( id ) {
				colors[ id ] = Constants.markerColors5[ idx++ % Constants.markerColors5.length ];
			} );

			categoryData.brands.colors = colors;

			// colors for sentiments

            colors = {};
            idx    = 0;
            _.forEach(categoryData.sentiment, function ( id ) {
                colors[ id ] = Constants.markerColors6[ idx++ % Constants.markerColors6.length ];
            } );

            categoryData.sentiment.colors = colors;

			// selection helpers

			const intrinsicsSelectorOptions = intrinsicIds.map( id => {
				return {
					key  : id,
					value: id,
					text : allIntrinsicsMapInverted[ id ]
				};
			} );

			// let publicationsSelectorOptions = allPublications.map( obj => {
			// 	return {
			// 		key  : obj.id,
			// 		value: String( obj.id ),
			// 		text : obj.display_name
			// 	};
			// } );

			const brandsSelectorOptions = brandIds.map( id => {
				return {
					key  : id,
					value: String( id ),
					text : allBrandsMapInverted[ id ]
				};
			} );

			categoryData.brands.brandsSelectorOptions         = _.orderBy( brandsSelectorOptions, "text" );
			categoryData.publications                         = publications;
			categoryData.intrinsics.intrinsicsSelectorOptions = _.orderBy( intrinsicsSelectorOptions, "text" );


			return {
				...state,
				categoryData: categoryData
			};

		case Constants.GET_ALL_BRANDS_MAP.concat( Constants.FULFILLED ):

			return {
				...state,
				brandByIdAllBrandsMap: action.payload.data.allBrandsMap
			};


		case Constants.SET_BRAND_NAMES.concat( Constants.FULFILLED ):
			let allBrandIds               = action.response.allBrands;
			preferredBrandIds             = action.response.preferredBrands;
			let preferredSelectedBrandIds = action.response.selectedBrands;

			obj                          = Object.assign( {}, state.categoryData );
			obj.brands.selectedBrandIds  = preferredSelectedBrandIds;
			obj.brands.allBrandIds       = allBrandIds;
			obj.brands.preferredBrandIds = preferredSelectedBrandIds;

			obj.brands.displayed       = action.response.displayed;
			obj.brands.brandsDisplayed = action.response.displayed;
			obj.brands.categoryName    = action.response.categoryName;

			obj = Object.assign( {}, state.categoryData );

			obj.brands.brandTable = setBrandOrIntrinsicTable( obj.brands.allBrandsMapInverted, preferredBrandIds, preferredSelectedBrandIds );


			return {
				...state,
				categoryData: obj
			};

		case Constants.SET_INTRINSICS_NAMES.concat( Constants.FULFILLED ):

			let allIntrinsicIds               = action.response.allIntrinsics;
			preferredIntrinsicIds             = action.response.preferredIntrinsics;
			let preferredSelectedIntrinsicIds = action.response.selectedIntrinsics;

			obj                                  = Object.assign( {}, state.categoryData );
			obj.intrinsics.selectedIntrinsicIds  = preferredSelectedIntrinsicIds;
			obj.intrinsics.allIntrinsicIds       = allIntrinsicIds;
			obj.intrinsics.preferredIntrinsicIds = preferredIntrinsicIds;

			obj.intrinsics.displayed           = action.response.displayed;
			obj.intrinsics.intrinsicsDisplayed = action.response.displayed;
			obj.intrinsics.categoryName        = action.response.categoryName;

			obj = Object.assign( {}, state.categoryData );


			obj.intrinsics.intrinsicTable = setBrandOrIntrinsicTable( obj.intrinsics.allIntrinsicsMapInverted, preferredIntrinsicIds, preferredSelectedIntrinsicIds );

			return {
				...state,
				categoryData: obj
			};

		case Constants.PUBLICATION_READ_ALL.concat( Constants.FULFILLED ):

			let publications = action.response.data.body;

			obj = Object.assign( {}, state.categoryData );
			obj.publications = publications;

			return {
				...state,
				categoryData: obj
			};

		case Constants.SET_NAVIGATION_TYPE:
			return {
				...state,
				navigationType: action.payload
			};
			//HM
      //  case Constants.SET_INTRINSICS_GLOBAL_CUSTOM_TYPE: // flag to see global or custom is set, ...
        //    return {
          //      ...state,
            //    intrinsicsGlobalCustomType: action.response
            //};
		case Constants.SET_REFINE_BY_TYPE:
			return {
				...state,
				refineByType: action.payload
			};
		default:
			return state;
	}
}
