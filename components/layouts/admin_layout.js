import React, {Component} from 'react';
import {PageHeader} from 'react-bootstrap';
import {connect} from 'react-redux';
import Admin from '../nav/admin';
import Nav from '../nav/nav';
import Form from '../shared/support_bee';

class AdminPageLayout extends Component {

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    render() {
        const panelHeadingStyle = {
            height: 40,
            color:  'black'
        };

        return (
            <div>
                <Nav/>
                <PageHeader style={panelHeadingStyle}>{'Administration'}</PageHeader>
                <Admin/>
                <div className="row">
                    <div className="col-md-12" style={{padding: 20}}>
                        {this.props.children}
                        <Form/>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {};
}

export default connect(mapStateToProps)(AdminPageLayout);
