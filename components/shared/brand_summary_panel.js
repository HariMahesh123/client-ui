import numeral from 'numeral';
import React, {Component} from 'react';

import {Label, Panel} from 'react-bootstrap';
import {connect} from 'react-redux';
import {brandClicked, getReviewsForIntrinsic, setCategory} from '../../actions/actions';
import * as Constants from '../../constants';

class BrandSummaryPanel extends Component {
    // get access to router from parent component
    // static contextTypes = {
    //     router: PropTypes.object
    // };

    render() {
        // console.log('brandSummary');

        const panelStyle = {
            color: 'black'
        };

        const categoryTitle = this.props.selectedCategory.title;
        const categoryInfo2 = (<div id="category-info">
            <hr/>
            <h4>
                <Label bsStyle="info"> {numeral(this.props.numBrands).format('0,0')}</Label>
                <span id="category-info">{Constants.BRAND_SUMMARY_TOTAL_BRANDS}</span>
            </h4>
            <h4>
                <Label bsStyle="info">{numeral(this.props.numBrandsSelected).format('0,0')}</Label>
                <span id="category-info">{Constants.BRAND_SUMMARY_BRANDS_SELECTED}</span>
            </h4>
            <hr/>
            <h4>
                <Label bsStyle="info">{numeral(this.props.numIntrinsics).format('0,0')}</Label>
                <span id="category-info">{'total intrinsics'}</span>
            </h4>
            <h4>
                <Label bsStyle="info">{numeral(this.props.numIntrinsicsSelected).format('0,0')}</Label>
                <span id="category-info">{'intrinsics selected'}</span>
            </h4>
        </div>);

        const panel = (<Panel>
            <h4>{Constants.BRAND_SUMMARY_SUMMARY}
                <span style={panelStyle}>{categoryTitle}</span>
            </h4>
            <h5>{categoryInfo2}</h5>
        </Panel>);

        return (
            <div>{panel}</div>
        );
    }
}

function mapStateToProps(state) {
    return {
        numBrandsSelected:     state.state.category.categoryData.brands.selectedBrands.length,
        numBrands:             state.category.categoryData.brands.allBrands.length,
        numIntrinsics:         state.state.category.categoryData.intrinsics.allIntrinsics.length,
        numIntrinsicsSelected: state.state.category.categoryData.intrinsics.selectedIntrinsics.length,
        selectedCategory:      state.state.category.categoryData.selectedCategory
    };
}

export default connect(mapStateToProps,
    {
        brandClicked,
        setCategory,
        getReviewsForIntrinsic
    })(BrandSummaryPanel);
