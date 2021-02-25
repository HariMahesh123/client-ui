/* eslint-disable react/jsx-indent-props,indent,no-mixed-spaces-and-tabs */
import _                                                    from "lodash";
import React, { Component }                                 from "react";
import { Button, ButtonGroup, Nav, Navbar, NavItem, Panel } from "react-bootstrap";
import { BootstrapTable, TableHeaderColumn, InsertModalHeader } from "react-bootstrap-table";
import { connect }                                          from "react-redux";
import {
	createTopic, deleteTopic, getTopics, setCategory, setWorkingSets,
	updateTopics, setNavigationType, setSelectedChart
}                                                           from "../../../actions/actions";
import { Grid, Menu }                                       from "semantic-ui-react";
import * as Constants     from "../../../constants";
import {call} from "redux-saga/effects";
import axios from "axios/index";
// import debugLogger from  '../../../utils';

//
class Settings extends Component {

	topicCreateCustomModalHeader = ( closeModal, save ) => {
		return (
			<InsertModalHeader
				title='Add Intrinsic'
			/>
		);
	};

	termCreateCustomModalHeader = ( closeModal, save ) => {
		return (
			<InsertModalHeader
				title='Add Term'
			/>
		);
	};

	//// NEW TOPIC HEADER

	constructor() {
		super();

		this.state = {
			activePanel: "brands",
			activeItem : "Manage Custom Intrinsics",
			topicId    : null,
			topicName  : null,
			terms      : []
		};

		this.handleItemClick  = this.handleItemClick.bind( this );
		this.onTopicRowSelect = this.onTopicRowSelect.bind( this );
	}

	componentWillMount() {
        this.props.setNavigationType( "intrinsics_reports" );
        this.props.setSelectedChart(Constants.CHART_LANDSCAPE);
		this.props.getTopics( this.props.selectedCategory.id, this.props.companyName );
	}


	//// NEW TOPIC FOOTER

	getWorkingSetObject( brandIds, intrinsicIds ) {
		return {
			brands    : {
				default: brandIds // an array of brand id's
			},
			intrinsics: {
				default: intrinsicIds // an array of intrinsic id's
			}
		};
	}

	onSetSelectedBrands( e ) {
		if ( !e.target.getAttribute( "name" ) ) {
			return;
		}

		const clickedBrandId = this.props.allBrandsMap[ e.target.getAttribute( "name" ) ];
		let selectedBrandIds = [];

		if ( clickedBrandId ) {
			selectedBrandIds = _.filter( this.props.brandsTable, o => o.selected ).map( o => o.id );

			if ( _.includes( selectedBrandIds, clickedBrandId  ) ) {
				// remove it
				selectedBrandIds = _.remove( selectedBrandIds, function ( n ) {
					return n !== clickedBrandId;
				} );

			} else {
				// add it
				selectedBrandIds.push( clickedBrandId );
			}
		}

		const selectedIntrinsicIds = _.filter( this.props.intrinsicsTable, o => o.selected ).map( o => o.id );
		this.props.setWorkingSets( this.getWorkingSetObject( selectedBrandIds, selectedIntrinsicIds ) );
	}

	onSetSelectedIntrinsics( e ) {
		const clickedIntrinsic = this.props.allIntrinsicsMap[ e.target.getAttribute( "name" ) ];
		let selectedIntrinsics = [];

		if ( clickedIntrinsic ) {
			selectedIntrinsics = _.filter( this.props.intrinsicsTable, o => o.selected ).map( o => o.id );

			if ( _.includes( selectedIntrinsics, clickedIntrinsic ) ) {
				// remove it
				selectedIntrinsics = _.remove( selectedIntrinsics, function ( n ) {
					return n !== clickedIntrinsic;
				} );

			} else {
				// add it
				selectedIntrinsics.push( clickedIntrinsic );
			}

			console.log( "selectedIntrinsics", selectedIntrinsics.sort() );

			const selectedBrands = _.filter( this.props.brandsTable, o => o.selected ).map( o => o.id );
			this.props.setWorkingSets( this.getWorkingSetObject( selectedBrands, selectedIntrinsics ) );
		}
	}

