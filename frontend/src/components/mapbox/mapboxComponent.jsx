import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './mapbox.css'; 

// Mapbox Component
const MapboxComponent = ({ mapRef, coordinates, setCoordinates, userCoordinates }) => {
  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
        container: 'map', // ID of the container element
        style: 'mapbox://styles/mapbox/streets-v11',
        center: userCoordinates ? [userCoordinates.lng, userCoordinates.lat] : [-74.5, 40], // Use user coordinates or default
        zoom: 9,
      });

    mapRef.current = map; 
    

    map.on('style.load', function () {
      map.on('click', function (e) {
          var coordinates = e.lngLat;
          new mapboxgl.Popup()
              .setLngLat(coordinates)
              .setHTML(`Latitude: ${coordinates.lat}, Longitude: ${coordinates.lng}`)
              .addTo(map);
      });
  });

    return () => {
      if (mapRef.current) mapRef.current.remove();
  };
}, [mapRef, userCoordinates]);

useEffect(() => {
  if (userCoordinates) {
      // Set the map's center to the user's coordinates when they change
      mapRef.current.setCenter([userCoordinates.lng, userCoordinates.lat]);
  }
}, [userCoordinates, mapRef]);

  return <div id="map" className="map-container" />;
};

export default MapboxComponent;