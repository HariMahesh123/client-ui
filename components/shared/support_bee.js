import React, {Component} from 'react';
import {Button, Modal} from 'react-bootstrap';
import {connect} from 'react-redux';
import {Field, reduxForm} from 'redux-form';
import {resetSupportFormStatus, showSupportForm, submitSupportForm} from '../../actions/actions';


function validate(values) {
    const errors = {};

    if (!values.name) {
        errors.name = 'Required';
    }
    if (!values.subject) {
        errors.subject = 'Required';
    }
    if (!values.message) {
        errors.message = 'Required';
    }

    if (!values.email) {
        errors.email = 'Required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
    }

    return errors;
}


function renderField({input, label, placeholder, type, style, name, meta: {touched, error, warning}}) {

    let control = <input {...input} placeholder={placeholder}
                         type={type}
                         name={name}
                         style={style}
    />;

    if (type === 'textarea') {
        control = <textarea {...input} placeholder={placeholder}
                            type={type}
                            name={name}
                            style={style}/>;
    }
    return (
        <div>
            <label>{label}</label>
            <div>
                {control}
                {touched && ((error && <span id="error-text">{error}</span>) || (warning && <span>{warning}</span>))}
            </div>
        </div>
    );
}


class Form extends Component {

    componentWillReceiveProps(nextProps) {
        //console.error('componentWillReceiveProps:', nextProps);
        //
    }

    render() {

        const {handleSubmit, pristine, reset, submitting} = this.props;
        //const {handleSubmit, pristine, reset, submitting} = props;

        const onHide = () => {
            reset();
            this.props.showSupportForm(false);
            this.props.resetSupportFormStatus();
        };

        const footer = this.props.submissionOK ?
            (
                <Button
                    bsStyle="success"
                    onClick={() => {
                        onHide();
                    }
                    }>Message sent successfully (click to close)</Button>
            ) :
            (
                <div>
                    <Button onClick={onHide}>Cancel</Button>
                    <Button
                        type="submit"
                        bsStyle="primary"
                        disabled={pristine || submitting}
                        onClick={handleSubmit(data => {
                            this.props.submitSupportForm(data);
                        })}>Submit</Button>
                </div>
            );

        return (

            <form ref='form' onSubmit={handleSubmit(data => {
                // do your submit stuff here and return a Promise if you want the
                // this.props.submitting flag to be set for the duration of the promise
                console.log(data);
            })}>
                <Modal id="support-form"
                       show={this.props.show}
                       onHide={onHide}>
                    <Modal.Body>
                        <Modal.Header closeButton={false}>
                            <Modal.Title>
                                <div>
                                    <div>
                                        <img src={require('../../../static/images/predicta-logo.svg')}
                                             alt="predicta-logo"
                                             height={20}/>
                                    </div>
                                    <div id="support-title">
                                        <p style={{textAlign: 'center'}}>Contact Us</p>
                                    </div>
                                    <div id="support-close-container">
                                        <p style={{textAlign: 'right'}}><i id="support-close" onClick={onHide}
                                                                           className="fa fa-window-close"
                                                                           aria-hidden="true"/></p>
                                    </div>
                                </div>
                            </Modal.Title>
                        </Modal.Header>

                        <div style={{margin: 10, border: 'none'}}>

                            <Field name="name"
                                   component={renderField}
                                   type="text"
                                   placeholder=""
                                   label="name"
                            />

                            <Field name="email"
                                   component={renderField}
                                   type="email"
                                   placeholder=""
                                   label="email"
                            />

                            <Field name="subject"
                                   component={renderField}
                                   type="text"
                                   placeholder=""
                                   label="subject"/>

                            <Field style={{maxWidth: 1092 / 2 + 4, minHeight: 120}}
                                   name="message"
                                   type="textarea"
                                   placeholder="your message..."
                                   component={renderField}
                                   label="message"/>

                        </div>
                        <Modal.Footer>{footer}</Modal.Footer>
                    </Modal.Body>
                </Modal>
            </form>
        );
    }
}

function mapStateToProps(state) {
    return {
        show:         state.nav.showSupportForm,
        firstName:    state.userData.loginInfo.firstName,
        lastName:     state.userData.loginInfo.lastName,
        username:     state.userData.loginInfo.username,
        email:        state.userData.loginInfo.email,
        submissionOK: state.nav.submissionOK
    };
}


Form = reduxForm({
    form: 'SupportBee',  // a unique identifier for this form
    validate
})(Form);

Form = connect(
    state => ({
        initialValues: {
            name:  `${state.userData.loginInfo.firstName} ${state.userData.loginInfo.lastName}`,
            email: state.userData.loginInfo.email
        }
    })
)(Form);

Form = connect(mapStateToProps, {
    showSupportForm,
    submitSupportForm,
    resetSupportFormStatus
})(Form);


//Form = connect(mapStateToProps, mapDispatchToProps)(Form);


export default Form;