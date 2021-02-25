import * as Constants from '../../constants';

import Plotly from 'react-plotlyjs';
// components/thumbnail.js
import React from 'react';

export default(props) => {

	const selectorOptions = {
		buttons: [
			{
				step: 'month',
				stepmode: 'backward',
				count: 1,
				label: '1 month'
			}, {
				step: 'month',
				stepmode: 'backward',
				count: 3,
				label: '3 months'
			}, {
				step: 'month',
				stepmode: 'backward',
				count: 6,
				label: '6 months'
			}, {
				step: 'year',
				stepmode: 'todate',
				count: 1,
				label: 'Year to Date'
			}, {
				step: 'year',
				stepmode: 'backward',
				count: 1,
				label: '1 year'
			}, {
				step: 'all'
			}
		]
	};

	const layout = {
		// autosize: true,
		yaxis: {
			title: 'Percentage',
			type: 'linear',
			autorange: true,
			fixedrange: true,
			showticklabels: true
		},
		paper_bgcolor: Constants.PAPER_BGCOLOR,
		// plot_bgcolor: Constants.PLOT_BGCOLOR,
		title: props.title,
		width: 800,
		bargap: 0.1,
		xaxis: {
			// type: 'category',
			// autorange: true,
			// title: 'Date',
			// domain: [],
			// tickangle: 'auto',
			// tickprefix: '',
			// side: 'bottom',
			// anchor: 'y',
			// position: 0,
			// rangeselector: selectorOptions,
			// ticks: 'outside',
			// ticklen: 5,
			// tickwidth: 2,
			// tickcolor: 'rgb(204, 204, 204)',
			// nticks: 0,
			// tickmode: 'linear',
			// dtick: 0,
			// showticklabels: true
			rangeselector: selectorOptions,
			title: 'Date'
		},
		barmode: 'stack',
		legend: {
			traceorder: 'reversed',
			borderwidth: 0,
			x: 1.04,
			y: 1,
			font: {
				family: 'Roboto, sans-serif'
			}
		},
		annotations: [
			{
				opacity: 1,
				align: 'center',
				bgcolor:'rgba(0, 0, 0, 0)',
				bordercolor: 'rgba(0, 0, 0, 0)',
				borderpad: 1,
				borderwidth: 1,
				showarrow: false,
				text: 'Star Rating',
				textangle: 0,
				xref: 'paper',
				axref: 'pixel',
				x: 1.15,
				xanchor: 'auto',
				yref: 'paper',
				ayref: 'pixel',
				y: 0.9952380952380954,
				yanchor: 'bottom'
			}
		],
		margin: {
			pad: 11,
			b: 150,
			autoexpand: true,
			l: 100,
			r: 100
		},
		showlegend: true,
		font: {
			family: 'Roboto, sans-serif'
		},
		dragmode: 'pan'
	};

	const config = {
		showLink: true,
		displayModeBar: true,
		displaylogo: false,
		scrollZoom: true,
		staticPlot: false
	};

	const data = props.data.map((item, idx) => {
		item.name = ['*', '**', '***', '****', '*****'][idx];
		return item;
	});
	// config={config}
	return (
		<div>
			<Plotly className="intrinsics-plotly" config={config} data={data} layout={layout}/>
		</div>
	);
};
