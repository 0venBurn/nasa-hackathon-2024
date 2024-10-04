// src/components/MapboxComponent.jsx
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl'; // Ensure you have this installed
import 'mapbox-gl/dist/mapbox-gl.css'; // Import Mapbox CSS

const MapboxComponent = () => {
  const mapContainerRef = useRef(); // Reference for the map container
  const mapRef = useRef(); // Reference for the map instance

  useEffect(() => {
    // Set your Mapbox access token
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN; // Use environment variable for security

    // Initialize the map instance
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11', // Choose a Mapbox style
      center: [-74.5, 40], // Starting position [lng, lat]
      zoom: 9, // Starting zoom level
    });

    // Cleanup on unmount
    return () => mapRef.current.remove();
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div
      ref={mapContainerRef} // Attach the ref to the div
      style={{ height: '500px', width: '100%' }} // Set height and width
      className="map-container" // Optional: for additional CSS styling
    />
  );
};

export default MapboxComponent;
