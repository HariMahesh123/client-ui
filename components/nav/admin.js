import React, {Component, PropTypes} from 'react';
import {Nav, NavItem} from 'react-bootstrap';
import {connect} from 'react-redux';

import {setSelectedAdminTab} from '../../actions/actions';
import * as Constants from '../../constants';

class Admin extends Component {

    static contextTypes = {
        router: PropTypes.object
    };

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    handleSelect(activeKey) {
        this.props.setSelectedAdminTab(activeKey);
        this.context.router.push(`/admin/${activeKey}`);
    }

    render() {
        return (
            <Nav bsStyle="tabs" activeKey={this.props.activeKey} onSelect={this.handleSelect.bind(this)}>
                <NavItem eventKey={Constants.ADMIN_TAB_VIEW_USERS}>{'View Users'} </NavItem>
                <NavItem eventKey={Constants.ADMIN_TAB_ADD_COMPANY}>{'Add Company'}</NavItem>
                <NavItem eventKey={Constants.ADMIN_TAB_ADD_USER} title="Item">{'Add User'}</NavItem>
                <NavItem eventKey={Constants.ADMIN_TAB_CONFIGURE_USER}>{'Configure User'} </NavItem>
            </Nav>
        );
    }
}

function mapStateToProps(state) {
    return {
        activeKey: state.admin.activeKey
    };
}

export default connect(mapStateToProps, {setSelectedAdminTab})(Admin);
