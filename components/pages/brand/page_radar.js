import _ from "lodash";

import moment               from "moment";
import React, { Component } from "react";

import { Button, Checkbox, ControlLabel, Form, FormGroup, Glyphicon, Radio } from "react-bootstrap";
import DateRangePicker                                                       from "react-bootstrap-daterangepicker";
import { connect }                                                           from "react-redux";
import uuidV4                                                                from "uuid/v4";
import {
	getChartBrandComparisonData, getChartChartScatterPlotData, getChartIntrinsicComparisonData,
	getChartIntrinsicWhitespaceAnalysisData, getChartWhitespaceAnalysisData, getEvents, getIntrinsicsByPeriod,
	getIntrinsicsByPeriodForRadarChart, getTopics, setCategory, setChartConfig, setChartScale, setChartSort,
	setComparisonChartType, setIntrinsicsByPeriodChartInterpolationType, setIntrinsicsByPeriodChartType,
	setIntrinsicsByPeriodDateRange, setIntrinsicsByPeriodStacked, setIntrinsicsChartType, setLandscapeChartType,
	setLandscapeChartView, setNavigationType, setRadarChartDates, setRadarChartPeriod, setRadarChartScaled,
	setRadarChartStacked, setRadarChartType, setRadarComparisonType, setSelectedChart, setSelectionType
}                                                                            from "../../../actions/actions";
import * as Constants                                                        from "../../../constants";
import * as Utils                                                            from "../../../utils";
import RadarChart                                                            from "../../charts/radar";
import PageHeading                                                           from "../../shared/page_heading";

//import {Responsive, WidthProvider} from 'react-grid-layout';
//const ResponsiveReactGridLayout = WidthProvider(Responsive);

class PageRadar extends Component {
	// get access to router from parent component
	// static contextTypes = {
	// 	router: PropTypes.object
	// };

	constructor( ...args ) {
		super( ...args );
		this.state = {};
	}

	componentWillMount() {
		Utils.debugLogger( "componentWillMount" );
		// if ( this.props.navigationType !== "radar" ) {
		// 	this.props.setNavigationType( "radar" );
		// 	this.props.setSelectedChart( Constants.CHART_RADAR );
		// }

		// if ( _.get( this.props, "companyName" ) && _.get( this.props, "selectedCategory.id" ) ) {
		// 	this.props.getEvents( this.props.companyName, this.props.selectedCategory.id );
		// }
	}

	onRadarChartPeriodChanged( event ) {
		const chartType = event.target.value;
		this.props.setRadarChartPeriod( chartType );
	}

	onRadarChartComparisonTypeChanged( event ) {
		const type = event.target.value;
		this.props.setRadarComparisonType( type );
	}

	onLandscapeChartTypeSelected( event ) {
		const type = event.target.value;
		// Utils.debugLogger(event, normalize);
		this.props.setLandscapeChartType( type );
	}

	dateRangeChanged( event, picker ) {
		Utils.debugLogger( "start", picker.startDate, "end", picker.endDate, event );
		if ( event.type === "apply" ) {
			this.props.setRadarChartDates( picker.startDate.format( "YYYY-MM-DD" ), picker.endDate.format( "YYYY-MM-DD" ) );
		}
	}

