import  _                                                from "lodash";
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
	YAxis, ChartColumns
}                                                       from "../../lib/react-timeseries-charts";


class SentimentByPeriod extends Component {

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
		// this is to keep track of # of brands that needs to be displayed in a single row

		this.row = [];
		this.chartFinal = [];

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
	    const timeSeries = [];
		// if only 1 intrinsic is charted, automatically select it
		const timeSeriesData = _.cloneDeep( this.props.data );
        for (let i=0; i< timeSeriesData.length;i++)
        {
            timeSeries[i] = new TimeSeries( timeSeriesData[i] );
            if ( timeSeries[i].columns().length === 1 ) {
                this.setState( {selection: timeSeries[i].columns()[ 0 ]} );
            }
        }
		// const timeSeries     = new TimeSeries( timeSeriesData );

		// read the # of brands here and decrement in render()
        // this.numofBrands = this.props.numofBrands;
	}

	handleTimeRangeChange( timerange ) {
		this.setState( {timerange} );
	}

    handleTrackerChanged( tracker ) {
        this.setState( {tracker} );
    }
    //
	makeChart( timeSeriesObj ) {

		let columns = [].concat( timeSeriesObj.columns );
		columns.shift();

		let columnsForStyles = [].concat( columns );

		//columnsForStyles.unshift( "value" );

		let lineStyle = {};
		let barStyle  = {};

		const interpolation   = this.props.interpolationType;
		const brandColors     = this.props.brandColors;
		const intrinsicColors = this.props.intrinsicColors;
		const chartView       = this.props.chartView;
		const sentimentColors = this.props.sentimentColors;

		_.forEach( columnsForStyles, function ( column ) {

			let id    = column.split( ":" )[ 0 ];
			let color = chartView === Constants.EVENT_CHART_VIEW_INTRINSICS_BY_BRANDS ? (intrinsicColors[ id ] || sentimentColors[ id]) : brandColors[ Number( id ) ];

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

		// items = items.sort();

		return items.map( o => {
			let key   = o.split( ":" )[ 0 ];
			let label = o.split( ":" )[ 0 ];

			// console.log("chartView", this.props.chartView, this.props.intrinsicColors, this.props.brandColors);

			return {
				key  : o,
				color: this.props.chartView === Constants.EVENT_CHART_VIEW_INTRINSICS_BY_BRANDS ? this.props.sentimentColors[ key ] : this.props.brandColors[ Number( key ) ],
              // color: this.props.chartView === Constants.EVENT_CHART_VIEW_INTRINSICS_BY_BRANDS ? this.props.intrinsicColors[ key ] : this.props.brandColors[ Number( key ) ],
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

		//function handleTrackerChanged( tracker ) {
		//	this.setState( {tracker} );
		//}

		const CHART_HEIGHT = 200;
		const BRUSH_HEIGHT = 40;
		const YAXIS_WIDTH  = 60;
		//const YAXIS_WIDTH  = 100;


        const timeSeriesDatas = this.props.data;
        for (let i=0; i< timeSeriesDatas.length; i++) {


            let tdata = timeSeriesDatas; // need to find out why does this work but not timeSeriesDatas[i]
            let data = tdata[i];

            if (_.isEmpty(data)) {
                return (<div>Select an event to view charts.</div>);
            }
            let domain = this.getAllValues(data);

            let localMin = domain.minVal;
            let localMax = domain.maxVal;

            const legendData = this.makeLegend(data.columns);

            // console.log("logendData", legendData);


            let scale = _.get(this.props, "chartScale") || Constants.CHART_SCALE_GLOBAL;

            let globalMin = this.props.minVal;
            let globalMax = this.props.maxVal;

            const seriesMin = scale === Constants.CHART_SCALE_GLOBAL ? globalMin : localMin;
            const seriesMax = scale === Constants.CHART_SCALE_GLOBAL ? globalMax : localMax;

            const series = SentimentByPeriod.getSeries(this.props.minDate, this.props.maxDate, seriesMin, seriesMax);

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
                border: "1px solid #999",
                background: "#FEFEFE",
                paddingTop: 30,
                width: 400,
                marginTop: 30,
                marginLeft: 15,
            };


            const chartYAxisStyle = {
                labels: {
                    labelColor: "Black", // Default label color
                    labelWeight: 100
                    // transform: 'rotate("90deg")'
                    //labelSize:   11
                },
                axis: {
                    axisColor:
                        "#FFF"
                    //"#000"
                }
            };

            /** BASELINES **/
            const baselineStyle = {
                line: {
                    stroke: "#999",
                    strokeWidth: 0.5
                }
            };


            const style = styler(legendData);

            const timeSeriesData = _.cloneDeep(data);
            const timeSeries = new TimeSeries(timeSeriesData);
            const charts = this.makeChart(timeSeriesData);


            let eventChart = <div/>; // use </div> instead of null. charting package will fail with null elements

            if (this.props.selectedEvent) {
                eventChart = this.makeEventChart(this.props.selectedEvent);
            }

            const yAxisOptions = {
                id: "axis",
                label: this.props.yAxisLabel || "signal",
                min: seriesMin,
                max: seriesMax,
                width: YAXIS_WIDTH,
                type: "linear",
                format: ".2f",
                //format:      ".8f",
                labelOffset: 0
                //labelOffset: 20
            };


            // console.log("timerange", timerange);

            const chartContainerOptions = {
                utc: false,
                timeRange: this.state.timerange || timerange,
                minTime: new Date(this.props.minDate),
                maxTime: new Date(this.props.maxDate),
                trackerPosition: this.state.tracker,
                onTrackerChanged: this.handleTrackerChanged.bind(this),
                onTimeRangeChanged: this.handleTimeRangeChange.bind(this),
                enablePanZoom: true,
                format: DATE_FORMAT,
                width: 350

            };

            const timeAxisStyle = {
                labels: {
                    labelColor: "grey",
                    labelWeight: 100,
                    labelSize: 11
                    // transform: "rotate(90)"
                },
                axis: {
                    axisColor: "black",
                    axisWidth: 2
                }
            };

            let minMaxBaselines = [];

            if (this.props.showMinMaxBaseLineCharts && (seriesMax === seriesMin)) {
                minMaxBaselines = ([<Baseline
                    key={uuidV4()}
                    axis="axis"
                    style={baselineStyle}
                    value={seriesMin}
                    label="data min / max"
                    position="right"/>]);
            } else {
                minMaxBaselines = this.props.showMinMaxBaseLineCharts ? [<Baseline
                    key={uuidV4()}
                    axis="axis"
                    style={baselineStyle}
                    value={seriesMin}
                    label="data min"
                    position="right"/>,
                    < Baseline
                        key={uuidV4()}
                        axis="axis"
                        style={baselineStyle}
                        value={seriesMax}
                        label="data max"
                        position="right"/>] : [];
            }

            const zeroBaseline = this.props.showZeroBaseLine ? (<Baseline
                    key={uuidV4()}
                    axis="axis"
                    style={baselineStyle}
                    value={0}
                    label="0%"
                    position="right"/>
            ) : [];


            let pctValue = null;

            if (this.state.tracker && this.state.selection) {
                const index = timeSeries.bisect(this.state.tracker);
                const trackerEvent = timeSeries.at(index);
                pctValue = Number(trackerEvent.get(this.state.selection)).toFixed(2);
                // console.log("this.state.tracker, index, trackerEvent, pctValue, columns, selection", this.state.tracker, index, trackerEvent, pctValue, timeSeries.columns(), this.state.selection);
            }

            const trackerValue = (

                <Grid.Row columns={8}>
                    {this.props.chartContext === "events" ?
                        <Grid.Column
                            textAlign={"left"}
                            width={8}
                            style={{
                                fontSize: 14,
                                fontWeight: "bold",
                                color: pctValue < 0 ? "red" : pctValue > 0 ? "green" : "#777"
                                // textAlign   : "left",
                                // marginRight : 50,
                                // marginBottom: 10
                            }}>
                            {this.state.selection && pctValue ? `change: ${pctValue}% [${this.state.selection.split(":")[0]}] ` : "-"}
                        </Grid.Column> :
                        null
                    }
                    <Grid.Column
                        textAlign={"right"}
                        width={8}
                        style={{
                            fontSize: 14,
                            fontWeight: "normal",
                            color: "#777"
                            // textAlign   : "left",
                            // marginRight : 50,
                            // marginBottom: 10
                        }}>
                        {this.state.tracker ? `${moment(this.state.tracker).format("dddd, MMMM Do, YYYY")}` : "-"}

                    </Grid.Column>
                </Grid.Row>
            );

            const legend = (
                <Legend
                    type="dot"
                    align="right"
                    style={style}
                    highlight={this.state.highlight}
                    onHighlightChange={highlight => this.setState({highlight})}
                    selection={timeSeries.columns().length === 1 ? {selection: timeSeries.columns()[0]} : this.state.selection}
                    onSelectionChange={selection => this.setState({selection})}
                    categories={legendData}/>
            );

            //return (<div>{chart1}</div>);

            const logoStyle = {
                objectFit: "contain",
                width: 60,
                height: 60,
                marginTop: 5
            };
            const logoContainerStyle = {
                width: 300
            };

            const panelTitleStyle = {
                paddingTop: "0",
                paddingLeft: "0"
            };
            const panelIntrinsicsTitleStyle = {
                paddingTop: "0",
                paddingLeft: 15
            };


            const titleData = this.props.title;
            const title = titleData[i];

            const popoverHoverFocus = (
                <Popover
                    id="popover-trigger-hover-focus"
                    title={this.props.brandData[i].logo?title:null}>
                    {this.props.brandData[i].logo?this.props.brandData[i].description || "Sorry, no description available.":""}
                </Popover>
            );

            const emptySVG = (color, title) =>
                (<svg
                    width={40}
                    height={40}>

                    <rect
                        x={0}
                        y={0}
                        height={40}
                        width={40}
                        rx={5}
                        ry={5}
                        style={{fill: color}}/>
                    <text
                        x={"50%"}
                        y={"55%"}
                        alignmentBaseline={"middle"}
                        textAnchor={"middle"}
                        fill={"white"}
                        fontFamily={"Roboto Condensed"}
                        fontSize={30}>{title.substring(0, 2)}
                    </text>
                </svg>);

            // since we are restricting # of intrinsics to 1 the 0th element should contain the intrinsic string
            const intrinsicsHeader = (

                <text
                    x={"50%"}
                    y={"55%"}
                    alignmentBaseline={"middle"}
                    textAnchor={"middle"}
                    fill={"red"}
                    fontFamily={"Roboto Condensed"}
                    fontSize={30}>{this.props.selectedIntrinsicIds[0]}
                </text>
            );
            const brandsHeader = (
                <Media>
                    <Media.Left style={logoContainerStyle}>
                        <OverlayTrigger
                            trigger={["hover", "focus"]}
                            placement="right"
                            overlay={popoverHoverFocus}>
                            <img src={this.props.brandData[i].logo?this.props.brandData[i].logo :require('../../../static/images/empty.svg') }
                                //fallbackImage={require('../../../static/images/empty.svg')}
                                alt={emptySVG(this.props.brandColors[Number(this.props.brandId[i])], title)}
                                //fallbackImage = {this.props.brandData[i].logo}

                                style={logoStyle}
                            />
                        </OverlayTrigger>

                    </Media.Left>
                    <Media.Body style={panelTitleStyle}>
                        <a
                            id="chart-title"
                            href={this.props.brandData[i].homepage}
                            target="_blank"
                            rel='noopener noreferrer'>{title}
                        </a>
                        {/*<div style={{color: '#DDDDDD', fontSize: 9}}>{this.props.brandData.relicDate}</div>*/}
                    </Media.Body>
                    <Media.Body style={panelIntrinsicsTitleStyle}>
                        {intrinsicsHeader}
                    </Media.Body>

                </Media>
            );

            /* const intrinsicsHeader = (
                <div>
                    <a
                        id="chart-title-intrinsics"
                        href={this.props.brandData[i].homepage}
                        target="_blank"
                        rel='noopener noreferrer'>{title}
                    </a>
                </div>
            );*/


            const header = this.props.chartView === Constants.EVENT_CHART_VIEW_INTRINSICS_BY_BRANDS ? brandsHeader : intrinsicsHeader;


            this.row.push( <Grid.Column key={uuidV4()} style={ chartStyle }>

                <Grid.Column width={16}>
                    {header}
                </Grid.Column>
                <Grid.Column width={16}>
                    {legend}
                </Grid.Column>
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

                <Grid.Column >
                {trackerValue}
				</Grid.Column>


            </Grid.Column> );
        }

        const chartFinal = (
            <Grid stackable key={uuidV4()} >
                {this.row}
            </Grid>
        );

        this.chartFinal.push(chartFinal);
        let chartSentiment = this.chartFinal;
        this.row = [];
        this.chartFinal = [];
		return (
			<div>{chartSentiment}</div>
		);
	}
}

function mapStateToProps( state ) {
	return {
		selectedCategoryId: state.category.categoryData.selectedCategoryId,
		intrinsicColors   : _.get( state, "category.categoryData.intrinsics.colors", [] ),
		brandColors       : _.get( state, "category.categoryData.brands.colors", [] ),
        sentimentColors   :	_.get( state, "category.categoryData.sentiment.colors", [] ),

        allEvents         : state.visualizationData.data.settings.events,
		interpolationType : state.visualizationData.data.settings.intrinsicsByPeriodChartInterpolationType,
		companyName       : state.userData.loginInfo.companyName,
        selectedIntrinsicIds : state.visualizationData.data.settings.selectedIntrinsicIds
	};
}

export default connect( mapStateToProps, {getEvents, setIntrinsicsByPeriodDateRange} )( SentimentByPeriod );


