// components/thumbnail.js
import React from 'react';

export default (props) => {
    return (
        <div style={{
            color: 'black'
        }}>
            <h2 className='page-heading'>{props.title}</h2>
        </div>
    );
};