import React, { Component, PropTypes }                                                 from "react";
import { ControlLabel, Media, OverlayTrigger, Panel, Popover, Radio } from "react-bootstrap";
import { BootstrapTable, TableHeaderColumn }                                           from "react-bootstrap-table";
import ReactImageFallback                                                              from "react-image-fallback";
import { connect }                                                                     from "react-redux";
import { Sparklines, SparklinesBars, SparklinesLine, SparklinesReferenceLine }         from "react-sparklines";
import { Form, Segment, Label } from "semantic-ui-react";

import uuidV4                                                                          from "uuid/v4";
import { setTimePeriodforTrends }                                                      from "../../actions/actions";


class IntrinsicTrends extends Component {

	static contextTypes = {
		router: PropTypes.object
	};


	makeSpark( cell, row ) {   // String example
		return (
			<Sparklines data={ cell }
						svgHeight={ 40 }
						svgWidth={ 500 }>
				<SparklinesLine style={ {stroke: "6cb2fb", fill: "6cb2fb", fillOpacity: ".25"} }/>
			</Sparklines>
		);
	}

	makePercent( cell, row ) {

		let strColor  = "";
		let arrowType = "fa-caret-up";

		if ( cell > 0 ) {
			strColor = "#007f00";
		} else {
			if ( cell < 0 ) {
				strColor  = "#BB0000";
				arrowType = "fa-caret-down";
			} else {
				strColor  = "gray";
				arrowType = "fa-arrows-h";
			}
		}

		return (
			<div style={ {marginTop: 15} }>
				<i className={ `fa ${arrowType} fa-2x` }
				   style={ {color: strColor} }
				   aria-hidden="true"></i>
			</div>
		);
	}

	makeIntrinsic( intrinsicId, row ) {

		const str = this.props.allIntrinsicsMapInverted[ intrinsicId ]; // remove percentage

		return (
			<span style={ {color: "black"} }>{ str }</span>
		);
	}

	handleClick( period ) {
		this.props.setTimePeriodforTrends( this.props.selectedCategory.id, period );
	}


