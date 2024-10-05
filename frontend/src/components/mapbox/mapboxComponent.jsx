import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './mapbox.css'; 

// Mapbox Component
const MapboxComponent = () => {
  const mapContainerRef = useRef(); 

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN; 

    // Initialize the map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current, // Container ID
      style: 'mapbox://styles/mapbox/streets-v11', // Map style
      center: [-74.5, 40], // Starting position [lng, lat]
      zoom: 9, // Starting zoom level
    });

    map.on('style.load', function () {
      map.on('click', function (e) {
        var coordinates = e.lngLat;
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(coordinates)
          .addTo(map);
      });
    });

    // Cleanup the map instance on unmount
    return () => map.remove();
  }, []);

  return (
    <div ref={mapContainerRef} className="map-container" />
  );
};

export default MapboxComponent;
