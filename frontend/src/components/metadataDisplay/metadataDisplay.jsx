import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MetadataDisplay = ({ coordinates, dateRange }) => {
    const [metadata, setMetadata] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Function to fetch metadata from the API
        const fetchMetadata = async () => {
            if (!coordinates) return; // Do not fetch if coordinates are not available

            //EDITED THIS LAT LNG, was originally lng, lat 
            const [lat, lng] = coordinates.split(', ').map(Number); // Extract lng and lat from coordinates
            const data = {
                lon: lng,  // Use the extracted longitude
                lat: lat,   // Use the extracted latitude
                delta: 0.04,  // You can adjust this if needed
                dateRange: dateRange  // Use the passed dateRange prop
            };
            console.log(data)
        

            try {
                // Attempt to fetch data from the API
                const response = await axios.post('http://127.0.0.1:5000/search-scenes', data);
                console.log('Response received:', response.data);
                
                // Check if response data is an empty array
                if (Array.isArray(response.data) && response.data.length === 0) {
                    setError('API returned an empty array, loading dummy data.');
                    throw new Error('Empty array'); // Trigger the catch block
                }

                setMetadata(response.data); // Set metadata if the response is not empty
            } catch (err) {
                setError('Failed to fetch metadata');
                console.error(err);
            
                try {
                    const dummyResponse = await axios.get('/metadataDummy.txt');
                    setMetadata(dummyResponse.data);
                    console.log('Dummy data loaded:', dummyResponse.data);
                } catch (dummyErr) {
                    console.error('Error fetching dummy data:', dummyErr);
                    setError('Failed to load dummy metadata');
                }
            } finally {
                setLoading(false); // Set loading to false regardless of success or failure
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
                <p>Enter location...</p>
            )}
        </div>
    );
};

export default MetadataDisplay;
