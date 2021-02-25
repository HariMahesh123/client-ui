// create container that can call "action creators"
import React, {Component} from 'react';

// first import connect
import {connect} from 'react-redux';

// actions
// import {setNavigationType} from '../../../actions/actions';
import {setProductSortType} from '../../../actions/actions';
import {setCategory} from '../../../actions/actions';
import {setRefineByType} from '../../../actions/actions';
import {FormGroup, Panel, PanelGroup, Radio} from 'react-bootstrap';

class ProductSort extends Component {
	componentWillMount() {}

	shouldComponentUpdate(nextProps, nextState) {
		return true;
	}

	handleProductSortTypeChanged(event) {
		const productSortType = event.target.value;
		// const checked = event.target.checked;
		this.props.setProductSortType(productSortType, this.props.selectedCategory.id);
	}

	onSetRefineByType(name) {
		this.props.setRefineByType(name);
	}

	render() {
		const categoryName = this.props.selectedCategory.id;
		const multipleBrandsSelected = this.props.selectedBrands.length > 1;

		let sortType = 'name';
		const productSortSetting = this.props.sort;

		// check to see if there is a sort setting
		if (productSortSetting.hasOwnProperty(categoryName)) {
			if (productSortSetting[categoryName].hasOwnProperty('products')) {
				sortType = productSortSetting[categoryName].products;
			}
		}
        else {
            // nothing set, default depends on multiple brands selected or not
            sortType = multipleBrandsSelected ? "name" : "rank";
        }

		const nameChecked = {
			checked: sortType === 'name'
		};
		const rankChecked = {
			checked: sortType === 'rank'
		};
		//const dataSourceCountChecked = {
		//	checked: sortType === 'dataSourceCount'
		//};
		// const similarityChecked = {
		// 	checked: sortType === 'similarity'
		// };

		const callBack = this.handleProductSortTypeChanged.bind(this);

		///name, rank, dataSourceCount, similarity

		const nameRadio = (
			<Radio key="name" name="productSortType" value="name" {...nameChecked} onChange={callBack}>{'by '}
				<b>{'Brand'}</b>
			</Radio>
		);

		const rankRadio = (
			<Radio key="rank" name="productSortType" value="rank" {...rankChecked} onChange={callBack}>{'by '}
				<b>{'Score (selected Intrinsics)'}</b>
			</Radio>
		);

		//const dataSourceCountRadio = (
		//	<Radio key="dataSourceCount" name="productSortType" value="dataSourceCount" {...dataSourceCountChecked} onChange={callBack}>{'by '}
		//		<b>{'Source Count'}</b>
		//	</Radio>
		//);

		// const similarityRadio = <Radio ref="similarity" key="similarity" name="productSortType" value="similarity" {...similarityChecked} onChange={callBack}>by
		// 	<b>Similarity</b>
		// </Radio>;

// accordion
		const productSettings = (
			<PanelGroup onSelect={this.onSetRefineByType.bind(this)}>
				<Panel header="Sort Products" eventKey="sort">
					<form>
						<FormGroup controlId="productSortType">
							{multipleBrandsSelected ? [nameRadio, rankRadio] : [nameRadio, rankRadio]}
						</FormGroup>
					</form>
				</Panel>
			</PanelGroup>
		);

		return (
			<div>{productSettings}</div>
		);
	}
}

function mapStateToProps(state) {
	return {selectedCategory : state.userData.userData.selectedCategory,
		      // selectedCategory   : state.category.selectedCategory,
		      navigationType     : state.category.navigationType,
		      sort               : state.nav.productSort,
              selectedBrands     : state.category.categoryData.brands.selectedBrands};
}

export default connect(mapStateToProps,
											{setProductSortType,
											 setCategory,
											 setRefineByType})(ProductSort);
