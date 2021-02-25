import numeral                                               from "numeral";
import React, { Component }                                  from "react";
import { Badge }                                             from "react-bootstrap";
import { connect }                                           from "react-redux";
import { brandClicked, getReviewsForIntrinsic, setCategory } from "../../actions/actions";
import * as Constants                                        from "../../constants";
import _                                                     from "lodash";


class HorizontalBrandSummaryPanel extends Component {
	// get access to router from parent component
	// static contextTypes = {
	//     router: PropTypes.object
	// };

	constructor( ...args ) {
		super( ...args );
		this.state = {
			hidden: true
		};
	}

	componentWillMount() {
	}

	onInfoClicked() {
		this.setState( {hidden: !this.state.hidden} );
	}

	render() {
		const style        = {backgroundColor: "#777", opacity: 1.0, color: "#fcbd40", textShadow: "none"};
		const categoryInfo = ( <span id="brand-summary-info"
									 hidden={ this.state.hidden }>

			<Badge className="badge"
				   style={ style }> { numeral( this.props.numBrands ).format( "0,0" ) }</Badge>
			<span id="brand-summary-info">{ Constants.BRAND_SUMMARY_TOTAL_BRANDS }</span>

			<Badge className="badge"
				   style={ style }>{ numeral( this.props.numBrandsSelected ).format( "0,0" ) }</Badge>
			<span id="brand-summary-info">{ Constants.BRAND_SUMMARY_BRANDS_SELECTED }</span>

			<Badge className="badge"
				   style={ style }>{ numeral( this.props.numIntrinsics ).format( "0,0" ) }</Badge>
			<span id="brand-summary-info">{ "total intrinsics" }</span>

			<Badge className="badge"
				   style={ style }>{ numeral( this.props.numIntrinsicsSelected ).format( "0,0" ) }</Badge>
			<span id="brand-summary-info">{ "intrinsics selected" }</span>

		</span> );

		return (
			<div><i className="fa fa-info-circle fa-lg info"
					aria-hidden="true"
					onClick={ this.onInfoClicked.bind( this ) }
					style={ {marginRight: 10} }></i>{ categoryInfo }</div>
		);
	}
}

function mapStateToProps( state ) {
	return {
		numBrandsSelected    : _.get( state, "category.categoryData.brands.selectedBrandIds.length", 0 ),
		numBrands            : _.get( state, "categoryData.brands.allBrandIds.length", 0 ),
		numIntrinsics        : _.get( state, "categoryData.intrinsics.allIntrinsicIds.length", 0 ),
		numIntrinsicsSelected: _.get( state, "categoryData.intrinsics.selectedIntrinsicIds.length", 0 ),
		selectedCategory     : state.category.categoryData.selectedCategory
	};
}

export default connect( mapStateToProps,
	{
		brandClicked,
		setCategory,
		getReviewsForIntrinsic
	} )( HorizontalBrandSummaryPanel );
