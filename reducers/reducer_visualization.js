import _              from "lodash";
import moment         from "moment";
import React          from "react";
import * as Constants from "../constants";
import * as Utils     from "../utils";


//
const INITIAL_STATE = {
	visualizationData                       : {
		status: ""
	},
	events                                  : [],
	eventEditing                            : {isEditing: false, eventObj: null},
	selectedChart                           : Constants.CHART_TRENDS,
	selectedChartType                       : "line",
	selectionType                           : "all",
	comparisonChart                         : {
		type     : "brands",
		normalize: false,
		stacked  : true
	},
	chartScale                              : Constants.CHART_SCALE_GLOBAL,
	chartSort                               : Constants.CHART_SORT_BY_FREQUENCY,
	landscapeChartType                      : "pie",
	landscapeChartView                      : "all", // or 'selected'
	radarChartStacked                       : true,
	intrinsicsByPeriodStacked               : true,
	intrinsicsByPeriodDateRange             : {
		range : Constants.DATE_RANGE_1_YEAR,
		filter: {
			period: "weekly",
			start : moment().subtract( 1, "years" ).format( "YYYY-MM-DD" ),
			end   : moment().format( "YYYY-MM-DD" )
		}
	},
	radarChartScaled                        : true,
	radarChartType                          : "cumulative",
	radarComparisonType                     : "intrinsics",
	intrinsicsByPeriodChartInterpolationType: "curveLinear",
	radarChartDates                         : {
		start: moment().subtract( 29, "days" ).format( "YYYY-MM-DD" ),
		end  : moment().format( "YYYY-MM-DD" )
	},
	trendsChartPeriod                       : {},
	intrinsicsByPeriod                      : [],
	intrinsicsByPeriodChartType             : "brands",
	intrinsicsByPeriodForRadar              : {},
	radarChartPeriod                        : "monthly",
	brandComparisons                        : null,
	intrinsicComparisons                    : null,
	whiteSpace                              : null,
	intrinsicWhiteSpace                     : null,
	// productSentimentByWeek :     {
	// 	count : {},
	// 	name :  'Product Sentiment by Week'
	// },
	topicsData                              : [],
	newTopic                                : {},
	deleteTopic                             : {},
	updatedTopic                            : {},
	topicsDataSort                          : Constants.TOPICS_SORT_ORDER_DISABLED_FIRST
};
//
export default function ( state = INITIAL_STATE, action ) {
	switch ( action.type ) {
		case Constants.SET_INTRINSICS_BY_PERIOD_CHART_SCALE.concat( Constants.FULFILLED ):
			return {
				...state,
				chartScale: action.response
			};
		case Constants.SET_INTRINSICS_BY_PERIOD_CHART_SORT.concat( Constants.FULFILLED ):
			return {
				...state,
				chartSort: action.response
			};
		case Constants.SET_SELECTED_CHART.concat( Constants.FULFILLED ):
			return {
				...state,
				selectedChart: action.response
			};
		case Constants.SET_COMPARISON_CHART_TYPE.concat( Constants.FULFILLED ):
			return {
				...state,
				comparisonChart: action.response
			};
		case Constants.SET_LANDSCAPE_CHART_TYPE.concat( Constants.FULFILLED ):
			return {
				...state,
				landscapeChartType: action.response
			};
		case Constants.SET_LANDSCAPE_CHART_VIEW.concat( Constants.FULFILLED ):
			return {
				...state,
				landscapeChartView: action.response
			};
		case Constants.SET_INTRINSICS_CHART_TYPE.concat( Constants.FULFILLED ):
			return {
				...state,
				selectedChartType: action.response
			};
		case Constants.SET_INTRINSICS_BY_PERIOD_CHART_INTERPOLATION_TYPE.concat( Constants.FULFILLED ):
			return {
				...state,
				intrinsicsByPeriodChartInterpolationType: action.response
			};
		case Constants.SET_CHARTS_SELECTION_TYPE.concat( Constants.FULFILLED ):
			return {
				...state,
				selectionType: action.response
			};
		case Constants.SET_RADAR_CHART_TYPE.concat( Constants.FULFILLED ): // cumulative or periodic
			return {
				...state,
				radarChartType: action.response
			};
		case Constants.SET_RADAR_CHART_STACKED.concat( Constants.FULFILLED ):
			return {
				...state,
				radarChartStacked: action.response
			};
		case Constants.SET_INTRINSICS_BY_PERIOD_STACKED.concat( Constants.FULFILLED ):
			return {
				...state,
				intrinsicsByPeriodStacked: action.response
			};
		case Constants.SET_INTRINSICS_BY_PERIOD_CHART_TYPE.concat( Constants.FULFILLED ):
			return {
				...state,
				intrinsicsByPeriodChartType: action.response
			};
		case Constants.SET_RADAR_CHART_SCALED.concat( Constants.FULFILLED ):
			return {
				...state,
				radarChartScaled: action.response
			};
		case Constants.SET_RADAR_COMPARISON_TYPE.concat( Constants.FULFILLED ):
			return {
				...state,
				radarComparisonType: action.response
			};
		case Constants.SET_RADAR_CHART_DATES.concat( Constants.FULFILLED ): // start and end date
			return {
				...state,
				radarChartDates: action.response
			};
		case Constants.SET_RADAR_CHART_PERIOD.concat( Constants.FULFILLED ): // weekly, monthly, ...
			return {
				...state,
				radarChartPeriod: action.response
			};
		case Constants.SET_INTRINSICS_BY_PERIOD_DATE_RANGE.concat( Constants.FULFILLED ): // weekly, monthly, ...
			return {
				...state,
				intrinsicsByPeriodDateRange: action.response
			};
			// HM for Gloabl_Custom_intrinsics removed from here
		case Constants.SET_TIME_PERIOD_FOR_TRENDS.concat( Constants.FULFILLED ): // weekly, monthly, ...
			return {
				...state,
				trendsChartPeriod: action.response
			};


		case Constants.TOPICS_SET_SORT_ORDER:
			return {
				...state,
				topicsDataSort: action.response
			};


		case Constants.EVENTS_READ_ALL.concat( Constants.FULFILLED ):


			let eventObjs = action.response.data;

			const lists = Constants.EVENT_LISTS;

			// lists are returned with their values in a "values" property

			let eventObjsOut = [];
			let eventObjOut  = {};
			let valueArray   = [];

			_.forEach( eventObjs, function ( eventObj ) {

				eventObjOut = Object.assign( {}, eventObj );

				_.forEach( lists, function ( list ) {
					if ( _.get( eventObj, `${list}.values` ) ) {
						//valueArray        = eventObj[list].values.map(item => item.replace(/^\s+|\s+$/gm, ''));
						valueArray          = eventObj[ list ].values;
						valueArray          = valueArray.map( item => {
							item = String( item ).trim();
							return item;
						} );
						eventObjOut[ list ] = valueArray;
					}
				} );

				eventObjsOut.push( eventObjOut );

			} );

			return {
				...state,
				events: eventObjsOut
			};

		case Constants.EVENT_EDIT.concat( Constants.FULFILLED ):


			let eventObj = action.payload;

			// console.log( "eventObj", eventObj );

			return {
				...state,
				eventEditing: {eventObj: eventObj, isEditing: true}
			};

		case Constants.EVENT_END_EDIT.concat( Constants.FULFILLED ):

			return {
				...state,
				eventEditing: {isEditing: false, eventObj: undefined}
			};

		default:
			return state;
	}
}
