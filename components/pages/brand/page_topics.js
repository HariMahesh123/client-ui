import _                             from "lodash";
import React, { Component }          from "react";
import {
	Accordion, Alert, Button, Col, ControlLabel, Form, FormControl, FormGroup, Grid, Panel, PanelGroup, Radio,
	Row
}                                    from "react-bootstrap";
import { Divider, Dropdown, Header } from "semantic-ui-react";

import { Bar }        from "react-chartjs-2";
import { connect }    from "react-redux";
import uuidV4         from "uuid/v4";
import {
	createTopic, deleteTopic, getTopics, setCategoryForTopicManagement, setTopicsSortOrder,
	updateTopics
}                     from "../actions";
import * as Constants from "../constants";

class TopicsEditor extends Component {

	constructor( ...args ) {
		super( ...args );
		this.state = {
			value       : "",
			alertVisible: false,
			deleteId    : null
		};
	}

	componentWillMount() {
		this.props.getTopics( this.props.selectedCategory.id );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.selectedCategory.id !== nextProps.selectedCategory.id ) {
			this.props.getTopics( nextProps.selectedCategory.id );
		}
	}

	handleSortTypeChange( e ) {
		console.log( "handleSortTypeChange", e.target.value );
		//const val = e.target.value;

		this.props.setTopicsSortOrder( e.target.value );
	}

	handleSubmit( e ) {
		e.preventDefault();

		const vals           = e.target;
		let name             = _.find( vals, [ "id", "name" ] ).value;
		name                 = ( name === "" ) ? _.find( vals, [ "id", "name" ] ).placeholder : name;
		const id             = _.find( vals, [ "id", "topicId" ] ).value;
		let seededTopicWords = _.find( vals, [ "id", "seededTopicWords" ] ).value;

		seededTopicWords = seededTopicWords.split( "," ).map( str => str.trim() ) || [];
		if ( _.isEqual( seededTopicWords, [ "" ] ) ) {
			seededTopicWords = [];
		}

		const obj = {
			id              : id,
			name            : name,
			seededTopicWords: seededTopicWords
		};

		this.props.updateTopics( this.props.selectedCategory.id, obj );
	}

	handleSelectCategoryForTopicManagement( event, data ) {
		const categoryId = data.value;
		let categoryObj  = _.find( this.props.categories, {"key": categoryId} );
		categoryObj      = {id: categoryObj.key, title: categoryObj.text};
		this.props.setCategoryForTopicManagement( categoryObj );
		this.props.getTopics( categoryObj.id );
	}

	handleDeleteTopic( id ) {
		//console.log('deleteTopic', this.props.selectedCategory.id, id);
		this.props.deleteTopic( this.props.selectedCategory.id, id );

		this.setState( {alertVisible: false, deleteId: null} );
	}

	handleAlertDismiss() {
		this.setState( {alertVisible: false} );
	}

	render() {

		if ( !this.props.topicsData.length ) {
			return <div>{ "Loading..." }</div>;
		}

		const alert = (
			<Alert bsStyle="warning"
				   onDismiss={ this.handleAlertDismiss.bind( this ) }>
				<h4>Really delete this topic?</h4>
				<p>
					<Button bsStyle="danger"
							onClick={ this.handleDeleteTopic.bind( this, this.state.deleteId ) }>{ "delete" }</Button>
					<span> or </span>
					<Button onClick={ this.handleAlertDismiss.bind( this ) }>{ "cancel" }</Button>
				</p>
			</Alert> );

		const sortByDisabled = {defaultChecked: ( this.props.topicsDataSort === Constants.TOPICS_SORT_ORDER_DISABLED_FIRST )};
		const sortByEnabled  = {defaultChecked: ( this.props.topicsDataSort === Constants.TOPICS_SORT_ORDER_ENABLED_FIRST )};
		const order          = ( this.props.topicsDataSort === Constants.TOPICS_SORT_ORDER_DISABLED_FIRST ) ? "asc" : "desc";
		const panels         = _.orderBy( this.props.topicsData, [ "sentiment", "name" ], [ order, "asc" ] ).map( ( data, idx ) => {
			const style            = data.enabled ? {bsStyle: "success"} : null;
			const seededTopicWords = data.seededTopicWords || [];
			const barChartData     = data.terms ? {
				labels  : data.terms.map( o => o.term ),
				datasets: [
					{
						label          : "Words",
						backgroundColor: "#0098C5",
						borderWidth    : 1,
						data           : data.terms.map( o => o.score.toFixed( 3 ) )
					}
				]
			} : null;

			const sentiment = [ "negative", "neutral", "positive" ][ data.sentiment + 1 ];

			const options = {
				title              : {
					text: "Words"
				},
				animation          : false,
				responsive         : true,
				maintainAspectRatio: false,
				scales             : {
					xAxes: [
						{
							stacked   : false,
							gridLines : {
								display: false
							},
							scaleLabel: {
								display    : true,
								labelString: "",
								fontSize   : 16,
								fontColor  : "#000"
							}
						}
					]
				}
			};

			const snippets = data.snippets ? data.snippets.map( ( snippet, idx ) => {

				return (
					<li key={ uuidV4() }>{ snippet }</li>
				);
			} ) : null;

			const lastUpdatedTopicId = this.props.lastUpdatedTopic;

			console.log( "lastUpdatedTopic", `[${lastUpdatedTopicId}]` );

			const topicName = data.topicId === lastUpdatedTopicId ? `${data.name} (updated)` : data.name;

			return (
				<Panel eventKey={ idx }
					   header={ <span style={ {
						   color   : ( data.topicId === lastUpdatedTopicId ? "red" : "black" ),
						   fontSize: "14px"
					   } }>{ topicName }</span> }
					   key={ uuidV4() } { ...style } >
					{ this.state.alertVisible && ( this.state.deleteId === data.id ) ? alert : null }
					<Grid fluid>
						<Row className="show-grid">
							<Col md={ 4 }>
								<Panel header='Update'>
									<Form onSubmit={ this.handleSubmit.bind( this ) }>
										<FormGroup>
											<ControlLabel>{ "Label:" }</ControlLabel>
											<FormControl id='name'
														 type="text"
														 defaultValue={ data.name }
														 placeholder={ data.name }/>
										</FormGroup>
										<FormControl id='topicId'
													 type="hidden"
													 value={ data.topicId }/>
										<FormGroup>
											<ControlLabel>{ "Seeded Topic Words:" }</ControlLabel>
											<FormControl id="seededTopicWords"
														 type="text"
														 placeholder="comma separated list of topic words"
														 defaultValue={ seededTopicWords.join( ", " ) }/>
										</FormGroup>
										<FormGroup>
											<Button bsSize='sm'
													type="submit">{ "submit" }</Button>
										</FormGroup>
									</Form>
								</Panel>
							</Col>
							<Col md={ 8 }>

								<h3>Sentiment: <span
									style={ {color: [ "red", "orange", "green" ][ data.sentiment + 1 ]} }>{ sentiment }</span>
								</h3>

								<div style={ {position: "relative", height: 300} }>
									{ barChartData ? <Bar data={ barChartData }
														  options={ options }
														  redraw/> : <div>{ "no data" }</div> }
								</div>
								{ snippets ? ( <Accordion key={ uuidV4() }>
									<Panel header={ "Snippets (click)" }
										   eventKey={ idx }>
										<ul>{ snippets }</ul>
									</Panel>
								</Accordion> ) : null
								}
							</Col>

						</Row>
					</Grid>
				</Panel>
			);
		} );

		return (
			<div style={ {width: 1200} }>
				<Header size='large'>
					<Header.Content>
						{ `${this.props.selectedCategory.title} (Topics)` }
					</Header.Content>
				</Header>

				<Divider section/>

				<div style={ {marginBottom: 10} }><b>category:</b></div>

				<Dropdown ref="categoryDropDown"
						  placeholder='Select category'
						  scrolling
						  selectOnBlur={ false }
						  defaultValue={ this.props.selectedCategory.id }
						  onChange={ this.handleSelectCategoryForTopicManagement.bind( this ) }
						  options={ this.props.categories }/>

				<div style={ {marginTop: 30} }/>

				<Form form="form">
					<FormGroup validationState={ null }>
						<ControlLabel style={ {marginRight: 10} }>{ "Sort order:" }</ControlLabel>
						<Radio id={ Constants.TOPICS_SORT_ORDER_DISABLED_FIRST } { ...sortByDisabled }
							   name='sortOrder'
							   value={ Constants.TOPICS_SORT_ORDER_DISABLED_FIRST }
							   inline
							   onClick={ this.handleSortTypeChange.bind( this ) }>{ "sentiment ascending" }</Radio>
						<Radio id={ Constants.TOPICS_SORT_ORDER_ENABLED_FIRST } { ...sortByEnabled }
							   name='sortOrder'
							   value={ Constants.TOPICS_SORT_ORDER_ENABLED_FIRST }
							   inline
							   onClick={ this.handleSortTypeChange.bind( this ) }>{ "sentiment descending" }</Radio>
					</FormGroup>
				</Form>
				<PanelGroup>
					{ panels }
				</PanelGroup>
			</div>
		);

	}
}

function mapStateToProps( state ) {
	return {
		selectedCategory: state.data.categoryForTopicManagement,
		categories      : state.data.categories,
		topicsData      : state.data.topicsData,
		lastUpdatedTopic: state.data.lastUpdatedTopic,
		topicsDataSort  : state.data.topicsDataSort,
		form            : state.form
	};
}

export default connect( mapStateToProps, {
	getTopics,
	updateTopics,
	setTopicsSortOrder,
	createTopic,
	setCategoryForTopicManagement,
	deleteTopic
} )( TopicsEditor );
