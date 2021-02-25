import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {fetchUserData} from '../actions/actions';

export class App extends Component {
    static contextTypes = {
        router: PropTypes.object
    };

    componentDidMount() {
        this.props.fetchUserData();
    }

    render() {
        return (
            <div className="container-fluid">
                {this.props.children}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        userData:   state.userData,
        categoryId: state.category.categoryData.selectedCategoryId
    };
}

export default connect(mapStateToProps, {
    fetchUserData
})(App);
