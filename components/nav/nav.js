import _                                                                    from "lodash";
import React, { Component, PropTypes }                                      from "react";
import { Button, ButtonGroup, MenuItem, Nav, Navbar, NavDropdown, NavItem } from "react-bootstrap";
import { connect }                                                          from "react-redux";
import {
	brandClicked, fetchNavData, fetchProducts, getBrandData, getTopics, logout, setBrandNames, setCategory,
	setIntrinsicsNames, setNavigationType, setRefineByType, setUserBrandsControl, setUserIntrinsicsControl,
	showSupportForm, setSelectedChart
}                                                                           from "../../actions/actions";
import * as Constants                                                       from "../../constants";
import HorizontalBrandSummaryPanel                                          from "../shared/horizontal_brand_summary_panel";


// actions

class TopNav extends Component {

	static contextTypes = {
		router: PropTypes.object
	};

	componentWillMount() {
	}

	componentWillReceiveProps( nextProps ) {
		if ( !nextProps.role ) {
			this.context.router.push( "/" );
		}
	}

	onSetCategory( category ) {
		// console.log('onSetCategory', category);
		const categoryId = category.id;
		this.props.setCategory( categoryId, this.props.userId ); // saga will getTopics

		let displayBrands     = "preferred";
		let displayIntrinsics = "preferred";
		// does the user have preferences?
		const preferences     = this.props.userPreferences;

		if ( preferences ) {
			const preference              = this.props.userPreferences[ categoryId ];
			const preferredBrandNames     = !_.get( preference, "preferredBrandNames" ) ? [] : preference.preferredBrandNames;
			const preferredIntrinsicNames = !_.get( preference, "preferredIntrinsicNames" ) ? [] : preference.preferredIntrinsicNames;

			if ( !preferredBrandNames.length ) { // no preferred brands are set
				displayBrands = "all";
			}
			if ( !preferredIntrinsicNames.length ) { // no preferred intrinsics are set
				displayIntrinsics = "all";
			}
		} else {
			console.error( "ERROR: No user preferences found!" );
		}

		this.props.setUserBrandsControl( displayBrands );
		this.props.setUserIntrinsicsControl( displayIntrinsics );

		this.context.router.push( `/${this.props.navigationType}/${category.id}` );
	}

	onSetNavigationType( navigationType ) {
		this.props.setNavigationType( navigationType );
		// HM
       // this.props.setIntrinsicsGlobalCustomType(navigationType);
		const categoryName = _.get( this.props, "selectedCategory.id", "" );
		this.context.router.push( `/${navigationType}/${categoryName}` );

		if (navigationType == "global_intrinsics_reports" || navigationType == "intrinsics_reports") {
            this.props.setCategory( categoryName, this.props.userId ); // saga will getTopics
            if (this.props.intrinsicsByPeriodChartType === "sentiment") {
                this.props.setSelectedChart(Constants.CHART_SENTIMENTCOUNTS_BY_PERIOD);
            }
            else {
                this.props.setSelectedChart(Constants.CHART_INTRINSICS_BY_PERIOD);
            }
        }
    }

	getActive( name, prop ) {
		return ( name === prop )
			? " active"
			: "";
	}

	getSelected( name, prop ) {
		return ( name === prop )
			? " selected"
			: "";
	}

	renderCategoryDropdownMenu() {
		const style = {
			color: "blue"
		};
		return (
			<NavDropdown eventKey={ 1 } title={ this.props.selectedCategory.title || "Select category" }
						 id="basic-nav-dropdown">
				{ this.renderCategoryDropdownItems() }
			</NavDropdown>
		);
	}

	// get array of category objects and render them

	renderCategoryDropdownItems() {
		if ( !this.props.allCategories.length ) {
			return;
		}

		let categories = this.props.userCategories;

		categories = _.sortBy( categories, [ function ( category ) {
			return category.title;
		} ] );

		return categories.map( ( category ) => {
			const linkStyle = {
				color: "black"
			};

			return (
				<MenuItem key={ category.id } className={ this.getSelected( this.props.selectedCategory.id ) }
						  onClick={ this.onSetCategory.bind( this, category ) }>
					<span style={ linkStyle }>{ category.title }</span>
				</MenuItem>
			);
		} );
	}

	logout( e ) {
		// console.log('logout', e);
		this.props.logout();
		this.context.router.push( "/" );
	}

	topics( e ) {
		// console.log('topics', e);
		this.context.router.push( `/topics/${this.props.selectedCategory.id}` );
	}

	settings( e ) {
		// console.log('topics', e);
		this.context.router.push( `/settings` );
	}

	admin( e ) {
		// console.log('admin', e);
		this.context.router.push( `/admin` );
	}

	changePasswordHandler( e ) {
		// console.log('admin', e);
		this.context.router.push( `/changepassword` );
	}

