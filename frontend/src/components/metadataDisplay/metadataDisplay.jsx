import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MetadataDisplay = () => {
    const [metadata, setMetadata] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Function to fetch metadata from the API
        const fetchMetadata = async () => {
            const data = {
                lon: -95.33,  // Example longitude
                lat: 29.76,   // Example latitude
                delta: 0.05,  // Example delta
                dateRange: '2023-01-01/2023-12-31'  // Example date range
            };

            try {
                const response = await axios.post('http://127.0.0.1:5000/search-scenes', data);
                setMetadata(response.data);
                console.log(response.data);
            } catch (err) {
                setError('Failed to fetch metadata');
                console.error(err);
            }
        };

        // Call the function to fetch metadata when the component is mounted
        fetchMetadata();
    }, []);

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
