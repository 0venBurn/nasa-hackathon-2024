import React, { useState } from 'react';

const LegendComponent = () => {
    const [isLegendVisible, setLegendVisible] = useState(true);

    const toggleLegend = () => {
        setLegendVisible(!isLegendVisible);
    };

    return (
        <div>
            <button onClick={toggleLegend} style={buttonStyle}>
                {isLegendVisible ? 'Hide Legend' : 'Show Legend'}
            </button>
            {isLegendVisible && (
                <div id="legend">
    <h4>Reflectance</h4>
            <div className="legend-scale">
        <div className="color" style={{ background: 'rgba(0, 255, 0, 1)' }}>High levels</div>
        <div className="color" style={{ background: 'rgba(0, 255, 0, 0.8)' }}></div>
        <div className="color" style={{ background: 'rgba(0, 255, 0, 0.6)' }}></div>
        <div className="color" style={{ background: 'rgba(0, 255, 0, 0.4)' }}></div>
        <div className="color" style={{ background: 'rgba(0, 255, 0, 0.2)' }}></div>
        <div className="color" style={{ background: 'rgba(0, 255, 0, 0)' }}>Low levels</div>
    </div>
                </div>
            )}
        </div>
    );
};

const buttonStyle = {
    marginBottom: '10px', // Space between button and legend
    padding: '5px 10px',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    position: 'absolute', // Position the container absolutely
    top: '10px', // Adjust as needed
    right: '10px', // Adjust as needed
    zIndex: 1000, // Ensure it's above other elements
    
};

export default LegendComponent;
