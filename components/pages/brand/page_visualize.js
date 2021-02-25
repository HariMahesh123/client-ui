import _ from "lodash";

import moment               from "moment";
import React, { Component } from "react";

import {
	Button, ButtonGroup, Checkbox, ControlLabel, DropdownButton, Form, FormGroup, MenuItem,
	Radio
}                        from "react-bootstrap";
import { Grid, Segment } from "semantic-ui-react";

import { connect }        from "react-redux";
import uuidV4             from "uuid/v4";
import {
	getChartBrandComparisonData, getChartChartScatterPlotData, getChartIntrinsicComparisonData,
	getChartIntrinsicWhitespaceAnalysisData, getChartWhitespaceAnalysisData, getEvents, getIntrinsicsByPeriod,
	getIntrinsicsByPeriodForRadarChart, getTopics, setCategory, setChartConfig, setChartScale, setChartSort,
	setComparisonChartType, setIntrinsicsByPeriodChartInterpolationType, setIntrinsicsByPeriodChartType,
	setIntrinsicsByPeriodDateRange, setIntrinsicsByPeriodStacked, setIntrinsicsChartType, setLandscapeChartType,
	setLandscapeChartView, setNavigationType, setRadarChartDates, setRadarChartPeriod, setRadarChartScaled,
	setRadarChartStacked, setRadarChartType, setRadarComparisonType, setSelectedChart, setSelectionType
    //getTopicSentimentCounts
}                         from "../../../actions/actions";
import * as Constants     from "../../../constants";
import * as Utils         from "../../../utils";
import BrandComparisons   from "../../charts/brand_comparisons";
import IntrinsicTrends    from "../../charts/intrinsic_trends";
import IntrinsicsByPeriod from "../../charts/intrinsics_by_period";
import PageRadar          from "./page_radar";
import ScatterPlotGrid    from "../../charts/scatterplotGrid";
import PageHeading        from "../../shared/page_heading";
import SentimentByPeriod from "../../charts/sentiment_by_period";


class PageVisualize extends Component {
	// get access to router from parent component
	// static contextTypes = {
	// 	router: PropTypes.object
	// };

	constructor( ...args ) {
		super( ...args );
		this.state = {
			interpolationType: "curveCatmullRom",
            interpolationSentimentButtonTitle : "All"

		};
	}

	componentWillMount() {
		Utils.debugLogger( "componentWillMount" );
		// HM - see if this needs to be changed when mounting. to mount correct default and private
        //console.log("*****In COMPONONENT WILL MOUNT******",this.props.navigationType);
       // console.log(JSON.stringify(this.props.loginfoObj));
		if ( this.props.navigationType !== "intrinsics_reports" ) {
            if (this.props.route.global_intrinsics) {
                // console.log("*****In COMPONONENT WILL MOUNT******GLOBAL ",this.props.route.global_intrinsics);
                this.props.setNavigationType( "global_intrinsics_reports" );
            }
            else {
                //console.log("*****In COMPONONENT WILL MOUNT******CUSTOM ",this.props.route.global_intrinsics);
                 this.props.setNavigationType( "intrinsics_reports" );
            }

            if (this.props.intrinsicsByPeriodChartType === "sentiment") {
                this.props.setSelectedChart(Constants.CHART_SENTIMENTCOUNTS_BY_PERIOD);
            }
            else {
                this.props.setSelectedChart(Constants.CHART_INTRINSICS_BY_PERIOD);
            }
            //this.props.setSelectedChart( Constants.CHART_INTRINSICS_BY_PERIOD );
            // this.props.setSelectedChart( Constants.CHART_RADAR );
        }

		if ( _.get( this.props, "companyName" ) && _.get( this.props, "selectedCategory.id" ) ) {
			this.props.getEvents( this.props.companyName, this.props.selectedCategory.id );
		}
	}

	onChartTypeSelected( event ) {
		const chartType = event.target.value;
		// Utils.debugLogger(event, chartType);
		this.props.setIntrinsicsChartType( chartType );
		if ( chartType === "radar" ) {
			this.props.setSelectedChart( Constants.CHART_RADAR );
		} else {
		    if (this.props.intrinsicsByPeriodChartType === "sentiment") {
                this.props.setSelectedChart(Constants.CHART_SENTIMENTCOUNTS_BY_PERIOD);
            }
            else {
                this.props.setSelectedChart(Constants.CHART_INTRINSICS_BY_PERIOD);
            }
		}
	}

	onChartScaleSelected( event ) {
		const chartScale = event.target.value;
		// Utils.debugLogger(event, chartType);
		this.props.setChartScale( chartScale );
	}

	onChartSortSelected( event ) {
		const chortSort = event.target.value;
		// Utils.debugLogger(event, chartType);
		this.props.setChartSort( chortSort );
	}

	onRadarChartTypeSelected( event ) {
		const chartType = event.target.value;
		this.props.setRadarChartType( chartType );
	}

	onRadarChartPeriodChanged( event ) {
		const chartType = event.target.value;
		this.props.setRadarChartPeriod( chartType );
	}

	onRadarChartComparisonTypeChanged( event ) {
		const type = event.target.value;
		this.props.setRadarComparisonType( type );
	}

