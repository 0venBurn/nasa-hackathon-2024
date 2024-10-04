// src/components/MapboxComponent.jsx
import React, { useState } from 'react';
import ReactMapGL from 'react-map-gl';
import './mapbox.css'; // Ensure this file contains the necessary styles

function MapboxComponent() {
    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN; // Ensure your Mapbox token is set in your environment variables

    // State to hold viewport information (center, zoom level, etc.)
    const [viewport, setViewport] = useState({
        latitude: 37.7749,  // Default to San Francisco
        longitude: -122.4194,
        zoom: 10,
        width: '100%',
        height: '500px',
    });

    return (
        <div>
            <ReactMapGL
                {...viewport}
                mapboxApiAccessToken={MAPBOX_TOKEN}
                mapStyle="mapbox://styles/mapbox/streets-v11" // Map style
                onViewportChange={(newViewport) => setViewport(newViewport)} // Update the viewport when it changes
                className="map-container" // Apply CSS class
            />
        </div>
    );
}

export default MapboxComponent;
