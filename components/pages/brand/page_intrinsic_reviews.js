import moment from 'moment';
import React, {Component, PropTypes} from 'react';
import {Button, Media, PageHeader, Panel} from 'react-bootstrap';

import ReactImageFallback from 'react-image-fallback';
import {connect} from 'react-redux';
import {getBrandData, getReviewsForIntrinsic, setCategory, setNavigationType} from '../../../actions/actions';
import * as Utils from '../../../utils';


class PageIntrinsicReviews extends Component {

	// get access to router from parent component
	static contextTypes = {
		router: PropTypes.object
	};

	componentWillMount() {
		this.props.setNavigationType('brands');
	}

	goBack() {
		Utils.debugLogger('go back');
	}

	handleError(src) {
		Utils.debugLogger('page_product_reviews: can\'t find image: [' + src + ']');
	}

	render() {

		const panelHeadingStyle = {
			height: 40,
			color: 'black'
		};

		const idx = this.props.params.index;

		if (!this.props.intrinsicReviews) {
			return <div/>;
		}

		const panels = this.props.intrinsicReviews.map((data, idx) => {
			let d = moment(new Date(data.date));
			if (d.isValid()) {
				d = d.format('MMM DD, YYYY');
			} else {
				d = '?';
			}

			// const imageStyle = { width: 100};
			const bodyStyle = {
				padding: 0
			};
			const imageStyle = {
				objectFit: 'contain',
				width: 150,
				height: 150,
				paddingRight: 20
			};

			let img = data.image.url;
			// if (img) {
			// 	img = '//' + img.split('//')[1];
			// }

			return (
				<div key={idx}>
					<div>
						<h3 id="review-title" className="panel-title">{data.product_name}
							<span id="review-date">
								{' - reviewed : '}
								<b>{d}</b>
							</span>
						</h3>
					</div>
					<Media style={bodyStyle}>
						<Media.Left align="top" style={imageStyle}>
							<ReactImageFallback src={img} fallbackImage={require('../../../../static/images/empty.svg')} alt="logo" style={imageStyle} onError={this.handleError}/>
						</Media.Left>
						<Media.Body>
							{/* <Media.Heading>{data.product_name}</Media.Heading> */}
							<h6>{data.body}</h6>
							<h6 id="review-rating">{'| brand : '}
								<b>{data.brand_name}</b>
								{' | rating : '}
								<b>{data.rating >= 0
										? data.rating
										: 'no rating'}</b>
								{' | score : '}
								<b>{data.frequency}
								</b>{' |'}</h6>
							<a id="review-link" href={data.url} target="_blank" rel='noopener noreferrer'>{data.url}</a>
						</Media.Body>
					</Media>
					<hr/>
				</div>
			);
		});

		const topicWords = this.props.intrinsicTopicWords.join(', ');
		const topicScores = 0;

		return (
			<div>
				<PageHeader style={panelHeadingStyle}>{this.props.selectedCategory.title} {'Intrinsics Reviews'}
					<small>{`(${this.props.params.intrinsic})`}</small>
					<Button onClick={this.context.router.goBack} bsStyle="link">{'← go back'}</Button>
				</PageHeader>
				<Panel>
					<h6>{'topic words:'}</h6>
					<h6 id="review-rating">{topicWords}</h6>
					<h6 id="review-rating">{topicScores}</h6>
				</Panel>
				{panels}
			</div>
		);

	}
}
function mapStateToProps(state) {
	return {
		intrinsicReviews     : state.intrinsics.exemplars,
		intrinsicTopicWords  : state.intrinsics.topicWords,
		intrinsicTopicScores : state.intrinsics.wordScores,
		// selectedCategory     : state.category.selectedCategory
		selectedCategory : state.category.categoryData.selectedCategory
	};
}

export default connect(mapStateToProps, {setCategory, getBrandData, getReviewsForIntrinsic, setNavigationType})(PageIntrinsicReviews);