	onSelectionTypeSelected( event ) {
		const selectionType = event.target.value;
		// Utils.debugLogger(event, selectionType, checked);
		this.props.setSelectionType( selectionType );
	}

	onComparisonChartTypeSelected( event ) {
		const type = event.target.value;
		// Utils.debugLogger(event, type);
		this.props.setComparisonChartType( type, this.props.comparisonChart.normalize, this.props.comparisonChart.stacked );
	}

	onIntrinsicsByPeriodChartTypeSelected( event ) {
        this.props.setSelectedChart( Constants.CHART_INTRINSICS_BY_PERIOD );
		const type = event.target.value;
		// Utils.debugLogger(event, type);
		this.props.setIntrinsicsByPeriodChartType( type );
	}

	onComparisonChartNormalizeClicked( event ) {
		const normalize = event.target.checked;
		this.props.setComparisonChartType( this.props.comparisonChart.type, normalize, this.props.comparisonChart.stacked );
	}

	onSetSelectedLandscapeChartViewClicked( event ) {
		const type = event.target.value;
		this.props.setLandscapeChartView( type );
	}

	onComparisonChartStackedClicked( event ) {
		const stacked = event.target.checked;
		this.props.setComparisonChartType( this.props.comparisonChart.type, this.props.comparisonChart.normalize, stacked );
	}

	onRadarChartStackedClicked( event ) {
		const stacked = event.target.checked;
		// Utils.debugLogger(event, normalize);
		this.props.setRadarChartStacked( stacked );
	}

	onIntrinsicsByPeriodStackedClicked( event ) {
		const stacked = event.target.checked;
		// Utils.debugLogger(event, normalize);
		this.props.setIntrinsicsByPeriodStacked( stacked );
	}

