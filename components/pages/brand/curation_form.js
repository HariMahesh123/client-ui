import React, {Component} from 'react';
import {Button, Checkbox, ControlLabel, FormControl, FormGroup} from 'react-bootstrap';
import * as Utils from '../../../utils';


export default class CurationFormBrand extends Component {
    constructor(...args) {
        super(...args);
        this.state = {
            enabled: this.props.enabled
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    handleChange(event) {
        Utils.debugLogger(event);
    }


    render() {
        return (
            <form>
                <FormGroup>
                    <ControlLabel>{'Name'}</ControlLabel>
                    <FormControl defaultValue={this.props.brand} id="brand" placeholder="Enter brand name" type="text"/>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>{'Logo'}</ControlLabel>
                    <FormControl defaultValue={this.props.logo} id="logo" placeholder="Enter logo url" type="text"/>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>{'Wikipedia'}</ControlLabel>
                    <FormControl defaultValue={this.props.wiki} id="wiki" placeholder="Enter wikipedia url"
                                 type="text"/>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>{'Homepage'}</ControlLabel>
                    <FormControl defaultValue={this.props.homepage} id="homepage" placeholder="Enter homepage url"
                                 type="text"/>
                </FormGroup>
                <FormGroup>
                    <Checkbox checked={this.state.enabled} id="enabled"
                              onChange={() => this.setState({enabled: !this.state.enabled})}>{'enabled'}</Checkbox>
                </FormGroup>
                <FormGroup>
                    <Button bsStyle="primary" onClick={this.props.handleClick.bind(this)}
                            type="submit">{'Submit'}</Button>
                </FormGroup>
            </form>
        );
    }
}
