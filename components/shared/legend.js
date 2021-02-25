import React from 'react';
import _ from 'lodash';

export default( props ) => {

	let legendData = props.data;

	if (props.sort) {
		legendData = _.sortBy( legendData, 'label' );
	}

	if (props.reverse) {
		legendData = legendData.reverse();
	}

	let legend = legendData.map( o => {
		return (<li key={o.label}><i className="fa-li fa fa-square" style={{ color : o.color }}/>{o.label}</li>);
	} );

	return (

		<div style={{ overflowY : "auto", maxHeight : 400, width : 200, marginTop : 78, marginLeft: -25}}>
			<ul className="fa-ul">
				{legend}
			</ul>
		</div>
	);
};
