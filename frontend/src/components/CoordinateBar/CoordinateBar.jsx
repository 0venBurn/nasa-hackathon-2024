import React, { useState } from 'react';

const CoordinateBar = ({ handleSubmit }) => {
    const [coordinates, setCoordinates] = useState('');
    const [error, setError] = useState('');

    // Handle form submission
    const onSubmit = (e) => {
        e.preventDefault();  // Prevent form from refreshing the page
        
        // Split the input value into longitude and latitude
        const [longitude, latitude] = coordinates.split(',').map(coord => parseFloat(coord.trim()));

        // Validate that the input contains two valid numbers
        if (isNaN(longitude) || isNaN(latitude)) {
            setError('Please enter valid numbers for both longitude and latitude.');
        } else if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
            setError('Please enter a valid latitude (-90 to 90) and longitude (-180 to 180).');
        } else {
            setError('');  // Clear any existing error
            handleSubmit(longitude, latitude); // Pass the coordinates to the parent component
        }
    };

    return (
        <div>
            <form onSubmit={onSubmit}>
                <label>
                    Coordinates (Longitude, Latitude):
                    <input
                        type="text"
                        value={coordinates}
                        onChange={(e) => setCoordinates(e.target.value)}
                        placeholder="e.g. 12.232, 43.543"
                        required
                        id="coordinate"
                    />
                </label>
                {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default CoordinateBar;
