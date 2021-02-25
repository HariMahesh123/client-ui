import React, { Component } from "react";
// import {Col, Grid, Row} from 'react-bootstrap';
import AutoAffix            from "react-overlays/lib/Affix";
import { connect }          from "react-redux";
import Nav                  from "../nav/nav";
import LeftNav              from "../nav_left/nav_left";
import Form                 from "../shared/support_bee";
import { Column, Grid }     from "semantic-ui-react";


class SideNavLayout extends Component {

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    render() {
        // console.log('side_nav_layout');

        return (
            <div>
                <Nav/>
                <Grid stackable>
                    <Grid.Row>
                        <Grid.Column width={4}>
                            <AutoAffix autoWidth={true}
                                       affixClassName="affixClass">
                                <div>
                                    <LeftNav/>
                                </div>
                            </AutoAffix>
                        </Grid.Column>
                        <Grid.Column width={11}>
                            {this.props.children}
                            <Form/>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}

function

mapStateToProps(state) {
    return {
        // selectedCategory: state.category.selectedCategory
    };
}

// export default connect(mapStateToProps, {setCategory})(SideNavLayout);
export default connect(mapStateToProps, {})(SideNavLayout);