	render() {

		if ( this.props.loading > 0 ) {
			return ( <div>Loading...</div> );
		}

		const options = {
			defaultSortName : "percentChange",
			defaultSortOrder: "desc"
		};

		const logoContainerStyle = {
			width: 300
		};

		const logoStyle = {
			objectFit: "contain",
			width    : 50,
			height   : 50,
			marginTop: 5
		};

		const panelTitleStyle = {
			paddingTop : "0px",
			paddingLeft: "15px",
			textAlign: "left"
		};


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

		const brandId = this.props.selectedBrandIds.length ? this.props.selectedBrandIds[ 0 ] : "";
		const brandName = this.props.allBrandsIdToNameMap[ brandId ];
		const src = this.props.brandByIdAllBrandsMap[ brandId].logo;
		const description = this.props.brandByIdAllBrandsMap[ brandId].description;
		const homepage = this.props.brandByIdAllBrandsMap[ brandId].homepage;

		const popoverHoverFocus = (
			<Popover id="popover-trigger-hover-focus"
					 title={ brandName }>
				{ description || "Sorry, no description available." }
			</Popover>
		);

		const brandsHeader = (
			<Label attached={"top"}>
				<Media>
					<Media.Left style={ logoContainerStyle }>
						<OverlayTrigger trigger={ [ "hover", "focus" ] }
										placement="right"
										overlay={ popoverHoverFocus }>
							<ReactImageFallback src={ src }
												fallbackImage={ emptySVG( this.props.brandColors[ Number( brandId ) ], brandName || "" ) }
												alt="logo"
												style={ logoStyle }/>
						</OverlayTrigger>

					</Media.Left>
					<Media.Body style={ panelTitleStyle }>
						<a id="chart-title"
						   href={ homepage }
						   target="_blank"
						   rel='noopener noreferrer'>{ brandName }</a>
					</Media.Body>
				</Media>
			</Label>
		);

		return (
			<Segment>
				{ brandsHeader }
				{/*<Panel style={ {maxWidth: 746} }>*/}
				<div id="trendsController">
					<Form>
						<Form.Group inline key={ uuidV4() }>
							<ControlLabel>{ "period:" }</ControlLabel>
							<Radio inline
								   key={ uuidV4() }
								   name="period"
								   defaultChecked={ this.props.trendsChartPeriod[ this.props.selectedCategory.id ].period === "weekly" }
								   onClick={ this.handleClick.bind( this, "weekly" ) }>weekly</Radio>
							<Radio inline
								   key={ uuidV4() }
								   name="period"
								   defaultChecked={ this.props.trendsChartPeriod[ this.props.selectedCategory.id ].period === "monthly" }
								   onClick={ this.handleClick.bind( this, "monthly" ) }>monthly
							</Radio>
							<Radio inline
								   key={ uuidV4() }
								   name="period"
								   defaultChecked={ this.props.trendsChartPeriod[ this.props.selectedCategory.id ].period === "quarterly" }
								   onClick={ this.handleClick.bind( this, "quarterly" ) }>quarterly</Radio>
							<Radio inline
								   key={ uuidV4() }
								   name="period"
								   defaultChecked={ this.props.trendsChartPeriod[ this.props.selectedCategory.id ].period === "yearly" }
								   onClick={ this.handleClick.bind( this, "yearly" ) }>yearly</Radio>
							<span style={ {
								marginLeft: 10,
								marginTop : 3,
								position  : "relative",
								top       : 1
							} }>{ this.props.trendsChartPeriod[ this.props.selectedCategory.id ].period === "yearly" ? "(data from all years)" : "(data from last 12 months)" }</span>
						</Form.Group>
					</Form>
				</div>
					<BootstrapTable data={ this.props.chartData_intrinsicsByPeriodForTrends }
									bordered={ false }
									condensed
									tableStyle={ {border: "none"} }
									options={ options }>

						<TableHeaderColumn isKey
										   dataField='name'
										   headerAlign='left'
										   dataAlign='left'
										   dataFormat={ this.makeIntrinsic.bind( this ) }
										   dataSort={ true }>intrinsic
						</TableHeaderColumn>

						<TableHeaderColumn dataField='percentChange'
										   headerAlign='center'
										   dataAlign='center'
										   dataSort={ true }
										   hidden={ false }
										   dataFormat={ this.makePercent }>movement</TableHeaderColumn>

						<TableHeaderColumn dataField='values'
										   headerAlign='center'
										   dataAlign='center'
										   width="500"
										   dataFormat={ this.makeSpark }>chart
						</TableHeaderColumn>

					</BootstrapTable>
				{/*</Panel>*/}
			</Segment>
		);
	}
}

function mapStateToProps( state ) {
	return {
		brandByIdAllBrandsMap                : state.category.brandByIdAllBrandsMap,
		intrinsicColors                      : _.get( state, "category.categoryData.intrinsics.colors", [] ),
		brandColors                          : _.get( state, "category.categoryData.brands.colors", [] ),
		settings                             : state.visualizationData.data.settings,
		selectedCategory                     : state.visualizationData.data.settings.selectedCategory,
		selectedCategoryTitle                : state.visualizationData.data.settings.selectedCategory.title,
		selectedBrandIds                     : state.visualizationData.data.settings.selectedBrandIds,
		trendsChartPeriod                    : state.visualizationData.data.settings.trendsChartPeriod,
		chartData_intrinsicsByPeriodForTrends: state.visualizationData.data.chart.intrinsicsByPeriodForTrends,
		allIntrinsicsMapInverted             : state.category.categoryData.intrinsics.allIntrinsicsMapInverted,
		allBrandsIdToNameMap                 : state.category.categoryData.brands.allBrandsMapInverted,
		allIntrinsicsMap                     : state.category.categoryData.intrinsics.allIntrinsicsMap
	};
}

export default connect( mapStateToProps, {setTimePeriodforTrends} )( IntrinsicTrends );
