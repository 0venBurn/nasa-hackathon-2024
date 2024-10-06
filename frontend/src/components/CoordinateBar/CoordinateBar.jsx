import React, { useState, useEffect } from 'react';

const CoordinateBar = ({ handleSubmit, coordinates, setCoordinates }) => {
    const [error, setError] = useState('');

    useEffect(() => {
        setError(''); // Clear errors when coordinates change
    }, [coordinates]);

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
        <div style={{
            display: "flex", 
            flexDirection: "column",
              justifyContent: "center", 
              alignItems: "center",
              gap: "1rem",
              margin: "1.5rem"
          }}>
            <form onSubmit={onSubmit} style={{
            display: "flex", 
            flexDirection: "column",
              justifyContent: "center", 
              alignItems: "center",
              gap: "1rem",
              margin: "1.5rem"
          }}>
                <label style={{display: 'block', textAlign: 'center'}}>
                    Coordinates (Longitude, Latitude)
                    <input
                    style={{display: 'block', width: '100%'}}
                        type="text"
                        value={coordinates}
                        onChange={(e) => setCoordinates(e.target.value)} // Allow manual input
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
