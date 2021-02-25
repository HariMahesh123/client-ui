import * as Constants from '../../constants';
import Plotly from 'react-plotlyjs';
import React from 'react';
// https://www.npmjs.com/package/react-chartjs-2

export default( props ) => {

	// const layout = {
	// 	autosize: true,
	// 	width: 300,
	// 	height: 300,
	// 	paper_bgcolor: Constants.PAPER_BGCOLOR,
	// 	plot_bgcolor: Constants.PLOT_BGCOLOR,
	// 	title: props.title,
	// 	// legend: {
	// 	// 	traceorder: 'reversed'
	// 	// }
	// };

	const layout = {
		autosize :      true,
		width :         300,
		height :        300,
		paper_bgcolor : Constants.PAPER_BGCOLOR,
		plot_bgcolor :  Constants.PLOT_BGCOLOR,
		title :         props.title,
        titlefont: {
            family: 'Roboto',
            color: 'black',
            size: 20,
        },
		yaxis :         {
			// range: [
			// 	0, 0.14334714756372463
			// ],
			type :      'linear',
			autorange : true,
			rangemode : 'tozero',
			showline :  true,
			mirror :    'all',
			showgrid :  true,
			zeroline :  true,
			tickmode :  'auto',
			ticks :     'inside',
			title :     props.yaxis,
            titlefont: {
                family: 'Roboto'
            },
            tickfont: {
                family: 'Roboto'
            },
		},
		margin :        {
			t : 40,
			r : 60,
			b : 85,
			l : 60
		},
		xaxis :         {
			// range: [
			// 	0, 0.025668138918592216
			// ],
			type :      'linear',
			autorange : true,
			rangemode : 'tozero',
			showline :  true,
			mirror :    'all',
			showgrid :  true,
			zeroline :  true,
			tickmode :  'auto',
			ticks :     'inside',
			title :     props.xaxis,
            titlefont: {
                family: 'Roboto'
            },
            tickfont: {
                family: 'Roboto'
            },
		},
		titlefont :     {
			family : 'Roboto, sans-serif',
			size :   14
		},
		font :          {
			family : 'Roboto, sans-serif'
		}
	};

	const config = {
		showLink :       false,
		displayModeBar : false,
		displaylogo :    false,
		scrollZoom :     false,
		staticPlot :     false
	};

	const options = {
		maintainAspectRatio : false,
		legend :              {
			display : false,
		},
		title :               {
			text :      props.data[ 0 ].name,
			fontSize :  12,
			padding :   30,
			fullWidth : false,
			fontColor : '#000',
			fontStyle : 'normal'
		},
		showLines :           false,
		scales :              {
			xAxes : [ {
				type :     'linear',
				// ticks: {
				// 	suggestedMax: 0.1
				// },
				position : 'bottom'
			} ],
			yAxes : [ {
				type :     'linear',
				// ticks: {
				// 	suggestedMax: 0.1
				// },
				position : 'left'
			} ]
		}
	};

	// const data = {
	// 	datasets : [ {
	// 		label :           props.data[ 0 ].name,
	// 		backgroundColor : 'rgba(91, 192, 222, 0.36)',
	// 		data :            props.data[ 0 ].x.map( ( x, idx ) => {
	// 			return (
	// 				{
	// 					x : x,
	// 					y : props.data[ 0 ].y[ idx ],
	// 				}
	// 			)
	// 		} )
	// 	} ]
	// };
	//

	return (
		<div style={{ position : 'relative', height : '33vh' }}>
			<Plotly className="intrinsics-plotly" data={props.data} layout={layout} config={config}/>
			{/* <Line data={data} options={options} />*/}
		</div>
	);
};
