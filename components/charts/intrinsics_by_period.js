import _                                                from "lodash";
import moment                                           from "moment";
import { Index, TimeRange, TimeRangeEvent, TimeSeries } from "pondjs";
import React, { Component }                             from "react";
import { Media, OverlayTrigger, Popover }               from "react-bootstrap";
import { Grid }                                         from "semantic-ui-react";
import ReactImageFallback                               from "react-image-fallback";
import { connect }                                      from "react-redux";
import uuidV4                                           from "uuid/v4";
import { getEvents, setIntrinsicsByPeriodDateRange }    from "../../actions/actions";
import * as Constants                                   from "../../constants";
import {
	BarChart, Baseline, Brush, ChartContainer, ChartRow, Charts, EventChart, Legend, LineChart, Resizable, styler,
	YAxis
}                                                       from "../../lib/react-timeseries-charts";


class IntrinsicsByPeriod extends Component {

	constructor( ...args ) {
		super( ...args );

		this.state = {
			tracker     : null,
			trackerValue: "",
			timerange   : null,
			selection   : null,
			highlight   : null,
			trackerEvent: null,
			markerMode  : "flag",
			localMin    : Number.MAX_VALUE,
			localMax    : Number.MIN_VALUE
		};

		this.makeChart      = this.makeChart.bind( this );
		this.makeLegend     = this.makeLegend.bind( this );
		this.makeEventChart = this.makeEventChart.bind( this );
		// this.onSelectionChange = this.onSelectionChange.bind(this);
	}

	static getSeries( minDate, maxDate, minValue, maxValue ) {

		// console.log( "getSeries:42", moment( maxDate ).format( "YYYY-MM-DD" ) );

		let start = new Date( minDate );
		let end   = new Date( maxDate );

		const data = {
			name   : "intrinsic",
			columns: [ "time", "value" ],
			points : [ [ start, minValue ], [ end, maxValue ] ] // get first and last
		};

		return new TimeSeries( data );
	}

	componentWillMount() {
		// if only 1 intrinsic is charted, automatically select it
		const timeSeriesData = _.cloneDeep( this.props.data );
		const timeSeries     = new TimeSeries( timeSeriesData );
		if ( timeSeries.columns().length === 1 ) {
			this.setState( {selection: timeSeries.columns()[ 0 ]} );
		}
	}

	handleTimeRangeChange( timerange ) {
		this.setState( {timerange} );
	}

	makeChart( timeSeriesObj ) {

		let columns = [].concat( timeSeriesObj.columns );
		columns.shift();

		let columnsForStyles = [].concat( columns );

		columnsForStyles.unshift( "value" );

		let lineStyle = {};
		let barStyle  = {};

		const interpolation   = this.props.interpolationType;
		const brandColors     = this.props.brandColors;
		const intrinsicColors = this.props.intrinsicColors;
		const chartView       = this.props.chartView;

		_.forEach( columnsForStyles, function ( column ) {

			let id    = column.split( ":" )[ 1 ];
			let color = chartView === Constants.EVENT_CHART_VIEW_INTRINSICS_BY_BRANDS ? intrinsicColors[ id ] : brandColors[ Number( id ) ];

			lineStyle[ column ] = {
				normal     : {stroke: color, fill: "none", strokeWidth: 1.5},
				highlighted: {stroke: color, fill: "none", strokeWidth: 3.0},
				selected   : {stroke: color, fill: "none", strokeWidth: 3.0},
				muted      : {stroke: color, fill: "none", opacity: 0.4, strokeWidth: 1.5}
			};

			barStyle[ column ] = {
				normal     : {stroke: color, fill: color, strokeWidth: 1.5, opacity: 1.0},
				highlighted: {stroke: "#000", fill: color, strokeWidth: 3.0, opacity: 1.0},
				selected   : {stroke: color, fill: color, strokeWidth: 3.0},
				muted      : {stroke: color, fill: color, opacity: 0.4, strokeWidth: 1.5}
			};
		} );

		let series;

		if ( this.props.type === "line" ) {
			series = new TimeSeries( timeSeriesObj );
		} else { // bar
			timeSeriesObj.columns[ 0 ] = "index";
			timeSeriesObj.points       = timeSeriesObj.points.map( ( [ d, ...values ] ) => [ Index.getIndexString( "1d", new Date( d ) ), ...values ] );
			series                     = new TimeSeries( timeSeriesObj );
		}

		const options = {
			axis             : "axis",
			style            : this.props.type === "line" ? lineStyle : barStyle,
			columns          : columns,
			breakLine        : false,
			series           : series,
			//
			highlight        : this.state.highlight,
			onHighlightChange: highlight => this.setState( {highlight} ),
			selection        : this.state.selection,
			onSelectionChange: selection => this.setState( {selection} )
		};

		if ( this.props.type === "line" ) {
			options.interpolation = interpolation;
		} else {
			options.spacing = 1;
			options.size    = 10;
			options.offset  = -5.5;
		}

		// remove the bar option (size) so that bars are less likely to overlap when there are a lot of data points
		if ( this.props.range !== Constants.DATE_RANGE_ALL ) {
			options.size = 10;
		}


		// return (<ScatterChart  { ...options } key={ uuidV4() }/>);

		return (
			this.props.type === "line" ? <LineChart { ...options } key={ uuidV4() }/> :
				<BarChart { ...options } key={ uuidV4() }/>
			//this.props.type === 'line' ? <AreaChart {...options} /> : <BarChart {...options} />
		);
	}

