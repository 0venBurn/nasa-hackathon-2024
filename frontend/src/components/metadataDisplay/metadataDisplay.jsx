import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MetadataDisplay = ({ coordinates, dateRange }) => {
    const [metadata, setMetadata] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Function to fetch metadata from the API
        const fetchMetadata = async () => {
            if (!coordinates) return; // Do not fetch if coordinates are not available

            //EDITED THIS LAT LNG, was orignially lng, lat 
            const [lat, lng] = coordinates.split(', ').map(Number); // Extract lng and lat from coordinates
            const data = {
                lon: lng,  // Use the extracted longitude
                lat: lat,   // Use the extracted latitude
                delta: 0.04,  // You can adjust this if needed
                dateRange: dateRange  // Use the passed dateRange prop
            };
            console.log(data)
        

            try {
                const response = await axios.post('http://127.0.0.1:5000/search-scenes', data);
                setMetadata(response.data);
                console.log(response.data);
            } catch (err) {
                setError('Failed to fetch metadata');
                console.error(err);
            }
        };

        fetchMetadata(); // Call the fetch function
    }, [coordinates, dateRange]); // Add coordinates and dateRange to dependency array

    return (
        <div>
            <h2>Landsat Metadata</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {metadata ? (
                <pre>{JSON.stringify(metadata, null, 2)}</pre>  // Display metadata in JSON format
            ) : (
                <p>Loading metadata...</p>
            )}
        </div>
    );
};

export default MetadataDisplay;
