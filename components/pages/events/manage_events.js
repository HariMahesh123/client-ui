import _                                                            from "lodash";
import moment                                                       from "moment";
import React, { Component, PropTypes }                              from "react";
import { BootstrapTable, DeleteButton }                             from "react-bootstrap-table";
import { connect }                                                  from "react-redux";
import { Button, Column, Form, Grid, Modal, Row }                   from "semantic-ui-react";
import { Index, TimeRange, TimeRangeEvent, TimeSeries, timeSeries } from "pondjs";
import {
	createEvent, deleteEvent, editEvent, endEditEvent, getEvents, getIntrinsicsByPeriodForEvents,
	updateEvent, getPublications
}                                                                   from "../../../actions/actions";
import * as Constants                                               from "../../../constants";
import BSTable                                                      from "./expanded_event_table";
import NewEventForm                                                 from "./new_event_form";
import IntrinsicsByPeriod                                           from "../../charts/intrinsics_by_period";
import uuidV4                                                       from "uuid/v4";
import * as Utils                                                   from "../../../utils";
import ReactImageFallback                                           from "react-image-fallback";

class ManageEvents extends Component {

	static contextTypes             = {
		router: PropTypes.object
	};
		   createCustomModal        = ( onModalClose, onSave, columns, validateState, ignoreEditable ) => {
			   const attr = {
				   onModalClose, onSave, columns, validateState, ignoreEditable
			   };
			   return (
				   <NewEventForm header={ "Create New Event" } { ...attr } />
			   );
		   };
		   handleOpen               = ( row ) => {
			   // console.log( "row", row );
			   //window.data = row;
			   this.props.editEvent( row );
			   //this.setState({modalOpen: true});
		   };
		   handleClose              = () => {
			   this.props.endEditEvent();
		   };
		   handleDeleteButtonClick  = ( onClick ) => {
			   // Custom your onClick event here,
			   // it's not necessary to implement this function if you have no any process before onClick
			   // console.log( "This is my custom function for DeleteButton click event" );
			   onClick();
		   };
		   createCustomDeleteButton = ( onClick ) => {
			   return (
				   <DeleteButton
					   btnText='Delete Event'
					   btnContextual='btn-warning'
					   className='delete-event-button-class'
					   // btnGlyphicon='glyphicon-delete'
					   onClick={ () => this.handleDeleteButtonClick( onClick ) }/>
			   );
		   };

	constructor( props ) {
		super( props );

		console.log("constructor");

		this.state = {
			modalOpen: false,
			chartView: Constants.EVENT_CHART_VIEW_INTRINSICS_BY_BRANDS,
			// chartView: Constants.EVENT_CHART_VIEW_BRANDS_BY_INTRINSICS,
			selected : [],
			selectedEvent: null
		};

		this.colorPicker = this.colorPicker.bind( this );
		this.editButton  = this.editButton.bind( this );
		this.onRowSelect = this.onRowSelect.bind( this );
		this.makeCharts  = this.makeCharts.bind( this );
	}

	static isExpandableRow( row ) {
		return true;
	}

	static expandComponent( row ) {
		return (
			<BSTable data={ row }/>
		);
	}

	static expandColumnComponent( {isExpandableRow, isExpanded} ) {
		let content = "";
		let style   = {
			marginLeft: 8,
			fontSize  : "18px",
			cursor    : "pointer"
		};

		if ( isExpandableRow ) {
			content = ( isExpanded ? ( <div style={ style }>-</div> ) : ( <div style={ style }>+</div> ) );
		} else {
			content = " ";
		}
		return (
			<div> { content } </div>
		);
	}

	static beforeClose( e ) {
		console.log( "beforeClose", e );
		//alert(`[Custom Event]: Before modal close event triggered!`);
	}

	static handleModalClose( closeModal ) {
		// Custom your onCloseModal event here,
		// it's not necessary to implement this function if you have no any process before modal close
		// console.log( "This is my custom function for modal close event" );
		closeModal();
	}

	componentWillMount() {
		// console.log( "manage_events", this.props );

		this.props.getPublications();
		if ( this.props.events.length === 1 ) {
			this.onRowSelect( this.props.events[ 0 ] );
		}
	}

	beforeSaveCell( data, prop, value ) {

		// TODO: data needs to be cleaned up and perform validation
		if ( value === "" ) return false;

		data[ prop ] = value;

		this.props.updateEvent( data );

		return true;
	}