	makeEventCharts() {

		// const brandEvents = _.orderBy( this.props.allEvents, "startDate" );

		const brandEvents = this.props.selectedEvent ? [ this.props.selectedEvent ] : [];

		let timeRangeEvent, _startDate, _endDate;

		function eventStyleFunc( event, state ) {

			const color = event.get( "color" ) || Constants.EVENT_DEFAULT_COLOR;

			switch ( state ) {
				case "normal":
					return {
						fill  : color,
						height: 20
					};
				case "hover":
					return {
						fill   : color,
						height : 20,
						opacity: 0.4
					};
				//case "muted":
				//    return {
				//        fill:    'gray',
				//        height:  20,
				//        opacity: 0.4
				//    };
				case "selected":
					return {
						fill  : color,
						height: 20
					};
				default:
				//pass
			}
		}

		function labelFunction( event ) {
			return event.get( "eventName" );
		}


		const eventRowOptions = {
			height: 30
		};

		const timeSeries = brandEvents.map(
			( {startDate, endDate, ...data}, idx ) => {

				_startDate = new Date( startDate );
				_endDate   = new Date( endDate );

				timeRangeEvent = new TimeRangeEvent( new TimeRange( _startDate, _endDate ), data );

				return new TimeSeries( {name: `brand event_${idx}`, events: [ timeRangeEvent ]} );
			}
		);


		let chartRows            = [];
		let options              = {};
		let chartRow             = null;
		const selectedCategoryId = this.props.selectedCategoryId;

		function onSelectionChange( e ) {
			const start = moment( e.begin() ).format( "YYYY-MM-DD" );
			const end   = moment( e.end() ).format( "YYYY-MM-DD" );
			// console.log( e.get( "eventName" ), start, end );
			this.props.setIntrinsicsByPeriodDateRange( selectedCategoryId, {
				period: "weekly",
				start : start,
				end   : end
			}, Constants.DATE_RANGE_ALL );
		}


		const onSelectionChangeCallBack = onSelectionChange.bind( this );

		_.forEach( timeSeries, function ( timeSerie ) {

			options = {
				series           : timeSerie,
				size             : 30,
				style            : eventStyleFunc,
				label            : labelFunction,
				onSelectionChange: onSelectionChangeCallBack
			};

			//
			// let fmt = "YYYY-MM-DD";
			// let beginTime = moment("2017-09-01", fmt);
			// let endTime =   moment("2017-10-01", fmt);
			// // let range = new TimeRange(beginTime, endTime);

			chartRow = (

				<ChartRow
					{ ...eventRowOptions } debug={ false }
					key={ uuidV4() }>

					<Charts>
						<EventChart { ...options } key={ uuidV4() }/>
					</Charts>

				</ChartRow>
			);

			chartRows.push( chartRow );

		} );

		return chartRows;
	}

