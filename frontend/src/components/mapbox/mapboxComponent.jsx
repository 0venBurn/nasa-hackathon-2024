import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './mapbox.css'; 

// Mapbox Component
const MapboxComponent = ({ mapRef }) => {
  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: 'map', // ID of the container element
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-74.5, 40], // Initial position [lng, lat]
        zoom: 9,
      });
    }

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
    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, [mapRef]);

  return <div id="map" className="map-container" />;
};

export default MapboxComponent;