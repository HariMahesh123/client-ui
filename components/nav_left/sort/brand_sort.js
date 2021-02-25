// create container that can call "action creators"
import React, { Component } from 'react';
// first import connect
import { connect } from 'react-redux';
// actions
// import {setNavigationType} from '../../../actions/actions';
import { setBrandSortType, setCategory, setRefineByType } from '../../../actions/actions';
import { FormGroup, Panel, PanelGroup, Radio } from 'react-bootstrap';

class BrandSort extends Component {

	componentWillMount() {
	}

	shouldComponentUpdate( nextProps, nextState ) {
		return true;
	}

	handleBrandSortTypeChanged( event ) {
		const brandSortType = event.target.value;
		// const checked = event.target.checked;
		this.props.setBrandSortType( brandSortType, this.props.selectedCategory.id );
	}

	onSetRefineByType( name ) {
		this.props.setRefineByType( name );
	}

	render() {
		const categoryName = this.props.selectedCategory.id;
		let sortType = 'name';
		const brandSortSetting = this.props.sort;

		// check to see if there is a sort setting
		if ( brandSortSetting.hasOwnProperty( categoryName ) ) {
			if ( brandSortSetting[ categoryName ].hasOwnProperty( 'brands' ) ) {
				sortType = brandSortSetting[ categoryName ].brands;
			}
		}

		const nameChecked = {
			checked : sortType === 'name'
		};
		const rankChecked = {
			checked : sortType === 'rank'
		};
		//const dataSourceCountChecked = {
		//	checked : sortType === 'dataSourceCount'
		//};
		const similarityChecked = {
			checked : sortType === 'similarity'
		};

		const callBack = this.handleBrandSortTypeChanged.bind( this );

		///name, rank, dataSourceCount, similarity

		const nameRadio = (<Radio key="name" name="brandSortType" value="name" {...nameChecked} onChange={callBack}>{'by '}
			<b>{'Brand'}</b>
		</Radio>);
		const rankRadio = <Radio key="rank" name="brandSortType" value="rank" {...rankChecked} onChange={callBack}>{'by '}
			<b>Frequency (selected Intrinsics)</b>
		</Radio>;
		//const dataSourceCountRadio = <Radio key="dataSourceCount" name="brandSortType" value="dataSourceCount" {...dataSourceCountChecked} onChange={callBack}>{'by '}
		//	<b>Source Count</b>
		//</Radio>;
		const similarityRadio = <Radio key="similarity" name="brandSortType" value="similarity" {...similarityChecked} onChange={callBack}>{'by '}
			<b>Similarity</b>
		</Radio>;

// accordion
		const brandSettings = <PanelGroup onSelect={this.onSetRefineByType.bind( this )}>
			<Panel header="Sort Brands" eventKey="sort">
				<form>
					<FormGroup controlId="brandSortType">
						{[ nameRadio, rankRadio ]}
					</FormGroup>
				</form>
			</Panel>
		</PanelGroup>;

		return (
			<div>{brandSettings}</div>
		);
	}
}

function mapStateToProps( state ) {
	return {
		selectedCategory : state.userData.userData.selectedCategory,
		// selectedCategory : state.category.selectedCategory,
		navigationType :   state.category.navigationType,
		sort :             state.nav.brandSort
	};
}

export default connect( mapStateToProps, { setBrandSortType, setCategory, setRefineByType } )( BrandSort );
