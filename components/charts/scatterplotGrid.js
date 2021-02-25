import {
	Col,
	Grid,
	Row,
} from 'react-bootstrap';
import React from 'react';

export default(props) => {

	return (
		<Grid style={{maxWidth: 800, marginLeft: -50}}>
			<Row className="show-grid">
				<Col xs={12} md={4}>
					{props.plots[6]}
				</Col>
				<Col xs={12} md={4}>
					{props.plots[7]}
				</Col>
				<Col xs={12} md={4}>
					{props.plots[8]}
				</Col>
			</Row>
			<Row className="show-grid">
				<Col xs={12} md={4}>
					{props.plots[3]}
				</Col>
				<Col xs={12} md={4}>
					{props.plots[4]}
				</Col>
				<Col xs={12} md={4}>
					{props.plots[5]}
				</Col>
			</Row>
			<Row className="show-grid">
				<Col xs={12} md={4}>
					{props.plots[0]}
				</Col>
				<Col xs={12} md={4}>
					{props.plots[1]}
				</Col>
				<Col xs={12} md={4}>
					{props.plots[2]}
				</Col>
			</Row>
		</Grid>

	);
};