	onRadarChartScaledClicked( event ) {
		const scaled = event.target.checked;
		// Utils.debugLogger(event, normalize);
		this.props.setRadarChartScaled( scaled );
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

		console.log( "setDateRange", range, filter, this.props.selectedCategory.id );

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

    onSentimentTypeSelected( event ) {

        this.props.setSelectedChart( Constants.CHART_SENTIMENTCOUNTS_BY_PERIOD );
        const type = event.target.value;
        // Utils.debugLogger(event, type);
        this.props.setIntrinsicsByPeriodChartType( type );
        //this.setState( {interpolationSentimentButtonTitle: event} );
        //const type = event.target.value;
        // Utils.debugLogger(event, type);
        //this.props.setIntrinsicsByPeriodChartType( type );

    }

    onAllSentimentTypeSelected (event) {
        this.props.setSelectedChart( Constants.CHART_SENTIMENTCOUNTS_BY_PERIOD );
        this.setState( {interpolationSentimentButtonTitle: event} );
    }

    onPositiveSentimentTypeSelected( event ) {

        this.props.setSelectedChart( Constants.CHART_POSITIVE_SENTIMENTCOUNTS_BY_PERIOD );
        //this.interpolationSentimentButtonTitle = event
        this.setState( {interpolationSentimentButtonTitle: event} );
      //  const type = event.target.value;
       // this.props.setIntrinsicsByPeriodChartType( type );

    }

    onNegativeSentimentTypeSelected( event ) {

        this.props.setSelectedChart( Constants.CHART_NEGATIVE_SENTIMENTCOUNTS_BY_PERIOD );
        this.setState( {interpolationSentimentButtonTitle: event} );
         // const type = event.target.value;
        // this.props.setIntrinsicsByPeriodChartType( type );

    }
    onNeutralSentimentTypeSelected( event ) {

        this.props.setSelectedChart( Constants.CHART_NEUTRAL_SENTIMENTCOUNTS_BY_PERIOD );
        this.setState( {interpolationSentimentButtonTitle: event} );
        //  const type = event.target.value;
        // this.props.setIntrinsicsByPeriodChartType( type );

    }

    render() {

		if ( this.props.loading ) {

			document.body.style.cursor = "wait";

			return (
				<div
					className={ "centered" }
					style={ {cursor: "wait"} }>
				</div>
			);
		}

		document.body.style.cursor = "default";

		const selectedBrands     = this.props.selectedBrandIds || [];
		const selectedIntrinsics = this.props.selectedIntrinsicIds || [];
        //const interpolationSentimentButtonTitle =  "All";

		let chartConfig = null;

		const interpolationButtonTitle = this.props.intrinsicsByPeriodChartInterpolationType ? this.props.intrinsicsByPeriodChartInterpolationType.slice( 5 ) : "";

		const barChecked   = {
			checked: this.props.intrinsicsChartType === "bar"
		};
		const lineChecked  = {
			checked: this.props.intrinsicsChartType === "line"
		};
		const radarChecked = {
			checked: this.props.intrinsicsChartType === "radar"
		};

        const brandsChecked     = {
            checked: this.props.intrinsicsByPeriodChartType === "brands"
        };
        const intrinsicsChecked = {
            checked: this.props.intrinsicsByPeriodChartType === "intrinsics"
        };
        const sentimentChecked = {
            checked: this.props.intrinsicsByPeriodChartType === "sentiment"

        };

		const interpolationTypeDropdown = (

			<DropdownButton
				bsSize="xsmall"
				title={ interpolationButtonTitle }
				id="interpolationTypeDropDownButton">

				<MenuItem header>curves</MenuItem>

				<MenuItem
					eventKey='curveBasis'
					active={ this.props.intrinsicsByPeriodChartInterpolationType === "curveBasis" }
					onSelect={ this.handleInterpolationType.bind( this ) }>Basis
				</MenuItem>
				<MenuItem
					eventKey='curveNatural'
					active={ this.props.intrinsicsByPeriodChartInterpolationType === "curveNatural" }
					onSelect={ this.handleInterpolationType.bind( this ) }>Natural
				</MenuItem>
				<MenuItem
					eventKey='curveCatmullRom'
					active={ this.props.intrinsicsByPeriodChartInterpolationType === "curveCatmullRom" }
					onSelect={ this.handleInterpolationType.bind( this ) }>CatmullRom
				</MenuItem>
				<MenuItem
					eventKey='curveBundle'
					active={ this.props.intrinsicsByPeriodChartInterpolationType === "curveBundle" }
					onSelect={ this.handleInterpolationType.bind( this ) }>Bundle
				</MenuItem>
				<MenuItem
					eventKey='curveCardinal'
					active={ this.props.intrinsicsByPeriodChartInterpolationType === "curveCardinal" }
					onSelect={ this.handleInterpolationType.bind( this ) }>Cardinal
				</MenuItem>
				<MenuItem
					eventKey='curveMonotoneX'
					active={ this.props.intrinsicsByPeriodChartInterpolationType === "curveMonotoneX" }
					onSelect={ this.handleInterpolationType.bind( this ) }>MonotoneX
				</MenuItem>
				<MenuItem
					eventKey='curveMonotoneY'
					active={ this.props.intrinsicsByPeriodChartInterpolationType === "curveMonotoneY" }
					onSelect={ this.handleInterpolationType.bind( this ) }>MonotoneY
				</MenuItem>

				<MenuItem divider/>

				<MenuItem header>lines</MenuItem>
				<MenuItem
					eventKey='curveLinear'
					active={ this.props.intrinsicsByPeriodChartInterpolationType === "curveLinear" }
					onSelect={ this.handleInterpolationType.bind( this ) }>Linear
				</MenuItem>
				<MenuItem
					eventKey='curveStep'
					active={ this.props.intrinsicsByPeriodChartInterpolationType === "curveStep" }
					onSelect={ this.handleInterpolationType.bind( this ) }>Step
				</MenuItem>
				<MenuItem
					eventKey='curveStepBefore'
					active={ this.props.intrinsicsByPeriodChartInterpolationType === "curveStepBefore" }
					onSelect={ this.handleInterpolationType.bind( this ) }>StepBefore
				</MenuItem>
				<MenuItem
					eventKey='curveStepAfter'
					active={ this.props.intrinsicsByPeriodChartInterpolationType === "curveStepAfter" }
					onSelect={ this.handleInterpolationType.bind( this ) }>StepAfter
				</MenuItem>

			</DropdownButton>
		);

        const interpolationSentimentTypeDropdown = (

            <DropdownButton
                bsSize="xsmall"
                title={ this.state.interpolationSentimentButtonTitle }
                id="interpolationSentimentTypeDropdown">

                <MenuItem
                    eventKey='All'
                    title = {this.state.interpolationSentimentButtonTitle}
                    onSelect={ this.onAllSentimentTypeSelected.bind( this ) }>All
                </MenuItem>
                <MenuItem
                    eventKey='Positive'
                    title = {this.state.interpolationSentimentButtonTitle}
                    onSelect={ this.onPositiveSentimentTypeSelected.bind( this ) }>Positive
                </MenuItem>
                <MenuItem
                    eventKey='Negative'
                    title = {this.state.interpolationSentimentButtonTitle}
                    onSelect={ this.onNegativeSentimentTypeSelected.bind( this ) }>Negative
                </MenuItem>
                <MenuItem
                    eventKey='Neutral'
                    title = {this.state.interpolationSentimentButtonTitle}
                    onSelect={ this.onNeutralSentimentTypeSelected.bind( this ) }>Neutral
                </MenuItem>

            </DropdownButton>
        );

		const pageHeading = (
			<div>

				<PageHeading title={ `Intrinsics Reports: ${this.props.selectedCategory.title}` }/>
                <Form>
					<Grid stackable>
                        <Grid.Row >
							<Grid.Column width={7}>
								<Segment  >
									<ControlLabel>{ "select chart type:" }</ControlLabel>
									<Radio
										inline
										key="bar"
										name="chartType"
										value="bar" { ...barChecked }
										onChange={ this.onChartTypeSelected.bind( this ) }>{ "bar" }
									</Radio>
									<Radio
										inline
										key="line"
										name="chartType"
										value="line" { ...lineChecked }
										onChange={ this.onChartTypeSelected.bind( this ) }
										style={ {marginRight: 10} }
										>{ "line" }
									</Radio>

									{ lineChecked.checked ? <ControlLabel>{ "line type:" }</ControlLabel> : null }
									{ lineChecked.checked ? interpolationTypeDropdown : null }
									{this.props.intrinsicsByPeriodChartType !== "sentiment" ?
									<Radio
										inline
										key="radar"
										name="chartType"
										value="radar" { ...radarChecked }
										onChange={ this.onChartTypeSelected.bind( this ) }
										//style={ lineChecked.checked ? {marginLeft: 10} : {marginLeft: 10} }
                                        style={ {marginLeft: 10,marginRight: 10} }>{ "radar" }
									</Radio> : null}
								</Segment>
							</Grid.Column>
                                <Grid.Column width={8} >
                                <Segment compact >
									<ControlLabel>{ "compare:" }</ControlLabel>
									<Radio
										inline
										key="brands"
										name="intrinsicsByPeriodchartType"
										value="brands" { ...brandsChecked }
										onChange={ this.onIntrinsicsByPeriodChartTypeSelected.bind( this ) }>{ "brands" }

									</Radio>
                                    <Radio
                                        inline
                                        key="sentiment"
                                        name="intrinsicsByPeriodchartType"
                                        value="sentiment" { ...sentimentChecked }
                                        onChange={ this.onSentimentTypeSelected.bind( this ) }
                                        style={ {marginLeft: 10,marginRight: 10} }>{ "sentiment" }
                                    </Radio>

                                    { sentimentChecked.checked ? <ControlLabel>{ "type:" }</ControlLabel> : null }
                                    { sentimentChecked.checked ? interpolationSentimentTypeDropdown : null }

                                    <Radio
                                        inline
                                        key="intrinsics"
                                        name="intrinsicsByPeriodchartType"
                                        value="intrinsics" { ...intrinsicsChecked }
                                        onChange={ this.onIntrinsicsByPeriodChartTypeSelected.bind( this ) }
                                        style={ {marginLeft: 10} }>{ "intrinsics" }
                                    </Radio>


             				   </Segment>
                      	  </Grid.Column>
						</Grid.Row>
					</Grid>
				</Form>
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
			marginTop : 2,
		//	marginLeft: 0,
            width: "100%"
			//maxWidth  : 1800 // control width here, control height in the chart component (for chart.js)
		};
		let controls   = null;

        // determine which radio is checked
        const globalChartScaleChecked = {
            checked: this.props.chartScale === Constants.CHART_SCALE_GLOBAL
        };

        const localChartScaleChecked = {
            checked: this.props.chartScale === Constants.CHART_SCALE_LOCAL
        };

        const sortByNameChecked = {
            checked: this.props.chartSort === Constants.CHART_SORT_BY_NAME
        };

        const sortByFrequencyChecked = {
            checked: this.props.chartSort === Constants.CHART_SORT_BY_FREQUENCY
        };
/*
       const barChecked  = {
            checked: this.props.intrinsicsChartType === "bar"
        };
        const lineChecked = {
            checked: this.props.intrinsicsChartType === "line"
        };
*/


        const periodMinDate = moment( this.props.minDate ).format( "YYYY-MM-DD" );
        const periodMaxDate = moment( this.props.maxDate ).format( "YYYY-MM-DD" );

        let brandMessage;

        const chartCommon = (
            <div>
                <Form>
                    <Grid stackable>

                        { /*<FormGroup controlId="intrinsicsByPeriodchartType">*/ }
                        <Grid.Row >

                            <Grid.Column width={5}>
                                <Segment>
                                    <ControlLabel>{ "scale:" }</ControlLabel>
                                    <Radio
                                        inline
                                        key="global"
                                        name="chartScale"
                                        value={ Constants.CHART_SCALE_GLOBAL }
                                        { ...globalChartScaleChecked }
                                        onChange={ this.onChartScaleSelected.bind( this ) }>{ "all charts" }
                                    </Radio>
                                    <Radio
                                        inline
                                        key="local"
                                        name="chartScale"
                                        value={ Constants.CHART_SCALE_LOCAL }
                                        { ...localChartScaleChecked }
                                        onChange={ this.onChartScaleSelected.bind( this ) }
                                        style={ {marginRight: 10} }>{ "per chart" }
                                    </Radio>
                                </Segment>
                            </Grid.Column>
                            <Grid.Column width={5}>

                                { this.props.intrinsicsByPeriodChartType === "brands" ?
                                    <Segment >
												<span>
										<ControlLabel>{ "sort:" }</ControlLabel>
										<Radio
                                            inline
                                            key="byName"
                                            name="chartSort"
                                            value={ Constants.CHART_SORT_BY_NAME }
                                            { ...sortByNameChecked }
                                            onChange={ this.onChartSortSelected.bind( this ) }
                                            style={ {marginRight: 10} }>{ "name" }
										</Radio>
										<Radio
                                            inline
                                            key="byFrequency"
                                            name="chartSort"
                                            value={ Constants.CHART_SORT_BY_FREQUENCY }
                                            { ...sortByFrequencyChecked }
                                            onChange={ this.onChartSortSelected.bind( this ) }>{ "frequency" }
										</Radio>
									</span></Segment> : null }

                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Form>

                <h3>Selected time period: <span
                    style={ {color: "#AAA", fontSize: 12} }>{ `from: ${periodMinDate} to: ${periodMaxDate}` }
							</span>
                </h3>


                <ButtonGroup>
                    <Button
                        active={ this.props.intrinsicsByPeriodDateRange === Constants.DATE_RANGE_1_MONTH }
                        bsSize='small'
                        className={ "item" }
                        onClick={ this.setIntrinsicsByPeriodDateRange.bind( this, Constants.DATE_RANGE_1_MONTH ) }>{ "1 month" }
                    </Button>
                    <Button
                        active={ this.props.intrinsicsByPeriodDateRange === Constants.DATE_RANGE_3_MONTHS }
                        bsSize='small'
                        className={ "item" }
                        onClick={ this.setIntrinsicsByPeriodDateRange.bind( this, Constants.DATE_RANGE_3_MONTHS ) }>{ "3 months" }
                    </Button>
                    <Button
                        active={ this.props.intrinsicsByPeriodDateRange === Constants.DATE_RANGE_6_MONTHS }
                        bsSize='small'
                        className={ "item" }
                        onClick={ this.setIntrinsicsByPeriodDateRange.bind( this, Constants.DATE_RANGE_6_MONTHS ) }>{ "6 months" }
                    </Button>
                    <Button
                        active={ this.props.intrinsicsByPeriodDateRange === Constants.DATE_RANGE_YTD }
                        bsSize='small'
                        className={ "item" }
                        onClick={ this.setIntrinsicsByPeriodDateRange.bind( this, Constants.DATE_RANGE_YTD ) }>{ "Year to date" }
                    </Button>
                    <Button
                        active={ this.props.intrinsicsByPeriodDateRange === Constants.DATE_RANGE_1_YEAR }
                        bsSize='small'
                        className={ "item" }
                        onClick={ this.setIntrinsicsByPeriodDateRange.bind( this, Constants.DATE_RANGE_1_YEAR ) }>{ "1 year" }
                    </Button>
                    { /*<Button active={this.props.intrinsicsByPeriodDateRange === Constants.DATE_RANGE_ALL}*/ }
                    { /*bsSize='small'*/ }
                    { /*className={'item'}*/ }
                    { /*onClick={this.setIntrinsicsByPeriodDateRange.bind(this, Constants.DATE_RANGE_ALL)}>{'All'}</Button>*/ }
                </ButtonGroup>

                <Button
                    bsSize='small'
                    style={ {marginLeft: 10} }
                    className={ "item" }
                    onClick={ this.setIntrinsicsByPeriodDateRange.bind( this, Constants.DATE_RANGE_ALL ) }>{ "All" }
                </Button>

                { brandMessage ?
                    <div style={ {marginTop: "40px", color: "orange"} }>{ brandMessage }</div> :
                    null
                }

                <div style={ {height: "5px"} }/>

           </div>
        );

		switch ( this.props.selectedChart ) {
			case Constants.CHART_TRENDS:
				chart = <IntrinsicTrends/>;
				break;
			case Constants.CHART_LANDSCAPE:
				controls = (
					<Form
						key={ uuidV4() }
						form="form"
						onSubmit={ null }>
						<FormGroup key={ uuidV4() }>
							<ControlLabel key={ uuidV4() }>{ "chart:" }</ControlLabel>
							<Radio
								key={ uuidV4() }
								defaultChecked={ this.props.landscapeChartType === "pie" }
								inline
								value='pie'
								name='landscapeChartType'
								onChange={ this.onLandscapeChartTypeSelected.bind( this ) }>{ "doughnut" }
							</Radio>
							<Radio
								key={ uuidV4() }
								defaultChecked={ this.props.landscapeChartType === "bar" }
								inline
								value='bar'
								name='landscapeChartType'
								onChange={ this.onLandscapeChartTypeSelected.bind( this ) }>{ "bar" }
							</Radio>


						</FormGroup>

						<FormGroup key={ uuidV4() }>
							<ControlLabel>{ "view:" }</ControlLabel>
							<Radio
								key={ uuidV4() }
								defaultChecked={ this.props.landscapeChartView === "all" }
								inline
								value='all'
								name='landscapeChartView'
								onChange={ this.onSetSelectedLandscapeChartViewClicked.bind( this ) }>{ "all intrinsics" }
							</Radio>
							<Radio
								key={ uuidV4() }
								defaultChecked={ this.props.landscapeChartView === "selected" }
								inline
								value='selected'
								name='landscapeChartView'
								onChange={ this.onSetSelectedLandscapeChartViewClicked.bind( this ) }>{ "selected intrinsics" }
							</Radio>
						</FormGroup>
					</Form>
				);
				//chart    = [<LandscapeChart key={uuidV4()} {...chartConfig.attrs}
				//                            data={this.props.landscapeChartView === 'all' ?
				// this.props.chartData_landscape : this.getSelectedIntrinsicValues(selectedIntrinsics,
				// this.props.chartData_landscape)}/>, controls];

				chart = null;

				break;
			case Constants.CHART_BRAND_COMPARISON:

				const hideControls =
						  ( this.props.comparisonChart.type === "brands" && this.props.selectedIntrinsicIds.length < 2 ) ||
						  ( this.props.comparisonChart.type === "intrinsics" && this.props.selectedBrandIds.length < 2 );

				const disableNormalize =
						  ( this.props.comparisonChart.type === "brands" && this.props.selectedBrandIds.length === 1 ) ||
						  ( this.props.comparisonChart.type === "intrinsics" && this.props.selectedIntrinsicIds.length === 1 );

				controls = (
					<Form
						key={ uuidV4() }
						form="form"
						onSubmit={ null }>
						<FormGroup controlId="chartType">
							<ControlLabel>{ "compare:" }</ControlLabel>
							<Radio
								defaultChecked={ this.props.comparisonChart.type === "brands" }
								inline
								name="compare"
								value="brands"
								onChange={ this.onComparisonChartTypeSelected.bind( this ) }>{ "brands" }
							</Radio>
							<Radio
								defaultChecked={ this.props.comparisonChart.type === "intrinsics" }
								inline
								name="compare"
								value="intrinsics"
								onChange={ this.onComparisonChartTypeSelected.bind( this ) }>{ "intrinsics" }
							</Radio>
						</FormGroup>
						<FormGroup hidden={ hideControls }>
							<ControlLabel>{ "options:" }</ControlLabel>
							<Checkbox
								defaultChecked={ this.props.comparisonChart.stacked }
								inline
								onChange={ this.onComparisonChartStackedClicked.bind( this ) }>{ "stack" }
							</Checkbox>
							<span
								hidden={ !this.props.comparisonChart.stacked }
								style={ {marginLeft: 10} }>
								<Checkbox
									disabled={ disableNormalize }
									defaultChecked={ this.props.comparisonChart.normalize }
									inline
									onChange={ this.onComparisonChartNormalizeClicked.bind( this ) }>{ "scale to %100" }
								</Checkbox>
							</span>
						</FormGroup>
					</Form>
				);

				Utils.debugLogger( "chartConfig", chartConfig );

				chart = [ <BrandComparisons
					key={ uuidV4() } { ...chartConfig.attrs }
					data={ this.getComparisonData() }/>, controls ];
				break;
			case Constants.CHART_INTRINSICS_BY_PERIOD: // intrinsics by period
			{

				let i              = 0;
				//let j = 0;
				let dat            = [];
				let allCharts      = [];
				let chartTitle     = "";
				let chartFrequency = null;
				//let key = 0;


				let missingBrandNames = [];

				if ( this.props.intrinsicsByPeriodChartType === "brands" ) {
					let selectedBrandIds         = this.props.selectedBrandIds;
					let dataAvailableForBrandIds = Object.keys( this.props.chartData_intrinsicsByPeriodRawData.brands ).map( id => Number( id ) );
					let missingBrandIds          = _.difference( selectedBrandIds, dataAvailableForBrandIds );

					missingBrandNames = missingBrandIds.map( id => {
						let brandData = _.find( this.props.brandData, function ( brand ) {
							//return o.name === chartTitle;
							return Number( brand.brandId ) === id;
						} );

						return brandData.name;
					} ).sort();

					//console.log('selectedBrandIds,dataAvailableForBrandIds, missingBrandIds', selectedBrandIds,
					// dataAvailableForBrandIds, missingBrandIds, missingBrandNames);
				}




				//brandMessage = <h3>`Could not find data for: ${missingBrandNames.toString()}`<h3/>;
				//    } else {
				//        brandMessage = <h4>Showing all selected brands</h4>;
				//    }

				if ( missingBrandNames.length ) {
					brandMessage = ( <h4>{ "Sorry, no chart data available for these brands: " }<span
						style={ {color: "black"} }>{ missingBrandNames.toString() }
						</span>
					</h4> );
				} else {
					brandMessage = null;
				}

				dat = this.props.chartData_intrinsicsByPeriod.map( chart => {
					return chart;
				} );

				/** sort charts by brand name **/

				dat = _.orderBy( dat, [ "brand", "intrinsic" ], [ "asc", "asc" ] );

				let chartData = [];
				i             = 0;


				let brandId;
				let chartScale        = this.props.chartScale;
				let range             = this.props.intrinsicsByPeriodDateRange;
				let minDate           = this.props.minDate;
				let maxDate           = this.props.maxDate;
				let minVal            = this.props.minVal;
				let maxVal            = this.props.maxVal;
				let interpolationType = this.props.interpolationType;
				let type              = this.props.intrinsicsChartType;
				let brandData         = this.props.brandData;


				dat = this.props.chartData_intrinsicsByPeriodIntrinsicsByBrandTimeSeries;

				if ( this.props.intrinsicsByPeriodChartType === "brands" ) {

					_.forEach( dat, function ( timeSeriesObj ) {

						chartData  = timeSeriesObj;
						chartTitle = chartData.name.split( ":" )[ 0 ];
						brandId    = chartData.name.split( ":" )[ 1 ];


						let brandDataObj = _.find( brandData, function ( o ) {
							return o.brandId === brandId;
						} );

						chartFrequency = _.get( brandDataObj, "frequency", 0 );

						allCharts.push( <IntrinsicsByPeriod
							key={ uuidV4() }
							className="intrinsics-plotly"
							data={ chartData }
							frequency={ chartFrequency }
							chartScale={ chartScale }
							title={ chartTitle }
							range={ range }
							minDate={ minDate }
							maxDate={ maxDate }
							minVal={ minVal }
							maxVal={ maxVal }
							brandData={ brandDataObj }
							brandId={ brandId }
							chartView={ Constants.EVENT_CHART_VIEW_INTRINSICS_BY_BRANDS }
							interpolationType={ interpolationType }
							showEventCharts
							showMinMaxBaseLineCharts
							showEventCharts={ false }
							showZeroBaseLine={ false }
						//	showBrush
							type={ type }/> );

					} );
				} else { // intrinsics

					dat = this.props.chartData_intrinsicsByPeriodBrandsByIntrinsicTimeSeries;

					_.forEach( dat, function ( timeSeriesObj ) {

						chartData  = timeSeriesObj;
						chartTitle = chartData.name.split( ":" )[ 0 ];
						//brandId    = chartData.name.split(':')[1];

						// console.log( "chartData", chartData );

						allCharts.push( <IntrinsicsByPeriod
							key={ uuidV4() }
							className="intrinsics-plotly"
							data={ chartData }
							frequency={ 0 }
							chartScale={ chartScale }
							title={ chartTitle }
							range={ range }
							minDate={ minDate }
							maxDate={ maxDate }
							minVal={ minVal }
							maxVal={ maxVal }
							brandData={ {} }
							brandId={ {} }
							chartView={ Constants.EVENT_CHART_VIEW_BRANDS_BY_INTRINSICS }
							interpolationType={ interpolationType }
							showEventCharts
							showMinMaxBaseLineCharts
							showEventCharts={ false }
							showZeroBaseLine={ false }
						//	showBrush
                            type={ type }/> );
						//} catch (e) {
						//    console.log(e);
						//}

					} );
				}


				allCharts = _.orderBy( allCharts, [ item => {
					return this.props.chartSort === Constants.CHART_SORT_BY_NAME ? item.props.title : item.props.frequency;
				}
				], [ this.props.chartSort === Constants.CHART_SORT_BY_NAME ? "asc" : "desc" ] );


				chart = (
					<div>
                        {chartCommon}

						{ allCharts }

					</div>
				);
			}
				break;
			case Constants.CHART_RADAR: // radar
				chart = <PageRadar/>;
				break;
			case Constants.CHART_SCATTERPLOT:
				chart = ( <ScatterPlotGrid plots={ this.props.chartData_scatterPlot }/> );
				break;
            case Constants.CHART_SENTIMENTCOUNTS_BY_PERIOD:
            case Constants.CHART_POSITIVE_SENTIMENTCOUNTS_BY_PERIOD:
            case Constants.CHART_NEGATIVE_SENTIMENTCOUNTS_BY_PERIOD:
            case Constants.CHART_NEUTRAL_SENTIMENTCOUNTS_BY_PERIOD:
                let allChartsSentiment = [];
                let chartSentimentData = [];
                let chartSentimentTitle = "";
                let chartSentimentscale = this.props.chartScale;
                let rangeSentiment      = this.props.intrinsicsByPeriodDateRange;
                let brandSentimentData  = this.props.brandData;
                let minDate    = this.props.minDate;
                let maxDate    = this.props.maxDate;
                let minVal            = this.props.minVal;
                let maxVal            = this.props.maxVal;
                let interpolationTypeSentiment = this.props.interpolationType;
                let typeSentiment              = this.props.intrinsicsChartType;
                let brandIdSentiment;
                let brandSentimentDataObj;
                let chartFrequency;
                let chartSentimentTotalData = [];
                let chartSentimentTitleData = [];
                let brandIdSentimentData = [];
                let brandSentimentObjData = [];


                let dat = this.props.sentimentCountsByBrandTimeSeries;

                _.forEach(dat, function (sentimentCountSeriesObj) {

                    chartSentimentData = sentimentCountSeriesObj;
                    chartSentimentTotalData.push(chartSentimentData);
                    //chartSentimentData.push(sentimentCountSeriesObj);

                    chartSentimentTitle = chartSentimentData.name.split(":")[0];
                    chartSentimentTitleData.push(chartSentimentTitle);
                    brandIdSentiment = chartSentimentData.name.split(":")[1];
                    brandIdSentimentData.push(brandIdSentiment);


                    brandSentimentDataObj = _.find(brandSentimentData, function (o) {
                        return o.brandId === brandIdSentiment;
                    });
                    brandSentimentObjData.push(brandSentimentDataObj);

                    chartFrequency = _.get(brandSentimentDataObj, "frequency", 0);

                });

                allChartsSentiment.push( <SentimentByPeriod
                    key={ uuidV4() }
                    className="intrinsics-plotly"
                    data={ chartSentimentTotalData }
                    frequency={ chartFrequency }
                    chartScale={ chartSentimentscale }
                    title={ chartSentimentTitleData }
                    range={ rangeSentiment }
                    minDate={ minDate }
                    maxDate={ maxDate }
                    minVal={ minVal }
                    maxVal={ maxVal }
                    brandData={ brandSentimentObjData }
                    brandId={ brandIdSentimentData }
                    chartView={ Constants.EVENT_CHART_VIEW_INTRINSICS_BY_BRANDS }
                    interpolationType={ interpolationTypeSentiment }
                    showEventCharts
                    showMinMaxBaseLineCharts
                    showEventCharts={ false }
                    showZeroBaseLine={ false }
            //        showBrush
                    type={ typeSentiment }/> );

                chart = (
                    <div>
                        {chartCommon}
                        {allChartsSentiment}

                    </div>
                );

                break;

			default:
				break;
		}

		return ( <div>
			{ pageHeading }
			<div
				key={ uuidV4() }
				style={ panelStyle }>
				{ chart }
			</div>
		</div> );
	}
}

// style={panelStyle}

function mapStateToProps( state ) {
	return {

		settings   : state.visualizationData.data.settings,
		loading    : state.loadingBar > 0,
		companyName: state.userData.loginInfo.companyName,
        companyObj:  state.userData.loginInfo,


		/** chart data **/

		chartData_brandsComparison                             : state.visualizationData.data.chart.brandComparisons,
		chartData_brandsWhiteSpace                             : state.visualizationData.data.chart.whiteSpace,
		chartData_intrinsicsWhiteSpace                         : state.visualizationData.data.chart.intrinsicWhiteSpace,
		chartData_intrinsicsComparisons                        : state.visualizationData.data.chart.intrinsicComparisons,
		chartData_intrinsicsByPeriod                           : state.visualizationData.data.chart.intrinsicsByPeriod,
		chartData_intrinsicsByPeriodIntrinsicsByBrandTimeSeries: state.visualizationData.data.chart.intrinsicsByBrandTimeSeries,
		chartData_intrinsicsByPeriodBrandsByIntrinsicTimeSeries: state.visualizationData.data.chart.brandsByIntrinsicsTimeSeries,
		chartData_intrinsicsByPeriodRawData                    : state.visualizationData.data.chart.intrinsicsByPeriodRawData,
		chartData_intrinsicsByPeriodForRadar                   : state.visualizationData.data.chart.intrinsicsByPeriodForRadar,
		chartData_scatterPlot                                  : state.visualizationData.data.chart.scatterPlot,
		minDate                                                : state.visualizationData.data.chart.minDate, // used by
																											 // intrinsics
																											 // by
																											 // period
																											 // chart
		maxDate                                                : state.visualizationData.data.chart.maxDate, // used by
																											 // intrinsics
																											 // by
																											 // period
																											 // chart
		minVal                                                 : state.visualizationData.data.chart.minVal, // used by
		// intrinsics
		// by
		// period
		// chart
		maxVal                                                 : state.visualizationData.data.chart.maxVal, // used by
		// intrinsics
		// by
		// period
		// chart


		/** settings **/

		comparisonChart                         : state.visualizationData.data.settings.comparisonChart,
		intrinsicsByPeriod                      : state.visualizationData.data.settings.intrinsicsByPeriod,
		intrinsicsByPeriodStacked               : state.visualizationData.data.settings.intrinsicsByPeriodStacked,
		intrinsicsByPeriodDateRange             : state.visualization.intrinsicsByPeriodDateRange.range,
		intrinsicsChartType                     : state.visualizationData.data.settings.intrinsicsChartType,
		intrinsicsByPeriodChartType             : state.visualizationData.data.settings.intrinsicsByPeriodChartType,
		landscapeChartType                      : state.visualizationData.data.settings.landscapeChartType,
		chartScale                              : state.visualizationData.data.settings.chartScale,
		chartSort                               : state.visualizationData.data.settings.chartSort,
		landscapeChartView                      : state.visualizationData.data.settings.landscapeChartView,
		navigationType                          : state.visualizationData.data.settings.navigationType,
		radarChartDates                         : state.visualizationData.data.settings.radarChartDates,
		radarChartPeriod                        : state.visualizationData.data.settings.radarChartPeriod,
		radarChartScaled                        : state.visualizationData.data.settings.radarChartScaled,
		radarChartStacked                       : state.visualizationData.data.settings.radarChartStacked,
		radarChartType                          : state.visualizationData.data.settings.radarChartType,
		radarComparisonType                     : state.visualizationData.data.settings.radarComparisonType,
		//
		selectedIntrinsicIds                    : state.visualizationData.data.settings.selectedIntrinsicIds,
		selectedBrandIds                        : state.visualizationData.data.settings.selectedBrandIds,
		//
		selectedChart                           : state.visualizationData.data.settings.selectedChart,
		selectionType                           : state.visualizationData.data.settings.selectionType,
		chartConfig                             : state.visualizationData.data.settings.chartConfig,
		selectedCategory                        : state.visualizationData.data.settings.selectedCategory,
		intrinsicsByPeriodChartInterpolationType: state.visualizationData.data.settings.intrinsicsByPeriodChartInterpolationType,
		// brandData                               : state.visualizationData.data.settings.brandData,
		brandData                               : state.category.brandByIdAllBrandsMap,
        topicsData                              : _.get( state, "visualizationData.topicsData", [] ),
		allIntrinsicsMapInverted                : _.get( state, "category.categoryData.intrinsics.allIntrinsicsMapInverted", {} ),

        // sentiment counts
        sentimentCountsByBrandTimeSeries        : state.visualizationData.data.chart.sentimentCountsByBrandTimeSeries
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
	setChartSort,
    //getTopicSentimentCounts
} )( PageVisualize );