	onSelect( eventKey ) {

		const val = "all";
		//
		// console.log( "intrinsicsTable", this.props.intrinsicsTable );
		// console.log( "brandsTable", this.props.brandsTable );

		const allBrands          = this.props.brandsTable.map( o => o.id );
		const allIntrinsics      = this.props.intrinsicsTable.map( o => o.id );
		const selectedBrands     = _.filter( this.props.brandsTable, o => o.selected ).map( o => o.id );
		const selectedIntrinsics = _.filter( this.props.intrinsicsTable, o => o.selected ).map( o => o.id );

		switch ( eventKey ) {
			case "all":
				if ( this.state.activePanel === "brands" ) {
					this.props.setWorkingSets( this.getWorkingSetObject( allBrands, selectedIntrinsics ) );
				} else {
					this.props.setWorkingSets( this.getWorkingSetObject( selectedBrands, allIntrinsics ) );
				}
				break;
			case "none":
				if ( this.state.activePanel === "brands" ) {
					this.props.setWorkingSets( this.getWorkingSetObject( [], selectedIntrinsics ) );
				} else {
					this.props.setWorkingSets( this.getWorkingSetObject( selectedBrands, [] ) );
				}
			default:
				break;
		}
	}

	//

	formatName( cell, row ) {
		return row.selected ? <span
			className='table-name-selected'
			name={ row.name }>{ `${cell}` }
		</span> : <span
			className='table-name'
			name={ row.name }>{ `${cell}` }
				   </span>;
	}

	formatSelected( cell, row ) {
		return cell ? <span><i
			className="fa fa-check-square-o"
			aria-hidden="true"
			style={ {color: "black", cursor: "pointer"} }
			name={ row.name }/>
		</span> : <span><i
			className="fa fa-square-o"
			aria-hidden="true"
			style={ {color: "black", cursor: "pointer"} }
			name={ row.name }/></span>;
	}

	getTableData( table ) {

		if ( table === "brands" ) {
			return this.props.brandsTable;
		} else {
			return this.props.intrinsicsTable;
		}
	}

	handleItemClick( e, {name} ) {
	    if ((name == "Manage Custom Intrinsics")) {
            this.props.setNavigationType( "intrinsics_reports" );
            this.props.setSelectedChart(Constants.CHART_LANDSCAPE);
            this.props.getTopics( this.props.selectedCategory.id, this.props.companyName );
            this.setState( {terms: [], topicName: null, topicId: null} );

        }
        if (name == "Global Intrinsics") {
            this.props.setNavigationType( "global_intrinsics_reports" );
            this.props.setSelectedChart(Constants.CHART_LANDSCAPE);
            this.props.getTopics( this.props.selectedCategory.id, this.props.companyName );
            this.setState( {terms: [], topicName: null, topicId: null} );
        }
		this.setState( {activeItem: name} );
	    // console.log("active ITEM ", this.state.activeItem);
	}

	// when a topic is selected set the terms in local state
	onTopicRowSelect( row, isSelected, e ) {

		const seededTopicWords = row.seededTopicWords.map( ( word, idx ) => {
			return {
				term: word,
				id  : idx
			};
		} );

		this.setState( {terms: seededTopicWords, topicName: row.name, topicId: row.topicId} );
	}

	// delete a topic
	onAfterDeleteTopic( id ) {
		// console.log( "onAfterDeleteTopic", this.state.topicId );
		this.setState( {terms: [], topicId: null} );
        let filterData = {
            id: this.state.topicId,
            name: this.state.topicName,
            seededTopicWords:[ this.spaceScoredName(this.state.topicName) ],
            filter: {
                selectedBrandIds: null,
                lastEvaluatedKey: null,
                selectedIntrinsicIds: null,
                perPage: null,
                offset: null,
                sort: null,
                verified: null,
                company_id: "default"
            }
        };

		this.props.deleteTopic( this.props.selectedCategory.id,this.props.companyName,filterData);
	}

