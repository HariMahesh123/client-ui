/* eslint-disable indent */
import { Radar }            from "react-chartjs-2"; // https://www.npmjs.com/package/react-chartjs-2
import React, { Component } from "react";
import { connect }          from "react-redux";
import { Col, Grid, Row }   from "react-bootstrap";
import Legend               from "../shared/legend";
import _                    from "lodash";
import moment               from "moment";
import Slider               from "nw-react-slider";

class RadarChart extends Component {


	constructor( props ) {
		super( props );

		this.state              = {value: 0};
		this.handleSliderChange = this.handleSliderChange.bind( this );

		// Bind callback methods to make `this` the correct context.
	}


	handleSliderChange( value ) {
		this.setState( {value: value} );
	}

	render() {

		const tension = 0.2;
		let labels    = [];
		let error     = false;


		let items = this.props.view === "intrinsics" ? this.props.data.intrinsicsByBrandTimeSeries : this.props.data.brandsByIntrinsicsTimeSeries; // brands or intrinsics depending on setting
		// let items = this.props.view === "intrinsics" ? this.props.data.intrinsicsByBrandTimeSeriesPctChange : this.props.data.brandsByIntrinsicsTimeSeriesPctChange; // brands or intrinsics depending on setting

		if ( !items.length ) {
			return ( <div>{ "No data." }</div> );
		}

		// create a dataset for each item

		items = _.filter( items, item => item !== "relic_date" );
		items = _.filter( items, item => item !== "filter" );


		labels = items[ 0 ].columns.slice( 1 ).map( item => item.split( ":" )[ 0 ] ); // get the labels from the timeseries columns

		let maxPoints = items[ 0 ].points.length;

		const dates = items[ 0 ].points.map( ( pointArray, idx ) => {
			return ( {value: idx, label: moment( pointArray[ 0 ] ).format( "YYYY-MM-DD" )} );
		} );

		let selectedDate = "";

		let datasets = items.map( ( item, idx ) => {

			const id = item.name.split( ":" )[ 1 ];

			// console.log("id", id);

			function hexToRGB( hex, alpha ) {

				const r = parseInt( hex.slice( 1, 3 ), 16 );
				const g = parseInt( hex.slice( 3, 5 ), 16 );
				const b = parseInt( hex.slice( 5, 7 ), 16 );

				if ( alpha ) {
					return `rgba(${r}, ${g}, ${b}, ${alpha})`;
				} else {
					return `rgba(${r}, ${g}, ${b})`;
				}
			}

			let dataset                       = {};
			dataset.tension                   = tension;
			dataset.label                     = item.name.split( ":" )[ 0 ];
			// dataset.backgroundColor           = Constants.colors[ ( this.props.stacked ? idx : this.props.idx ) % Constants.colors.length ];
			dataset.backgroundColor           = this.props.view === "intrinsics" ? hexToRGB( this.props.brandColors[ Number( id ) ], 0.5 ) : hexToRGB( this.props.intrinsicColors[ id ], 0.5 );
			dataset.borderWidth               = "1px";
			dataset.borderColor               = "#999999";
			dataset.pointBackgroundColor      = "rgba(179,181,198,1)";
			dataset.pointBorderColor          = "#fff";
			dataset.pointHoverBackgroundColor = "#fff";
			dataset.pointHoverBorderColor     = "rgba(179,181,198,1)";
			dataset.pointRadius               = 2;
			dataset.data                      = item.points[ this.state.value ].slice( 1 ).map( val => Number( val.toFixed( 3 ) ) );


			selectedDate = moment( item.points[ this.state.value ][ 0 ] ).format( "YYYY-MM-DD" );

			return dataset;
		} );


		const chartData = {
			labels  : labels, // vertices
			datasets: datasets
		};

		const ticksConfig = this.props.scaled ? {
				beginAtZero: true,
				callback   : function ( value ) {
					{
						// return ( value ).toFixed( 3 );
						return "";
					}
				}
				// min: 0,
				// max: 1.0
			} :
			{
				beginAtZero: true,
				callback   : function ( value ) {
					{
						return ( value ).toFixed( 1 );
					}
				},
				min        : 0,
				max        : 1.0
			};


		function myLegendCallback( chart ) {
			// console.log( "myLegendCallback", chart );
		}

		const options = {
			animation          : false,
			maintainAspectRatio: false,
			responsive         : true,
			legendCallback     : myLegendCallback,
			scale              : {
				lineArc: false,
				ticks  : ticksConfig
			},
			title              : {
				display: true,
				text   : this.props.title
			},
			scaleLabel         : {
				fontSize : 16,
				fontColor: "#FF0000"
			},
			pointLabels        : {
				fontSize: 18
			},
			ticks              : {
				fontSize: 14
			},
			legend             : {
				display : true,
				position: "left",
				padding : 60,
				labels  : {
					fontColor: "rgb(0,0,0)"
				}
			}
		};

		const legendData = datasets.map( o => {
			return {
				color: o.backgroundColor,
				label: o.label
			};
		} );

		const cols = this.props.stacked ? 9 : 12;
		// const cols = 13;

		const legend = this.props.stacked ?
			(
				<Col md={ 3 }>
					<Legend
						data={ legendData }
						reverse
						sort={ false }/>
				</Col>
			) : null;


		let value = this.state.value;

		return (
			error ?
				null :
				<Grid style={ {maxWidth: 1200, marginLeft: 0} }>
					<Row>
						<Col md={ cols }>
							<Radar
								data={ chartData }
								options={ options }
								height={ this.props.height }
								width={ this.props.height }
								redraw/>
						</Col>
					</Row>
					<Row>
						<Col md={ cols }>
							<div style={ {
								textAlign: "center",
								marginBottom: "20px"
							} }>{ `selected date: ${selectedDate}` }</div>
							<Slider
								value={ this.state.value }
								min={ 0 }
								max={ maxPoints - 1 }
								ticks
								// displayFollowerPopover
								// markerLabel={dates}
								// markers={[{value: 3, label: 'Three'}, {value: 8, label: 'Eight'}]}
								onChange={ this.handleSliderChange }

							/>
						</Col>
					</Row>
				</Grid>
		);
	}
}

function mapStateToProps( state ) {
	return {
		allBrandsIdToNameMap    : _.get( state, "category.categoryData.brands.allBrandsMapInverted", {} ),
		allIntrinsicsIdToNameMap: _.get( state, "category.categoryData.intrinsics.allIntrinsicsMapInverted", {} ),
		brandColors             : _.get( state, "category.categoryData.brands.colors", [] ),
		intrinsicColors         : _.get( state, "category.categoryData.intrinsics.colors", [] )
	};
}


RadarChart = connect( mapStateToProps, {} )( RadarChart );


export default RadarChart;