	onAfterDeleteRow( hashKey ) {
		this.props.deleteEvent( hashKey );
	}

	colorPicker( cell, row ) {

		return (
			<i className="fa fa-circle" aria-hidden="true"
			   style={ {color: ( !!cell ? cell : Constants.EVENT_DEFAULT_COLOR )} }></i>
		);

	}

	newButton( cell, row ) {

		const eventObj = {
			eventName  : `New Event`,
			description: "",
			color      : Constants.EVENT_DEFAULT_COLOR,
			startDate  : moment().format( "YYYY-MM-DD" ),
			endDate    : moment().add( 1, "months" ).format( "YYYY-MM-DD" ),
			resonance  : 0,
			preceding  : 0,
			imageUrl   : ""
		};

		return (
			<Button className="new-event-button-xxx" size={ "mini" } onClick={ this.handleOpen.bind( this, eventObj ) }
					positive>New Event</Button>
		);
	}

	editButton( cell, row ) {
		return (
			<Button size={ "mini" } onClick={ this.handleOpen.bind( this, row ) }>Edit</Button>
		);
	}

	onRowSelect( row, isSelected, e ) {


		const resonance = _.get( row, "resonance", 0 );
		const preceding = _.get( row, "preceding", 0 );


		// add resonance period (months) to endDate
		const end = moment( row.endDate ).add( resonance, "months" ).format( "YYYY-MM-DD" );
		const start = moment( row.startDate ).subtract( preceding, "months" ).format( "YYYY-MM-DD" );

		// console.log("end, resonance, end+resonance", row.endDate, resonance, end);

		const selectedBrandIds     = _.get( row, "brandIdList", [] );
		const selectedIntrinsicIds = this.state.chartView === Constants.EVENT_CHART_VIEW_BRANDS_BY_ALL_INTRINSICS ? this.props.allIntrinsicIds :_.get( row, "intrinsicIdList", [] );

		let filter = {
			selectedBrandIds    : selectedBrandIds.map( o => Number( o ) ),
			selectedIntrinsicIds: selectedIntrinsicIds,
			timeSeries          : {period: "weekly", start: start, end: end}
		};

		if ( selectedBrandIds.length && selectedIntrinsicIds ) {
			this.props.getIntrinsicsByPeriodForEvents( this.props.selectedCategoryId, filter );
		}

		if ( isSelected ) {
			this.setState( {selected: [ row.hashKey ], selectedEvent: row} );
		}
	}

	makeCharts( data ) {


		const length = data.length;

		let column    = 1;
		let rows      = [];
		let row       = [];
		let num       = 0;
		let chartView = this.state.chartView;

		////

		const chartFrequency    = 0;
		const chartScale        = Constants.CHART_SCALE_GLOBAL;
		const range             = "DATE_RANGE_1_YEAR";
		// const interpolationType = "curveBasis";
		const interpolationType = "curveLinear";
		const type              = "line";
		const brandData         = this.props.brandData;
		///

		const selectedEvent = this.state.selectedEvent;

		_.forEach( data, function ( ts ) {

			column = 1 - column;
			num++;

			if ( !column ) {
				row = [];
			}

			let timeSeries = new TimeSeries( ts );
			let timeRange  = timeSeries.timerange();

			let columns = ts.columns.slice( 1 );

			let minVals = [];
			let maxVals = [];

			_.forEach( columns, function ( column ) {
				minVals.push( timeSeries.min( column ) );
				maxVals.push( timeSeries.max( column ) );
			} );

			let minVal = _.min( minVals );
			let maxVal = _.max( maxVals );
			let absVal = _.max( [ Math.abs( minVal ), Math.abs( maxVal ) ] );

			const brandId = Number( ts.name.split( ":" )[ 1 ] );

			row[ column ] = ( <Grid.Column key={ uuidV4() } width={ 6 }><IntrinsicsByPeriod
				key={ uuidV4() }
				className="intrinsics-plotly"
				data={ ts }
				frequency={ chartFrequency }
				chartScale={ chartScale }
				title={ ts.name.split( ":" )[ 0 ] }
				range={ range }
				minDate={ moment( timeRange.begin() ).format( "YYYY-MM-DD" ) }
				maxDate={ moment( timeRange.end() ).format( "YYYY-MM-DD" ) }
				minVal={ -absVal }
				maxVal={ absVal }
				brandData={ brandData[ brandId ] || {} }
				brandId={ brandId }
				chartView={ chartView }
				interpolationType={ interpolationType }
				showEventCharts={ true }
				showZeroBaseLine={ true }
				chartContext={ "events" }
				selectedEvent={selectedEvent}
				yAxisLabel={ "% change" }
				type={ type }/></Grid.Column> );

			const spacer = () => ( <Grid.Column key={ uuidV4() }/> );

			if ( ( column % 2 ) || ( num === length ) ) {

				if ( row.length === 2 ) {
					row.unshift( <Grid.Column key={ uuidV4() }/> );
					row.splice( 2, 0, <Grid.Column key={ uuidV4() }/> );
					row.push( <Grid.Column key={ uuidV4() }/> );
				} else {
					row.unshift( <Grid.Column key={ uuidV4() }/> );
					row.push( <Grid.Column key={ uuidV4() }/> );
				}

				rows.push(
					<Grid.Row key={ uuidV4() }>
						{ row }
					</Grid.Row> );
				row = [];
			}
		} );

		return ( <Grid key={ uuidV4() } columns={ "equal" } stackable relaxed>{ rows }</Grid> );
	}

