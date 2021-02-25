import _ from "lodash";
import React, {Component} from "react";
import {Badge, Button, ButtonGroup, Nav, Navbar, NavItem, Panel, PanelGroup} from "react-bootstrap";
import {BootstrapTable, TableHeaderColumn} from "react-bootstrap-table";
import {connect} from "react-redux";
// actions
import {getBrandData, setBrandNames, setIntrinsicsNames, setPreferredBrands, setPreferredIntrinsics, setRefineByType} from "../../actions/actions";
import BrandSort from "./sort/brand_sort";
import ProductSort from "./sort/product_sort";

class LeftNav extends Component {
    constructor() {
        super();

        this.state = {
            activePanel: 'brands'
        };

        this.onSetSelectedBrands = this.onSetSelectedBrands.bind(this);
        this.onSetSelectedIntrinsics = this.onSetSelectedIntrinsics.bind(this);
        this.activePanel = 'brands';
        this.formatName = this.formatName.bind(this);
    }

    resize = () => this.forceUpdate();

    componentDidMount() {
        window.addEventListener('resize', this.resize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize);
    }

    onSetRefineByType(name) {
        this.props.setRefineByType(name);
    }

    getTableData(table) {

        let keys = Object.keys(table);
        return keys.map(key => {
            return (table[key]);
        });
    }

    onSetSelectedBrands(e) {
        const clickedBrandId = Number(e.target.getAttribute('name'));

        if (clickedBrandId) {
            let selectedBrandIds = this.props.selectedBrandIds.slice(0);

            if (_.includes(selectedBrandIds, clickedBrandId)) {
                // remove it
                selectedBrandIds = _.remove(this.props.selectedBrandIds, function (n) {
                    return n !== clickedBrandId;
                });

            } else {
                // add it
                selectedBrandIds.push(clickedBrandId);
            }

            this.props.setBrandNames(this.props.allBrandIds, this.props.preferredBrandIds, selectedBrandIds, 'all', this.props.selectedCategory.id);
            this.props.setPreferredBrands(this.props.selectedCategory.id, this.props.userId, selectedBrandIds);

        }
    }

    onSetSelectedIntrinsics(e) {

        const clickedIntrinsicId = e.target.getAttribute('name');

        if (clickedIntrinsicId) {
            let selectedIntrinsicIds = this.props.selectedIntrinsicIds.slice(0);

            if (_.includes(selectedIntrinsicIds, clickedIntrinsicId)) {
                // remove it
                selectedIntrinsicIds = _.remove(this.props.selectedIntrinsicIds, function (n) {
                    return n !== clickedIntrinsicId;
                });

            } else {
                // add it
                selectedIntrinsicIds.push(clickedIntrinsicId);
            }

            let allIntrinsicIds = this.props.allIntrinsicIds;
            let preferredIntrinsicsIds = this.props.preferredIntrinsicIds;
            let categoryId = this.props.selectedCategory.id;
            let userId = this.props.userId;

            // all params are ids
            this.props.setIntrinsicsNames(allIntrinsicIds, preferredIntrinsicsIds, selectedIntrinsicIds, 'all', categoryId);

            // all params are ids
            this.props.setPreferredIntrinsics(categoryId, userId, selectedIntrinsicIds);

        }
    }

    formatName(cell, row) {

        let name = row.name;
        let id = row.id;
        let intrinsicColors = this.props.intrinsicColors;
        let brandColors = this.props.brandColors;
        let colors = this.state.activePanel === 'brands' ? brandColors : intrinsicColors;

        return row.selected ?
            <div className='table-name-selected'
                //name={id}><i className="fa fa-check-square-o"
                 name={id}><i className="fa fa-circle"
                              aria-hidden="true"
                              style={{
                                  color : _.get(colors, `${id}`, 'transparent'),
                                  cursor: 'pointer',
                                  //backgroundColor: _.get(intrinsicColors, `${id}`, 'transparent')
                              }}
                              name={id} />{` - ${name}`}</div> :
            <div className='table-name'
                 name={id}><i className="fa fa-circle-o"
                              aria-hidden="true"
                              style={{
                                  color : _.get(colors, `${id}`, 'transparent'),
                                  cursor: 'pointer',
                                  //backgroundColor: _.get(intrinsicColors, `${id}`, 'transparent')
                              }}
                              name={id} />{` - ${name}`}</div>;
    }

