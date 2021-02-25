import * as Constants from '../../constants';
import _ from 'lodash';
import {Doughnut, Bar} from 'react-chartjs-2';
import React from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import Legend from '../shared/legend';


// import ChartistGraph from 'react-chartist';
//
//
// const biPolarLineChartData = {
//     labels: [1, 2, 3, 4, 5, 6, 7, 8],
//     series: [
//         [1, 2, 3, 1, -2, 0, 1, 0],
//         [-2, -1, -2, -1, -2.5, -1, -2, -1],
//         [0, 0, 0, 1, 2, 2.5, 2, 1],
//         [2.5, 2, 1, 0.5, 1, 0.5, -1, -2.5]
//     ]
// }
// const biPolarLineChartOptions = {
//     high: 3,
//     low: -3,
//     showArea: true,
//     showLine: false,
//     showPoint: false,
//     axisX: {
//         showLabel: false,
//         showGrid: false
//     }
// }

export default(props) => {

    const pairs = _.toPairs(props.data);
    const sortedPairs = _.sortBy(pairs, function (p) {
        return -p[1];
    });
    const data = {
        labels: sortedPairs.map(a => a[0]),
        datasets: [
            {
                data: sortedPairs.map(a => a[1]),
                backgroundColor: Constants.markerColors5,
                borderWidth: 0,
                label: 'value'
                // hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
            }
        ]
    };

    // console.log('data', data.datasets, data.labels);

    const legendData = data.labels.map((label, idx) => {
        return {
            color: data.datasets[0].backgroundColor[idx],
            label: label
        }
    });

    // don't animate if the data has not changed

    // TODO fix this (always false)
    //const animate = !_.isEqual(props.data, window.store.getState().brands.brandSummary.intrinsics);
    const animate = false;

    const options = {
        maintainAspectRatio: false,
        responsive: true,
        animation: {
            animateScale: animate,
            animateRotate: animate,
            duration: 1000
        },
        legend: {
            // display : (props.type === 'pie')
            display: false
        },
        title: {
            text: props.title,
        },
        scales: {
            xAxes: [
                {
                    display: (props.type === 'bar'),
                    stacked: true,
                    gridLines: {
                        display: false
                    },
                    scaleLabel: {
                        display: (props.type === 'bar'),
                        labelString: 'Intrinsics',
                        fontSize: 16,
                        fontColor: '#000'
                    }
                }
            ],
            // yAxes: [
            // 	{
            // 		stacked: true,
            // 		scaleLabel: {
            // 			display: true,
            // 			labelString: props.yaxisTitle,
            // 			fontSize: 16,
            // 			fontColor: '#000'
            // 		}
            // 	}
            // ]
        },
        cutoutPercentage: 30
    };

    const cols = props.type === 'pie' ? 6 : 12;

    const legend = props.type === 'pie' ?
        (<Col md={6}>
            <Legend data={legendData} reverse={false} sort={false}/>
        </Col>) : null;

    return (
        <Grid style={{maxWidth: 900, minHeight: 500, maxHeight: 500, marginLeft: props.type === 'pie' ? 40 : -50}}>
            <Row>
                <Col md={cols}>
                    {props.type === 'pie' ?
                        <Doughnut data={data} options={options} height={450} redraw/> :
                        <Bar data={data} options={options} height={450} redraw/>}
                </Col>
                {legend}
            </Row>
            {/*<Row>*/}
            {/*<ChartistGraph data={biPolarLineChartData} options={biPolarLineChartOptions} type={'Line'}/>*/}
            {/*</Row>*/}
        </Grid>
    );
};

