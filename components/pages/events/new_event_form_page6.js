import React, { Component }                                                     from "react";
import { connect }                                                              from "react-redux";
import { change, reduxForm }                                                    from "redux-form";
import { Button, Divider, Form, Header, Icon }                                  from "semantic-ui-react";
import { addPublication, createEvent, deletePublication, fetchProducts, login } from "../../../actions/actions";
import AdminForm                                                                from "../../../forms/AdminForm";
import { BootstrapTable }                                                       from "react-bootstrap-table";
import isFQDN                                                                   from "validator/lib/isFQDN";


// import BootstrapTable                          from "react-bootstrap-table-next";


function validate( values ) {
	const errors = {};

	if ( !values.eventName ) {
		errors.eventName = "* required";
	}

	if ( !values.description ) {
		errors.description = "* required";
	}

	return errors;
}


class NewEventFormPage6 extends Component {

	handleInsertButtonClick  = ( onClick ) => {
		// Custom your onClick event here,
		// it's not necessary to implement this function if you have no any process before onClick
		// console.log( "This is my custom function for InserButton click event" );
		onClick();
	};
	createCustomInsertButton = ( onClick ) => {
		return (
			<InsertButton
				btnText='Add'
				btnContextual='btn-warning'
				className='my-custom-class'
				btnGlyphicon='glyphicon-edit'
				onClick={ () => this.handleInsertButtonClick( onClick ) }/>
		);
	};

	constructor( props ) {
		super( props );

		// Bind callback methods to make `this` the correct context.
		this.handleBrandIdListChange     = this.handleBrandIdListChange.bind( this );
		this.handleIntrinsicIdListChange = this.handleIntrinsicIdListChange.bind( this );
	}

	beforeSave( e ) {
	}

	componentWillMount() {
		// console.log( "cwm:", this.props );
	}

	handleBrandIdListChange( event, newValue, previousValue ) {

		const selectedBrandIds     = _.filter( newValue, ( val ) => val !== "" );
		const selectedIntrinsicIds = _.filter( this.props.selectedIntrinsicIds, ( val ) => val !== "" );

		if ( selectedBrandIds.length ) {
			this.props.fetchProducts( this.props.selectedCategoryId, selectedBrandIds, selectedIntrinsicIds );
		}
	}

	handleSave( save ) {
		console.log( "handleSave", save );
	}

	handleIntrinsicIdListChange( event, newValue, previousValue ) {

		const selectedIntrinsicIds = _.filter( newValue, ( val ) => val !== "" );
		const selectedBrandIds     = _.filter( this.props.selectedBrandIds, ( val ) => val !== "" );

		if ( selectedBrandIds.length ) {
			this.props.fetchProducts( this.props.selectedCategoryId, selectedBrandIds, selectedIntrinsicIds );
		}
	}

	onAfterDeleteRow( rowKeys ) {

		if ( rowKeys.length ) {
			this.props.deletePublication( rowKeys[ 0 ] );
		}
	}

