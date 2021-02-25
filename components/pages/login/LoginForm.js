import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Field, reduxForm} from 'redux-form';
import {Button, Form, Message} from 'semantic-ui-react';
import {login} from '../../../actions/actions';
import AdminForm from '../../../forms/AdminForm';
import {renderField} from '../../../forms/renderField';
import {Link} from 'react-router';



function validate(values) {
    const errors = {};

    if (!values.email) {
        errors.email = '* required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = '* invalid email';
    }

    if (!values.password) {
        errors.password = '* required';
    }

    return errors;
}

class LoginForm extends Component {

    static contextTypes = {
        router: PropTypes.object
    };

    componentWillReceiveProps(nextProps) {
        //console.error('componentWillReceiveProps:', nextProps);
        //
    }

    render() {

        const {handleSubmit, pristine, reset, submitting} = this.props;
        //const {handleSubmit, pristine, reset, submitting} = props;

        const onHide = () => {
            reset();
        };

        const submit = (<Button type="submit"
                                disabled={pristine || submitting}
                                onClick={handleSubmit((data) => {
                                    this.props.login(data);
                                    // console.log('login', data);
                                })}>Submit</Button>);


        //const isAdmin = this.props.user.authorizationRole === Constants.PREDICTA_ADMIN ||
        //    this.props.user.authorizationRole === Constants.PREDICTA_DEVELOPER ||
        //    this.props.user.authorizationRole === Constants.COMPANY_ADMIN;

        const loggedIn = this.props.user.success === 'true';

        const hidden = this.props.user.success === 'unattempted';

        const msg = loggedIn ? (
            <Message success
                     header='Success'
                     content="Loading..."
                     hidden={hidden}/>
        ) : (
            <Message error
                     header='Login failed'
                     content={this.props.user.message}
                     hidden={hidden}/>
        );

        const props = loggedIn ? {
            success: true
        } : {
            error: true
        };

        let form = (

            <AdminForm title="Login" id='login-panel'>
                {/*<Label attached='top'>Predicta Login</Label>*/}

                <Form {...props}>

                    {msg}

                    <Form.Field>

                        <Field name="email"
                               component={renderField}
                               type="email"
                               placeholder="email"
                               label="email"/>

                    </Form.Field>
                    <Form.Field>
                        <Field name="password"
                               component={renderField}
                               type="password"
                               placeholder="password"
                               label="password"/>

                    </Form.Field>


                    <Form.Field>
                        <Link to="/lostpassword">Forgot password?</Link>
                    </Form.Field>

                    {/*<Form.Field>*/}
                    {/*<Link to="/changepassword">Change password</Link>*/}
                    {/*</Form.Field>*/}

                    <Form.Field>

                        {submit}

                    </Form.Field>

                </Form>

            </ AdminForm>
        );

        //form = (loggedIn && loggedIn !== 'unattempted') ? <Redirect to="/listusers" /> : form;

        return (
            <div>{form}</div>
        );
    }
}

function mapStateToProps(state) {
    return {
        user: state.userData.loginInfo
    };
}

LoginForm = reduxForm({
    form: 'login',  // a unique identifier for this form
    validate
})(LoginForm);

LoginForm = connect(
    (state) => ({
        initialValues: {
            email:    '',
            password: ''
        }
    })
)(LoginForm);

LoginForm = connect(mapStateToProps, {login})(LoginForm);

//Form = connect(mapStateToProps, mapDispatchToProps)(Form);

export default LoginForm;
