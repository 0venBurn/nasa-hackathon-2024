// src/components/MapboxComponent.js
import React, { useState } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import './mapbox.css';

function MapboxComponent() {
  
    const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

  // State to hold viewport information (center, zoom level, etc.)
  const [viewport, setViewport] = useState({
    latitude: 37.7749,  // Default to San Francisco
    longitude: -122.4194,
    zoom: 10,
    width: '100%',
    height: '500px',
  });

  // State for popup or marker
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <div>
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v11" // Different styles available
        onViewportChange={(newViewport) => setViewport(newViewport)}
      >
        {/* Marker for a location */}
        <Marker latitude={37.7749} longitude={-122.4194}>
          <button
            onClick={() => setSelectedLocation({ latitude: 37.7749, longitude: -122.4194 })}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
            }}
          >
            📍
          </button>
        </Marker>

        {/* Popup when a marker is clicked */}
        {selectedLocation && (
          <Popup
            latitude={selectedLocation.latitude}
            longitude={selectedLocation.longitude}
            onClose={() => setSelectedLocation(null)}
          >
            <div>San Francisco</div>
          </Popup>
        )}
      </ReactMapGL>
    </div>
  );
}

export default MapboxComponent;
