import _ from 'lodash';
import React from 'react';

export default (props) => {

    let legendData = props.data;

    if (props.sort) {
        legendData = _.sortBy(legendData, 'label');
    }

    if (props.reverse) {
        legendData = legendData.reverse();
    }

    let legend = legendData.map(o => {
        return (
            <li key={o.label} className='myLegend'><i className="fa-li fa fa-square" style={{color: o.color}}/>{o.label}
            </li>);
    });

    return (

        <div style={{overflowY: "auto", maxHeight: 400, marginLeft: -25, marginBottom: 10}}>
            <ul className="fa-ul" style={{listStyleType: 'none'}}>
                {legend}
            </ul>
        </div>
    );
};