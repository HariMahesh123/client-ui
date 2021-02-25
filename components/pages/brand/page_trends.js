import _                                                  from "lodash";
import React, { Component }                               from "react";
import { connect }                                        from "react-redux";
import uuidV4                                             from "uuid/v4";
import { getEvents, setNavigationType, setSelectedChart } from "../../../actions/actions";
import * as Constants                                     from "../../../constants";
import * as Utils                                         from "../../../utils";
import IntrinsicTrends                                    from "../../charts/intrinsic_trends";
import PageHeading                                        from "../../shared/page_heading";

class PageTrends extends Component {
	// get access to router from parent component
	// static contextTypes = {
	// 	router: PropTypes.object
	// };

	constructor( ...args ) {
		super( ...args );
		this.state = {
			interpolationType: "curveCatmullRom"
		};
	}

	componentWillMount() {
		Utils.debugLogger( "componentWillMount" );
		if ( this.props.navigationType !== "trends" ) {
			this.props.setNavigationType( "trends" );
			this.props.setSelectedChart( Constants.CHART_TRENDS );
		}

		if ( _.get( this.props, "companyName" ) && _.get( this.props, "selectedCategory.id" ) ) {
			this.props.getEvents( this.props.companyName, this.props.selectedCategory.id );
		}
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

		let chartConfig = null;

		const pageHeading = (
			<div>
				<PageHeading title={ `Trends: ${this.props.selectedCategory.title}` }/>
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

		chart = <IntrinsicTrends/>;


		const tmp =
				  (
					  <div>
						  { pageHeading }
						  <div
							  key={ uuidV4() }
							  style={ panelStyle }>
							  { chart }
						  </div>
					  </div>
				  );

		return tmp;
	}
}

function mapStateToProps( state ) {
	return {


		loading    : state.loadingBar > 0,
		companyName: state.userData.loginInfo.companyName,
		navigationType                          : state.visualizationData.data.settings.navigationType,
		selectedIntrinsicIds                    : state.visualizationData.data.settings.selectedIntrinsicIds,
		selectedBrandIds                        : state.visualizationData.data.settings.selectedBrandIds,
		chartConfig                             : state.visualizationData.data.settings.chartConfig,
		selectedCategory                        : state.visualizationData.data.settings.selectedCategory,
	};
}

export default connect( mapStateToProps, {
	setSelectedChart,
	setNavigationType,
	getEvents
} )( PageTrends );
