// components/thumbnail.js
import React from 'react';

export default (props) => {
    return (
        <div className="thumbnail">
            <img src={props.src} alt={props.alt}/>
        </div>
    );
};
