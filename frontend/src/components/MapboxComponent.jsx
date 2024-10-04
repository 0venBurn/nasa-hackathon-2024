// src/components/MapboxComponent.jsx
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox Component
const MapboxComponent = () => {
  const mapContainerRef = useRef(); // Reference to the map container

  useEffect(() => {
    // Set Mapbox access token from environment variable
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN; 

    // Initialize the map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current, // Container ID
      style: 'mapbox://styles/mapbox/streets-v11', // Map style
      center: [-74.5, 40], // Starting position [lng, lat]
      zoom: 9, // Starting zoom level
    });

    // Cleanup the map instance on unmount
    return () => map.remove();
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{ height: '500px', width: '100%' }} // Set height and width
    />
  );
};

export default MapboxComponent;
