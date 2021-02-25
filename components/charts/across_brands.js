import * as Constants from '../../constants';
import Plotly from 'react-plotlyjs';
import React from 'react';

export default(props) => {
	const data = props.intrinsics.map((intrinsic, idx) => {
		let dataSet = {};
		const brands = Object.keys(props.data).sort();

		dataSet.x = brands;
		dataSet.y = brands.map(brand => {
			return props.data[brand][intrinsic] * 100;
		});
		// dataSet.x     = Object.keys(props.data[brand]).sort();
		// dataSet.y     = intrinsics.map(intrinsic => {return props.data[brand][intrinsic]*100});
		dataSet.name = intrinsic;
		dataSet.type = 'bar';

		return dataSet;
	});

	const layout = {
		barmode: 'stack',
		// xaxis: {autorange: 'reversed'}
		autosize: true,
		paper_bgcolor: Constants.PLOT_PAPERCOLOR,
		plot_bgcolor: Constants.PLOT_BGCOLOR,
		title: props.title,
		xaxis: {
			title: 'AcrossBrandsChart'
		},
		legend: {
			traceorder: 'reversed'
		}
	};

	let config = {
		showLink: true,
		displayModeBar: true,
		displaylogo: false,
		scrollZoom: true,
		staticPlot: false
	};

	return (
		<div>
			<Plotly className="intrinsics-plotly" data={data} layout={layout} config={config}/>
		</div>
	);
};
