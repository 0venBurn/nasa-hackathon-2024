import React, { useState } from 'react';

const CloudCoverage = ({ clouds, setClouds, minimum, maximum, labels }) => {
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const value = e.target.value;

        // Check if the value is a number between 1 and 100
        if (value === '' || (value >= 1 && value <= 100)) {
            setClouds(value); // Update clouds state
            setError(''); // Clear any previous error
        } else {
            setError('Please enter a number between 1 and 100.'); // Set error message
        }
    };

    return (
        <div>
            <label>
                {labels}:
                <input
                    type="number"
                    value={clouds}
                    onChange={handleChange} // Update clouds on input change
                    placeholder="e.g. 50"
                    min={minimum}
                    max={maximum}
                    required
                    id="coordinate"
                />
            </label>
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
        </div>
    );
};

export default CloudCoverage;
