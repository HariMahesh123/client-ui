import React, {Component} from 'react';
import {connect} from 'react-redux';
import {setCategory} from '../../actions/actions';
import Nav from '../nav/nav';
import Form from '../shared/support_bee';
import { Column, Grid }     from "semantic-ui-react";



class FullPageLayout extends Component {

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    render() {
        return (
            <div>
                <Nav/>
                <Grid>
                    <Grid.Column>
                        {this.props.children}
                        <Form/>
                    </Grid.Column>
                </Grid>
            </div>
        );
    }
}

function mapStateToProps(state) {
    // return {selectedCategory: state.category.selectedCategory};
    return {selectedCategory: state.userData.userData.selectedCategory};
}

export default connect(mapStateToProps, {setCategory})(FullPageLayout);
