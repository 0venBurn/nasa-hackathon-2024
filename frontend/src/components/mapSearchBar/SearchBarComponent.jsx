// src/components/mapSearchBar/SearchBarComponent.jsx
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import './searchBar.css';

const SearchBarComponent = ({ mapRef }) => {
  useEffect(() => {
    // Ensure mapRef is available
    if (!mapRef.current) return;

    // Create a new instance of MapboxGeocoder
    const geocoder = new MapboxGeocoder({
      accessToken: import.meta.env.VITE_MAPBOX_TOKEN, // Set your Mapbox access token here
      mapboxgl: mapboxgl, // Reference to the mapbox-gl
      placeholder: "Search for places", // Placeholder text
      marker: false, // Disable automatic marker
    });

    // Add the geocoder as a control to the map
    mapRef.current.addControl(geocoder);

    // Handle the result from the geocoder
    geocoder.on('result', (e) => {
      const { center } = e.result.geometry;
      mapRef.current.flyTo({
        center: center,
        zoom: 12,
      });
    });

    // Cleanup function to remove the geocoder on unmount
    return () => {
      geocoder.off('result');
      mapRef.current.removeControl(geocoder);
    };
  }, [mapRef]);

  return null; // No UI is rendered here, the geocoder is added directly to the map
};

export default SearchBarComponent;
