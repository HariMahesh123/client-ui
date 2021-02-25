import _ from 'lodash';
import numeral from 'numeral';
import React, {Component, PropTypes} from 'react';
import {Button, Glyphicon, Media, Modal, Panel} from 'react-bootstrap';
import EllipsisText from 'react-ellipsis-text';
import InfiniteScroll from 'react-infinite-scroll-component'; //https://www.npmjs.com/package/react-infinite-scroll-component
import {connect} from 'react-redux';
import {
    fetchNextProducts,
    fetchProducts,
    getProductSentimentByWeek,
    setCategory,
    setNavigationType
} from '../../../actions/actions';
import * as Constants from '../../../constants';
import * as Utils from '../../../utils';
import ProductSentimentByWeek from '../../charts/product_sentiment';
import PageHeading from '../../shared/page_heading';


// import InfiniteScroll                 from 'redux-infinite-scroll';

//import Waypoint                       from 'react-waypoint';

class PageProducts extends Component {

    constructor(...args) {
        super(...args);
        this.state = {
            showChart:   false,
            open:        true,
            loadingMore: false
        };
    }

    // get access to router from parent component
    static contextTypes = {
        router: PropTypes.object
    };

    componentWillUpdate(nextProps, nextState) {
        // Utils.debugLogger('componentWillUpdate', nextProps, nextState);
        // Utils.debugLogger('componentWillUpdate');
        // perform any preparations for an upcoming update
    }

    componentWillMount() {
        // Utils.debugLogger('page_products will mount', this.props.params);

        if (this.props.navigationType !== 'products') {
            this.props.setNavigationType('products');
        }

        if (this.props.params.hasOwnProperty('brand')) {
            this.props.fetchProducts(this.props.selectedCategory.id, [this.props.params.brand]);
        } else {
            this.props.fetchProducts(this.props.selectedCategory.id);
        }
    }

    componentWillReceiveProps(nextProps) {
        // test properties that affect product display and re-display if they have changed
        // Utils.debugLogger('sort', nextProps.productSort, this.props.productSort);

        // if(!_.isEqual(nextProps.productReviewData, this.props.productReviewData)) {
        //   this.setState({ loadingMore: false });
        // }

        const productPageNeedsUpdate =
                  !_.isEqual(nextProps.selectedBrands, this.props.selectedBrands) || !_.isEqual(nextProps.selectedIntrinsics, this.props.selectedIntrinsics) || !_.isEqual(nextProps.dataSourceThreshold, this.props.dataSourceThreshold) || !_.isEqual(nextProps.productSort, this.props.productSort) || !_.isEqual(nextProps.selectedCategory.id, this.props.selectedCategory.id);

        if (productPageNeedsUpdate) {
            this.props.fetchProducts(nextProps.selectedCategory.id);
        }
    }

    handleError(src) {
        Utils.debugLogger("page_products: can't find image: [" + src + ']');
    }

    //refresh() {
    //    const categoryName = this.props.selectedCategory.id;
    //    if (categoryName) {
    //        this.props.fetchProducts(categoryName);
    //    }
    //    this.context.router.push(`/products/${categoryName}`);
    //}

    fetchNextProducts() {
        // Utils.debugLogger('fetchNextProducts');

        this.props.fetchNextProducts(this.props.selectedCategory.id, 0); // make start 0 for now, later will be used to
                                                                         // page
    }

    fetchPreviousProducts(obj) {
        //if (obj.previousPosition && obj.currentPosition === 'inside' && (this.props.end < this.props.total)) {
        //    this.props.fetchNextProducts(this.props.selectedCategory.id, this.props.end - 10, this.props.signature);
        //}
    }

    handlePageChanged(newPage) {
        Utils.debugLogger('handlePageChanged', newPage);
        this.props.fetchNextProducts(this.props.selectedCategory.id, newPage * Constants.PRODUCTS_PER_PAGE);
    }

