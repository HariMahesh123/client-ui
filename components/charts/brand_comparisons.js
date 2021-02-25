// import * as Constants from '../../constants';
import {Bar} from 'react-chartjs-2';
import {Grid, Row, Col} from 'react-bootstrap';
// import Plotly from 'react-plotlyjs';
import React from 'react';
import Legend from '../shared/legend';

export default(props) => {

    const options = {
        legend: false,
        maintainAspectRatio: false,
        animation: {
            animateScale: true,
            animateRotate: true,
            easing: 'easeInQuad',
            duration: 200
        },
        title: {
            text: props.title
        },
        scales: {
            xAxes: [
                {
                    stacked: props.stacked,
                    gridLines: {
                        display: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: props.xaxisTitle,
                        fontSize: 16,
                        fontColor: '#000'
                    }
                }
            ],
            yAxes: [
                {
                    stacked: props.stacked,
                    scaleLabel: {
                        display: true,
                        labelString: props.yaxisTitle,
                        fontSize: 16,
                        fontColor: '#000'
                    },
                    ticks: {
                        min: 0,
                        max: 100,
                        stepSize: 10
                    }
                }
            ]
        }
    };

    // console.log( 'data', props.data );
    let legendData = [];

    try {
        legendData = props.data.datasets.map(o => {
            return {color: o.backgroundColor, label: o.label}
        });
    } catch (e) {
        console.error (e);
        return (<div>Error</div>)
    }



    // legendData = _.sortBy(legendData, 'label').reverse();
    //
    // let legend = legendData.map( o => {
    // 	return (<li><i className="fa-li fa fa-square" style={{ color : o.color }}/>{o.label}</li>);
    // } );


    return (
        <Grid style={{maxWidth: 900, maxHeight: 500, marginLeft: -50}}>
            <Row >
                <Col md={10}>
                    <Bar data={props.data} options={options} height={450} redraw/>
                </Col>
                <Col md={2}>
                    <Legend data={legendData} reverse={true} sort={false}/>
                </Col>
            </Row>
        </Grid>
    );
};
