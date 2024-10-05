import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './mapbox.css'; 

// Mapbox Component
const MapboxComponent = ({ mapRef, coordinates, setCoordinates }) => {
  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
        container: 'map', // ID of the container element
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-6.23, 53.345], // Initial position [lng, lat]
        zoom: 9,
      });

    mapRef.current = map; 
    

    map.on('style.load', function () {
      map.on('click', function (e) {
        var coordinates = e.lngLat;
        const formattedCoordinates = `${coordinates.lng}, ${coordinates.lat}`;
        setCoordinates(formattedCoordinates);
        // mapCoordBox.innerHTML = `${coordinates.lng}, ${coordinates.lat}`;
        console.log("Coordinates:", coordinates);

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(coordinates)
          .addTo(map);
      });
    });

    // Cleanup the map instance on unmount
    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, [mapRef]);

  return <div id="map" className="map-container" />;
};

export default MapboxComponent;