    displayJSON(category, id) {

        const url  = `${Constants.PREDICTA_SERVICES_DOMAIN}/product/${category}/${id}?pretty`;
        const w    = 500;
        const h    = 500;
        const left = Math.round((screen.width / 2) - (w / 2));
        const top  = Math.round((screen.height / 2) - (h / 2));

        Utils.debugLogger('displayJSON', url);

        window.open(url, 'JSON', 'toolbar=no, location=no, directories=no, status=no, ' + 'menubar=no, scrollbars=yes, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
    }

    displaySentimentChart(idx) {
        this.props.getProductSentimentByWeek(this.props.selectedCategory.id, this.props.products[idx].id);
        this.setState({showChart: true});
    }

    render() {

        const windowClose            = () => this.setState({showChart: false});
        const multipleBrandsSelected = this.props.selectedBrands.length > 1;

        const dateStrings = this.props.productSentimentByWeek.quintiles
            ? Object.keys(this.props.productSentimentByWeek.quintiles).sort()
            : [];

        const x         = dateStrings.map(item => {
            return item;
            // return ' ' + item; (make it text, rather than date)
        });
        const quintiles = ['20', '40', '60', '80', '100'];

        const traces = quintiles.map((quintile, idx) => {
            let obj     = {};
            let val     = null;
            let dateObj = {};

            obj.x    = x;
            obj.name = quintile;

            obj.y           = dateStrings.map(item => {
                dateObj = this.props.productSentimentByWeek.quintiles[item];
                return dateObj[parseInt(quintile)];
            });
            obj.type        = 'bar';
            obj.marker      = {color: Constants.COLORS_SENTIMENT[idx]};
            obj.connectgaps = true;
            return obj;
        });

        const data = null;

        const chartWindow = <Modal show={this.state.showChart}
                                   bsSize="large"
                                   aria-labelledby="contained-modal-title-lg"
                                   onHide={windowClose}>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-lg">{this.props.productSentimentByWeek.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ProductSentimentByWeek className="intrinsics-plotly"
                                        data={traces}
                                        title={'Product Sentiment Over Time'}/>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={windowClose}>Close</Button>
            </Modal.Footer>
        </Modal>;

        const panelHeadingStyle = {
            height: 40,
            color:  'black'
        };

        const container = {
            // height: 430,
            overflow:      'auto',
            paddingTop:    10,
            paddingBottom: 10,
            position:      'relative'
        };

        // if (!this.props.products || this.props.products.length === 0) {
        // 	return null;
        // }

        const panels = this.props.products.map((data, idx) => {
            const header = (
                <div><EllipsisText text={data.name}
                                   length={120}/></div>
            );

            const viewJsonPermitted        = this.props.permissions[Constants.PERMISSIONS_VIEW_JSON];
            const viewDataSourcesPermitted = this.props.permissions[Constants.PERMISSIONS_VIEW_DATA_SOURCES];

            const footer = <div>
                {/*<Button bsSize="xsmall" onClick={this.displaySentimentChart.bind( this, idx )}>Display Product Sentiment</Button>*/}
                {viewJsonPermitted
                    ? <Button bsSize="xsmall"
                              onClick={this.displayJSON.bind(this, this.props.selectedCategory.id, data.id)}
                              style={{
                                  marginLeft: 10
                              }}>JSON</Button>
                    : null}
                <span id='review-rating'
                      style={{
                          marginLeft: 10
                      }}>
					<b>{data.brand} {`score : ${numeral(data.frequency).format('0.00')}`} </b>
					</span>
            </div>;

            const imageSize  = 170;
            const descHeight = 150;
            //const panelHeight = imageSize + descHeight + 48;

            let props  = {
                width: imageSize
            };
            let spacer = {
                paddingLeft:  0,
                paddingRight: 0
            };

            if (data.productImages.length) {
                const w     = data.productImages[0].width;
                const h     = data.productImages[0].height;
                const ratio = w / h;

                // width < height
                if (ratio < 1.0) {
                    props.height        = imageSize;
                    props.width         = ratio * props.height;
                    spacer.paddingLeft  = (imageSize - props.width) / 2;
                    spacer.paddingRight = spacer.paddingLeft + 10;
                } else { // width > height
                    props.width         = imageSize;
                    props.height        = 1 / ratio * props.width;
                    spacer.paddingLeft  = 0;
                    spacer.paddingRight = 10;
                }
            }

            //const productPhotos = data.productImages.length > 1
            //    ? <ImageCarousel {...props} images={data.productImages.map((image) => {
            //        {/*return (image.url ? ('//' + image.url.split('//')[1]) : null);*/
            //        }
            //        return (image);
            //    })} />
            //    : <ReactImageFallback src={data.productImages.length > 0 ? data.productImages[0] :
            // require('../../../../static/images/empty.svg')} // use this image if no images are available
            // fallbackImage={require('../../../../static/images/empty.svg')} // this one is used if there's an error
            // alt='product image' style={props} onError={this.handleError} />;

            const productPhotos = <img
                src={data.productImages.length > 0 ? data.productImages[0] : require('../../../../static/images/empty.svg')} // use this image if no images are available
                fallbackImage={require('../../../../static/images/empty.svg')} // this one is used if there's an error
                alt='product image'
                style={props}
                onError={this.handleError}/>;

            return (
                <Panel key={idx}
                       header={header}
                       footer={footer}
                       style={{maxWidth: 600, overflowY: 'auto'}}>
                    <Media>
                        <Media.Left style={spacer}>
                            {productPhotos}
                        </Media.Left>
                        <Media.Body>
                            {/* <Media.Heading>Review</Media.Heading> */}
                            {/*<blockquote>*/}
                            <div style={{
                                height:    descHeight,
                                overflowY: 'auto'
                            }}>{data.description}</div>
                            {/*</blockquote>*/}
                        </Media.Body>
                    </Media>
                </Panel>
            );
        });

        const nPerPage   = Constants.PRODUCTS_PER_PAGE;
        const totalPages = Math.ceil(this.props.total / nPerPage);
        const current    = this.props.start / nPerPage;

        const pagerProps = {
            total:         totalPages,
            current:       current, // page 1 = 0
            visiblePages:  10,
            onPageChanged: this.handlePageChanged.bind(this)
        };

        Utils.debugLogger('total', totalPages, 'current', current);

        return (
            <div>
                <PageHeading title={`${this.props.selectedCategory.title}`}/>
                <Button onClick={() => this.setState({
                    open: !this.state.open
                })}
                        bsStyle='link'>
                    {this.state.open
                        ? <span><Glyphicon glyph='collapse-up'/>
								<span>{' collapse'}</span>
							</span>
                        : <span><Glyphicon glyph='collapse-down'/>
							<span>{'expand'}</span>
						</span>}
                </Button>
                <Panel collapsible
                       expanded={this.state.open}
                       style={{maxWidth: 600}}>
                    <h6 id='summary-property'>{'selected brands : '}{this.props.selectedBrands.length === 0
                        ? <span id='warning-text'>{'please select at least one brand.'}</span>
                        : null}</h6>
                    <h6 id='brands-summary'>{this.props.selectedBrands.join(', ')}</h6>
                    <h6 id='brands-summary'>
                        <span id='summary-property'>{'sort : '}</span>
                        {this.props.productSort[this.props.selectedCategory.id]
                            ? {
                                rank:            'score',
                                name:            'brand',
                                dataSourceCount: 'source count'
                            }[this.props.productSort[this.props.selectedCategory.id].products]
                            : (multipleBrandsSelected ? 'brand' : 'score')}</h6>
                    {/*<h6 id='brands-summary'><span id='summary-property'>sort:</span> {this.props.productSort[this.props.selectedCategory.id] ? this.props.productSort[this.props.].products: 'name'}</h6> */}
                </Panel>
                <div style={container}>

                    {chartWindow}

                    <InfiniteScroll next={this.handlePageChanged.bind(this, current + 1)}
                                    hasMore={(current + 1) < totalPages}
                                    loader={<h4 style={{maxWidth: 600}}>loading...</h4>}
                                    endMessage={<h4 style={{maxWidth: 600}}> ~ end ~</h4>}>
                        {panels}

                    </InfiniteScroll>

                </div>
                {/* {totalPages > 1 ? <Pager {...pagerProps}/> : null } */}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        role:                   state.userData.userData.role,
        permissions:            state.userData.userData.permissions,
        // selectedCategory       : state.category.selectedCategory,
        selectedCategory:       state.category.categoryData.selectedCategory,
        lastEvaluatedKey:       state.products.lastEvaluatedKey,
        end:                    0, // TODO
        products:               state.products.products,
        productSentimentByWeek: state.visualizationData.productSentimentByWeek,
        selectedBrands:         state.category.categoryData.brands.selectedBrands,
        selectedIntrinsics:     state.category.categoryData.intrinsics.selectedIntrinsics,
        dataSourceThreshold:    state.nav.dataSourceThreshold,
        productSort:            state.nav.productSort,
        navigationType:         state.category.navigationType
    };
}

export default connect(mapStateToProps, {
    setCategory,
    fetchProducts,
    fetchNextProducts,
    setNavigationType,
    getProductSentimentByWeek
})(PageProducts);