	setIntrinsicsByPeriodDateRange( range ) {

		let start  = null;
		let end    = moment().format( "YYYY-MM-DD" );
		let filter = {period: "weekly", end: end};

		switch ( range ) {
			case Constants.DATE_RANGE_YTD:
				start        = moment().startOf( "year" ).format( "YYYY-MM-DD" );
				filter.start = start;
				break;
			case Constants.DATE_RANGE_ALL:
				delete filter.end;
				break;
			case Constants.DATE_RANGE_1_YEAR:
				start        = moment().subtract( "years", 1 ).format( "YYYY-MM-DD" );
				filter.start = start;
				break;
			case Constants.DATE_RANGE_6_MONTHS:
				start        = moment().subtract( "months", 6 ).format( "YYYY-MM-DD" );
				filter.start = start;
				break;
			case Constants.DATE_RANGE_3_MONTHS:
				start        = moment().subtract( "months", 3 ).format( "YYYY-MM-DD" );
				filter.start = start;
				break;
			case Constants.DATE_RANGE_1_MONTH:
				start        = moment().subtract( "months", 1 ).format( "YYYY-MM-DD" );
				filter.start = start;
				break;
			default:
				break;
		}

		// console.log( "setDateRange", range, filter, this.props.selectedCategory.id );

		this.props.setIntrinsicsByPeriodDateRange( this.props.selectedCategory.id, filter, range );
	}


	getComparisonData() {
		let chartData = null;
		switch ( this.props.comparisonChart.type ) {
			case "brands":
				chartData = ( this.props.comparisonChart.normalize && this.props.selectedIntrinsicIds.length > 1 ? this.props.chartData_brandsComparison : this.props.chartData_brandsWhiteSpace );
				break;
			case "intrinsics":
				chartData = ( this.props.comparisonChart.normalize && this.props.selectedBrandIds.length > 1 ? this.props.chartData_intrinsicsComparisons : this.props.chartData_intrinsicsWhiteSpace );
				break;
			default:
		}
		return chartData;
	}

	getSelectedIntrinsicValues( selectedIntrinsics, allIntrinsics ) {

		let obj = {};
		_.forEach( selectedIntrinsics, function ( intrinsic ) {
			obj[ intrinsic ] = allIntrinsics[ intrinsic ];
		} );

		return obj;
	}

	handleInterpolationType( eventKey ) {
		console.log( eventKey );
		this.setState( {interpolationType: eventKey} );
		this.props.setIntrinsicsByPeriodChartInterpolationType( eventKey );
	}

