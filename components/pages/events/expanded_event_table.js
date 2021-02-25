import React, { Component }                  from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { connect }                           from "react-redux";
import { Dropdown }                          from "semantic-ui-react";
import { createEvent, updateEvent }          from "../../../actions/actions";
//import PopoverImage from './PopoverImage';
import * as Constants                        from "../../../constants";


class MultiSelector extends Component {
	constructor( props ) {
		super( props );
		this.updateData = this.updateData.bind( this );
		this.onChange   = this.onChange.bind( this );

	}

	updateData() {
	};

	onChange( e, data ) {
		console.log( "e", e, data.value, this.props.row );

		let eventObj    = this.props.row;
		const list      = this.props.list;
		const listValue = data.value;

		if ( !listValue.length ) {
			delete eventObj[ list ];
		} else {
			eventObj[ list ] = listValue;
		}

		console.log( "eventObj", eventObj );

		//this.props.globalProps.updateEvent(eventObj);
		this.props.globalProps.createEvent( eventObj );
	};


	render() {

		const nameMap = {
			"brandIdList"            : "brands",
			"intrinsicIdList"        : "intrinsics",
			"productIdList"          : "products",
			"publicationLocationList": "publications"
		};

		const name = nameMap[ this.props.list ];

		const options = this.props.list === "brandIdList" ? this.props.globalProps.brandsOptions : this.props.globalProps.intrinsicsOptions;

		const placeholder = name;

		return <Dropdown className={ "eventItemsDropdown" } placeholder={ placeholder } fluid multiple scrolling search
						 selection options={ options }
						 header={ `select ${name}` } defaultValue={ this.props.defaultValue }
						 onChange={ this.onChange }/>;
	}
}


const createListEditor = ( onUpdate, props ) => ( <MultiSelector onUpdate={ onUpdate } { ...props }/> );

class BSTable extends Component {

	componentWillMount() {
		console.log( "BSTable:componentWillMount" );
	}

	//state = {selectedProductIndex: 0};
	//
	//dropdownHandler (event, data) {
	//    this.setState({selectedProductIndex: data.value});
	//}

	//showProducts (products) { // used by 'bad' table
	//
	//    products = _.sortBy(products, 'name');
	//
	//    const options = products.map((product, idx) => {
	//
	//        let o = {};
	//        o.key = product.productId;
	//        o.value = idx;
	//        o.text = product.name;
	//        return o;
	//    });
	//
	//    if (!products.length) {
	//        return 'no products found';
	//    }
	//
	//    //console.log('index', this.state.selectedProductIndex);
	//
	//    let images = products[this.state.selectedProductIndex].images;
	//
	//    let popoverImage = <PopoverImage images={images} placement={"left"}
	// title={products[this.state.selectedProductIndex].name}/>;  /** product list **/  let dropDown = <Dropdown
	// placeholder='Select product' selection selectOnBlur={false} scrolling defaultValue={0}
	// onChange={this.dropdownHandler.bind(this)} options={options} />;  return (  <Segment.Group horizontal> <Segment
	// raised textAlign={'center'}><PopoverImage images={[this.props.data.logo]} placement={"right"}
	// title={this.props.data.brandName}/></Segment> <Segment raised textAlign={'center'}>{options.length ? dropDown :
	// 'no products found'}</Segment> <Segment raised textAlign={'center'}>{popoverImage}</Segment> </Segment.Group>
	// ); }

	beforeSaveCell( data, prop, value ) {
		// if you dont want to save this editing, just return false to cancel it.

		// TODO: data needs to be cleaned up and perform validation
		if ( value === "" ) return false;

		const lists = Constants.EVENT_LISTS;

		// if we're updating a list, convert string to array
		if ( lists.indexOf( prop ) >= 0 ) {
			value = value.split( "," );
		}
		data[ prop ] = value;

		this.props.updateEvent( data );

		return true;
	}


