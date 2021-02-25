import React, { Component }  from "react";
import { connect }           from "react-redux";
import { setNavigationType } from "../../../actions/actions";
import PageHeading           from "../../shared/page_heading";
import ManageEvents          from "./manage_events";

class PageEvents extends Component {

	constructor() {
		super();
	}

	componentWillMount() {
		this.props.setNavigationType( "events" );
	}

	render() {


		return (
			<div>
				<PageHeading title={ "Events" }/>
				<ManageEvents/>
			</div> );
	}
}

function mapStateToProps( state ) {
	return {};
}

export default PageEvents = connect( mapStateToProps, {
	setNavigationType
} )( PageEvents );
