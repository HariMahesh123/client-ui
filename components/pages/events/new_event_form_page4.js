import React, { Component }                    from "react";
import { connect }                             from "react-redux";
import { change, reduxForm }                   from "redux-form";
import { Button, Divider, Form, Header, Icon } from "semantic-ui-react";
import { createEvent, fetchProducts, login }   from "../../../actions/actions";
import AdminForm                               from "../../../forms/AdminForm";
import { BootstrapTable }                      from "react-bootstrap-table";


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


class NewEventFormPage4 extends Component {

	constructor( props ) {
		super( props );

		// Bind callback methods to make `this` the correct context.
		this.handleBrandIdListChange     = this.handleBrandIdListChange.bind( this );
		this.handleIntrinsicIdListChange = this.handleIntrinsicIdListChange.bind( this );
	}


	componentWillMount() {
		if ( this.props.selectedBrandIds.length ) {
			this.props.fetchProducts( this.props.selectedCategoryId, this.props.selectedBrandIds, this.props.selectedIntrinsicIds );
		}
	}


	handleBrandIdListChange( event, newValue, previousValue ) {

		const selectedBrandIds     = _.filter( newValue, ( val ) => val !== "" );
		const selectedIntrinsicIds = _.filter( this.props.selectedIntrinsicIds, ( val ) => val !== "" );

		if ( selectedBrandIds.length ) {
			this.props.fetchProducts( this.props.selectedCategoryId, selectedBrandIds, selectedIntrinsicIds );
		}
	}

	handleIntrinsicIdListChange( event, newValue, previousValue ) {

		const selectedIntrinsicIds = _.filter( newValue, ( val ) => val !== "" );
		const selectedBrandIds     = _.filter( this.props.selectedBrandIds, ( val ) => val !== "" );

		if ( selectedBrandIds.length ) {
			this.props.fetchProducts( this.props.selectedCategoryId, selectedBrandIds, selectedIntrinsicIds );
		}
	}

	render() {

		const {
				  previousPage
			  } = this.props;

		const {handleSubmit, pristine, submitting} = this.props;

		function onRowSelect( row, isSelected, e ) {

			let allSelected = [].concat( this.refs.bsTable.state.selectedRowKeys );

			if ( isSelected ) {
				allSelected.push( row.key );
			} else {
				allSelected = _.filter( allSelected, id => id !== row.key );
			}

			this.props.dispatch( change( "newEventForm", "brandIdList", allSelected ) );
		}

		function onSelectAll( isSelected, rows ) {

			const brandIdList = isSelected ? rows.map( o => o.key ) : [];

			this.props.dispatch( change( "newEventForm", "brandIdList", brandIdList ) );
		}

		const selectRowProp = {
			mode            : "checkbox",
			bgcolor         : "red",
			onSelect        : onRowSelect.bind( this ),
			onSelectAll     : onSelectAll.bind( this ),
			showOnlySelected: true,
			selected        : this.props.selectedBrandIds
		};

		const options = {
			defaultSortName     : "text",
			defaultSortOrder    : "asc",
			hideSizePerPage     : true,
			sizePerPage         : 7,
			paginationShowsTotal: true
		};

		return (
			<AdminForm id="new-event-panel">
				<Form onSubmit={ handleSubmit } style={ {maxHeight: "488px"} }>

					<Header style={ {fontFamily: "Roboto"} }>{ "Brands: [4 of 6]" }</Header>
					<Divider/>

					<Form.Field>

						<BootstrapTable
							ref={ "bsTable" }
							data={ this.props.brandIdListOptions }
							options={ options }
							selectRow={ selectRowProp }
							condensed
							afterDeleteRow={ this.onAfterDeleteRow }
							hover={ true }
							scrollTop={ "Top" }
							maxHeight={ 600 }
							search={ true }
							multiColumnSearch={ true }
							pagination={ true }
						>
							<TableHeaderColumn dataField="key"
											   hidden={ true }
											   hiddenOnInsert={ true }
											   dataAlign="left"
											   isKey={ true }
											   tdStyle={ {width: "30px"} }
											   thStyle={ {width: "30px"} }
											   dataSort={ false }>id</TableHeaderColumn>
							<TableHeaderColumn dataField="text"
											   hidden={ false }
											   hiddenOnInsert={ true }
											   dataAlign="left"
											   isKey={ false }
											   tdStyle={ {width: "2000px"} }
											   thStyle={ {width: "2000px"} }
											   dataSort={ false }>brands</TableHeaderColumn>
						</BootstrapTable>

					</Form.Field>

					<Form.Field id="event-buttons">
						<Form.Group>
							<Button type="button" className="previous" onClick={ previousPage } icon>
								<Icon name='left arrow'/>
								{ "Previous" }
							</Button>
							<Button type="submit" className="next" onSubmit={ this.props.onSubmit } icon disabled={!this.props.selectedBrandIds.length}>
								{ "Next" }
								<Icon name='right arrow'/>
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
		selectedCategoryId    : state.category.categoryData.selectedCategoryId,
		intrinsicIdListOptions: state.category.categoryData.intrinsics.intrinsicsSelectorOptions,
		brandIdListOptions    : state.category.categoryData.brands.brandsSelectorOptions,
		selectedIntrinsicIds  : _.get( state, "form.newEventForm.values.intrinsicIdList", [] ),
		selectedBrandIds      : _.get( state, "form.newEventForm.values.brandIdList", [] ),
		productSelectorOptions: _.get( state, "products.data.selectorOptions", [] )
	};
}

NewEventFormPage4 = reduxForm( {
	form                    : "newEventForm",  // a unique identifier for this form
	destroyOnUnmount        : false, //        <------ preserve form data
	forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
	validate
} )( NewEventFormPage4 );

NewEventFormPage4 = connect( mapStateToProps, {login, createEvent, fetchProducts} )( NewEventFormPage4 );

export default NewEventFormPage4;