	render() {

		function listFormatter( cell, row ) {
			if ( typeof cell === "string" ) {
				return cell.toLowerCase();
			} else {
				return cell;
			}
		}

		function brandListFormatter( cell, row ) {
			if ( cell ) {
				const brandNamesArray = cell.map( id => this.props.brandIdToName[ Number( id ) ] );
				return brandNamesArray.toString();
			}
		}

		function intrinsicListFormatter( cell, row ) {
			if ( cell ) {
				const intrinsicNamesArray = cell.map( id => this.props.intrinsicIdToName[ id ] );
				return intrinsicNamesArray.toString();
			}
		}

		const data    = this.props.data;
		const tdStyle = {width: "140px", maxWidth: "140px", wordBreak: "break-all", height: "200px"};
		const thStyle = {width: "140px", wordBreak: "break-all"};

		const cellEdit = {
			mode          : "dbclick", // double-click cell to edit
			beforeSaveCell: this.beforeSaveCell.bind( this )
		};

		if ( data ) {
			return (
				<div>

					{ /*{this.showProducts(data.products)}*/ }

					<BootstrapTable data={ [ data ] }
									condensed
						//containerStyle={ { background: '#00ff00', border: '1px solid black' } }
						//tableStyle={ { background: '#00ff00', border: '1px solid black'}}
						//bodyStyle={ { background: '#00ff00', border: '1px solid black'}}
						//headerStyle={ { background: '#f00' } }
						//headerStyle={ { backgroundColor: 'transparent'} }
						//bodyStyle={ { background: '#00f' } }
									trClassName={ "curate" }
									cellEdit={ cellEdit }>
						<TableHeaderColumn dataField='hashKey'
										   isKey={ true }
										   hidden>id</TableHeaderColumn>
						<TableHeaderColumn dataField="productIdList"
										   hidden={ false }
										   hiddenOnInsert={ true }
										   dataAlign="left"
										   tdStyle={ tdStyle }
										   thStyle={ thStyle }
										   width={ "140px" }
							//filter={{type: 'TextFilter', delay: 500}}
										   editable={ {type: "text"} }
										   dataFormat={ listFormatter }
										   dataSort={ false }>productIdList</TableHeaderColumn>

						<TableHeaderColumn dataField="brandIdList"
										   hidden={ false }
										   hiddenOnInsert={ true }
										   dataAlign="left"
										   tdStyle={ tdStyle }
										   thStyle={ thStyle }
										   width={ "140px" }
										   dataFormat={ brandListFormatter.bind( this ) }
										   customEditor={ {
											   getElement            : createListEditor,
											   customEditorParameters: {globalProps: this.props, list: "brandIdList"}
										   } }
										   dataSort={ false }>brandIdList</TableHeaderColumn>

						<TableHeaderColumn dataField="intrinsicIdList"
										   hidden={ false }
										   hiddenOnInsert={ true }
										   dataAlign="left"
										   tdStyle={ tdStyle }
										   thStyle={ thStyle }
										   width={ "140px" }
										   dataFormat={ intrinsicListFormatter.bind( this ) }
										   customEditor={ {
											   getElement            : createListEditor,
											   customEditorParameters: {
												   globalProps: this.props,
												   list       : "intrinsicIdList"
											   }
										   } }
										   dataSort={ false }>intrinsicIdList</TableHeaderColumn>

						<TableHeaderColumn dataField="publicationLocationList"
										   hidden={ false }
										   hiddenOnInsert={ true }
										   dataAlign="left"
										   tdStyle={ tdStyle }
										   thStyle={ thStyle }
										   width={ "140px" }
							//filter={{type: 'TextFilter', delay: 500}}
										   editable={ {type: "text"} }
										   dataFormat={ listFormatter }
										   dataSort={ false }>publicationLocationList</TableHeaderColumn>

						<TableHeaderColumn dataField='description'
										   width={ "140px" }
										   tdStyle={ tdStyle }
										   thStyle={ thStyle }
										   editable={ {type: "textarea"} }>description</TableHeaderColumn>
					</BootstrapTable>
				</div> );
		} else {
			return ( <div>no data</div> );
		}
	}
}

function mapStateToProps( state ) {
	return {
		intrinsicsOptions: state.category.categoryData.intrinsics.intrinsicsSelectorOptions,
		brandsOptions    : state.category.categoryData.brands.brandsSelectorOptions,
		intrinsicIdToName: state.category.categoryData.intrinsics.allIntrinsicsMapInverted,
		brandIdToName    : state.category.categoryData.brands.allBrandsMapInverted
	};
}

BSTable = connect( mapStateToProps,
	{
		updateEvent, createEvent //curateBrand
	} )( BSTable );

export default BSTable;