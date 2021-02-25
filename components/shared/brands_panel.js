import React, {Component} from 'react';
import {OverlayTrigger, Panel, Tooltip} from 'react-bootstrap';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {getReviewsForIntrinsic, setCategory} from '../../actions/actions';

//import * as bs from 'react-bootstrap';

class BrandsPanel extends Component {
    // get access to router from parent component
    // static contextTypes = {
    //     router: PropTypes.object
    // };

    componentWillMount() {
        // console.log('props', this.props);
    }

    onBrandClicked(brand) {
        //this.props.getReviewsForIntrinsic(category, intrinsicName);
    }

    render() {
        const brandsArray = this.props.allBrands.sort(); // All brands
        const category    = this.props.selectedCategory.id;
        const brands      = brandsArray.map((brand, idx) => {
            const tooltip = <Tooltip id={brand}>{`click for info.: "${brand}"`}</Tooltip>;
            return (
                <span key={idx}>
					<OverlayTrigger placement="top" overlay={tooltip}>
						<Link onClick={this.onBrandClicked.bind(this, brand)}
                              to={`/products/${category}/${brand}`}>{brand}</Link>
					</OverlayTrigger>
                    {idx < (brandsArray.length - 1)
                        ? <span id="item-seperator">
								{' | '}
							</span>
                        : null}
				</span>
            );
        });

        return (
            <Panel header="Sources by Brand">
				<span id="item-seperator">{'[ '}
				</span>{brands}
                <span id="item-seperator">
					{' ]'}</span>
            </Panel>
        );
    }
}

function mapStateToProps(state) {
    return {
        // selectedCategory  : state.category.selectedCategory,
        selectedCategory: state.category.categoryData.selectedCategory,
        selectedBrands:   state.category.categoryData.brands.selectedBrands,
        allBrands:        state.category.categoryData.brands.allBrands
    };
}

export default connect(mapStateToProps,
    {
        setCategory,
        getReviewsForIntrinsic
    })(BrandsPanel);
