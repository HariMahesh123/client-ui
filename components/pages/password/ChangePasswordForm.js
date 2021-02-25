import React, {Component, PropTypes} from 'react';
import {Field, reduxForm} from 'redux-form';
import {connect} from 'react-redux';
import {Button, Form, Label, Message} from 'semantic-ui-react';
import {renderField} from '../../../forms/renderField';
import AdminForm from '../../../forms/AdminForm';
import {changePassword, resetChangePasswordStatus, logout} from '../../../actions/actions';
function validate(values) {
    const errors = {};

    if (!values.email) {
        errors.email = 'Required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Invalid email';
    }

    if (!values.oldPassword) {
        errors.oldPassword = 'Required';
    }

    if (!values.newPassword) {
        errors.newPassword = 'Required';
    }

    if (values.verifyNewPassword !== values.newPassword) {
        errors.verifyNewPassword = 'Does not match new password';
    }

    return errors;
}

class ChangePasswordForm extends Component {

    static contextTypes = {
        router: PropTypes.object
    };

    state = {pathname: undefined};

    componentWillMount() {
        this.props.resetChangePasswordStatus();
        //this.props.setState({pathname: this.props.history.location.pathname});
    }

    componentWillReceiveProps(nextProps) {
        //console.log('componentWillReceiveProps:', nextProps);
    }

    shouldComponentUpdate(nextProps, nextState) {
        //console.log('scu', nextProps, nextState);
        return true;
    }

    render() {

        const handleCancel = () => {
            this.props.logout();
            //this.context.router.history.push('/');
            this.context.router.push('/');
            //////console.log('history', this.context.router.history);
            ////
            //this.context.router.history.goBack();
        };

        const {passwordChangeResult, handleSubmit, pristine, reset, submitting} = this.props;

        const onHide = () => {
            reset();
        };

        const success = this.props.passwordChangeResult && this.props.passwordChangeResult !== 'xx';

        const submit = (<Button type="submit"
                                disabled={pristine || submitting}
                                onClick={handleSubmit((data) => {
                                    let obj = Object.assign({}, data);
                                    delete obj.verifyNewPassword;
                                    this.props.changePassword(obj);
                                })}>Submit</Button>);

        const cancelColor = success ? {color: 'green'} : null;

        const cancel = (<Button
            {...cancelColor} disabled={submitting}
            onClick={handleCancel}>{success ? 'Continue' : 'Cancel'}</Button>);

        //console.log('status', success, this.props.passwordChangeResult );

        let statusMessage = this.props.passwordChangeResult === 'xx' ? null : success ? (
            <Message success>
                <Message.Header>
                    Password successfully changed.
                </Message.Header>
                <p>
                    Click continue...</p>
            </Message>
        ) : (
            <Message error>
                <Message.Header>
                    Password change failed
                </Message.Header>
                <p>
                    Please try again.</p>
            </Message>
        );

        const admin_form = (
            <AdminForm title={'Change password'}
                       style={{width: 400}}>
                <Label attached='top'>{'Change password'}</Label>

                {statusMessage}

                <Form>

                    {!success && <Message info>
                        <Message.Header>
                            Change password
                        </Message.Header>
                        <p>
                            Fill out this form, then click the "Submit" button. We will send you instructions to change your password. </p>
                    </Message>}

                    {!success && (<div style={{marginBottom: 20}}><Form.Field>
                        <Field name="email"
                               component={renderField}
                               type="email"
                               placeholder=""
                               readonly={true}
                               icon="lock"
                               label="email" />
                    </Form.Field>
                        <Form.Field>
                            <Field name="oldPassword"
                                   component={renderField}
                                   type="password"
                                   placeholder=""
                                   label="old password" />
                        </Form.Field>
                        <Form.Field>
                            <Field name="newPassword"
                                   component={renderField}
                                   type="password"
                                   placeholder=""
                                   label="new password" />
                        </Form.Field>
                        <Form.Field>
                            <Field name="verifyNewPassword"
                                   component={renderField}
                                   type="password"
                                   placeholder=""
                                   label="verify new password" />
                        </Form.Field></div>)}

                    <Form.Group >

                        <Form.Field>
                            {cancel}
                        </Form.Field>

                        {!success && <Form.Field>
                            {submit}
                        </Form.Field>}

                    </Form.Group>

                </Form>
            </ AdminForm >
        );

        return (
            <div className="container"
                 style={{
                     marginTop: 100
                 }}>
                <div className="row">
                    <div className="login-form is-Responsive">
                        <div className="col-sm-12 col-md-10 col-md-offset-1">
                            {/*<Panel header={logo}>*/}
                            {admin_form}
                            {/*</Panel>*/}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        passwordChangeResult: state.userData.passwordChangeResult,
        //loggedInUserData: state.data.loggedInUserData
    };
}

ChangePasswordForm = reduxForm({
    form: 'changePassword',  // a unique identifier for this form
    validate
})(ChangePasswordForm);

ChangePasswordForm = connect(
    (state) => ({
        initialValues: {
            email            : state.userData.loginInfo.email,
            oldPassword      : '',
            newPassword      : '',
            verifyNewPassword: ''
        }
    })
)(ChangePasswordForm);

ChangePasswordForm = connect(mapStateToProps, {changePassword, resetChangePasswordStatus, logout})(ChangePasswordForm);

//Form = connect(mapStateToProps, mapDispatchToProps)(Form);

export default ChangePasswordForm;