	render() {


		// let selectedRowKeys = _.get(this.refs, "bsTable.state.selectedRowKeys", []);

		const modal = (
			<Modal
				open={ this.props.isEditing }
				onClose={ this.handleClose }
				closeOnRootNodeClick={ false }
				closeIcon
				// basic
				size='small'
				dimmer={ "inverted" }
				style={ {maxHeight: "652px", width: "800px"} }>

				<Modal.Header>
					{ `Edit Event: ${_.get( this.props.eventObj, "eventName", "(new)" )}` }
				</Modal.Header>

				<Modal.Content>
					<NewEventForm/>
				</Modal.Content>

				<Modal.Actions>
					<Button color='red' onClick={ this.handleClose }>Cancel</Button>
				</Modal.Actions>
			</Modal>

		);

		function dateFormatter( cell, row ) {

			return moment( cell ).format( "YYYY/MM/DD" ).toString();

		}

		function imageFormatter( cell, row ) {


			const logoStyle = {
				objectFit: "contain",
				width    : 60,
				height   : 60
				// marginTop: 5
			};

			const fallBackImage = `https://picsum.photos/60}`;

			function handleError( src ) {
				Utils.debugLogger( "manage_events: can't find image: [" + src + "]" );
			}

			return ( <ReactImageFallback
				src={ ( cell && cell.length ) ? cell : require( "../../../../static/images/predicta-logo.svg" ) }
				fallbackImage={ fallBackImage }
				alt="logo"
				style={ logoStyle }
				onError={ handleError }/> );

		}


		function listFormatter( cell, row ) {

			//console.log('listFormatter', cell);

			if ( _.get( cell, "values" ) ) {
				return cell.values.toString().toLowerCase();
			} else {
				return cell;
			}
		}

		function lowerCaseFormatter( cell, row ) {

			//console.log('lowerCaseFormatter', cell);
			if ( typeof cell === "string" ) {
				return cell.toLowerCase();
			}

		}

		const cellEditProp = {
			// mode: 'dbclick',
			mode          : "click",
			blurToSave    : false,
			beforeSaveCell: this.beforeSaveCell.bind( this )
		};

		const selectRowProp = {
			// mode: 'checkbox',
			mode         : "radio",
			bgcolor      : "red",
			clickToExpand: true,
			onSelect     : this.onRowSelect,
			// selected     : this.props.events.length === 1 ? [ this.props.events[ 0 ].hashKey ] : this.state.selected
			selected     : this.state.selected
			// selected     : []
			// onSelectAll  : onSelectAll
		};

		const colStyle = {
			width: "150px"
		};


		const options = {
			defaultSortName     : "eventName",
			defaultSortOrder    : "asc",
			hideSizePerPage     : true,
			sizePerPage         : 5,
			insertModal         : this.createCustomModal,
			deleteBtn           : this.createCustomDeleteButton,
			afterDeleteRow      : this.onAfterDeleteRow.bind( this ),  // A hook for after droping rows.
			paginationShowsTotal: true

		};


		let chart;

		if ( this.state.chartView === Constants.EVENT_CHART_VIEW_INTRINSICS_BY_BRANDS ) {
			chart = this.props.intrinsicsByBrandTimeSeriesPctChange.length ? this.makeCharts( this.props.intrinsicsByBrandTimeSeriesPctChange ) : null;
		} else {
			chart = this.props.brandsByIntrinsicsTimeSeriesPctChange.length ? this.makeCharts( this.props.brandsByIntrinsicsTimeSeriesPctChange ) : null;
		}

		const table = (
			<div>
				<BootstrapTable
					ref={ "bsTable" }
					data={ this.props.events }
					options={ options }
					selectRow={ selectRowProp }
					condensed
					afterDeleteRow={ this.onAfterDeleteRow }
					//
					insertRow={ false }
					exportCSV={ false }
					// deleteRow={ this.state.selected.length }
					deleteRow={ true }
					//
					striped={ true }
					hover={ true }
					scrollTop={ "Top" }
					maxHeight={ 800 }
					search={ true }
					multiColumnSearch={ true }
					cellEdit={ cellEditProp }
					pagination={ true }
				>


					<TableHeaderColumn dataField="hashKey"
									   hidden={ true }
									   hiddenOnInsert={ true }
									   dataAlign="left"
									   isKey={ true }
									   tdStyle={ {width: "30px"} }
									   thStyle={ {width: "30px"} }
									   dataSort={ false }>id</TableHeaderColumn>

					<TableHeaderColumn dataField="imageUrl"
									   hidden={ false }
									   hiddenOnInsert={ false }
									   dataAlign="center"
									   tdStyle={ colStyle }
									   thStyle={ colStyle }
						// filter={ {type: "TextFilter", delay: 500} }
						// editable={ {type: "text"} }
									   editable={ false }
									   dataFormat={ imageFormatter }
									   dataSort={ true }>image</TableHeaderColumn>

					<TableHeaderColumn dataField="edit"
									   hidden={ false }
									   hiddenOnInsert={ true }
									   dataAlign="center"
									   dataFormat={ this.editButton }
									   thStyle={ {width: "80px"} }
									   tdStyle={ {width: "80px"} }
									   width={ "80px" }
									   editable={ false }
									   dataSort={ false }>{ "" }</TableHeaderColumn>

					<TableHeaderColumn dataField="color"
									   headerAlign='left'
									   dataAlign='center'
									   hidden={ false }
									   expandable={ false }
									   dataFormat={ this.colorPicker }
									   width={ "60px" }
									   thStyle={ {width: "60px"} }
									   tdStyle={ {width: "60px"} }
									   editable={ false }
									   dataSort={ true }>{ "label" }</TableHeaderColumn>

					<TableHeaderColumn dataField="eventName"
									   dataAlign="left"
									   filter={ {type: "TextFilter", delay: 500} }
						// editable={ {type: "text"} }
									   editable={ false }
									   expandable={ false }
									   width={ "260px" }
									   dataSort={ true }>event name</TableHeaderColumn>

					<TableHeaderColumn dataField="startDate"
									   dataAlign="left"
									   hiddenOnInsert={ false }
									   dataFormat={ dateFormatter }
									   editable={ false }
									   dataSort={ true }
									   width={ "200px" }
					>start date</TableHeaderColumn>

					<TableHeaderColumn dataField="endDate"
									   dataAlign="left"
									   hiddenOnInsert={ false }
									   type={ "date" }
									   dataFormat={ dateFormatter }
									   editable={ false }
									   expandable={ false }
									   width={ "200px" }
									   dataSort={ true }>end date</TableHeaderColumn>

					<TableHeaderColumn dataField="email"
									   hidden={ false }
									   hiddenOnInsert={ true }
									   dataAlign="left"
									   tdStyle={ colStyle }
									   thStyle={ colStyle }
									   filter={ {type: "TextFilter", delay: 500} }
									   editable={ false }
									   dataFormat={ lowerCaseFormatter }
									   dataSort={ true }>updated by</TableHeaderColumn>


					<TableHeaderColumn dataField="companyName"
									   hidden={ true }
									   hiddenOnInsert={ true }
									   dataAlign="left"
									   tdStyle={ colStyle }
									   thStyle={ colStyle }
									   filter={ {type: "TextFilter", delay: 500} }
									   editable={ false }
									   dataSort={ true }>company name</TableHeaderColumn>


					<TableHeaderColumn dataField="publicationLocationList"
									   hidden={ true }
									   hiddenOnInsert={ true }
									   dataAlign="left"
									   tdStyle={ colStyle }
									   thStyle={ colStyle }
									   filter={ {type: "TextFilter", delay: 500} }
									   editable={ {type: "text"} }
									   dataFormat={ listFormatter }
									   dataSort={ true }>publicationLocationList</TableHeaderColumn>


					<TableHeaderColumn dataField="description"
									   hidden={ false }
									   dataAlign="left"
									   filter={ {type: "TextFilter", delay: 500} }
									   editable={ {type: "textarea"} }
									   expandable={ false }
									   dataSort={ true }>description</TableHeaderColumn>

					<TableHeaderColumn dataField="categoryId"
									   hiddenOnInsert={ true }
									   hidden={ true }
									   dataAlign="left"
									   tdStyle={ colStyle }
									   thStyle={ colStyle }
									   filter={ {type: "TextFilter", delay: 500} }
									   editable={ false }
									   dataFormat={ lowerCaseFormatter }
									   dataSort={ true }>categoryId</TableHeaderColumn>

					<TableHeaderColumn dataField="resonance"
									   hiddenOnInsert={ true }
									   hidden={ true }
									   dataAlign="left"
									   tdStyle={ colStyle }
									   thStyle={ colStyle }
									   editable={ false }
									   dataSort={ true }>resonance</TableHeaderColumn>


				</BootstrapTable>
			</div> );


		const handleChange = ( e, {value} ) => this.setState( {chartView: value} );

		const controls = (
			(
				<Form>
					<Form.Group inline>
						<label>Compare:</label>
						<Form.Radio
							label='Brands'
							name='chartViewGroup'
							value={ Constants.EVENT_CHART_VIEW_INTRINSICS_BY_BRANDS }
							checked={ this.state.chartView === Constants.EVENT_CHART_VIEW_INTRINSICS_BY_BRANDS }
							onChange={ handleChange }
						/>
						<Form.Radio
							label='Event Intrinsics'
							name='chartViewGroup'
							value={ Constants.EVENT_CHART_VIEW_BRANDS_BY_INTRINSICS }
							checked={ this.state.chartView === Constants.EVENT_CHART_VIEW_BRANDS_BY_INTRINSICS }
							onChange={ handleChange }
						/>
						<Form.Radio
							label='All Intrinsics'
							name='chartViewGroup'
							value={ Constants.EVENT_CHART_VIEW_BRANDS_BY_ALL_INTRINSICS }
							checked={ this.state.chartView === Constants.EVENT_CHART_VIEW_BRANDS_BY_ALL_INTRINSICS }
							onChange={ handleChange }
						/>
					</Form.Group>
				</Form>
			)
		);

		return (
			<div>
				{ this.newButton( null, undefined ) }

				{ modal }
				{ table }
				{ controls }
				{ this.state.selected.length ? chart : null}

			</div>
		);
	}
}

