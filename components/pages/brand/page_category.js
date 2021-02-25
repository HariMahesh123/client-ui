import React, {Component} from 'react';
import {connect} from 'react-redux';

import BrandsPanel from '../../shared/brands_panel';
import CategoryReviewsByIntrinsic from '../../shared/category_reviews_by_intrinsic';
import PageHeading from '../../shared/page_heading';

//
class PageCategory extends Component {

    render() {
        // debugLogger ('page_category');
        return (
            <div>
                <PageHeading title={this.props.selectedCategory.title}/>
                <CategoryReviewsByIntrinsic/>
                <BrandsPanel/>
            </div>
        );

    }
}

function mapStateToProps(state) {
    return {
        selectedCategory: state.category.categoryData.selectedCategory
    };
}

export default connect(mapStateToProps, {})(PageCategory);