	render() {

		if ( this.props.loading ) {

			document.body.style.cursor = "wait";

			return (
				<div
					className={ "centered" }
					style={ {cursor: "wait"} }>
					{ /*<Loader indeterminate*/ }
					{ /*active>loading...</Loader>*/ }
				</div>
			);
		}

		document.body.style.cursor = "default";

		//console.log('not showing bar');

		const selectedBrands     = this.props.selectedBrandIds || [];
		const selectedIntrinsics = this.props.selectedIntrinsicIds || [];

		//this.getSelectedIntrinsicValues(selectedIntrinsics, this.props.chartData_landscape);

		let chartConfig = null;

		const pageHeading = (
			<div>
				<PageHeading title={ `Radar: ${this.props.selectedCategory.title}` }/>
			</div>
		);

		try {
			chartConfig = this.props.chartConfig;
		} catch ( e ) {
			Utils.debugLogger( "chart configuration error:", e.message );
		} finally {

			if ( !chartConfig ) {
				return (
					<div>{ "" }</div> // loading
				);
			}

			const msg = [];

			if ( selectedBrands.length < chartConfig.minBrands ) {
				if ( ( chartConfig.minBrands === 1 ) && ( chartConfig.maxBrands === 1 ) ) {
					msg.push(
						<div key={ uuidV4() }>{ `Please select a brand. (${selectedBrands.length} selected)` }</div> );
				} else {
					msg.push(
						<div
							key={ uuidV4() }>{ `Select at least ${chartConfig.minBrands} brand${chartConfig.minBrands > 1 ? "s" : ""}. (${selectedBrands.length} selected)` }
						</div> );
				}
			}

			if ( chartConfig.hasOwnProperty( "maxBrands" ) ) {
				if ( selectedBrands.length > chartConfig.maxBrands ) {
					msg.push(
						<div
							key={ uuidV4() }>{ `Select a maximum of ${chartConfig.maxBrands} brand${chartConfig.maxBrands > 1 ? "s" : ""}. (${selectedBrands.length} selected)` }
						</div> );
				}
			}

			if ( selectedIntrinsics.length < chartConfig.minIntrinsics ) {
				msg.push(
					<div
						key={ uuidV4() }>{ `Select at least ${chartConfig.minIntrinsics} intrinsic${chartConfig.minIntrinsics > 1 ? "s" : ""}. (${selectedIntrinsics.length} selected)` }
					</div> );
			}

			if ( chartConfig.hasOwnProperty( "maxIntrinsics" ) ) {
				if ( selectedIntrinsics.length > chartConfig.maxIntrinsics ) {
					msg.push(
						<div
							key={ uuidV4() }>{ `Select a maximum of ${chartConfig.maxIntrinsics} intrinsic${chartConfig.maxIntrinsics > 1 ? "s" : ""}. (${selectedIntrinsics.length} selected)` }
						</div> );
				}
			}

			if ( msg.length ) {
				// store.dispatch(hideLoading());

				return (
					<div key={ uuidV4() }>
						<div
							style={ {marginBottom: 20} }
							key={ uuidV4() }>
							{ pageHeading }
						</div>
						<div
							style={ {padding: 15} }
							key={ uuidV4() }>
							<h4 key={ uuidV4() }>{ "Please modify your selection:" }</h4>
							<div
								id="warning-text"
								key={ uuidV4() }>{ msg }
							</div>
						</div>
					</div>
				);
			}
		}

		let chart = <div id="warning-text"/>;

		let panelStyle = {
			// position: 'relative',
			marginTop: 30,
			maxWidth : 800 // control width here, control height in the chart component (for chart.js)
		};
		let controls   = null;

		switch ( this.props.selectedChart ) {


			case Constants.CHART_RADAR: // radar
				{
					const obj = this.props.chartData_intrinsicsByPeriodForRadar;

					if ( typeof obj === "undefined" ) {
						break;
					}
					const result = selectedBrands.map( brand => {
						return _.mapKeys( obj[ brand ], function ( value, key ) {
							return `${brand}-${key}`;
						} );
					} );

					const intrinsicsByBrandByPeriod = _.merge( ...result );

					panelStyle   = {
						...panelStyle
					};
					// panelStyle = {...panelStyle};
					const ranges = {
						"Today"       : [
							moment(), moment()
						],
						"Yesterday"   : [
							moment().subtract( 1, "days" ),
							moment().subtract( 1, "days" )
						],
						"Last 7 Days" : [
							moment().subtract( 6, "days" ),
							moment()
						],
						"Last 30 Days": [
							moment().subtract( 29, "days" ),
							moment()
						],
						"This Month"  : [
							moment().startOf( "month" ), moment().endOf( "month" )
						],
						"Last Month"  : [
							moment().subtract( 1, "month" ).startOf( "month" ),
							moment().subtract( 1, "month" ).endOf( "month" )
						]
					};

					const endDateStr   = this.props.radarChartDates.end;
					const startDateStr = this.props.radarChartDates.start;

					const endDate   = moment( new Date( endDateStr ) );
					const startDate = moment( new Date( startDateStr ) );

					const cumulativeChecked = {
						checked: this.props.radarChartType === "cumulative"
					};
					const periodicChecked   = {
						checked: this.props.radarChartType === "periodic"
					};

					const weeklyChecked = {
						checked: this.props.radarChartPeriod === "weekly"
					};

					const monthlyChecked = {
						checked: this.props.radarChartPeriod === "monthly"
					};

					const quarterlyChecked = {
						checked: this.props.radarChartPeriod === "quarterly"
					};

					const yearlyChecked = {
						checked: this.props.radarChartPeriod === "yearly"
					};

					const comparisonTypeBrandsChecked = {
						checked: this.props.radarComparisonType === "brands"
					};

					const comparisonTypeIntrinsicsChecked = {
						checked: this.props.radarComparisonType === "intrinsics"
					};

					// const title = cumulativeChecked.checked
					// 	? `Cumulative ${Utils.capitalize( this.props.radarComparisonType )}`
					// 	: `${Utils.capitalize( this.props.radarComparisonType )} by Period`;
					//
					const title = `${Utils.capitalize( this.props.radarComparisonType )}`;

					const data  = cumulativeChecked.checked
						? this.props.chartData_intrinsicsByPeriodForRadar
						: intrinsicsByBrandByPeriod;

					//const brands = cumulativeChecked.checked
					//    // ? this.props.visBrands
					//    ? selectedBrands
					//    : Object.keys(data).sort();

					let label = `Date range: [${startDateStr}] - [${endDateStr}]`;
					if ( startDateStr === endDateStr ) {
						label = startDateStr;
					}

					const dateRangePicker = cumulativeChecked.checked
						? null
						: (
							<DateRangePicker
								endDate={ endDate }
								onEvent={ this.dateRangeChanged.bind( this ) }
								ranges={ ranges }
								startDate={ startDate }
								style={ {width: 310, marginBottom: 20, marginTop: 15} }>
								<Button
									className="selected-date-range-btn"
									style={ {
										width: "100%"
									} }>
									<div className="pull-left"><Glyphicon glyph="calendar"/></div>
									<div className="pull-right">
										<span style={ {
											marginRight: 10
										} }>{ label }
										</span><span className="caret"/>
									</div>
								</Button>
							</DateRangePicker> );

					const periodSelection = (
						<FormGroup controlId="periodSelection"> <ControlLabel>{ "period:" }</ControlLabel>
							<Radio
								inline
								value="weekly" { ...weeklyChecked }
								onChange={ this.onRadarChartPeriodChanged.bind( this ) }>{ "weekly" }
							</Radio>
							<Radio
								inline
								value="monthly" { ...monthlyChecked }
								onChange={ this.onRadarChartPeriodChanged.bind( this ) }>{ "monthly" }
							</Radio>
							<Radio
								inline
								value="quarterly" { ...quarterlyChecked }
								onChange={ this.onRadarChartPeriodChanged.bind( this ) }>{ "quarterly" }
							</Radio>
							<Radio
								inline
								value="yearly" { ...yearlyChecked }
								onChange={ this.onRadarChartPeriodChanged.bind( this ) }>{ "yearly" }
							</Radio>
						</FormGroup>
					);

					let radarChart = _.isEqual( data, {} )
						? ( <div
							id="warning-text">{ "No data returned for specified period. Please specify a different period." }
						</div> )
						: this.props.radarChartStacked ?
							/** stacked **/
							<div style={ {marginLeft: 0} }>
								<RadarChart
									data={ data }
									view={ this.props.radarComparisonType }
									height={ 800 }
									redraw
									title={ title }
									selectedIntrinsicIds={selectedIntrinsics}
									selectedBrandIds={selectedBrands}
									stacked={ this.props.radarChartStacked }
									scaled={ this.props.radarChartScaled }/>
							</div> :
							/** not stacked **/
							( Object.keys( data ).map( ( item, idx ) => {
								let obj     = {};
								obj[ item ] = data[ item ];
								return (
									<div
										key={ item }
										style={ {maxHeight: 500} }>
										<RadarChart
											data={ obj }
											view={ this.props.radarComparisonType }
											redraw
											title={ item }
											selectedIntrinsicIds={selectedIntrinsics}
											selectedBrandIds={selectedBrands}
											height={ 400 }
											stacked={ this.props.radarChartStacked }
											scaled={ this.props.radarChartScaled }
											idx={ idx }/>
									</div> );
							} )
							);

					if ( !result.length ) {
						radarChart = <div id="warning-text">{ "No data returned. Please try a different period." }</div>;
					}

					chart = (
						<div>
							{ radarChart ? dateRangePicker : null }
							<Form>
								<FormGroup controlId="compare">
									<ControlLabel>{ "compare:" }</ControlLabel>
									<Radio
										inline
										key="intrinsics"
										name="radarComparisonType"
										value="intrinsics"
										{ ...comparisonTypeIntrinsicsChecked }
										onChange={ this.onRadarChartComparisonTypeChanged.bind( this ) }>{ "intrinsics" }
									</Radio>
									<Radio
										inline
										key="brands"
										name="radarComparisonType"
										value="brands"
										{ ...comparisonTypeBrandsChecked }
										onChange={ this.onRadarChartComparisonTypeChanged.bind( this ) }>{ "brands" }
									</Radio>
								</FormGroup>
							</Form>
							{ periodSelection }
							{ radarChart }
						</div>
					);
				}
				break;
			default:
				break;
		}

		const tmp =
				  ( <div>
					  {/*{ pageHeading }*/}
					  <div
						  key={ uuidV4() }
						  style={ panelStyle }>
						  { chart }
					  </div>
				  </div> );

		return tmp;
	}
}