	render() {
		const logoStyle = {
			marginTop: 3,
			height   : 20
		};
		//const navigateLabelStyle = { marginRight: -8};
		// const navigateLabelStyle = {};
		// const navigateLabel = this.props.selectedCategoryName
		// 	? <Navbar.Text style={navigateLabelStyle}>Navigate:</Navbar.Text>
		// 	: null;
		const categoryName       = this.props.selectedCategory.id;
		// console.log('categoryName', categoryName);
		let hasAdminAccess       = false;
		let hasUpdateTopicAccess = false;

		if ( this.props.permissions !== undefined ) {
			hasAdminAccess       = this.props.permissions[ Constants.PERMISSIONS_UPDATE_USER_DATA ];
			hasUpdateTopicAccess = this.props.permissions[ Constants.PERMISSIONS_UPDATE_TOPIC_DATA ];
		}
		const adminLink = hasAdminAccess
			? <MenuItem key="admin" eventKey={ "admin" }
						onSelect={ this.admin.bind( this ) }>{ Constants.NAV_ITEM_ADMIN }</MenuItem>
			: null;

		const topicEditor = hasUpdateTopicAccess
			? <MenuItem key="topics" eventKey={ "topics" }
						onSelect={ this.topics.bind( this ) }>{ Constants.NAV_ITEM_TOPICS }</MenuItem>
			: null;

		const changePassword = <MenuItem key="changePassword" eventKey={ "changePassword" }
										 onSelect={ this.changePasswordHandler.bind( this ) }>Change
			Password</MenuItem>;


		return (
			<div style={ {paddingBottom: 0} }>
				<Navbar fluid fixedTop>
					<Navbar.Header>
						<Navbar.Brand>
							<a href="/"><img src={ require( "../../../static/images/predicta-logo.svg" ) }
											 alt="predicta-logo" style={ logoStyle }/></a>
						</Navbar.Brand>
						<Navbar.Toggle/>
					</Navbar.Header>
					<Navbar.Collapse>
						<Nav>
							{ this.renderCategoryDropdownMenu() }
							<NavItem>
								<ButtonGroup>
									<Button disabled={ !categoryName } bsSize='xsmall' to='#'
											className={ "item" + this.getActive( "trends", this.props.navigationType ) }
											onClick={ this.onSetNavigationType.bind( this, "trends" ) }>{ Constants.NAV_ITEM_TRENDS }</Button>

									<Button disabled={ !categoryName } bsSize='xsmall' to='#'
											className={ "item" + this.getActive( "global_intrinsics_reports", this.props.navigationType ) }
											onClick={ this.onSetNavigationType.bind( this, "global_intrinsics_reports" ) }>{ Constants.NAV_ITEM_GLOBAL_INTRINSICS_REPORTS }</Button>

									<Button disabled={ !categoryName } bsSize='xsmall' to='#'
                                            className={ "item" + this.getActive( "intrinsics_reports", this.props.navigationType ) }
                                            onClick={ this.onSetNavigationType.bind( this, "intrinsics_reports" ) }>{ Constants.NAV_ITEM_INTRINSICS_REPORTS }</Button>

									{/*<Button disabled={ !categoryName } bsSize='xsmall' to='#'*/}
											{/*className={ "item" + this.getActive( "radar", this.props.navigationType ) }*/}
											{/*onClick={ this.onSetNavigationType.bind( this, "radar" ) }>{ Constants.NAV_ITEM_RADAR }</Button>*/}

									<Button disabled={ !categoryName } bsSize='xsmall' to='#'
											className={ "item" + this.getActive( "events", this.props.navigationType ) }
											onClick={ this.onSetNavigationType.bind( this, "events" ) }>{ Constants.NAV_ITEM_EVENTS }</Button>
								</ButtonGroup>
							</NavItem>
						</Nav>
						<Nav>
							<NavItem style={ {marginLeft: -5} }><HorizontalBrandSummaryPanel/></NavItem>
						</Nav>
						<Nav pullRight>
							<NavItem eventKey={ "support" } href="#"
									 onClick={ this.props.showSupportForm.bind( this, true ) }>{ Constants.NAV_ITEM_SUPPORT }</NavItem>
							<NavDropdown eventKey={ "account" } title={ this.props.username } id="basic-nav-dropdown">
								{ changePassword }
								<MenuItem divider/>
								{ this.props.permissions.updateUserSettings ?
									<MenuItem key="settings" eventKey={ "settings" }
											  onSelect={ this.settings.bind( this ) }>{ Constants.NAV_ITEM_SETTINGS }</MenuItem> : null }
                                { this.props.companyName=='Predicta' ?
								<MenuItem eventKey={ 1 } href="https://admin-production.predicta.com"
										  target="_blank">Administration</MenuItem>: null }
								<MenuItem key="signout" eventKey={ "signout" }
										  onSelect={ this.logout.bind( this ) }>{ Constants.NAV_ITEM_SIGN_OUT }</MenuItem>
							</NavDropdown>
						</Nav>
					</Navbar.Collapse>
				</Navbar>

				<div style={ {
					marginBottom: 80
				} }/>

			</div>
		);
	}
}

function mapStateToProps( state ) {
	return {
		permissions       : state.userData.userData.permissions,
		userPreferences   : state.userData.userData.preferences,
		allCategories     : state.nav.categories,
		userCategories    : state.userData.userData.userCategories,
		username          : state.userData.userData.username ? state.userData.userData.username : "Logged out",
		role              : state.userData.userData.role,
		userId            : state.userData.userData.id,
		selectedCategory  : state.userData.userData.selectedCategory,
		navigationType    : state.category.navigationType,
		refineByType      : state.category.refineByType,
		allBrands         : state.brands.allBrands,
		allIntrinsics     : state.brands.allIntrinsics,
		selectedIntrinsics: state.brands.selectedIntrinsics,
        companyName       : state.userData.loginInfo.companyName,
		selectedBrands    : state.brands.selectedBrands,
        intrinsicsByPeriodChartType: state.visualizationData.data.settings.intrinsicsByPeriodChartType,
	};
}

export default connect( mapStateToProps, {
	fetchNavData,
	setCategory,
	setNavigationType,
	setRefineByType,
	setBrandNames,
	setIntrinsicsNames,
	getTopics,
	getBrandData,
	brandClicked,
	fetchProducts,
	logout,
	setUserBrandsControl,
	setUserIntrinsicsControl,
	showSupportForm,
    setSelectedChart
} )( TopNav );
