/* eslint-disable react/jsx-tag-spacing */
import React, { Component }                    from "react";
import { connect }                             from "react-redux";
import { change, Field, reduxForm }            from "redux-form";
import { Button, Divider, Form, Header, Icon } from "semantic-ui-react";
import { createEvent, login }                  from "../../../actions/actions";
import AdminForm                               from "../../../forms/AdminForm";
import { renderField }                         from "../../../forms/renderField";
import { DateRangePicker }                     from "react-dates";
import moment                                  from "moment";
// import { fs }                                  from "file-system";

// import { file }                         from "file-system";


function validate( values ) {

	const errors = {};

	if ( !values.eventName ) {
		errors.eventName = "* required";
	}

	if ( values.startDate >= values.endDate ) {
		errors.startDate = "* start date must be earlier than end date";
	}

	if ( values.endDate <= values.startDate ) {
		errors.endDate = "* end date must be later than start date";
	}

	// if ( !values.resonance ) {
	// 	errors.resonance = "* required";
	// }

	return errors;
}

class NewEventFormPage1 extends Component {


	constructor( props ) {
		super( props );

		this.state                 = {focusedInput: null, startDate: moment(this.props.myForm.values.startDate), endDate: moment(this.props.myForm.values.endDate)};
		// Bind callback methods to make `this` the correct context.
		this.handleDateRangeChange = this.handleDateRangeChange.bind( this );
	}

	componentWillMount() {
	}

	handleDateRangeChange( startDate, endDate ) {


		this.setState( {startDate, endDate} );

		startDate = startDate ? startDate.format("YYYY-MM-DD") : null;
		endDate = endDate ? endDate.format("YYYY-MM-DD") : null;

		this.props.dispatch( change( "newEventForm", "startDate", startDate ) );
		this.props.dispatch( change( "newEventForm", "endDate", endDate ) );
	}

	render() {


		const {handleSubmit, pristine, reset, submitting} = this.props;

		// console.log("startDate, endDate, resonance", this.props.startDate, this.props.endDate, this.props.resonance);

		return (
			<AdminForm id="new-event-panel">
				{ /*<Form onSubmit={handleSubmit}>*/ }
				<Form onSubmit={ handleSubmit }>

					<Header style={ {fontFamily: "Roboto"} }>{ "Event Information [1 of 6]" }</Header>
					<Divider/>

					<Form.Field>
						<Field
							key={ "eventName" }
							name={ "eventName" }
							ref={ "eventName" }
							type={ "text" }
							component={ renderField }
							label={ "name" }
						/>
					</Form.Field>


					<Form.Group>

						<Form.Field width={8}>
							<label>date range</label>
							<DateRangePicker
								startDate={ this.state.startDate } // momentPropTypes.momentObj or null,
								startDateId="startDateId" // PropTypes.string.isRequired,
								endDate={ this.state.endDate } // momentPropTypes.momentObj or null,
								endDateId="endDateId" // PropTypes.string.isRequired,
								onDatesChange={ ( {startDate, endDate} ) => this.handleDateRangeChange( startDate, endDate ) } // PropTypes.func.isRequired,
								focusedInput={ this.state.focusedInput } // PropTypes.oneOf([START_DATE, END_DATE]) or null,
								onFocusChange={ focusedInput => this.setState( {focusedInput} ) } // PropTypes.func.isRequired,
								small={false}
								displayFormat={"YYYY-MM-DD"}
								isOutsideRange={() => false}
								minimumNights={7}
								regular={true}
							/>
							<label style={{color: "red"}}>{this.props.startDate && this.props.endDate ? "" : "*required"}</label>
						</Form.Field>

						<Form.Field width={4}>
							<Field
								key={ "preceding" }
								name={ "preceding" }
								ref={ "preceding" }
								type={ "number" }
								min={ 0 }
								max={ 9 }
								placeholder={ "enter pre-event period" }
								component={ renderField }
								label={ "pre-event period (months)" }
							/>
						</Form.Field>

						<Form.Field width={4}>
							<Field
								key={ "resonance" }
								name={ "resonance" }
								ref={ "resonance" }
								type={ "number" }
								min={ 0 }
								max={ 9 }
								placeholder={ "enter post-event period" }
								component={ renderField }
								label={ "post-event period (months)" }
							/>
						</Form.Field>



					</Form.Group>

					<Form.Field>
						<Field
							style={ {height: "100px", minHeight: "100px", maxHeight: "100px"} }
							key={ "description" }
							name={ "description" }
							ref={ "description" }
							placeholder={"add description here"}
							type={ "textarea" }
							component={ renderField }
							label={ "description" }
						/>
					</Form.Field>

					<div style={ {marginTop: "20px"} }>
						<Form.Field>
							<label>{ "label" }</label>
							<Field
								key={ "color" }
								name={ "color" }
								ref={ "color" }
								type={ "color" }
								component={ renderField }
								label={ "label" }
							/>
						</Form.Field>
					</div>

					<Form.Field id="event-buttons">
						<Form.Group>
							{ /*{closeButton}*/ }
							<Button type="submit" className="next" icon
									disabled={
										!_.isEmpty( _.get( this.props.myForm, "syncErrors", {} ) ) ||
										!this.props.startDate ||
										!this.props.endDate
									}>
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
		myForm: _.get( state, "form.newEventForm", {} ),
		startDate: _.get( state, "form.newEventForm.values.startDate", null ),
		endDate: _.get( state, "form.newEventForm.values.endDate", null ),
		resonance: _.get( state, "form.newEventForm.values.resonance", null ),
		preceding: _.get( state, "form.newEventForm.values.preceding", null )
		// syncErrors: _.get(state, "form.newEventForm.syncErrors", {})
	};
}

NewEventFormPage1 = reduxForm( {
	form                    : "newEventForm",  // a unique identifier for this form
	destroyOnUnmount        : false, //        <------ preserve form data
	forceUnregisterOnUnmount: false, // <------ unregister fields on unmount
	validate
} )( NewEventFormPage1 );

NewEventFormPage1 = connect( mapStateToProps, {login, createEvent} )( NewEventFormPage1 );

export default NewEventFormPage1;