	// delete a term
	onAfterDeleteTerm( id ) {

		// console.log( "onAfterDeleteTerm" );

		this.setState( {terms: this.refs.termsTable.store.data} );

		const seededTopicWords = this.refs.termsTable.store.data.map( o => o.term );

		this.props.updateTopics( this.props.selectedCategory.id,this.props.companyName,
			{
				id              : this.state.topicId,
				name            : this.state.topicName,
				seededTopicWords: seededTopicWords,
                filter: {
                    selectedBrandIds: null,
                    lastEvaluatedKey: null,
                    selectedIntrinsicIds: null,
                    perPage: null,
                    offset: null,
                    sort: null,
                    verified: null,
                    company_id: "default"
                }
			}
		);
	}

	safeName (name) {
		return name.replace( /[^a-zA-Z0-9_ ]+/g, "" ).trim();
	}

	lowerCaseUnderScoredSafeTopicId (name) {
		return this.safeName(name).replace(/ /g, "_").toLowerCase();
	}

	underScoredName (name) {
		return name.replace(/ /g, "_");
	}

    spaceScoredName (name) {
        return this.safeName(name).replace(/_/g, " ").toLowerCase();
    }

	// edit a topic name
	onUpdateTopicName( data, prop, value ) {
		// console.log("*****************TopicName**********")
		this.props.updateTopics( this.props.selectedCategory.id,this.props.companyName,
			{
				id              : data.topicId,
				name            : this.safeName(value),
				seededTopicWords: data.seededTopicWords,
                filter: {
                    selectedBrandIds: null,
                    lastEvaluatedKey: null,
                    selectedIntrinsicIds: null,
                    perPage: null,
                    offset: null,
                    sort: null,
                    verified: null,
                    company_id: "default"
                }
			}
		);
	}

	// edit a term
	onUpdateTerm( data, prop, value ) {
        // console.log("in Update TERM", value);

		let seededTopicWords = this.state.terms.map( o => o.term ).toString();
		const oldTerm        = data.term;
		const newTerm        = value;

		seededTopicWords = seededTopicWords.replace( oldTerm, newTerm ).split(",").sort();

		seededTopicWords = Array.from(new Set(seededTopicWords)); // remove duplicates

		// update local state
		this.setState( {
			terms: seededTopicWords.map( ( term, id ) => {
				return {
					id  : id,
					term: term
				};
			} )
		} );

		this.props.updateTopics( this.props.selectedCategory.id,this.props.companyName,
			{
				id              : this.state.topicId,
				name            : this.state.topicName,
				seededTopicWords: seededTopicWords.map(term => this.spaceScoredName(term)),
                filter: {
                    selectedBrandIds: null,
                    lastEvaluatedKey: null,
                    selectedIntrinsicIds: null,
                    perPage: null,
                    offset: null,
                    sort: null,
                    verified: null,
                    company_id: "default"
                }
			}
		);
	}

	handleNewTerm( row ) {

		this.setState( {...this.state, terms: this.refs.termsTable.store.data} );

		let seededTopicWords = this.refs.termsTable.store.data.map( o => o.term );

		seededTopicWords = Array.from(new Set(seededTopicWords)); // remove duplicates

		this.props.updateTopics( this.props.selectedCategory.id,this.props.companyName,
			{
				id              : this.state.topicId,
				name            : this.state.topicName,
				seededTopicWords: seededTopicWords.map(term => this.spaceScoredName(term)),
                filter          : {
                    selectedBrandIds    : null,
                    lastEvaluatedKey    : null,
                    selectedIntrinsicIds: null,
                    perPage : null,
                    offset  : null,
                    sort    : null,
                    verified : null,
                    company_id : "default"
                }
			}
		);
	}