	render() {

		function domainValidator( value, row ) {
			return ( isFQDN( value ) || "invalid domain name" );
		}

		// const isAdmin = this.props.user.authorizationRole === Constants.PREDICTA_ADMIN || this.props.user.authorizationRole === Constants.PREDICTA_DEVELOPER;
		const isAdmin = false;

		const {
				  previousPage
			  } = this.props;

		const {handleSubmit, pristine, submitting} = this.props;

		function onRowSelect( row, isSelected, e ) {

			let allSelected = [].concat( this.refs.bsTable.state.selectedRowKeys );

			if ( isSelected ) {
				allSelected.push( row.id );
			} else {
				allSelected = _.filter( allSelected, id => id !== row.id );
			}

			this.props.dispatch( change( "newEventForm", "publicationLocationList", allSelected.map( id => String( id ) ) ) );
		}

		function onSelectAll( isSelected, rows ) {

			const publicationLocationList = isSelected ? rows.map( o => o.id ) : [];

			this.props.dispatch( change( "newEventForm", "publicationLocationList", publicationLocationList.map( id => String( id ) ) ) );
		}

		function onAfterInsertRow( row ) {
			this.props.addPublication( row.display_name, row.domain_name, false );
		}

		const selectRowProp = {
			mode            : "checkbox",
			bgcolor         : "red",
			onSelect        : onRowSelect.bind( this ),
			onSelectAll     : onSelectAll.bind( this ),
			showOnlySelected: true,
			selected        : this.props.publicationLocationList.map( id => Number( id ) )
		};

		const options = {
			defaultSortName     : "display_name",
			defaultSortOrder    : "asc",
			hideSizePerPage     : true,
			sizePerPage         : 7,
			paginationShowsTotal: true,
			afterDeleteRow      : this.onAfterDeleteRow.bind( this ),  // A hook for after droping rows.
			// insertModalHeader   : this.createCustomModalHeader,
			// insertModalFooter   : this.createCustomModalFooter,
			// insertBtn           : this.createCustomInsertButton,
			afterInsertRow      : onAfterInsertRow.bind( this )   // A hook for after insert rows

		};

		return (
			<AdminForm id="new-event-panel">
				<Form onSubmit={ handleSubmit } style={ {maxHeight: "488px"} }>

					<Header style={ {fontFamily: "Roboto"} }>{ "Publications: [6 of 6]" }</Header>
					<Divider/>

					<Form.Field>

						<BootstrapTable
							ref={ "bsTable" }
							data={ this.props.publications }
							insertRow={ true }
							options={ options }
							selectRow={ selectRowProp }
							condensed
							deleteRow={ isAdmin }
							hover={ true }
							scrollTop={ "Top" }
							maxHeight={ 600 }
							search={ true }
							multiColumnSearch={ true }
							// cellEdit={ cellEditProp }
							pagination={ true }
						>
							<TableHeaderColumn dataField="id"
											   hidden={ true }
											   hiddenOnInsert={ true }
											   dataAlign="left"
											   isKey={ true }
											   autoValue={ true }
											   tdStyle={ {width: "auto"} }
											   thStyle={ {width: "auto"} }
											   dataSort={ false }>id</TableHeaderColumn>

							<TableHeaderColumn dataField="display_name"
											   hidden={ false }
											   hiddenOnInsert={ false }
											   dataAlign="left"
											   isKey={ false }
											   tdStyle={ {width: "auto"} }
											   thStyle={ {width: "auto"} }
											   dataSort={ false }>name</TableHeaderColumn>

							<TableHeaderColumn dataField="domain_name"
											   hidden={ false }
											   hiddenOnInsert={ false }
											   dataAlign="left"
											   isKey={ false }
											   editable={ {validator: domainValidator} }
											   tdStyle={ {width: "auto"} }
											   thStyle={ {width: "auto"} }
											   dataSort={ false }>domain</TableHeaderColumn>

						</BootstrapTable>

					</Form.Field>

					<Form.Field id="event-buttons">
						<Form.Group>
							{ /*{closeButton}*/ }
							<Button type="button" className="previous" onClick={ previousPage } icon>
								<Icon name='left arrow'/>
								{ "Previous" }
							</Button>
							<Button positive type="submit" disabled={ submitting }>
								{ "Save" }
							</Button>
						</Form.Group>
					</Form.Field>

				</Form>

			</AdminForm>
		);
	}
}

function mapStateToProps( state ) {
	return {
		user                   : state.userData.loginInfo,
		selectedCategoryId     : state.category.categoryData.selectedCategoryId,
		intrinsicIdListOptions : _.get( state, "category.categoryData.intrinsics.intrinsicsSelectorOptions", [] ),
		brandIdListOptions     : _.get( state, "category.categoryData.brands.brandsSelectorOptions", [] ),
		publications           : _.get( state, "category.categoryData.publications", [] ),
		selectedIntrinsicIds   : _.get( state, "form.newEventForm.values.intrinsicIdList", [] ),
		selectedBrandIds       : _.get( state, "form.newEventForm.values.brandIdList", [] ),
		selectedProductIds     : _.get( state, "form.newEventForm.values.productIdList", [] ),
		publicationLocationList: _.get( state, "form.newEventForm.values.publicationLocationList", [] ),
		productSelectorOptions : _.get( state, "products.data.selectorOptions", [] )
	};
}

NewEventFormPage6 = reduxForm( {
	form                    : "newEventForm",  // a unique identifier for this form
	destroyOnUnmount        : false, //        <------ preserve form data
	forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
	validate
} )( NewEventFormPage6 );

NewEventFormPage6 = connect( mapStateToProps, {
	login,
	createEvent,
	fetchProducts,
	addPublication,
	deletePublication
} )( NewEventFormPage6 );

export default NewEventFormPage6;