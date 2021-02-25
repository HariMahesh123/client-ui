import React, {Component} from 'react';
import {Carousel} from 'react-bootstrap';

export default class ImageCarousel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            index:     0,
            direction: null
        };

        // Bind callback methods to make `this` the correct context.
        this.handleSelect = this.handleSelect.bind(this);
    }

    // get access to router from parent component
    // static contextTypes = {
    // 	router: PropTypes.object
    // };

    handleSelect(selectedIndex, e) {
        // console.log('selected=' + selectedIndex + ', direction=' + e.direction);
        this.setState({index: selectedIndex, direction: e.direction});
    }

    render() {
        const carouselStyle = {
            width:  this.props.width,
            height: this.props.height
        };
        const carouselItems = this.props.images.map((image, idx) => {
            return (
                <Carousel.Item key={idx}>
                    <img width={this.props.width} height={this.props.height} alt={'image' + idx} src={image}/>
                </Carousel.Item>
            );
        });

        return (
            <Carousel style={carouselStyle} activeIndex={this.state.index} direction={this.state.direction}
                      onSelect={this.handleSelect} indicators={false}>
                {carouselItems}
            </Carousel>
        );
    }
}