    sortByName(a, b, order) {   // order is desc or asc
        if (order === 'desc') {
            return ((a.selected === b.selected) ? 0 : a.selected ? -1 : 1) || a.name.localeCompare(b.name);
        } else {
            return ((a.selected === b.selected) ? 0 : a.selected ? 1 : -1) || b.name.localeCompare(a.name);
        }
    }

    onSelect(eventKey) {

        const val = 'all';

        let allIntrinsicIds = Object.keys(this.props.allIntrinsicsMapInverted);
        let categoryId = this.props.selectedCategory.id;
        let allBrandIds = this.props.allBrandIds;
        let preferredBrandIds = this.props.preferredBrandIds;
        let preferredIntrinsicIds = this.props.preferredIntrinsicIds;
        let userId = this.props.userId;

        switch (eventKey) {
            case 'all':
                if (this.state.activePanel === 'brands') {
                    this.props.setBrandNames(allBrandIds, preferredBrandIds, /** **/ allBrandIds, val, categoryId);
                    this.props.setPreferredBrands(categoryId, userId, allBrandIds);
                } else {
                    this.props.setIntrinsicsNames(allIntrinsicIds, preferredIntrinsicIds, /** **/allIntrinsicIds, val, categoryId);
                    this.props.setPreferredIntrinsics(categoryId, userId, allIntrinsicIds);
                }
                break;
            case 'none':
                if (this.state.activePanel === 'brands') {
                    this.props.setBrandNames(allBrandIds, preferredBrandIds, /** **/ [], val, categoryId);
                    this.props.setPreferredBrands(categoryId, userId, []);

                } else {
                    this.props.setIntrinsicsNames(allIntrinsicIds, preferredIntrinsicIds, /** **/ [], val, categoryId);
                    this.props.setPreferredIntrinsics(categoryId, userId, []);
                }
            default:
                break;
        }
    }

    footer() {
        const type = this.state.activePanel;
        const total = type === 'brands' ? this.props.allBrandIds.length : this.props.allIntrinsicIds.length;
        const numSelected = type === 'brands' ? this.props.selectedBrandIds.length : this.props.selectedIntrinsicIds.length;

        const badge = (<Badge className="badge">{numSelected}</Badge>);

        let msg = '';

        if (total === numSelected) {
            msg = <span><Badge className="badge">{'all'}</Badge></span>;
        } else {
            if (numSelected === 0) {
                msg = <span><Badge className="badge">{'none'}</Badge></span>;
            } else {
                msg = <span>{badge}{` of ${total} ${type}`}</span>;
            }
        }

        return (<span>{'selected: '}{msg}</span>);
    }

    createTable(type, data) {

        if (!data) return (<div>{'Loading'}</div>);

        const options = {
            defaultSortName : 'name',
            defaultSortOrder: 'desc'
        };

        return (
            <Panel header={null}
                   footer={this.footer()}>

                <Navbar collapseOnSelect>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <a href="#"
                               style={{fontSize: 14, cursor: 'default'}}>select:</a>
                        </Navbar.Brand>
                        <Navbar.Toggle />
                    </Navbar.Header>
                    <Navbar.Collapse>
                        <Nav>
                            <NavItem eventKey={'all'}
                                     href="#"
                                     style={{fontSize: 12}}
                                     onSelect={this.onSelect.bind(this)}>all</NavItem>
                            <NavItem eventKey={'none'}
                                     href="#"
                                     style={{fontSize: 12}}
                                     onSelect={this.onSelect.bind(this)}>none</NavItem>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>

                <BootstrapTable data={this.getTableData(data)}
                                bordered={false}
                                condensed
                                maxHeight={`${window.innerHeight - 320 }px`}
                                minHeight={'400px'}
                                tableStyle={{border: 'none'}}
                                striped
                                options={options}>

                    <TableHeaderColumn isKey
                                       hidden
                                       dataField='id'
                                       headerAlign='left'
                                       dataAlign='left'
                                       editable={false}
                                       dataSort={false}>{type}</TableHeaderColumn>

                    <TableHeaderColumn dataField='name'
                                       headerAlign='left'
                                       dataAlign='left'
                                       editable={false}
                                       dataSort={true}
                                       filter={{type: 'TextFilter', delay: 500}}
                                       tdAttr={{'onClick': type.toLowerCase() === 'brands' ? this.onSetSelectedBrands : this.onSetSelectedIntrinsics}}
                                       sortFunc={this.sortByName}
                                       dataFormat={this.formatName.bind(this)}>{type.toLowerCase()}</TableHeaderColumn>


                </BootstrapTable>
            </Panel>
        );
    }

