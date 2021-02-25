import moment from 'moment';
import React, {Component, PropTypes} from 'react';

import {Button, Media, PageHeader} from 'react-bootstrap';

import ReactImageFallback from 'react-image-fallback';
import {connect} from 'react-redux';
import {fetchProducts, getAllDataSourcesForProduct, setCategory} from '../../../actions/actions';
import * as Utils from '../../../utils';


class PageProductReviews extends Component {

    // get access to router from parent component
    static contextTypes = {
        router: PropTypes.object
    };

    componentWillMount() {

        // getDataSourcesForProductIntrinsic

        const productId = this.props.params.productId;
        const category  = this.props.selectedCategory;

        this.props.getAllDataSourcesForProduct(category.id, productId);
    }

    componentDidMount() {
    }

    handleError(src) {
        Utils.debugLogger('page_product_reviews: can\'t find image: [' + src + ']');
    }

    render() {

        const bodyStyle         = {
            padding: 0
        };
        const imageStyle        = {
            objectFit:    'contain',
            width:        150,
            height:       150,
            paddingRight: 20,
            marginTop:    20
        };
        const panelHeadingStyle = {
            height: 40,
            color:  'black'
        };
        const idx               = this.props.params.productId;
        // const name = this.props.productReviewData[idx]
        // 		? this.props.productReviewData[idx].name
        // 	: [];

        let firstRecord = null;

        if (!this.props.allDataSourcesForProducts || !this.props.allDataSourcesForProducts.length) {
            return <div/>;
        } else {
            firstRecord = this.props.allDataSourcesForProducts[0];
        }

        const panels = this.props.allDataSourcesForProducts.map((data, idx) => {
            let d = moment(new Date(data.date));
            if (d.isValid()) {
                d = d.format('MMM DD, YYYY');
            } else {
                d = '?';
            }

            return (
                <div key={idx} style={{maxWidth: 600}}>
                    <div>
                        <h3 id="review-title" className="panel-title">
							<span id="review-date">
								{`source : [${data.type}] : `}
                                <b>{d}</b>
							</span>
                        </h3>
                    </div>
                    <div>

                        <Media style={bodyStyle}>
                            <Media.Body>
                                <h6>{data.body}</h6>
                                <h6 id="review-rating">{'rating : '}
                                    <b>{data.rating >= 0
                                        ? data.rating
                                        : 'no rating'}</b>
                                </h6>
                                <a id="review-link" href={firstRecord.url} target="_blank"
                                   rel='noopener noreferrer'>{data.url}</a>
                            </Media.Body>
                        </Media>
                        <hr/>
                    </div>
                </div>
            );
        });

        let img = firstRecord.image.url;
        // if (img) {
        // 	img = '//' + img.split('//')[1];
        // }


        return (
            <div>
                <PageHeader style={panelHeadingStyle}>{this.props.selectedCategory.title}{' : Sources'}
                    {/*<small>{name}</small>*/}
                    <Button onClick={this.context.router.goBack} bsStyle="link">{'← go back'}</Button>
                </PageHeader>
                <h3 id="review-title" className="panel-title">{firstRecord.productName}</h3>
                <ReactImageFallback src={img} fallbackImage={require('../../../../static/images/empty.svg')} alt="logo"
                                    style={imageStyle} onError={this.handleError}/>
                <hr/>
                <h3 id="review-title" className="panel-title">{'Sources:'}</h3>
                <hr/>
                {panels}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        // selectedCategory          : state.category.selectedCategory,
        selectedCategory:          state.category.categoryData.selectedCategory,
        productReviewData:         state.products.products,
        allDataSourcesForProducts: state.products.dataSources
    };
}

export default connect(mapStateToProps,
    {
        setCategory,
        fetchProducts,
        getAllDataSourcesForProduct
    })(PageProductReviews);