// style={panelStyle}

function mapStateToProps( state ) {
	return {

		/** chart data **/

		chartData_brandsComparison                             : state.visualizationData.data.chart.brandComparisons,
		chartData_brandsWhiteSpace                             : state.visualizationData.data.chart.whiteSpace,
		chartData_intrinsicsWhiteSpace                         : state.visualizationData.data.chart.intrinsicWhiteSpace,
		chartData_intrinsicsComparisons                        : state.visualizationData.data.chart.intrinsicComparisons,
		chartData_intrinsicsByPeriodForRadar                   : state.visualizationData.data.chart.intrinsicsByPeriodForRadar,

		/** settings **/

		comparisonChart                                        : state.visualizationData.data.settings.comparisonChart,

		navigationType                                         : state.visualizationData.data.settings.navigationType,
		radarChartDates                                        : state.visualizationData.data.settings.radarChartDates,
		radarChartPeriod                                       : state.visualizationData.data.settings.radarChartPeriod,
		radarChartScaled                                       : state.visualizationData.data.settings.radarChartScaled,
		radarChartStacked                                      : state.visualizationData.data.settings.radarChartStacked,
		radarChartType                                         : state.visualizationData.data.settings.radarChartType,
		radarComparisonType                                    : state.visualizationData.data.settings.radarComparisonType,
		//
		selectedIntrinsicIds                                   : state.visualizationData.data.settings.selectedIntrinsicIds,
		selectedBrandIds                                       : state.visualizationData.data.settings.selectedBrandIds,
		//
		selectedChart                                          : state.visualizationData.data.settings.selectedChart,
		chartConfig                                            : state.visualizationData.data.settings.chartConfig,
		selectedCategory                                       : state.visualizationData.data.settings.selectedCategory,
	};
}

export default connect( mapStateToProps, {
	setCategory,
	getIntrinsicsByPeriod,
	setSelectedChart,
	setNavigationType,
	setIntrinsicsChartType,
	setIntrinsicsByPeriodChartType,
	setSelectionType,
	setRadarChartPeriod,
	setRadarChartType,
	setRadarChartDates,
	setIntrinsicsByPeriodDateRange,
	getIntrinsicsByPeriodForRadarChart,
	getChartBrandComparisonData,
	getChartWhitespaceAnalysisData,
	getChartIntrinsicWhitespaceAnalysisData,
	getChartIntrinsicComparisonData,
	getChartChartScatterPlotData,
	getTopics,
	getEvents,
	setComparisonChartType,
	setLandscapeChartType,
	setLandscapeChartView,
	setRadarChartStacked,
	setRadarComparisonType,
	setRadarChartScaled,
	setIntrinsicsByPeriodStacked,
	setChartConfig,
	setIntrinsicsByPeriodChartInterpolationType,
	setChartScale,
	setChartSort
} )( PageRadar );
