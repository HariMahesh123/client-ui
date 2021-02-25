import _                from "lodash";
import React            from "react";
import ScatterPlotChart from "../components/charts/scatterplot";
import * as Constants   from "../constants";
import moment           from "moment/moment";


//
const INITIAL_STATE = {

	data                  : {
		settings: {
			comparisonChart          : {
				type     : "brands",
				normalize: false,
				stacked  : true
			},
			intrinsicsByPeriod       : [],
			intrinsicsByPeriodStacked: true,
			intrinsicsByPeriodRawData: null,
			intrinsicsChartType      : "line",
			intrinsicsValues         : [],
			landscapeChartType       : "pie",
			landscapeChartView       : "all",
			navigationType           : "trends",
			radarChartDates          : null,
			radarChartPeriod         : "monthly",
			radarChartScaled         : true,
			radarChartStacked        : true,
			radarChartType           : "cumulative",
			selectedBrands           : [],
			selectedCategory         : {},
			selectedChart            : Constants.CHART_LANDSCAPE,
			selectedIntrinsics       : [],
			selectionType            : "all",
			trendsChartPeriod        : {}
		},
		chart   : {
			whiteSpace                 : {},
			intrinsicsByBrandTimeSeries: [],
			brandsByIntrinsicTimeSeries: []
		}
	},
	productSentimentByWeek: {
		count: {},
		name : "Product Sentiment by Week"
	},
	topicsData            : []
};


