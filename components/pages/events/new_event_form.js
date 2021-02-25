import React, { Component }                              from "react";
import * as Constants                                    from "../../../constants";
import NewEventFormFirstPage                             from "./new_event_form_page1";
import NewEventFormSecondPage                            from "./new_event_form_page2";
import NewEventFormThirdPage                             from "./new_event_form_page3";
import NewEventFormFourthPage                            from "./new_event_form_page4";
import NewEventFormFifthPage                             from "./new_event_form_page5";
import NewEventFormSixthPage                             from "./new_event_form_page6";
import _                                                 from "lodash";
import { createEvent, endEditEvent, login, updateEvent } from "../../../actions/actions";
import { reduxForm }                                     from "redux-form";
import { connect }                                       from "react-redux";
// import request                                           from "request";
// import fs                                           from "fs";

class NewEventForm extends Component {

	constructor( props ) {
		super( props );
		this.nextPage     = this.nextPage.bind( this );
		this.previousPage = this.previousPage.bind( this );
		this.handleSubmit = this.handleSubmit.bind( this );
		this.state        = {
			page: 1
		};
	}

	nextPage() {
		this.setState( {page: this.state.page + 1} );
	}

	previousPage() {
		this.setState( {page: this.state.page - 1} );
	}

	handleSubmit( eventObj ) {


		const state = store.getState();

		const categoryId  = state.category.categoryData.selectedCategoryId;
		const companyName = state.userData.loginInfo.companyName;

		const imageUrl = eventObj.imageUrl;

		let newRow = Object.assign( {}, eventObj );

		newRow.categoryId  = categoryId;
		newRow.companyName = companyName;
		newRow.email       = state.userData.loginInfo.email;


		// delete lists if they are empty
		_.forEach( Constants.EVENT_LISTS, function ( list ) {
			if ( _.get( eventObj, list, [] ).length === 0 ) {
				delete eventObj[ list ];
			}
		} );

		let payload = Object.assign( {}, eventObj );

		_.forEach( Constants.EVENT_LISTS, function ( list ) {
			if ( _.get( eventObj, list ) && eventObj[ list ] !== "" ) {
				payload[ list ] = _.filter( eventObj[ list ], function ( value ) {
					return value !== "";
				} ); //.map(item => Number (item) ? Number (item) : item);
			}
		} );

		payload.categoryId  = categoryId;
		payload.companyName = companyName;

		payload = _.assign( eventObj, payload ); // merge the new data with all data

		if ( payload.hasOwnProperty( "resonance" ) ) {
			payload.resonance = String( payload.resonance );
		}

		if ( payload.hasOwnProperty( "preceding" ) ) {
			payload.preceding = String( payload.preceding );
		}

		payload.email = this.props.userId; // email

		this.props.updateEvent( payload );

		this.props.endEditEvent();

	}

	render() {

		const {page} = this.state;

		return (
			<div>
				{ page === 1 && <NewEventFormFirstPage handleSubmit={ this.nextPage }/> }
				{ page === 2 &&
				<NewEventFormSecondPage previousPage={ this.previousPage } handleSubmit={ this.nextPage }/> }
				{ page === 3 &&
				<NewEventFormThirdPage previousPage={ this.previousPage } handleSubmit={ this.nextPage }/> }
				{ page === 4 &&
				<NewEventFormFourthPage previousPage={ this.previousPage } handleSubmit={ this.nextPage }/> }
				{ page === 5 && <NewEventFormFifthPage previousPage={ this.previousPage } onSubmit={ this.nextPage }/> }
				{ page === 6 &&
				<NewEventFormSixthPage previousPage={ this.previousPage } onSubmit={ this.handleSubmit }/> }
			</div>

		);
	}
}

function mapStateToProps( state ) {
	return {
		eventObj: state.visualization.eventEditing.eventObj,
		userId  : state.userData.userData.id
	};
}

NewEventForm = reduxForm( {
	form                    : "newEventForm",  // a unique identifier for this form
	destroyOnUnmount        : false, //        <------ preserve form data
	forceUnregisterOnUnmount: false, // <------ unregister fields on unmount
	enableReinitialize      : true
} )( NewEventForm );

NewEventForm = connect(
	( state ) => ( {
		initialValues: _.get( state, "visualization.eventEditing.eventObj", {
			// eventName  : `New Event - ${new Date().toString()}`,
			eventName  : "Event Name",
			description: "description",
			color      : Constants.EVENT_DEFAULT_COLOR,
			resonance  : "0",
			preceding  : "0",
			// startDate  : "1/1/2013",
			// endDate    : moment().add(1, "months").format( "YYYY-MM-DD" ),
			imageUrl   : ""
		} )
	} )
)( NewEventForm );

NewEventForm = connect( mapStateToProps, {login, createEvent, endEditEvent, updateEvent} )( NewEventForm );

export default NewEventForm;