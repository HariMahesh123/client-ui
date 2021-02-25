import React, { Component, PropTypes }           from "react";
import { Field, reduxForm }                      from "redux-form";
import { connect }                               from "react-redux";
import AdminForm                                 from "../../../forms/AdminForm";
import { Button, Form, Label, Message }          from "semantic-ui-react";
import { renderField }                           from "../../../forms/renderField";
import { lostPassword, resetLostPasswordStatus } from "../../../actions/actions";

function validate( values ) {
	const errors = {};

	if ( !values.email ) {
		errors.email = "Required";
	} else if ( !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test( values.email ) ) {
		errors.email = "Invalid email";
	}

	return errors;
}

class LostPasswordForm extends Component {

	static contextTypes = {
		router: PropTypes.object
	};

	componentWillMount() {
		console.log( "LostPasswordForm.js: cwm" );
		this.props.resetLostPasswordStatus();
	}

	componentWillReceiveProps( nextProps ) {
		//console.error('componentWillReceiveProps:', nextProps);
		//
	}

	render() {

		const handleCancel = () => {
			this.context.router.push( "/" );
		};

		const {handleSubmit, pristine, reset, submitting} = this.props;

		/*
		 const onHide = () => {
		 reset();
		 };
		 */

		const submit = ( <Button disabled={ pristine || submitting }
								 onClick={ handleSubmit( ( data ) => {

									 this.props.lostPassword( data );

								 } ) }>Submit</Button> );

		const success = this.props.passwordLostResult && this.props.passwordLostResult !== "xx";

		const cancelColor = success ? {color: "green"} : null;

		const cancel = ( <Button
			{ ...cancelColor } disabled={ submitting }
			onClick={ handleCancel }>{ success ? "Continue" : "Cancel" }</Button> );

		let statusMessage = this.props.passwordLostResult === "xx" ? null : success ? (
			<Message success>
				<Message.Header>
					Password reset succeeded.
				</Message.Header>
				<p>
					Click continue...</p>
			</Message>
		) : (
			<Message error>
				<Message.Header>
					Password reset failed.
				</Message.Header>
				<p>
					Please try again.</p>
			</Message>
		);

		const admin_form = ( <AdminForm style={ {width: 400} }>
			<Label attached='top'>{ "Reset password?" }</Label>

			{ statusMessage }

			<Form>

				{ !success && ( <div style={ {marginBottom: 20} }>
					<Message info>
						<Message.Header>
							Reset password
						</Message.Header>
						<p>
							Enter your email and click the 'Submit' button. We will send you an email with instructions
							to reset your password. </p>
					</Message>

					<Form.Field>
						<Field name="email"
							   component={ renderField }
							   type="email"
							   placeholder=""
							   label="email"/>
					</Form.Field>
				</div> ) }


				<Form.Group>

					<Form.Field>
						{ cancel }
					</Form.Field>

					{ !success && <Form.Field>
						{ submit }
					</Form.Field> }

				</Form.Group>

			</Form>
		</ AdminForm> );

		return (
			<div className="container"
				 style={ {
					 marginTop: 100
				 } }>
				<div className="row">
					<div className="login-form is-Responsive">
						<div className="col-sm-12 col-md-10 col-md-offset-1">
							{ /*<Panel header={logo}>*/ }
							{ admin_form }
							{ /*</Panel>*/ }
						</div>
					</div>
				</div>
			</div>
		);
	}
}

function mapStateToProps( state ) {
	return {
		passwordLostResult: state.userData.passwordLostResult
	};
}

LostPasswordForm = reduxForm( {
	form: "lostPassword",  // a unique identifier for this form
	validate
} )( LostPasswordForm );

LostPasswordForm = connect(
	( state ) => ( {
		initialValues: {
			email: ""
		}
	} )
)( LostPasswordForm );

LostPasswordForm = connect( mapStateToProps, {lostPassword, resetLostPasswordStatus} )( LostPasswordForm );

export default LostPasswordForm;
