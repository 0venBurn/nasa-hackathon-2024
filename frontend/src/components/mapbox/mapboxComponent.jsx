import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './mapbox.css'; 

// Mapbox Component
const MapboxComponent = ({ mapRef, coordinates, setCoordinates, userCoordinates , drawGridAroundPoint}) => {
  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: 'map', // ID of the container element
      style: 'mapbox://styles/mapbox/standard-satellite',
      center: userCoordinates ? [userCoordinates.lng, userCoordinates.lat] : [-74.5, 40], // Use user coordinates or default
      zoom: 9,
    });

    mapRef.current = map;

    map.on('style.load', function () {
      map.on('click', function (e) {
        var coordinates = e.lngLat;
        const formattedCoordinates = `${coordinates.lng}, ${coordinates.lat}`;
        setCoordinates(formattedCoordinates);
        console.log("Coordinates:", coordinates);

        if (mapRef.current.getLayer('square-layer')) {
          mapRef.current.removeLayer('square-layer');
          mapRef.current.removeSource('square-source');
        }

        drawGridAroundPoint(mapRef.current, coordinates.lng, coordinates.lat);
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
