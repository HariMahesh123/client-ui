import _                                                 from "lodash";
import React, { Component, PropTypes }                   from "react";
import { DropdownButton, Media, MenuItem, Modal, Panel } from "react-bootstrap";
import ReactImageFallback                                from "react-image-fallback";
import { connect }                                       from "react-redux";
import {
	brandClicked, curationUpdateBrand, getBrandData, getReviewsForBrandIntrinsic, intrinsicClicked, setBrandNames,
	setCategory, setNavigationType
}                                                        from "../../../actions/actions";
import * as Constants                                    from "../../../constants";
import * as Utils                                        from "../../../utils";
import PageHeading                                       from "../../shared/page_heading";
import CurationFormBrand                                 from "./curation_form";

class PageCategory extends Component {

    constructor(...args) {
        super(...args);
        this.state = {
            showCurationForm: false,
            id:               -1
        };
    }

    // get access to router from parent component
    static contextTypes = {
        router: PropTypes.object
    };

    componentWillMount() {
        if (this.props.navigationType !== 'brands') {
            this.props.setNavigationType('brands');
        }
        this.refresh(this.props);
    }

    componentWillReceiveProps(nextProps) {
        // test properties that affect product display and re-display if they have changed

        const brandPageNeedsUpdate =
                  nextProps.selectedBrands.toString() !== this.props.selectedBrands.toString() ||
                  nextProps.selectedIntrinsics.toString() !== this.props.selectedIntrinsics.toString() ||
                  nextProps.dataSourceThreshold !== this.props.dataSourceThreshold || !_.isEqual(nextProps.brandSort, this.props.brandSort) ||
                  this.props.selectedCategory.id !== nextProps.selectedCategory.id;

        if (brandPageNeedsUpdate) {
            this.refresh(nextProps);
        }
    }

    componentWillUpdate(nextProps, nextState) {
        //this.refresh();
    }

    onError(src) {
        Utils.debugLogger('page_brands: can\'t find image: [' + src + ']');
    }

    refresh(props) {
        const categoryName = props.selectedCategory.id;
        if (categoryName) {
            this.props.getBrandData(categoryName);
        }
    }

    handleReviewLinkClicked(category, brandId, intrinsic) {
        this.props.getReviewsForBrandIntrinsic(category, brandId, intrinsic);
    }

    handleIntrinsicReviewClicked(categoryName, brandId, intrinsic) {
        this.props.getReviewsForBrandIntrinsic(categoryName, brandId, intrinsic);
        this.context.router.push(`/sources/exemplars/${categoryName}/${brandId}/${intrinsic}`);
    }

    getIntrinsics(brandId) {
        // return this.props.allIntrinsics.map((intrinsic, idx) => {
        return this.props.selectedIntrinsics.map((intrinsic, idx) => {
            return (
                <MenuItem key={intrinsic}
                          eventKey={intrinsic}
                          onClick={this.handleIntrinsicReviewClicked.bind(this, this.props.selectedCategory.id,
                              brandId,
                              intrinsic)}>
                    {intrinsic}
                </MenuItem>
            );
        });
    }

    displayCurationForm(id) {
        this.setState({showCurationForm: true, id: id});
    }

    closeCurationForm() {
        this.setState({showCurationForm: false});
    }

    onSubmit(event) {
        event.preventDefault();
        const newName  = event.target.form.brand.value;
        const oldName  = event.target.form.brand.defaultValue;
        const logo     = event.target.form.logo.value;
        const wiki     = event.target.form.wiki.value;
        const homepage = event.target.form.homepage.value;
        const enabled  = event.target.form.enabled.checked;
        const obj      = {
            name:      newName,
            logo:      logo,
            wikipedia: wiki,
            homepage:  homepage,
            enabled:   enabled
        };

        this.props.curationUpdateBrand(this.props.selectedCategory.id, this.props.userId, oldName, obj);
        this.closeCurationForm();
    }

