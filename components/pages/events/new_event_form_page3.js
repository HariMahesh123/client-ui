import React, { Component }                               from "react";
import { connect }                                        from "react-redux";
import { change, reduxForm }                              from "redux-form";
import { Button, Divider, Form, Header, Icon }            from "semantic-ui-react";
import { createEvent, createTopic, getTopics, fetchProducts, login } from "../../../actions/actions";
import AdminForm                                          from "../../../forms/AdminForm";
import { BootstrapTable }                                 from "react-bootstrap-table";
import * as Constants from "../../../constants";


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


class NewEventFormPage3 extends Component {

	constructor( props ) {
		super( props );

		// Bind callback methods to make `this` the correct context.
		this.handleBrandIdListChange     = this.handleBrandIdListChange.bind( this );
		this.handleIntrinsicIdListChange = this.handleIntrinsicIdListChange.bind( this );
        this.valueIntrinsic = "Global Intrinsics";

	}


	componentWillMount() {
        this.props.getTopics( this.props.selectedCategoryId, this.props.companyName );
		if ( this.props.selectedBrandIds.length ) {
			this.props.fetchProducts( this.props.selectedCategoryId, this.props.selectedBrandIds, this.props.selectedIntrinsicIds );
		}

        if (this.props.navigationType !== "intrinsics_reports" ) {
			this.valueIntrinsic = "Global Intrinsics";
        }
        else {

            this.valueIntrinsic = "Custom Intrinsics";
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

	topicCreateCustomModalHeader = ( closeModal, save ) => {
		return (
			<InsertModalHeader
				title='Add Intrinsic'
			/>
		);
	};


	safeName (name) {
		return name.replace( /[^a-zA-Z0-9_ ]+/g, "" ).trim();
	}

	lowerCaseUnderScoredSafeTopicId (name) {
		return this.safeName(name).replace(/ /g, "_").toLowerCase();
	}

	spaceScoredName (name) {
		return this.safeName(name).replace(/_/g, " ").toLowerCase();
	}

	handleNewTopic( row ) {

        this.setState( {...this.state, terms: []} );
        let filterData = {
            id              : row.text,
            name            :  row.text,
            seededTopicWords: [  row.text ],
            filter          : {
                selectedBrandIds    : null,
                lastEvaluatedKey    : null,
                selectedIntrinsicIds: null,
                perPage : null,
                offset  : null,
                sort    : null,
                verified : null,
                company_id : "default"
            }
        };

        this.props.createTopic( this.props.selectedCategoryId, this.props.companyName, filterData);


		/*this.props.createTopic( this.props.selectedCategoryId, this.props.companyName,
			{
				id              : this.lowerCaseUnderScoredSafeTopicId(row.text),
				name            : row.text,
				seededTopicWords: [ this.spaceScoredName(row.text) ],
                company_id      : "default"
			}
		);*/
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

			this.props.dispatch( change( "newEventForm", "intrinsicIdList", allSelected ) );
		}

		function onSelectAll( isSelected, rows ) {

			const intrinsicIdList = isSelected ? rows.map( o => o.key ) : [];

			this.props.dispatch( change( "newEventForm", "intrinsicIdList", intrinsicIdList ) );
		}

		const selectRowProp = {
			mode            : "checkbox",
			bgcolor         : "red",
			onSelect        : onRowSelect.bind( this ),
			onSelectAll     : onSelectAll.bind( this ),
			showOnlySelected: true,
			selected        : this.props.selectedIntrinsicIds
		};

		const options = {
			defaultSortName     : "text",
			defaultSortOrder    : "asc",
			hideSizePerPage     : true,
			sizePerPage         : 7,
			paginationShowsTotal: true,
			afterInsertRow      : this.handleNewTopic.bind( this ),
			insertModalHeader   : this.topicCreateCustomModalHeader
		};

		return (
			<AdminForm id="new-event-panel">
				<Form onSubmit={ handleSubmit } style={ {maxHeight: "488px"} }>

					<Header style={ {fontFamily: "Roboto"} }>{ "Intrinsics: [3 of 6]" }</Header>
					<Divider/>

					<Form.Field>

						<BootstrapTable
							ref={ "bsTable" }
							insertRow={ (this.valueIntrinsic==="Custom Intrinsics") ? true: false }
							data={ this.props.intrinsicIdListOptions }
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
											   autoValue={true}
											   dataSort={ false }>id</TableHeaderColumn>
							<TableHeaderColumn dataField="text"
											   hidden={ false }
											   hiddenOnInsert={ false }
											   dataAlign="left"
											   isKey={ false }
											   tdStyle={ {width: "2000px"} }
											   thStyle={ {width: "2000px"} }
											   dataSort={ false }>{this.valueIntrinsic}</TableHeaderColumn>
						</BootstrapTable>
					</Form.Field>

					<Form.Field id="event-buttons">
						<Form.Group>
							<Button type="button" className="previous" onClick={ previousPage } icon>
								<Icon name='left arrow'/>
								{ "Previous" }
							</Button>
							<Button type="submit" className="next" onSubmit={ this.props.onSubmit } icon disabled={!this.props.selectedIntrinsicIds.length}>
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
        navigationType        : state.visualizationData.data.settings.navigationType,
		selectedIntrinsicIds  : _.get( state, "form.newEventForm.values.intrinsicIdList", [] ),
		selectedBrandIds      : _.get( state, "form.newEventForm.values.brandIdList", [] ),
		productSelectorOptions: _.get( state, "products.data.selectorOptions", [] ),
        companyName     : state.userData.loginInfo.companyName
    };
}

NewEventFormPage3 = reduxForm( {
	form                    : "newEventForm",  // a unique identifier for this form
	destroyOnUnmount        : false, //        <------ preserve form data
	forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
	validate
} )( NewEventFormPage3 );

NewEventFormPage3 = connect( mapStateToProps, {login, createEvent,getTopics, createTopic, fetchProducts} )( NewEventFormPage3 );

export default NewEventFormPage3;