	makeEventChart( event ) {

		let timeRangeEvent, _startDate, _endDate;

		function eventStyleFunc( event, state ) {

			const color = event.get( "color" ) || Constants.EVENT_DEFAULT_COLOR;

			switch ( state ) {
				case "normal":
					return {
						fill  : color,
						height: 20
					};
				case "hover":
					return {
						fill   : color,
						height : 20,
						opacity: 0.4
					};
				//case "muted":
				//    return {
				//        fill:    'gray',
				//        height:  20,
				//        opacity: 0.4
				//    };
				case "selected":
					return {
						fill  : color,
						height: 20
					};
				default:
				//pass
			}
		}

		function labelFunction( event ) {
			return event.get( "eventName" );
		}


		const eventRowOptions = {
			height: 30
		};

		let preEvent  = Object.assign( {}, event );
		let postEvent = Object.assign( {}, event );

		preEvent.startDate = moment( event.startDate ).subtract( event.preceding, "months" ).format( "YYYY-MM-DD" );
		preEvent.endDate   = event.startDate;
		preEvent.color     = "lightgray";
		preEvent.eventName = "preceding";

		postEvent.startDate = event.endDate;
		postEvent.endDate   = moment( event.endDate ).add( event.resonance, "months" ).format( "YYYY-MM-DD" );
		postEvent.color     = "lightgray";
		postEvent.eventName = "resonance";

		let brandEvents = [ preEvent, event, postEvent ];

		const events = brandEvents.map(
			( {startDate, endDate, ...data} ) =>
				new TimeRangeEvent( new TimeRange( new Date( startDate ), new Date( endDate ) ), data )
		);

		const timeSeries = new TimeSeries( {name: "event", events} );

		const selectedCategoryId = this.props.selectedCategoryId;

		function onSelectionChange( e ) {
			const start = moment( e.begin() ).format( "YYYY-MM-DD" );
			const end   = moment( e.end() ).format( "YYYY-MM-DD" );
			// console.log( e.get( "eventName" ), start, end );
			this.props.setIntrinsicsByPeriodDateRange( selectedCategoryId, {
				period: "weekly",
				start : start,
				end   : end
			}, Constants.DATE_RANGE_ALL );
		}

		const onSelectionChangeCallBack = onSelectionChange.bind( this );

		const options = {
			series           : timeSeries,
			size             : 30,
			style            : eventStyleFunc,
			label            : labelFunction,
			onSelectionChange: onSelectionChangeCallBack
		};

		const chartRow = (

			<ChartRow
				{ ...eventRowOptions } debug={ false }
				key={ uuidV4() }>

				<Charts>
					<EventChart { ...options } key={ uuidV4() }/>
				</Charts>

			</ChartRow>
		);

		return chartRow;
	}

	makeLegend( columns ) {

		let items = [].concat( columns );
		items.shift();

		items = items.sort();

		return items.map( o => {
			let key   = o.split( ":" )[ 1 ];
			let label = o.split( ":" )[ 0 ];

			// console.log("chartView", this.props.chartView, this.props.intrinsicColors, this.props.brandColors);

			return {
				key  : o,
				color: this.props.chartView === Constants.EVENT_CHART_VIEW_INTRINSICS_BY_BRANDS ? this.props.intrinsicColors[ key ] : this.props.brandColors[ Number( key ) ],
				label: label
			};
		} );
	}

	getAllValues( data ) {

		let allValues = [];

		let timeSeriesObj = _.cloneDeep( data );

		_.forEach( timeSeriesObj.points, function ( valuesArray ) {
			valuesArray.shift(); // the first value in the array is the time (discard it)
			allValues = allValues.concat( valuesArray );
		} );


		// is it an array? (in Javascript an array is an object)
		allValues = allValues.sort( function ( a, b ) {
			return a - b;
		} );

		return ( allValues.length >= 2 ) ? {minVal: allValues.shift(), maxVal: allValues.pop()} : {
			minVal: 0,
			maxVal: 0
		};
	}