function mapStateToProps( state ) {
	return {
		selectedCategoryId                   : state.category.categoryData.selectedCategoryId,
		brandData                            : _.get( state, "category.categoryData.brands.rawBrandsMap", {} ),
		allIntrinsicIds                      : _.get( state, "category.categoryData.intrinsics.allIntrinsicIds", {} ),
		events                               : state.visualization.events,
		isEditing                            : state.visualization.eventEditing.isEditing,
		eventObj                             : state.visualization.eventEditing.eventObj,
		intrinsicsByBrandTimeSeries          : _.get( state, "visualizationData.events.intrinsicsByBrandTimeSeries", [] ),
		brandsByIntrinsicsTimeSeries         : _.get( state, "visualizationData.events.brandsByIntrinsicsTimeSeries", [] ),
		intrinsicsByBrandTimeSeriesPctChange : _.get( state, "visualizationData.events.intrinsicsByBrandTimeSeriesPctChange", [] ),
		brandsByIntrinsicsTimeSeriesPctChange: _.get( state, "visualizationData.events.brandsByIntrinsicsTimeSeriesPctChange", [] ),
		minVal                               : _.get( state, "visualizationData.events.minVal", 0.0 ),
		maxVal                               : _.get( state, "visualizationData.events.maxVal", 0.0 ),
		minDate                              : _.get( state, "visualizationData.events.minDate", null ),
		maxDate                              : _.get( state, "visualizationData.events.maxDate", null )
	};
}

ManageEvents = connect( mapStateToProps, {
	createEvent,
	updateEvent,
	deleteEvent,
	editEvent,
	endEditEvent,
	getEvents,
	getIntrinsicsByPeriodForEvents,
	getPublications
} )( ManageEvents );

export default ManageEvents;
