import React, {Component} from 'react';
import {Panel} from 'react-bootstrap';
import {connect} from 'react-redux';
// import { setNavigationType }            from '../../actions/actions';
import {getReviewsForIntrinsic, setCategory} from '../../actions/actions';

class CategoryReviewsByIntrinsic extends Component {
    // get access to router from parent component
    // static contextTypes = {
    //     router: PropTypes.object
    // };

    componentWillMount() {
        // console.log('props', this.props);
    }

    onIntrinsicClicked(category, intrinsic) {
        this.props.getReviewsForIntrinsic(category, intrinsicName);
    }

    render() {
        // console.error('category views by intrinsic');
        //const intrinsicsArray = Object.getOwnPropertyNames(this.props.brandSummary.intrinsics).sort(); // All
        // intrinsics const intrinsicsArray = this.props.selectedIntrinsics.sort(); // Show only selected
        const category = this.props.selectedCategory.id;
        // const categoryTitle = this.props.selectedCategory.title;
        //const intrinsics = intrinsicsArray.map((intrinsic, idx) => {
        //    const tooltip = <Tooltip id={intrinsic}>{`click for info.: "${intrinsic}"`}</Tooltip>;
        //    return (
        //        <span key={idx}>
        //		<OverlayTrigger placement="top" overlay={tooltip}>
        //			<Link onClick={this.onIntrinsicClicked.bind(this, category, intrinsic)}
        //                      to={`/sources/exemplars/${category}/${intrinsic}`}>{intrinsic}</Link>
        //		</OverlayTrigger>
        //            {idx < (intrinsicsArray.length - 1)
        //                ? <span id="item-seperator">
        //					{' | '}
        //			</span>
        //                : null}
        //	</span>
        //    );
        //});

        return (
            <Panel header="Sources by Intrinsic">
				<span id="item-seperator">{'[ '}
				</span>
                {/*{intrinsics}*/}
                <span id="item-seperator">
				{' ]'}</span>
            </Panel>
        );
    }
}

function mapStateToProps(state) {
    return {
        selectedCategory:   state.category.categoryData.selectedCategory,
        selectedIntrinsics: state.category.categoryData.intrinsics.selectedIntrinsics
    };
}

export default connect(mapStateToProps,
    {
        setCategory,
        getReviewsForIntrinsic
    })(CategoryReviewsByIntrinsic);