	render() {
		/** CHART HEIGHT **/

		function handleTrackerChanged( tracker ) {
			this.setState( {tracker} );
		}

		const CHART_HEIGHT = 250;
		const BRUSH_HEIGHT = 40;
		const YAXIS_WIDTH  = 60;
		//const YAXIS_WIDTH  = 100;

		let data = this.props.data;

		if ( _.isEmpty( data ) ) {
			return ( <div>Select an event to view charts.</div> );
		}
		let domain = this.getAllValues( data );

		let localMin = domain.minVal;
		let localMax = domain.maxVal;

		const legendData = this.makeLegend( data.columns );

		// console.log("logendData", legendData);


		let scale = _.get( this.props, "chartScale" ) || Constants.CHART_SCALE_GLOBAL;

		let globalMin = this.props.minVal;
		let globalMax = this.props.maxVal;

		const seriesMin = scale === Constants.CHART_SCALE_GLOBAL ? globalMin : localMin;
		const seriesMax = scale === Constants.CHART_SCALE_GLOBAL ? globalMax : localMax;

		const series = IntrinsicsByPeriod.getSeries( this.props.minDate, this.props.maxDate, seriesMin, seriesMax );

		const timerange = series.timerange();

		//const seriesAvg = allValues.length ? allValues.reduce((x, y) => x + y) / allValues.length : 0; // sum / num

		/** CHART **/

			  //https://github.com/d3/d3-time-format
			  // const DATE_FORMAT = "%b-%d";
		const DATE_FORMAT = "%m/%d";


		const chartRowOptions = {
			height: CHART_HEIGHT
		};

		const chartStyle = {
			border    : "1px solid #999",
			background: "#FEFEFE",
			paddingTop: 20
		};


		const chartYAxisStyle = {
			labels: {
				labelColor : "Black", // Default label color
				labelWeight: 100
				// transform: 'rotate("90deg")'
				//labelSize:   11
			},
			axis  : {
				axisColor:
					"#FFF"
				//"#000"
			}
		};

		/** BASELINES **/
		const baselineStyle = {
			line: {
				stroke     : "#999",
				strokeWidth: 0.5
			}
		};

		//const AvgBaselineStyle = {
		//    line: {
		//        stroke     : "#900",
		//        strokeWidth: 1.0
		//    }
		//};

		/** BRUSH **/

		const brushContainerOptions = {
			timeRange       : timerange,
			trackerPosition : this.state.tracker,
			onTrackerChanged: handleTrackerChanged.bind( this ),
			format          : DATE_FORMAT,
			enablePanZoom   : true
		};
		const brushOptions          = {
			// timeRange          : this.state.timerange,
			timeRange          : this.state.timerange,
			allowSelectionClear: true,
			onTimeRangeChanged : this.handleTimeRangeChange.bind( this ),
			style              : {stroke: "#000", fill: "#AAA", strokeWidth: "0"},
			handleSize         : 12
		};
		const brushRowOptions       = {
			height: BRUSH_HEIGHT
		};
		const brushStyle            = {
			background: "#FEFEFE",
			//border:     '1px solid #AAA',
			border    : "none",
			paddingTop: "0"
		};
		const brushYAxisOptions     = {
			id    : "axis",
			label : "range",
			min   : seriesMin,
			max   : seriesMax,
			width : YAXIS_WIDTH,
			type  : "linear",
			format: ".2f"
		};
		const brushYAxisStyle       = {
			labels: {
				labelColor : "Black", // Default label color
				labelWeight: 100
				//labelSize:   11
			},
			axis  : {
				axisColor:
					"#FFF"
			}
		};

		// react timeseries chart

		const style = styler( legendData );

		const timeSeriesData = _.cloneDeep( this.props.data );
		const timeSeries     = new TimeSeries( timeSeriesData );
		const charts         = this.makeChart( timeSeriesData );

		let eventChart = <div/>; // use </div> instead of null. charting package will fail with null elements

		if ( this.props.selectedEvent ) {
			eventChart = this.makeEventChart( this.props.selectedEvent );
		}

		const yAxisOptions = {
			id         : "axis",
			label      : this.props.yAxisLabel || "signal",
			min        : seriesMin,
			max        : seriesMax,
			width      : YAXIS_WIDTH,
			type       : "linear",
			format     : ".2f",
			//format:      ".8f",
			labelOffset: 0
			//labelOffset: 20
		};


		// console.log("timerange", timerange);

		const chartContainerOptions = {
			utc               : false,
			timeRange         : this.state.timerange || timerange,
			minTime           : new Date( this.props.minDate ),
			maxTime           : new Date( this.props.maxDate ),
			trackerPosition   : this.state.tracker,
			onTrackerChanged  : handleTrackerChanged.bind( this ),
			onTimeRangeChanged: this.handleTimeRangeChange.bind( this ),
			enablePanZoom     : true,
			format            : DATE_FORMAT
		};

		const timeAxisStyle = {
			labels: {
				labelColor : "grey",
				labelWeight: 100,
				labelSize  : 11
				// transform: "rotate(90)"
			},
			axis  : {
				axisColor: "black",
				axisWidth: 2
			}
		};

		let minMaxBaselines = [];

		if ( this.props.showMinMaxBaseLineCharts && ( seriesMax === seriesMin ) ) {
			minMaxBaselines = ( [ <Baseline
				key={ uuidV4() }
				axis="axis"
				style={ baselineStyle }
				value={ seriesMin }
				label="data min / max"
				position="right"/> ] );
		} else {
			minMaxBaselines = this.props.showMinMaxBaseLineCharts ? [ <Baseline
				key={ uuidV4() }
				axis="axis"
				style={ baselineStyle }
				value={ seriesMin }
				label="data min"
				position="right"/>,
				< Baseline
					key={ uuidV4() }
					axis="axis"
					style={ baselineStyle }
					value={ seriesMax }
					label="data max"
					position="right"/> ] : [];
		}

		const zeroBaseline = this.props.showZeroBaseLine ? ( <Baseline
				key={ uuidV4() }
				axis="axis"
				style={ baselineStyle }
				value={ 0 }
				label="0%"
				position="right"/>
		) : [];

		const chart = (
			<Grid.Row columns={ 1 }>
				<Grid.Column
					style={ chartStyle }>
					<Resizable>
						<ChartContainer { ...chartContainerOptions } timeAxisStyle={ timeAxisStyle }>
							<ChartRow { ...chartRowOptions } debug={ false }>
								<YAxis { ...yAxisOptions } style={ chartYAxisStyle }/>

								{ this.props.type === "line" ?

									<Charts>
										{ charts }
										{ minMaxBaselines }
										{ zeroBaseline }
									</Charts> :

									<Charts>
										{ charts }
									</Charts>
								}

							</ChartRow>

							{ this.props.showEventCharts ? eventChart : <div/> }

						</ChartContainer>
					</Resizable>
				</Grid.Column>
			</Grid.Row> );

		const brush = (
			<Grid.Row>
				<Grid.Column
					style={ brushStyle }>
					<Resizable>
						<ChartContainer { ...brushContainerOptions }>
							<ChartRow { ...brushRowOptions } debug={ false }>
								<Brush { ...brushOptions } />
								<YAxis { ...brushYAxisOptions } style={ brushYAxisStyle }/>
								<Charts>
									{ charts }
								</Charts>
							</ChartRow>
						</ChartContainer>
					</Resizable>
				</Grid.Column>
			</Grid.Row>
		);

		let pctValue = null;

		if ( this.state.tracker && this.state.selection ) {
			const index        = timeSeries.bisect( this.state.tracker );
			const trackerEvent = timeSeries.at( index );
			pctValue           = Number( trackerEvent.get( this.state.selection ) ).toFixed( 2 );
			// console.log("this.state.tracker, index, trackerEvent, pctValue, columns, selection", this.state.tracker, index, trackerEvent, pctValue, timeSeries.columns(), this.state.selection);
		}


		const trackerValue = (

			<Grid.Row columns={ 8 }>
				{ this.props.chartContext === "events" ?
					<Grid.Column
						textAlign={ "left" }
						width={ 8 }
						style={ {
							fontSize  : 14,
							fontWeight: "bold",
							color     : pctValue < 0 ? "red" : pctValue > 0 ? "green" : "#777"
							// textAlign   : "left",
							// marginRight : 50,
							// marginBottom: 10
						} }>
						{ this.state.selection && pctValue ? `change: ${pctValue}% [${this.state.selection.split( ":" )[ 0 ]}] ` : "-" }
					</Grid.Column> :
					null
				}
				<Grid.Column
					textAlign={ "right" }
					width={ 8 }
					style={ {
						fontSize  : 14,
						fontWeight: "normal",
						color     : "#777"
						// textAlign   : "left",
						// marginRight : 50,
						// marginBottom: 10
					} }>
					{ this.state.tracker ? `${moment( this.state.tracker ).format( "dddd, MMMM Do, YYYY" )}` : "-" }

				</Grid.Column>
			</Grid.Row>
		);

		const legend = (
			<Legend
				type="dot"
				align="right"
				style={ style }
				highlight={ this.state.highlight }
				onHighlightChange={ highlight => this.setState( {highlight} ) }
				selection={ timeSeries.columns().length === 1 ? {selection: timeSeries.columns()[ 0 ]} : this.state.selection }
				onSelectionChange={ selection => this.setState( {selection} ) }
				categories={ legendData }/>
		);

		//return (<div>{chart1}</div>);

		const logoStyle          = {
			objectFit: "contain",
			width    : 60,
			height   : 60,
			marginTop: 5
		};
		const logoContainerStyle = {
			width: 300
		};

		const panelTitleStyle = {
			paddingTop : "0",
			paddingLeft: "0"
		};


		const title = this.props.title;

		const popoverHoverFocus = (
			<Popover
				id="popover-trigger-hover-focus"
				title={ this.props.title }>
				{ this.props.brandData.description || "Sorry, no description available." }
			</Popover>
		);

		const emptySVG = ( color, title ) =>
			( <svg
				width={ 40 }
				height={ 40 }>

				<rect
					x={ 0 }
					y={ 0 }
					height={ 40 }
					width={ 40 }
					rx={ 5 }
					ry={ 5 }
					style={ {fill: color} }/>
				<text
					x={ "50%" }
					y={ "55%" }
					alignmentBaseline={ "middle" }
					textAnchor={ "middle" }
					fill={ "white" }
					fontFamily={ "Roboto Condensed" }
					fontSize={ 30 }>{ title.substring( 0, 2 ) }
				</text>
			</svg> );

		const brandsHeader = (
			<Media>
				<Media.Left style={ logoContainerStyle }>
					<OverlayTrigger
						trigger={ [ "hover", "focus" ] }
						placement="right"
						overlay={ popoverHoverFocus }>
						<ReactImageFallback
							src={ this.props.brandData.logo }
							//fallbackImage={require('../../../static/images/empty.svg')}
							fallbackImage={ emptySVG( this.props.brandColors[ Number( this.props.brandId ) ], title ) }
							alt="logo"
							style={ logoStyle }/>
					</OverlayTrigger>

				</Media.Left>
				<Media.Body style={ panelTitleStyle }>
					<a
						id="chart-title"
						href={ this.props.brandData.homepage }
						target="_blank"
						rel='noopener noreferrer'>{ title }
					</a>
					{ /*<div style={{color: '#DDDDDD', fontSize: 9}}>{this.props.brandData.relicDate}</div>*/ }
				</Media.Body>
			</Media>
		);

		const intrinsicsHeader = (
			<div>
				<a
					id="chart-title-intrinsics"
					href={ this.props.brandData.homepage }
					target="_blank"
					rel='noopener noreferrer'>{ title }
				</a>
			</div>
		);

		const header = this.props.chartView === Constants.EVENT_CHART_VIEW_INTRINSICS_BY_BRANDS ? brandsHeader : intrinsicsHeader;

		return (
			<Grid stackable>

				<div style={ {height: "80px"} }/>

				<Grid.Row style={ {height: 20, marginBottom: 40, marginTop: 40} }>
					<Grid.Column width={ 16 }>
						{ header }
					</Grid.Column>
				</Grid.Row>

				{ trackerValue }

				<Grid.Row>
					<Grid.Column width={ 16 }>
						{ legend }
					</Grid.Column>
				</Grid.Row>

				{ chart }

				{ /*<div style={ {height: 20} }/>*/ }

				{ this.props.showBrush ? brush : null }

			</Grid>
		);
	}
}

function mapStateToProps( state ) {
	return {
		selectedCategoryId: state.category.categoryData.selectedCategoryId,
		intrinsicColors   : _.get( state, "category.categoryData.intrinsics.colors", [] ),
		brandColors       : _.get( state, "category.categoryData.brands.colors", [] ),
		allEvents         : state.visualizationData.data.settings.events,
		interpolationType : state.visualizationData.data.settings.intrinsicsByPeriodChartInterpolationType,
		companyName       : state.userData.loginInfo.companyName
	};
}

export default connect( mapStateToProps, {getEvents, setIntrinsicsByPeriodDateRange} )( IntrinsicsByPeriod );