	handleNewTopic( row ) {

		this.setState( {...this.state, terms: []} );
		let filterData = {
                id              : this.lowerCaseUnderScoredSafeTopicId(row.name),
                name            : row.name,
                seededTopicWords: [ this.spaceScoredName(row.name) ],
                filter          : {
                                    selectedBrandIds    : null,
                                    lastEvaluatedKey    : null,
                                    selectedIntrinsicIds: null,
                                     perPage : null,
                                     offset  : null,
                                     sort    : null,
                                     verified : null,
                                     company_id : "default"
                                    }
		};

		//TODO: validate id and name (no dups) before creating
	   /*	this.props.createTopic( this.props.selectedCategory.id, this.props.companyName,
            {
				id              : this.lowerCaseUnderScoredSafeTopicId(row.name),
				name            : row.name,
				seededTopicWords: [ this.spaceScoredName(row.name) ],
                company_id      : "default"
			}
		); */
        this.props.createTopic( this.props.selectedCategory.id, this.props.companyName, filterData);
	}

        render() {

            function termValidator(value, row) {

                if(_.find(this.refs.termsTable.store.data, ["term", value])) {
                    return "error: duplicate term-update with new seed name or PRESS ESC ";
                } // else

                return true;
            }

            function nameValidator(value, row) {

                // avoid duplicates
                if(_.find(this.refs.topicsTable.store.data, function(o) { return o.name.toLowerCase() ===  value.toLowerCase(); })) {
                    return "error: duplicate name-update with new topic name or PRESS ESC  ";
                } // else

                return true;
            }

            // HM
            // <Button
            /** active={ this.state.activePanel === "intrinsics" }
            onClick={ () => this.setState( {activePanel: "intrinsics"} ) }
            style={ {width: 150} }>Intrinsics
            </Button> **/

		const type = this.state.activePanel;

		const workingSets = (
			<div>
				<div style={ {maxWidth: 600, marginTop: 25} }>
					<ButtonGroup style={ {marginBottom: 10} }>
						<Button
							active={ this.state.activePanel === "brands" }
							onClick={ () => this.setState( {activePanel: "brands"} ) }
							style={ {width: 150} }>Brands
						</Button>

					</ButtonGroup>

					<Panel>

						<Navbar collapseOnSelect>
							<Navbar.Header>
								<Navbar.Brand>
									<a
										href="#"
										style={ {fontSize: 14, cursor: "default"} }>select:
									</a>
								</Navbar.Brand>
								<Navbar.Toggle/>
							</Navbar.Header>
							<Navbar.Collapse>
								<Nav>
									<NavItem
										eventKey={ "all" }
										href="#"
										style={ {fontSize: 12} }
										onSelect={ this.onSelect.bind( this ) }>all
									</NavItem>
									<NavItem
										eventKey={ "none" }
										href="#"
										style={ {fontSize: 12} }
										onSelect={ this.onSelect.bind( this ) }>none
									</NavItem>
									{ /*<NavItem eventKey={'preferred'}*/ }
									{ /*href="#"*/ }
									{ /*style={{ fontSize : 12 }}*/ }
									{ /*onSelect={this.onSelect.bind( this )}>preferred</NavItem>*/ }
								</Nav>
							</Navbar.Collapse>
						</Navbar>

						<BootstrapTable
							data={ this.getTableData( this.state.activePanel ) }
							bordered={ false }
							condensed
							maxHeight="450px"
							tableStyle={ {border: "none"} }
							striped
							// options={ options }
						>

							<TableHeaderColumn
								dataField='selected'
								headerAlign='center'
								dataAlign='center'
								dataSort={ false }
								editable={ false }
								hidden={ false }
								width='100px'
								tdAttr={ {"onClick": type.toLowerCase() === "brands" ? this.onSetSelectedBrands.bind( this ) : this.onSetSelectedIntrinsics.bind( this )} }
								dataFormat={ this.formatSelected }>{ "selected" }
							</TableHeaderColumn>

							<TableHeaderColumn
								isKey
								dataField='name'
								headerAlign='left'
								dataAlign='left'
								editable={ false }
								dataSort={ false }
								tdAttr={ {"onClick": type.toLowerCase() === "brands" ? this.onSetSelectedBrands.bind( this ) : this.onSetSelectedIntrinsics.bind( this )} }
								sortFunc={ this.sortByName }
								// filter={ { type: 'TextFilter', delay: 1000 } }
								dataFormat={ this.formatName }>{ type.toLowerCase() }
							</TableHeaderColumn>


						</BootstrapTable>
					</Panel>
				</div>

			</div>
		);

		const topicCellEditProp = {
			mode: 'dbclick',
			blurToSave: true,
			beforeSaveCell: this.onUpdateTopicName.bind( this )
		};

        const topicCellEditPropCustom = {
            blurToSave: false,
        };

		const termCellEditProp = {
			mode: 'dbclick',
			//mode          : "click",
			blurToSave    : true,
			beforeSaveCell: this.onUpdateTerm.bind( this )
		};

		const termCellEditPropCustom = {
             blurToSave: false,
        };

		const topicSelectRowProp = {
			mode: "radio",
         	clickToSelectAndEditCell: true,
			onSelect: this.onTopicRowSelect,
			selected: this.state.topicId ? [ this.state.topicId ] : []
		};

        const topicSelectRowPropCustom = {
            onSelect: this.onTopicRowSelect,
            selected: this.state.topicId ? [ this.state.topicId ] : []
        };


        const termsSelectRowProp = {
			// mode: 'checkbox',
			mode: "radio",
         	clickToSelectAndEditCell: true
			// onSelect: this.onTopicRowSelect,
			// selected: this.props.topicsData.length ? [ this.props.topicsData[ 0 ].topicId ] : []
			// onSelectAll  : onSelectAll
		};

		const topicOptions = {
			defaultSortName     : "name",
			clearSearch         : true,
			defaultSortOrder    : "asc",
			hideSizePerPage     : true,
			sizePerPage         : 10,
			afterInsertRow      : this.handleNewTopic.bind( this ),
			insertModalHeader   : this.topicCreateCustomModalHeader,
			afterDeleteRow      : this.onAfterDeleteTopic.bind( this ),  // A hook for after dropping rows.
			paginationShowsTotal: true,
            deleteText          : 'Delete'

		};

		const termOptions = {
			defaultSortName     : "term",
			clearSearch         : true,
			defaultSortOrder    : "asc",
			hideSizePerPage     : true,
			sizePerPage         : 10,
			afterInsertRow      : this.handleNewTerm.bind( this ),
			insertModalHeader   : this.termCreateCustomModalHeader,
			afterDeleteRow      : this.onAfterDeleteTerm.bind( this ),  // A hook for after dropping rows.
			paginationShowsTotal: true,
           	deleteText          : 'Delete'
		};

		// function termFormatter( cell, row ) {
		// 	return ( cell.replace( / /g, "_" ) );
		// }

		const topicsData = (
				  <Grid columns={ "equal" } divided={ true } style={{marginLeft: "15px"}}>
					  <Grid.Row>
						  <Grid.Column>

							  <BootstrapTable
								  ref={ "topicsTable" }
								  data={ this.props.topicsData }
                                  hover={true}
								  selectRow={ topicSelectRowProp }
								  insertRow={this.props.companyName == "Predicta" || this.state.activeItem == "Manage Custom Intrinsics" ? true: false}
								  options={ topicOptions }
								  pagination={ true }
								  multiColumnSearch={ true }
								  search={ true }
								  deleteRow={this.props.companyName == "Predicta" || this.state.activeItem == "Manage Custom Intrinsics" ? true: false}
								  condensed
								  cellEdit={ this.props.companyName == "Predicta" || this.state.activeItem == "Manage Custom Intrinsics" ? topicCellEditProp : topicCellEditPropCustom }
                                 // cellEdit={ topicCellEditProp}
							  >
								  <TableHeaderColumn
									  isKey={ true }
									  hiddenOnInsert={ true }
									  dataField='topicId'
									  headerAlign='left'
									  dataAlign='left'
									  dataSort={ false }
									  editable={ true }
									  autoValue={ true }
									  hidden={ true }>topicId
								  </TableHeaderColumn>
								  <TableHeaderColumn
									  isKey={ false }
									  dataField='name'
									  headerAlign='left'
									  dataAlign='left'
									  dataSort={ false }
									  width={ "auto" }
									  editable={ { validator: nameValidator.bind(this) } }
									  hidden={ false }>Intrinsics
								  </TableHeaderColumn>
								  <TableHeaderColumn
									  isKey={ false }
									  hiddenOnInsert={ true }
									  dataField='seededTopicWords'
									  headerAlign='center'
									  dataAlign='center'
									  dataSort={ false }
									  editable={ false }
									  hidden={ true }>
								  </TableHeaderColumn>
							  </BootstrapTable>
						  </Grid.Column>

						  <Grid.Column>
							  { this.state.topicId ?
								  <BootstrapTable
									  ref={ "termsTable" }
									  data={ this.state.terms }
									  selectRow={termsSelectRowProp}
									  insertRow= {this.props.companyName == "Predicta" || this.state.activeItem == "Manage Custom Intrinsics" ? true: false }
									  options={ termOptions }
									  pagination={ true }
									  multiColumnSearch={ true }
									  search={ true }
									  deleteRow= {this.props.companyName == "Predicta" || this.state.activeItem == "Manage Custom Intrinsics" ? true: false }
									  condensed
									  cellEdit={this.props.companyName == "Predicta" || this.state.activeItem == "Manage Custom Intrinsics"  ? termCellEditProp : termCellEditPropCustom }
                                    //  cellEdit={termCellEditProp}
								  >
									  <TableHeaderColumn
										  isKey={ true }
										  dataField='id'
										  headerAlign='left'
										  dataAlign='left'
										  dataSort={ false }
										  editable={ false }
										  autoValue={ true }
										  hidden={ true }>id
									  </TableHeaderColumn>
									  <TableHeaderColumn
										  isKey={ false }
										  dataField='term'
										  headerAlign='left'
										  dataAlign='left'
										  dataSort={ false }
										  editable={ { validator: termValidator.bind(this) } }
										  width={ "auto" }
										  // dataFormat={ termFormatter }
										  hidden={ false }>{ `Seeds [${this.state.topicName || "none selected"}]` }
									  </TableHeaderColumn>

								  </BootstrapTable> : <div>Please select an Intrinsic from left.</div> }
						  </Grid.Column>

					  </Grid.Row>
				  </Grid>
			  )
		;

		const {activeItem} = this.state;

		return (
			<div>
				<Menu tabular>
					<Menu.Item name='Manage Custom Intrinsics' active={ activeItem === "Manage Custom Intrinsics" } onClick={ this.handleItemClick }/>
                    <Menu.Item name='Global Intrinsics' active={ activeItem === "Global Intrinsics" } onClick={ this.handleItemClick }/>
					<Menu.Item name='Manage Brands' active={ activeItem === "Manage Brands" }
							   onClick={ this.handleItemClick }/>
				</Menu>

				{ activeItem === "Manage Brands" ? workingSets : topicsData }
			</div>
		);

	}
}

function

mapStateToProps( state ) {
	return {
		brandsTable     : state.category.categoryData.workingSetsBrandsTable,
		intrinsicsTable : state.category.categoryData.workingSetsIntrinsicsTable,
		allBrandsMap    : state.category.categoryData.brands.allBrandsMapForSettings,
		allIntrinsicsMap: state.category.categoryData.intrinsics.allIntrinsicsMapForSettings,
		selectedCategory: state.category.categoryData.selectedCategory,
		userId          : state.userData.userData.id,
		topicsData      : _.get( state, "visualizationData.topicsData", [] ),
        companyName     : state.userData.loginInfo.companyName
    };
}

export default connect( mapStateToProps, {
	setWorkingSets, setCategory, deleteTopic, getTopics, createTopic, updateTopics,setNavigationType, setSelectedChart
} )( Settings );
