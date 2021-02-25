import React, { Component, PropTypes } from "react";
import { Panel }                       from "react-bootstrap";
import _                               from "lodash";

import { connect }    from "react-redux";
// actions
import {
	login, logout, setBrandNames, setCategory, setIntrinsicsNames, setUserBrandsControl,
	setUserIntrinsicsControl
}                     from "../../../actions/actions";
import ReduxLoginForm from "./LoginForm";

class LoginForm extends Component {

	static contextTypes = {
		router: PropTypes.object
	};

	componentWillReceiveProps( nextProps ) {

		if ( nextProps.userData.loginInfo.success === "true" && nextProps.categoryId ) { // user is logged in

			this.props.setUserBrandsControl( nextProps.categoryDisplay );
			this.props.setUserIntrinsicsControl( nextProps.intrinsicDisplay );

			this.context.router.push( `/trends/${nextProps.categoryId}` );
		}
	}

	onSubmit( obj ) {
		obj.remember = !!obj.remember;
		// console.log('onSubmit', obj);
		// this.props.login(obj);
	}

	handleSubmit( formData ) {
		// console.log('formData', formData);
		this.props.login( formData );
	}

	render() {

		const logoStyle = {
			marginTop: 3,
			height   : 20
		};

		// const logo = <a href="https://www.predicta.com"><img src={`/static/images/predicta-logo.svg`}
		// alt="predicta-logo" style={logoStyle}/></a>;
		{/*const logo = <a href="https://www.predicta.com"><img src={require('../../../../static/images/predicta-logo.svg')} alt="predicta-logo" style={logoStyle}/></a>;*/
		}
		const logo = <a href="https://www.predicta.com"><img
			src={ require( "../../../../static/images/predicta-logo.svg" ) }
			alt="predicta-logo"
			style={ logoStyle }/></a>;

		const login_form = <ReduxLoginForm/>;

		return (
			<div className="container"
				 style={ {
					 marginTop: 100
				 } }>
				<div className="row">
					<div className="login-form is-Responsive">
						<div className="col-sm-12 col-md-10 col-md-offset-1">
							<Panel header={ logo }>
								{ login_form }


								<div style={ {float: "left", fontSize: 10, paddingBottom: 0, color: "black"} }><em>Predicta
									Client</em></div>

							</Panel>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

function mapStateToProps( state ) {
	return {
		categoryId          : state.category.categoryData.selectedCategoryId,
		category            : state.category,
		categoryDisplay     : _.get( state, "category.categoryData.brands.displayed", null ),
		intrinsicDisplay    : _.get( state, "categoryData.intrinsics.displayed", null ),
		userData            : state.userData,
		userPreferences     : state.userData.preferences,
		intrinsicNameMapping: state.brands.intrinsicNameMapping,
		intrinsicIdMapping  : state.brands.intrinsicIdMapping
	};
}

export default connect( mapStateToProps, {
	setCategory,
	setBrandNames,
	setIntrinsicsNames,
	setUserIntrinsicsControl,
	setUserBrandsControl,
	login,
	logout
} )( LoginForm );