    render() {

        const brandSettings = <BrandSort />;
        const productSettings = <ProductSort />;
        const visualizeSettings = null;

        let settings = null;
        let settingsHeading = null;

        switch (this.props.navigationType) {
            case 'category':
                settingsHeading = null;
                settings = null;
                break;
            case 'brands':
                settings = brandSettings;
                break;
            case 'products':
                settings = productSettings;
                // intrinsicsPanel = null;
                break;
            case 'visualize':
                settings = visualizeSettings;
                break;
            default:
                break;
        }

        const activePanel = this.state.activePanel === 'brands' ?
            this.createTable('Brands', this.props.brandTable) :
            this.createTable('Intrinsics', this.props.intrinsicTable);

        return (
            <div style={{maxWidth: 300, marginTop: 25}}>
                <ButtonGroup style={{marginBottom: 10}}>
                    <Button active={this.state.activePanel === 'brands'}
                            onClick={() => this.setState({activePanel: 'brands'})}
                            style={{width: 150}}>Brands</Button>
                    <Button active={this.state.activePanel === 'intrinsics'}
                            onClick={() => this.setState({activePanel: 'intrinsics'})}
                            style={{width: 150}}>Intrinsics</Button>
                </ButtonGroup>
                <PanelGroup>
                    {activePanel}
                </PanelGroup>
                {settingsHeading}
                {settings}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        userId                  : state.userData.userData.id,
        //
        intrinsicTable          : _.get(state, "category.categoryData.intrinsics.intrinsicTable", []),
        intrinsicColors         : _.get(state, "category.categoryData.intrinsics.colors", []),
        brandColors             : _.get(state, "category.categoryData.brands.colors", []),
        brandTable              : _.get(state, "category.categoryData.brands.brandTable", []),
        //
        selectedCategory        : state.category.categoryData.selectedCategory,
        //
        navigationType          : state.category.navigationType,
        refineByType            : state.category.refineByType,
        //
        allIntrinsicsMap        : _.get(state, "category.categoryData.intrinsics.allIntrinsicsMap", {}),
        allIntrinsicsMapInverted: _.get(state, "category.categoryData.intrinsics.allIntrinsicsMapInverted", {}),
        //
        allIntrinsicIds         : _.get(state, "category.categoryData.intrinsics.allIntrinsicIds", []),
        preferredIntrinsics     : _.get(state, "category.categoryData.intrinsics.preferredIntrinsicIds", []),
        selectedIntrinsicIds    : _.get(state, "category.categoryData.intrinsics.selectedIntrinsicIds", []),
        //
        allBrandIds             : _.get(state, "category.categoryData.brands.allBrandIds", []),
        preferredBrandIds       : _.get(state, "category.categoryData.brands.preferredBrandIds", []),
        selectedBrandIds        : _.get(state, "category.categoryData.brands.selectedBrandIds", []),
        //
        userIntrinsicsControl   : state.nav.userIntrinsicsControl,
        userBrandsControl       : state.nav.userBrandsControl
    };
}

export default connect(mapStateToProps, {
    setRefineByType,
    getBrandData,
    setBrandNames,
    setIntrinsicsNames,
    setPreferredBrands,
    setPreferredIntrinsics
})(LeftNav);