    render() {

        const windowClose = () => this.setState({showCurationForm: false});

        const name               = this.props.params.name;
        const logoStyle          = {
            objectFit: 'contain',
            width:     60,
            height:    60,
            marginTop: 5
        };
		const logoContainerStyle = {
			width: 300
		};

        const panelHeadingStyle = {
            height: 40,
            color:  'black'
        };
        const panelTitleStyle   = {
            paddingTop:  0,
            paddingLeft: 0
        };

        const selectedIntrinsics = this.props.selectedIntrinsics.join(', ');
        const categoryName       = this.props.selectedCategory.id;
        let sortType             = 'name';

        try {
            sortType = this.props.brandSort[categoryName].brands;
        } catch (e) {
            Utils.debugLogger('sortType not set', this.props.brandSort);
        } finally {
            sortType = Constants.BRAND_SORT_TYPE_MAPPING[sortType];
        }

        const panel = this.props.brandData.map((data, idx) => {
            let img = data.logo;
            // if (img) {
            // 	img = '//' + img.split('//')[1];
            // }

            const header = (
                <Media>
                    <Media.Left style={logoContainerStyle}>
                        <ReactImageFallback src={img ? img : require('../../../../static/images/empty.svg')}
                                            fallbackImage={require('../../../../static/images/empty.svg')} alt="logo"
                                            style={logoStyle}
                                            onError={this.onError}/>
                    </Media.Left>
                    <Media.Body style={panelTitleStyle}>
                        <h3>{data.name}</h3>
                    </Media.Body>
                </Media>
            );

            const viewDataSourcesPermitted = false; // disable for now

            const intrinsicsDropdown = <div>

                {viewDataSourcesPermitted ?
                    <DropdownButton bsSize="xsmall" title="sources by intrinsic" id="dropdown-size-xsmall" style={{
                        marginLeft: 5
                    }}>
                        {this.getIntrinsics(data.brandId)}
                    </DropdownButton> :
                    null
                }
            </div>;

            const body = (
                <div key={data.name}>
                    <div>{data.description}</div>
                    <h6>{`frequency: ${data.frequency.toFixed(4)}`}
                    </h6>
                    <div>
						<span id="review-link">{'home : '}
						</span>
                        <a id="review-link" href={data.homepage} target="_blank"
                           rel='noopener noreferrer'>{data.homepage}</a>
                    </div>
                    <div>
						<span id="review-link">{data.wikipedia
                            ? 'wikipedia : '
                            : ''}
						</span>
                        <a id="review-link" href={data.wikipedia} target="_blank">{data.wikipedia}</a>
                    </div>
                    <Modal show={this.state.showCurationForm && this.state.id === data.id} bsSize="large"
                           aria-labelledby="contained-modal-title-lg" onHide={windowClose}>
                        <Modal.Header closeButton>
                            <Modal.Title id="contained-modal-title-lg">Brand Curation</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <CurationFormBrand key={data.name} brand={data.name} wiki={data.wikipedia}
                                               homepage={data.homepage} logo={data.logo} enabled={data.enabled}
                                               handleClick={this.onSubmit.bind(this)}/>
                        </Modal.Body>
                        {/*<Modal.Footer>*/}
                        {/*<Button onClick={windowClose}>Close</Button>*/}
                        {/*</Modal.Footer>*/}
                    </Modal>
                </div>
            );

            const panelProps = {
                key:    data.id,
                header: header,
                //footer : intrinsicsDropdown,
                style:  {padding: 0, maxWidth: 600}
            };


            return (
                <Panel {...panelProps} key={idx}>
                    <Media>
                        <Media.Body>
                            <div style={{
                                height:    85,
                                overflowY: 'auto'
                            }}>{body}</div>
                        </Media.Body>
                    </Media>
                </Panel>
            );

            // let enabled = data.status === 1;
			//
            // if (!enabled) {
            //     panelProps.bsStyle = "danger";
            // }
			//
            // if (!enabled && !(this.props.role === Constants.ROLE_ADMINISTRATOR)) {
            //     return null;
            // } else {
            //     return (
            //         <Panel {...panelProps} key={idx}>
            //             <Media>
            //                 <Media.Body>
            //                     <div style={{
            //                         height:    85,
            //                         overflowY: 'auto'
            //                     }}>{body}</div>
            //                 </Media.Body>
            //             </Media>
            //         </Panel>
            //     );
            // }
        });

        return (
            <div>
                <PageHeading title={`${this.props.selectedCategory.title}`}/>
                <Panel style={{maxWidth: 600}}>
                    <h6 id="summary-property">{'selected brands : '}{this.props.selectedBrands.length === 0
                        ? <span id="warning-text">{'Please select at least one brand.'}</span>
                        : null}</h6>
                    <h6 id="brands-summary">{this.props.selectedBrands.join(', ')}</h6>
                    <h6 id="brands-summary">
                        <span id="summary-property">{'review threshold : '}</span>
                        {this.props.dataSourceThreshold}</h6>
                    <h6 id="brands-summary">
                        <span id="summary-property">{'sort : '}</span>
                        {sortType}</h6>
                    <h6 id="brands-summary">
						<span id="summary-property">{'intrinsics : '}
						</span>{selectedIntrinsics}</h6>
                </Panel>
                <div>
                    {panel}
                </div>
            </div>
        );


    }
}

function mapStateToProps(state) {
    return {
        userData:           state.userData.userData,
        role:               state.userData.userData.role,
        permissions:        state.userData.userData.permissions,
        userId:             state.userData.userData.id,
        selectedCategory:   state.userData.userData.selectedCategory,
        brandData:          state.brands.brandData,
        brands:             state.brands,
        brandsChecked:      state.category.categoryData.brands.brandsChecked,
        selectedBrands:     state.category.categoryData.brands.selectedBrands,
        selectedIntrinsics: state.category.categoryData.intrinsics.selectedIntrinsics,
        allIntrinsics:      state.category.categoryData.intrinsics.allIntrinsics,
        brandSort:          state.nav.brandSort,
        navigationType:     state.category.navigationType
    };
}

export default connect(mapStateToProps, {
    setCategory,
    getBrandData,
    brandClicked,
    getReviewsForBrandIntrinsic,
    setBrandNames,
    intrinsicClicked,
    setNavigationType,
    curationUpdateBrand
})(PageCategory);