export default function ( state = INITIAL_STATE, action ) {

	let appState = {};

	function getPercentChangeTimeSeries( timeSeriesObjects ) {

		let tmpSeries = _.cloneDeep( timeSeriesObjects );
		let points    = [];
		let output    = [];

		_.forEach( tmpSeries, function ( timeSeriesObj ) {

			points = timeSeriesObj.points;

			if ( points.length ) {

				let event   = points[ 0 ];
				let date    = [ event[ 0 ] ];
				let vals    = _.times( event.length - 1, _.constant( 0.0 ) );
				let points2 = [ date.concat( vals ) ];  // the first event should be date, followed by n 0's

				for ( let idx = 1; idx < points.length; idx++ ) {

					event = points[ idx ]; // [date, V0, V1, ... Vn]
					date  = [ event[ 0 ] ];
					vals  = event.slice( 1 );

					points2[ idx ] = date.concat( vals.map( ( val, i ) => ( ( val / points[ idx - 1 ][ i + 1 ] * 100.0 ) - 100.0 ) ) );
				}

				timeSeriesObj.points = points2;
				output.push( timeSeriesObj );
			}

		} );

		return output;
	}

	function getDateAndValueDomains( timeSeriesObjects ) {
		let allDates = [];
		let values   = [];
		let points   = [];

		let maxDate = new Date().getTime();
		let minDate = maxDate;

		let minVal = 0.0;
		let maxVal = 0.0;

		let tmpSeries = _.cloneDeep( timeSeriesObjects );

		tmpSeries.forEach( function ( timeSeriesObj ) {
			points = timeSeriesObj.points;
			points.forEach( function ( dataArray ) {
				allDates.push( dataArray.shift() );
				values = values.concat( dataArray );
			} );
		} );

		values = values.sort( function ( a, b ) {
			return a - b;
		} );

		allDates = allDates.sort( function ( a, b ) {
			return a - b;
		} );

		if ( values.length >= 2 ) {
			minVal = values[ 0 ];
			maxVal = values.pop();
		} else {
			minVal = maxVal = 0;
		}

		if ( allDates.length >= 2 ) {
			minDate = allDates[ 0 ];
			maxDate = allDates.pop();
		} else {
			minDate = maxDate = new Date();
		}

		return {minVal: minVal, maxVal: maxVal, minDate: minDate, maxDate: maxDate};
	}

    function getSentimentDateAndValueDomains( sentimentCountsByBrandTimeSeries ) {
        let allDates    = [];
        let values      = [];
        let points      = [];

        let maxDate = new Date().getTime();
        let minDate = maxDate;

        let minVal = 0;
        let maxVal = 0;


        let tmpSeries = _.cloneDeep( sentimentCountsByBrandTimeSeries );

        tmpSeries.forEach( function ( sentimentCountsByBrandTimeSeries ) {
            points = sentimentCountsByBrandTimeSeries.points;

            points.forEach( function ( dataArray ) {
                allDates.push( dataArray.shift() );
                values.push(dataArray.shift());
                values = values.concat( dataArray );
            } );
        } );

        allDates = allDates.sort( function ( a, b ) {
            return a - b;
        } );

        values = values.sort( function ( a, b ) {
            return a - b;
        } );

        if ( allDates.length >= 2 ) {
            minDate = allDates[ 0 ];
            maxDate = allDates.pop();
        } else {
            minDate = maxDate = new Date();
        }

        if ( values.length >= 2 ) {
            minVal = values[ 0 ];
            maxVal = values.pop();
        } else {
            minVal = maxVal = 0;
        }


        return {minVal: minVal, maxVal: maxVal,minDate: minDate, maxDate: maxDate};
    }


    function getBrandsByIntrinsicsdata( intrinsicsByBrandData, period, selectedBrandIds, selectedIntrinsicIds ) {
		// give intrinsicsByBrandData, produce brandsByIntrinsic Data
		const returnedBrandIds = _.filter( Object.keys( intrinsicsByBrandData ), function ( val ) {return ( val !== "relic_date" && val !== "filter" );} );

		let dateKeys = returnedBrandIds.length ? Object.keys( intrinsicsByBrandData[ Number( returnedBrandIds[ 0 ] ) ][period] ) : [];
		dateKeys     = dateKeys.sort();

		let brandsByIntrinsicData = {};

		_.forEach( selectedIntrinsicIds, function ( intrinsicId ) {
			brandsByIntrinsicData[ intrinsicId ] = {[period]: {}};

			_.forEach( dateKeys, function ( dateKey ) {
				brandsByIntrinsicData[ intrinsicId ][period][ dateKey ] = {};

				_.forEach( returnedBrandIds, function ( brandId ) {
                    if (intrinsicsByBrandData[ brandId ][period][ dateKey ][ intrinsicId ]) {
                        brandsByIntrinsicData[intrinsicId][period][dateKey][brandId] = intrinsicsByBrandData[brandId][period][dateKey][intrinsicId];
                    }
				} );
			} );
		} );

		return brandsByIntrinsicData;
	}


    function createSentimentCountsTimeSeriesObjects( data, startDate, endDate, period, ids, type, selectedBrandIds, selectedIntrinsicIds, brandsMap, intrinsicsMap ) {

        let sentimentTimeSeriesObjs = [];
        let brandSentimentSeries    =[];
       // let brandTopicSentiment = {}


        _.forEach( ids, function ( id ) { // brand or intrinsic id

            if ( !data.hasOwnProperty( id ) ) {
                return;
            }

            brandSentimentSeries = data[ id ];
            for (let topicIndex = 0; topicIndex<brandSentimentSeries.length; topicIndex++) {
                // filter out the intrinsics from the series that is not selected.
                let  foundTopic = _.find(selectedIntrinsicIds, function ( o ) {
                        return o === brandSentimentSeries[topicIndex].topicId;
                    } );
                if (!foundTopic) {
                    continue;
                }

                let brandTopicSentiment = JSON.parse(brandSentimentSeries[topicIndex].sentiment_counts);
                //console.log(JSON.stringify(brandTopicSentiment));

                let dates = Object.keys(brandTopicSentiment).sort();

                if (startDate) {
                    dates = _.filter(dates, d => d >= startDate);
                }

                if (endDate) {
                    dates = _.filter(dates, d => d <= endDate);
                }

                // filter the dates

                //let keys = dates.length ? Object.keys(brandTopicSentiment[dates[0]]) : [];
                let keys = dates.length;

                // HM why is this needed for sentiment..
                /*
                if (type === Constants.INTRINSICS_BY_PERIOD_INTRINSICS_BY_BRAND) {
                    keys = _.intersection(keys, selectedIntrinsicIds);
                } else {
                    keys = keys.map(key => Number(key));
                    keys = _.intersection(keys, selectedBrandIds);
                }
                */


                //keys = keys.sort();

                let points = [];
                let dataArray = [];

                for (let j=0; j<dates.length; j++) {
                    dataArray = [];
                    dataArray.push(new Date(dates[j]).getTime());
                    dataArray.push(brandTopicSentiment[dates[j]].positive);
                    dataArray.push(brandTopicSentiment[dates[j]].negative);
                    dataArray.push(brandTopicSentiment[dates[j]].neutral);
                    points.push(dataArray);
                }

                // use the key for intrinsics from brandSentimentSeries
                let key = brandSentimentSeries[topicIndex].topicId;
                let columns = []
                //Need to see if there is a better way to show positive..
                // we can also parse it in component but this is much easier to do this. $key has the intrinsics
                //columns.push(`${intrinsicsMap[key] + "- positive"}:${key}`);
                columns.push(`positive:${key}`);
                columns.unshift("time");
                // these need to match the items that are in points array. So 0th element is +ve, 1 is -ve and 2 is neutral
                columns.push('negative:negative');
                columns.push('neutral:neutral');


                let name = "";

                if (type === Constants.INTRINSICS_BY_PERIOD_BRANDS_BY_INTRINSIC) {
                    name = `${intrinsicsMap[id]}:${id}`;
                } else {
                    name = `${brandsMap[id]}:${id}`;
                }

                const timeSeriesObj = {
                    name: name,
                    columns: columns,
                    points: points
                };

                sentimentTimeSeriesObjs.push(timeSeriesObj);
            }
        } );

        return sentimentTimeSeriesObjs;

    }

    function createPositiveSentimentCountsTimeSeriesObjects( data, startDate, endDate, period, ids, type, selectedBrandIds, selectedIntrinsicIds, brandsMap, intrinsicsMap ) {

        let sentimentTimeSeriesObjs = [];
        let brandSentimentSeries    =[];

        _.forEach( ids, function ( id ) { // brand or intrinsic id

            if ( !data.hasOwnProperty( id ) ) {
                return;
            }

            brandSentimentSeries = data[ id ];
            for (let topicIndex = 0; topicIndex<brandSentimentSeries.length; topicIndex++) {
                // filter out the intrinsics from the series that is not selected.
                let  foundTopic = _.find(selectedIntrinsicIds, function ( o ) {
                    return o === brandSentimentSeries[topicIndex].topicId;
                } );
                if (!foundTopic) {
                    continue;
                }

                let brandTopicSentiment = JSON.parse(brandSentimentSeries[topicIndex].sentiment_counts);
                let dates = Object.keys(brandTopicSentiment).sort();

                if (startDate) {
                    dates = _.filter(dates, d => d >= startDate);
                }

                if (endDate) {
                    dates = _.filter(dates, d => d <= endDate);
                }

                let keys = dates.length;



                let points = [];
                let dataArray = [];

                for (let j=0; j<dates.length; j++) {
                    dataArray = [];
                    dataArray.push(new Date(dates[j]).getTime());
                    dataArray.push(brandTopicSentiment[dates[j]].positive);
                    points.push(dataArray);
                }

                // use the key for intrinsics from brandSentimentSeries
                let key = brandSentimentSeries[topicIndex].topicId;
                let columns = [];
               columns.push(`positive:${key}`);
                columns.unshift("time");

                let name = "";

                if (type === Constants.INTRINSICS_BY_PERIOD_BRANDS_BY_INTRINSIC) {
                    name = `${intrinsicsMap[id]}:${id}`;
                } else {
                    name = `${brandsMap[id]}:${id}`;
                }

                const timeSeriesObj = {
                    name: name,
                    columns: columns,
                    points: points
                };

                sentimentTimeSeriesObjs.push(timeSeriesObj);
            }
        } );

        return sentimentTimeSeriesObjs;

    }

    function createNegativeSentimentCountsTimeSeriesObjects( data, startDate, endDate, period, ids, type, selectedBrandIds, selectedIntrinsicIds, brandsMap, intrinsicsMap ) {

        let sentimentTimeSeriesObjs = [];
        let brandSentimentSeries    =[];


        _.forEach( ids, function ( id ) { // brand or intrinsic id

            if ( !data.hasOwnProperty( id ) ) {
                return;
            }

            brandSentimentSeries = data[ id ];
            for (let topicIndex = 0; topicIndex<brandSentimentSeries.length; topicIndex++) {
                let  foundTopic = _.find(selectedIntrinsicIds, function ( o ) {
                    return o === brandSentimentSeries[topicIndex].topicId;
                } );
                if (!foundTopic) {
                    continue;
                }

                let brandTopicSentiment = JSON.parse(brandSentimentSeries[topicIndex].sentiment_counts);
                let dates = Object.keys(brandTopicSentiment).sort();

                if (startDate) {
                    dates = _.filter(dates, d => d >= startDate);
                }

                if (endDate) {
                    dates = _.filter(dates, d => d <= endDate);
                }


                let keys = dates.length;



                let points = [];
                let dataArray = [];

                for (let j=0; j<dates.length; j++) {
                    dataArray = [];
                    dataArray.push(new Date(dates[j]).getTime());
                    dataArray.push(brandTopicSentiment[dates[j]].negative);
                    points.push(dataArray);
                }

                let key = brandSentimentSeries[topicIndex].topicId;
                let columns = [];
                columns.push(`negative:${key}`);
                columns.unshift("time");

                let name = "";

                if (type === Constants.INTRINSICS_BY_PERIOD_BRANDS_BY_INTRINSIC) {
                    name = `${intrinsicsMap[id]}:${id}`;
                } else {
                    name = `${brandsMap[id]}:${id}`;
                }

                const timeSeriesObj = {
                    name: name,
                    columns: columns,
                    points: points
                };

                sentimentTimeSeriesObjs.push(timeSeriesObj);
            }
        } );

        return sentimentTimeSeriesObjs;

    }


    function createNeutralSentimentCountsTimeSeriesObjects( data, startDate, endDate, period, ids, type, selectedBrandIds, selectedIntrinsicIds, brandsMap, intrinsicsMap ) {

        let sentimentTimeSeriesObjs = [];
        let brandSentimentSeries    =[];


        _.forEach( ids, function ( id ) { // brand or intrinsic id

            if ( !data.hasOwnProperty( id ) ) {
                return;
            }

            brandSentimentSeries = data[ id ];
            for (let topicIndex = 0; topicIndex<brandSentimentSeries.length; topicIndex++) {
                let  foundTopic = _.find(selectedIntrinsicIds, function ( o ) {
                    return o === brandSentimentSeries[topicIndex].topicId;
                } );
                if (!foundTopic) {
                    continue;
                }

                let brandTopicSentiment = JSON.parse(brandSentimentSeries[topicIndex].sentiment_counts);

                let dates = Object.keys(brandTopicSentiment).sort();

                if (startDate) {
                    dates = _.filter(dates, d => d >= startDate);
                }

                if (endDate) {
                    dates = _.filter(dates, d => d <= endDate);
                }

                let keys = dates.length;



                let points = [];
                let dataArray = [];

                for (let j=0; j<dates.length; j++) {
                    dataArray = [];
                    dataArray.push(new Date(dates[j]).getTime());
                    dataArray.push(brandTopicSentiment[dates[j]].neutral);
                    points.push(dataArray);
                }

                let key = brandSentimentSeries[topicIndex].topicId;
                let columns = [];
                columns.push(`neutral:${key}`);
                columns.unshift("time");


                let name = "";

                if (type === Constants.INTRINSICS_BY_PERIOD_BRANDS_BY_INTRINSIC) {
                    name = `${intrinsicsMap[id]}:${id}`;
                } else {
                    name = `${brandsMap[id]}:${id}`;
                }

                const timeSeriesObj = {
                    name: name,
                    columns: columns,
                    points: points
                };

                sentimentTimeSeriesObjs.push(timeSeriesObj);
            }
        } );

        return sentimentTimeSeriesObjs;

    }



	function createTimeSeriesObjects( data, startDate, endDate, period, ids, type, selectedBrandIds, selectedIntrinsicIds, brandsMap, intrinsicsMap ) {

		let timeSeriesObjs = [];

		_.forEach( ids, function ( id ) { // brand or intrinsic id

			if ( !data.hasOwnProperty( id ) ) {
				return;
			}

			let series = data[ id ][period];
			let dates        = Object.keys( series ).sort();

			if ( startDate ) {
				dates = _.filter( dates, d => d >= startDate );
			}

			if ( endDate ) {
				dates = _.filter( dates, d => d <= endDate );
			}

			// filter the dates

			let keys = dates.length ? Object.keys( series[ dates[ 0 ] ] ) : [];

			if ( type === Constants.INTRINSICS_BY_PERIOD_INTRINSICS_BY_BRAND ) {
				keys = _.intersection( keys, selectedIntrinsicIds );
			} else {
				keys = keys.map( key => Number( key ) );
				keys = _.intersection( keys, selectedBrandIds );
			}


			keys = keys.sort();

			let points    = [];
			let dataArray = [];

			_.forEach( dates, function ( date ) {

				dataArray = [];
				dataArray.push( new Date( date ).getTime() );

				_.forEach( keys, function ( key ) {
					dataArray.push( data[ id ][period][ date ][ key ] );
				} );

				points.push( dataArray );
			} );

			let columns = keys.map( key => {
				if ( type === Constants.INTRINSICS_BY_PERIOD_INTRINSICS_BY_BRAND ) {
					return `${intrinsicsMap[ key ]}:${key}`;
				} else {
					return `${brandsMap[ key ]}:${key}`;
				}
			} );

			columns.unshift( "time" );

			let name = "";

			if ( type === Constants.INTRINSICS_BY_PERIOD_BRANDS_BY_INTRINSIC ) {
				name = `${intrinsicsMap[ id ]}:${id}`;
			} else {
				name = `${brandsMap[ id ]}:${id}`;
			}

			const timeSeriesObj = {
				name   : name,
				columns: columns,
				points : points
			};

			timeSeriesObjs.push( timeSeriesObj );

		} );

		return timeSeriesObjs;
	}

	switch ( action.type ) {

		case Constants.SAGA_SET_CATEGORY.concat( Constants.FULFILLED ):
			return {
				...state,
				events: {}
			};

		case Constants.SET_SELECTED_CHART.concat( Constants.FULFILLED ):
			return {
				...state,
				selectedChart: action.response
			};
		case Constants.SET_CHART_CONFIG:
			const obj             = Object.assign( {}, state );
			obj.data.chart.config = action.payload;
			return {
				...state,
				data: obj.data
			};
		case Constants.GET_VISUALIZATION_DATA.concat( Constants.FULFILLED ):
			return {
				...state,
				data: {
					settings: action.response.data._settings,
					chart   : {
						visualizationData: action.response.data.brands
					}
				}
			};


		case Constants.EVENT_GET_INTRINSICS_BY_PERIOD.concat( Constants.FULFILLED ): {
			appState = store.getState();


			const defaultFilter                          = "{\"selectedBrandIds\":[49766,41160,41156],\"selectedIntrinsicIds\":[\"breakfast\"],\"timeSeries\":{\"period\":\"weekly\",\"start\":\"2017-01-03\",\"end\":\"2017-05-03\"}}";
			const intrinsicsByBrandData                  = Object.assign( {}, _.get( action, "response.data.brands", {} ) );
			let filter                                   = JSON.parse( _.get( action, "response.config.data", defaultFilter ) );
			let {selectedBrandIds, selectedIntrinsicIds} = filter;
			let {start, end, period}                     = filter.timeSeries;
			selectedBrandIds                             = selectedBrandIds.map( brandId => Number( brandId ) );

			const intrinsicsMap = appState.category.categoryData.intrinsics.allIntrinsicsMapInverted;
			const brandsMap     = appState.category.categoryData.brands.allBrandsMapInverted;

			// intrinsics by brand (plot intrinsics for each brand
			const intrinsicsByBrandTimeSeries = createTimeSeriesObjects( intrinsicsByBrandData, start, end, "weekly", selectedBrandIds, Constants.INTRINSICS_BY_PERIOD_INTRINSICS_BY_BRAND, selectedBrandIds, selectedIntrinsicIds, brandsMap, intrinsicsMap );

			// invert the data
			const brandsByIntrinsicData = getBrandsByIntrinsicsdata( Object.assign( {}, _.get( action, "response.data.brands", {} ) ), "weekly", selectedBrandIds, selectedIntrinsicIds );

			// brands by intrinsic (plot brands for each intrinsic)
			const brandsByIntrinsicsTimeSeries = createTimeSeriesObjects( brandsByIntrinsicData, start, end, "weekly", selectedIntrinsicIds, Constants.INTRINSICS_BY_PERIOD_BRANDS_BY_INTRINSIC, selectedBrandIds, selectedIntrinsicIds, brandsMap, intrinsicsMap );

			/// Look at one of the timeseries objects to get min/max date, min/max Val
			const domains = getDateAndValueDomains( brandsByIntrinsicsTimeSeries );

			// console.log( "EVENT_GET_INTRINSICS_BY_PERIOD", JSON.stringify( filter ), JSON.stringify( intrinsicsByBrandData ) );

			const intrinsicsByBrandTimeSeriesPctChange  = getPercentChangeTimeSeries( intrinsicsByBrandTimeSeries );
			const brandsByIntrinsicsTimeSeriesPctChange = getPercentChangeTimeSeries( brandsByIntrinsicsTimeSeries );

			return {
				...state,
				events: {
					minDate                              : domains.minDate,
					maxDate                              : domains.maxDate,
					minVal                               : domains.minVal,
					maxVal                               : domains.maxVal,
					intrinsicsByPeriod                   : intrinsicsByBrandData,
					intrinsicsByPeriodRawData            : intrinsicsByBrandData,
					intrinsicsByBrandTimeSeries          : intrinsicsByBrandTimeSeries,
					brandsByIntrinsicsTimeSeries         : brandsByIntrinsicsTimeSeries,
					intrinsicsByBrandTimeSeriesPctChange : intrinsicsByBrandTimeSeriesPctChange,
					brandsByIntrinsicsTimeSeriesPctChange: brandsByIntrinsicsTimeSeriesPctChange
				}
			};
		}


		case Constants.GET_INTRINSICS_BY_PERIOD.concat( Constants.FULFILLED ): {

			appState = store.getState();


			// Utils.debugLogger( 'appState', appState );

			const intrinsicsByPeriod = action.response.data.brands;

			const startDate          = _.get( action.response.data, "_settings.intrinsicsByPeriodDateRange.filter.start", null );

			delete intrinsicsByPeriod.filter;
			delete intrinsicsByPeriod.relic_date;
			delete intrinsicsByPeriod.period;


			let intrinsicsByBrandData        = Object.assign( {}, _.get( action, "response.data.brands", {} ) );
			let selectedIntrinsicIds         = _.get( action, "response.data._selections.selectedIntrinsicIds", [] );
			let selectedBrandIds             = Object.keys( intrinsicsByBrandData );
			let brandsByIntrinsicsTimeSeries = [];
			let intrinsicsByBrandTimeSeries  = [];

			selectedBrandIds = selectedBrandIds.map( brandId => Number( brandId ) );

			const intrinsicsMap = appState.category.categoryData.intrinsics.allIntrinsicsMapInverted;
			const brandsMap     = appState.category.categoryData.brands.allBrandsMapInverted;

			const endDate               = moment().format( "YYYY-MM-DD" );
			// intrinsics by brand (plot intrinsics for each brand
			intrinsicsByBrandTimeSeries = createTimeSeriesObjects( intrinsicsByBrandData, startDate, endDate, "weekly", selectedBrandIds, Constants.INTRINSICS_BY_PERIOD_INTRINSICS_BY_BRAND, selectedBrandIds, selectedIntrinsicIds, brandsMap, intrinsicsMap );

			// invert the data
			const brandsByIntrinsicData = getBrandsByIntrinsicsdata( Object.assign( {}, _.get( action, "response.data.brands", {} ) ), "weekly", selectedBrandIds, selectedIntrinsicIds );

			// brands by intrinsic (plot brands for each intrinsic)
			brandsByIntrinsicsTimeSeries = createTimeSeriesObjects( brandsByIntrinsicData, startDate, endDate, "weekly", selectedIntrinsicIds, Constants.INTRINSICS_BY_PERIOD_BRANDS_BY_INTRINSIC, selectedBrandIds, selectedIntrinsicIds, brandsMap, intrinsicsMap );


			/// Look at one of the timeseries objects to get min/max date, min/max Val
			const domains = getDateAndValueDomains( brandsByIntrinsicsTimeSeries );

			///////

			return {
				...state,
				data: {
					settings: action.response.data._settings,
					chart   : {
						minDate                     : domains.minDate,
						maxDate                     : domains.maxDate,
						minVal                      : domains.minVal,
						maxVal                      : domains.maxVal,
						intrinsicsByPeriod          : [],
						intrinsicsByPeriodRawData   : action.response.data,
						intrinsicsByBrandTimeSeries : intrinsicsByBrandTimeSeries,
						brandsByIntrinsicsTimeSeries: brandsByIntrinsicsTimeSeries
					}
				}
			};
		}

		case Constants.GET_INTRINSICS_BY_PERIOD_FOR_RADAR.concat( Constants.FULFILLED ): // weekly, monthly, ...

			appState = store.getState();

			const defaultFilter                          = "{\"selectedBrandIds\":[49766,41160,41156],\"selectedIntrinsicIds\":[\"breakfast\"],\"timeSeries\":{\"period\":\"weekly\",\"start\":\"2017-01-03\",\"end\":\"2017-05-03\"}}";
			const intrinsicsByBrandData                  = Object.assign( {}, _.get( action, "response.data.brands", {} ) );
			let filter                                   = JSON.parse( _.get( action, "response.config.data", defaultFilter ) );
			let {selectedBrandIds, selectedIntrinsicIds} = filter;
			let {start, end, period}                     = filter.timeSeries;
			selectedBrandIds                             = selectedBrandIds.map( brandId => Number( brandId ) );

			const intrinsicsMap = appState.category.categoryData.intrinsics.allIntrinsicsMapInverted;
			const brandsMap     = appState.category.categoryData.brands.allBrandsMapInverted;

			// intrinsics by brand (plot intrinsics for each brand
			const intrinsicsByBrandTimeSeries = createTimeSeriesObjects( intrinsicsByBrandData, start, end, period, selectedBrandIds, Constants.INTRINSICS_BY_PERIOD_INTRINSICS_BY_BRAND, selectedBrandIds, selectedIntrinsicIds, brandsMap, intrinsicsMap );

			// invert the data
			const brandsByIntrinsicData = getBrandsByIntrinsicsdata( Object.assign( {}, _.get( action, "response.data.brands", {} ) ), period, selectedBrandIds, selectedIntrinsicIds );

			// brands by intrinsic (plot brands for each intrinsic)
			const brandsByIntrinsicsTimeSeries = createTimeSeriesObjects( brandsByIntrinsicData, start, end, period, selectedIntrinsicIds, Constants.INTRINSICS_BY_PERIOD_BRANDS_BY_INTRINSIC, selectedBrandIds, selectedIntrinsicIds, brandsMap, intrinsicsMap );

			/// Look at one of the timeseries objects to get min/max date, min/max Val
			const domains = getDateAndValueDomains( brandsByIntrinsicsTimeSeries );

			// console.log( "EVENT_GET_INTRINSICS_BY_PERIOD", JSON.stringify( filter ), JSON.stringify( intrinsicsByBrandData ) );

			const intrinsicsByBrandTimeSeriesPctChange  = getPercentChangeTimeSeries( intrinsicsByBrandTimeSeries );
			const brandsByIntrinsicsTimeSeriesPctChange = getPercentChangeTimeSeries( brandsByIntrinsicsTimeSeries );

			return {
				...state,
				data: {
					settings: action.response.data._settings,
					chart   : {
						intrinsicsByPeriodForRadar: {
							minDate                              : domains.minDate,
							maxDate                              : domains.maxDate,
							minVal                               : domains.minVal,
							maxVal                               : domains.maxVal,
							intrinsicsByPeriod                   : intrinsicsByBrandData,
							intrinsicsByPeriodRawData            : intrinsicsByBrandData,
							intrinsicsByBrandTimeSeries          : intrinsicsByBrandTimeSeries,
							brandsByIntrinsicsTimeSeries         : brandsByIntrinsicsTimeSeries,
							intrinsicsByBrandTimeSeriesPctChange : intrinsicsByBrandTimeSeriesPctChange,
							brandsByIntrinsicsTimeSeriesPctChange: brandsByIntrinsicsTimeSeriesPctChange
						}
					}
				}
			};


		case Constants.GET_INTRINSICS_BY_PERIOD_FOR_TRENDS.concat( Constants.FULFILLED ): // weekly, monthly, ...

			const FIXED_PRECISON = 7;

			filter   = action.response.data.brands.filter;
			let data = action.response.data;
			period   = filter.period;

			const brands = data.brands;

			//
			delete brands.filter;
			delete brands.relic_date;
			delete brands.period;
			//

			const brandKeys  = Object.keys( brands );
			let output       = [];
			let dates        = [];
			const intrinsics = data._settings.selectedIntrinsicIds;

			if ( data._settings.selectedBrandIds.length ) {
				output = brandKeys.map( ( brand, idx ) => {

					dates = Object.keys( brands[ brand ][ period ] ).sort(); // get the dates and sort

					dates = _.filter(dates, d => d >= filter.start); // filter dates from start

					return intrinsics.map( ( intrinsic, idx ) => {
						let y = dates.map( d => {
							if ( brands[ brand ][ period ].hasOwnProperty( d ) ) {
								return brands[ brand ][ period ][ d ][ intrinsic ];
							} else {
								return null;
							}
						} );

						y = _.filter( y, it => it !== null && it !== undefined );

						const obj = {
							name         : data._settings.selectedBrandIds.length === 1 ? intrinsic : brand,
							values       : _.filter( y, it => it !== null && it !== undefined ), // leave out nulls
							percentChange: y.length > 1 ? Number( ( ( y[ y.length - 1 ] - y[ y.length - 2 ] ) * 100.0 ).toFixed( FIXED_PRECISON ) ) : 0
						};
						return obj;
					} );
				} );
			}

			output = _.flatten( output );

			return {
				...state,
				data: {
					settings: action.response.data._settings,
					chart   : {
						intrinsicsByPeriodForTrends: output
					}
				}
			};

		case Constants.GET_CHART_BRAND_COMPARISONS_DATA.concat( Constants.FULFILLED ): {
			const obj            = action.response.data.intrinsics;
			const brandNames     = _.keys( obj.brands ).sort();
			const intrinsicNames = obj.intrinsicNames;

			const dataSets = intrinsicNames.map( ( intrinsic, idx ) => {
				const y = brandNames.map( ( brand ) => {
					return obj.brands[ brand ][ idx ].toFixed( 2 );
				} );
				return {
					data           : y,
					label          : intrinsic,
					backgroundColor: Constants.markerColors5[ idx % Constants.markerColors5.length ]
				};
			} );

			const data = {
				labels  : brandNames,
				datasets: dataSets
			};

			return {
				...state,
				data: {
					settings: action.response.data._settings,
					chart   : {
						brandComparisons: data
					}
				}
			};
		}
		case Constants.CHART_UPDATE_SETTINGS.concat( Constants.FULFILLED ): {
			const obj         = Object.assign( {}, state );
			obj.data.settings = action.response;

			return {
				...state,
				data: obj.data
			};
		}
		case Constants.GET_CHART_WHITESPACE_ANALYSIS_DATA.concat( Constants.FULFILLED ): {
			const obj            = action.response.data.intrinsics;
			const brandNames     = _.keys( obj.brands ).sort();
			const intrinsicNames = obj.intrinsicNames;

			const dataSets = intrinsicNames.map( ( intrinsic, idx ) => {
				const y = brandNames.map( ( brand ) => {
					return obj.brands[ brand ][ idx ].toFixed( 2 );
				} );
				return {
					data           : y,
					label          : intrinsic,
					backgroundColor: Constants.markerColors5[ idx % Constants.markerColors5.length ]
				};
			} );

			const data = {
				labels  : brandNames,
				datasets: dataSets
			};

			return {
				...state,
				// whiteSpace : data
				data: {
					settings: action.response.data._settings,
					chart   : {
						whiteSpace: data
					}
				}
			};
		}
		case Constants.GET_CHART_INTRINSIC_COMPARISONS_DATA.concat( Constants.FULFILLED ): {
			const obj = action.response.data.brands;

			const intrinsicNames = _.keys( obj.intrinsics ).sort();
			const brandNames     = obj.brandNames;

			const dataSets = brandNames.map( ( brand, idx ) => {
				const y = intrinsicNames.map( ( intrinsic ) => {
					return obj.intrinsics[ intrinsic ][ idx ].toFixed( 2 );
				} );
				return {
					data           : y,
					label          : brand,
					backgroundColor: Constants.markerColors5[ idx % Constants.markerColors5.length ]
				};
			} );

			const data = {
				labels  : intrinsicNames,
				datasets: dataSets
			};

			return {
				...state,
				data: {
					settings: action.response.data._settings,
					chart   : {
						intrinsicComparisons: data
					}
				}
			};
		}
		case Constants.GET_CHART_INTRINSIC_WHITESPACE_ANALYSIS_DATA.concat( Constants.FULFILLED ): {
			// const obj = action.payload.data.brands;
			const obj            = action.response.data.brands;
			const intrinsicNames = _.keys( obj.intrinsics ).sort();
			const brandNames     = obj.brandNames;

			const dataSets = brandNames.map( ( brand, idx ) => {
				const y = intrinsicNames.map( ( intrinsic ) => {
					return obj.intrinsics[ intrinsic ][ idx ].toFixed( 2 );
				} );
				return {
					data           : y,
					label          : brand,
					backgroundColor: Constants.markerColors5[ idx % Constants.markerColors5.length ]
				};
			} );

			const data = {
				labels  : intrinsicNames,
				datasets: dataSets
			};

			return {
				...state,
				data: {
					settings: action.response.data._settings,
					chart   : {
						intrinsicWhiteSpace: data
					}
				}
			};
		}
		case Constants.GET_CHART_SCATTER_PLOT.concat( Constants.FULFILLED ): {
			const rawData        = action.response.data;
			const brands         = _.keys( rawData.brands ).sort(); // ['BMW']
			const brand          = brands[ 0 ]; // 'BMW'
			const product        = rawData.brands[ brand ]; // {}
			const intrinsicsData = product.intrinsics;
			const intrinsics     = _.keys( intrinsicsData );
			const products       = product.products;
			const numIntrinsics  = intrinsics.length;

			let x      = [];
			let y      = [];
			let trace  = {};
			let charts = [];
			let name   = "";

			for ( let i = 0; i < numIntrinsics; i++ ) {
				for ( let j = 0; j < numIntrinsics; j++ ) {
					// row.push(`[${intrinsics[i]} : ${intrinsics[j]}]`);
					x     = intrinsicsData[ intrinsics[ i ] ];
					y     = intrinsicsData[ intrinsics[ j ] ];
					//name = `${brand} : ${intrinsics[i]} vs. ${intrinsics[j]}`;
					name  = `${intrinsics[ i ]} vs. ${intrinsics[ j ]}`;
					trace = {
						x           : x,
						y           : y,
						mode        : "markers",
						type        : "scatter",
						name        : name,
						text        : products.map( product => {
							return product.name;
						} ),
						hoverinfo   : "all",
						textposition: "bottom center",
						marker      : {
							// symbol: 'cross-open-dot',
							size : 6,
							color: Constants.markerColors
						},
						textfont    : {
							size : 9,
							color: "rgb(255, 0, 0)"
						}
					};
					charts.push( <ScatterPlotChart
						className="intrinsics-plotly"
						data={ [ trace ] }
						title={ name }
						xaxis={ intrinsics[ i ] }
						yaxis={ intrinsics[ j ] }/> );
				}
			}

			return {
				...state,
				data: {
					settings: action.response.data._settings,
					chart   : {
						scatterPlot: charts
					}
				}
			};
		}
		case Constants.GET_CHART_TOPICS.concat( Constants.FULFILLED ):
			return {
				...state,
				topicsData: action.response.data.topics
			};

		case Constants.UPDATE_TOPICS.concat( Constants.FULFILLED ):
			return {
				...state,
				topicsData: action.payload.data.topics
			};
		case Constants.CREATE_TOPIC.concat( Constants.FULFILLED ):
			return {
				...state,
				topicsData: action.payload.data.topics
			};

		case Constants.DELETE_TOPIC.concat( Constants.FULFILLED ):
			// Utils.debugLogger( "delete topic", action.response );
			// const url  = action.response.config.url;
			// const id   = url.slice( url.lastIndexOf( "/" ) + 1 );
			// let topics = state.topicsData.concat();
			// topics     = _.filter( topics, ( o ) => o.id !== id );
			return {
				...state,
				topicsData: action.payload.data.topics
			};

		case Constants.GET_TOPICS_SENTIMENT_COUNTS.concat( Constants.FULFILLED ):{

           appState = store.getState();


            // Utils.debugLogger( 'appState', appState );

            let sentimentCountsByPeriod = action.response.data.topics;

            const startDate          = _.get( action.response.data, "_settings.intrinsicsByPeriodDateRange.filter.start", null );

            let sentimentCountsByBrandData        = Object.assign( {}, _.get( action, "response.data.topics", {} ) );
            let selectedSentimentIntrinsicIds         = _.get( action, "response.data._selections.selectedIntrinsicIds", [] );
            let selectedSentimentBrandIds             = Object.keys( sentimentCountsByBrandData );
            selectedBrandIds             = Object.keys( sentimentCountsByBrandData );
            //let brandsByIntrinsicsTimeSeries = [];
            let sentimentCountsByBrandTimeSeries  = [];

            selectedBrandIds = selectedBrandIds.map( brandId => Number( brandId ) );

            // HM these two probably not needed
            const SentimentintrinsicsMap = appState.category.categoryData.intrinsics.allIntrinsicsMapInverted;
            const SentimentbrandsMap     = appState.category.categoryData.brands.allBrandsMapInverted;

            const endDate               = moment().format( "YYYY-MM-DD" );

            // HM may need to change the type that is being sent here..
            sentimentCountsByBrandTimeSeries = createSentimentCountsTimeSeriesObjects( sentimentCountsByPeriod, startDate, endDate, "weekly", selectedBrandIds, Constants.SENTIMENTCOUNTS_BY_PERIOD_BRANDS_BY_INTRINSIC, selectedSentimentBrandIds, selectedSentimentIntrinsicIds, SentimentbrandsMap, SentimentintrinsicsMap );

            const sentimentsDomains = getSentimentDateAndValueDomains( sentimentCountsByBrandTimeSeries );


            return {

                ...state,
                data: {
                    settings: action.response.data._settings,
                    chart   : {
                        minDate	: 	sentimentsDomains.minDate,
                        maxDate	: 	sentimentsDomains.maxDate,
                        minVal              :   sentimentsDomains.minVal,
                        maxVal              :   sentimentsDomains.maxVal,
                        sentimentCountsByBrandTimeSeries: sentimentCountsByBrandTimeSeries
                    }
                }
            };
        }


        case Constants.GET_POSITIVE_TOPICS_SENTIMENT_COUNTS.concat(Constants.FULFILLED):

            appState = store.getState();


            let sentimentCountsByPeriod = action.response.data.topics;

            let startDate = _.get(action.response.data, "_settings.intrinsicsByPeriodDateRange.filter.start", null);


            let sentimentCountsByBrandData = Object.assign({}, _.get(action, "response.data.topics", {}));
            let selectedSentimentIntrinsicIds = _.get(action, "response.data._selections.selectedIntrinsicIds", []);
            let selectedSentimentBrandIds = Object.keys(sentimentCountsByBrandData);
            selectedBrandIds = Object.keys(sentimentCountsByBrandData);
            let sentimentCountsByBrandTimeSeries = [];

            selectedBrandIds = selectedBrandIds.map(brandId => Number(brandId));

            // HM these two probably not needed
            let SentimentintrinsicsMap = appState.category.categoryData.intrinsics.allIntrinsicsMapInverted;
            let SentimentbrandsMap = appState.category.categoryData.brands.allBrandsMapInverted;

            let endDate = moment().format("YYYY-MM-DD");

            sentimentCountsByBrandTimeSeries = createPositiveSentimentCountsTimeSeriesObjects(sentimentCountsByPeriod, startDate, endDate, "weekly", selectedBrandIds, Constants.SENTIMENTCOUNTS_BY_PERIOD_BRANDS_BY_INTRINSIC, selectedSentimentBrandIds, selectedSentimentIntrinsicIds, SentimentbrandsMap, SentimentintrinsicsMap);

            let sentimentsDomains = getSentimentDateAndValueDomains(sentimentCountsByBrandTimeSeries);


            return {

                ...state,
                data: {
                    settings: action.response.data._settings,
                    chart: {
                        minDate	          : 	sentimentsDomains.minDate,
                        maxDate	          : 	sentimentsDomains.maxDate,
                        minVal            :   sentimentsDomains.minVal,
                        maxVal            :   sentimentsDomains.maxVal,
                        sentimentCountsByBrandTimeSeries: sentimentCountsByBrandTimeSeries
                    }
                }
            };


        case Constants.GET_NEGATIVE_TOPICS_SENTIMENT_COUNTS.concat(Constants.FULFILLED):

            appState = store.getState();


             sentimentCountsByPeriod = action.response.data.topics;

             startDate = _.get(action.response.data, "_settings.intrinsicsByPeriodDateRange.filter.start", null);


             sentimentCountsByBrandData = Object.assign({}, _.get(action, "response.data.topics", {}));
             selectedSentimentIntrinsicIds = _.get(action, "response.data._selections.selectedIntrinsicIds", []);
             selectedSentimentBrandIds = Object.keys(sentimentCountsByBrandData);
             selectedBrandIds = Object.keys(sentimentCountsByBrandData);
             sentimentCountsByBrandTimeSeries = [];

             selectedBrandIds = selectedBrandIds.map(brandId => Number(brandId));

             SentimentintrinsicsMap = appState.category.categoryData.intrinsics.allIntrinsicsMapInverted;
             SentimentbrandsMap = appState.category.categoryData.brands.allBrandsMapInverted;

             endDate = moment().format("YYYY-MM-DD");

             sentimentCountsByBrandTimeSeries = createNegativeSentimentCountsTimeSeriesObjects(sentimentCountsByPeriod, startDate, endDate, "weekly", selectedBrandIds, Constants.SENTIMENTCOUNTS_BY_PERIOD_BRANDS_BY_INTRINSIC, selectedSentimentBrandIds, selectedSentimentIntrinsicIds, SentimentbrandsMap, SentimentintrinsicsMap);

             sentimentsDomains = getSentimentDateAndValueDomains(sentimentCountsByBrandTimeSeries);


            return {

                ...state,
                data: {
                    settings: action.response.data._settings,
                    chart: {
                        minDate	: 	sentimentsDomains.minDate,
                        maxDate	: 	sentimentsDomains.maxDate,
                        minVal              :   sentimentsDomains.minVal,
                        maxVal              :   sentimentsDomains.maxVal,
                        sentimentCountsByBrandTimeSeries: sentimentCountsByBrandTimeSeries
                    }
                }
            };


        case Constants.GET_NEUTRAL_TOPICS_SENTIMENT_COUNTS.concat(Constants.FULFILLED):

            appState = store.getState();

            sentimentCountsByPeriod = action.response.data.topics;
            startDate = _.get(action.response.data, "_settings.intrinsicsByPeriodDateRange.filter.start", null);
            sentimentCountsByBrandData = Object.assign({}, _.get(action, "response.data.topics", {}));
            selectedSentimentIntrinsicIds = _.get(action, "response.data._selections.selectedIntrinsicIds", []);
            selectedSentimentBrandIds = Object.keys(sentimentCountsByBrandData);
            selectedBrandIds = Object.keys(sentimentCountsByBrandData);
            sentimentCountsByBrandTimeSeries = [];

            selectedBrandIds = selectedBrandIds.map(brandId => Number(brandId));

            SentimentintrinsicsMap = appState.category.categoryData.intrinsics.allIntrinsicsMapInverted;
            SentimentbrandsMap = appState.category.categoryData.brands.allBrandsMapInverted;

            endDate = moment().format("YYYY-MM-DD");

            sentimentCountsByBrandTimeSeries = createNeutralSentimentCountsTimeSeriesObjects(sentimentCountsByPeriod, startDate, endDate, "weekly", selectedBrandIds, Constants.SENTIMENTCOUNTS_BY_PERIOD_BRANDS_BY_INTRINSIC, selectedSentimentBrandIds, selectedSentimentIntrinsicIds, SentimentbrandsMap, SentimentintrinsicsMap);

            sentimentsDomains = getSentimentDateAndValueDomains(sentimentCountsByBrandTimeSeries);


            return {

                ...state,
                data: {
                    settings: action.response.data._settings,
                    chart: {
                        minDate	           : 	sentimentsDomains.minDate,
                        maxDate	           : 	sentimentsDomains.maxDate,
                        minVal              :   sentimentsDomains.minVal,
                        maxVal              :   sentimentsDomains.maxVal,
                        sentimentCountsByBrandTimeSeries: sentimentCountsByBrandTimeSeries
                    }
                }
            };



        case Constants.GET_PRODUCT_SENTIMENT_PRODUCT_BY_WEEK.concat( Constants.FULFILLED ):
			return {
				...state,
				productSentimentByWeek: action.payload.data
			};
		default:
			return state;
	}
}