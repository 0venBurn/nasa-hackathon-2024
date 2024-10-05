// src/components/SearchBarComponent.jsx
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css'; // Import Mapbox CSS
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'; // Import Geocoder CSS

const SearchBarComponent = ({ mapRef }) => {
  const geocoderContainerRef = useRef(null); // Ref to hold the search bar

  useEffect(() => {
    // Ensure mapRef is available
    if (!mapRef.current) return;

    // Initialize MapboxGeocoder
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken, // Set your Mapbox access token here
      mapboxgl: mapboxgl, // Use Mapbox GL JS
      placeholder: "Search for places", // Placeholder text in search bar
      marker: false, // Disable automatic marker
    });

    // Add geocoder to the DOM
    geocoderContainerRef.current.appendChild(geocoder.onAdd(mapRef.current));

    // Fly to the selected result on the map
    geocoder.on('result', (e) => {
      const { center } = e.result.geometry;
      mapRef.current.flyTo({
        center: center,
        zoom: 12,
      });
    });
  }, [mapRef]);

  return (
    <div ref={geocoderContainerRef} className="geocoder-container"></div>
  );
};

export default SearchBarComponent;
