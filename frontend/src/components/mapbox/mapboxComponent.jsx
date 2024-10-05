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

    const drawGridAroundPoint = (map, lng, lat) => {
      const latInMeters = 15 / 111320; // 15 meters in degrees of latitude
      const lngInMeters = 15 / (111320 * Math.cos(lat * (Math.PI / 180))); // Adjust for latitude

      // Generate a 3x3 grid of squares around the clicked point
      const offsets = [
        [-lngInMeters, latInMeters],  [0, latInMeters],  [lngInMeters, latInMeters],
        [-lngInMeters, 0],            [0, 0],            [lngInMeters, 0],
        [-lngInMeters, -latInMeters], [0, -latInMeters], [lngInMeters, -latInMeters],
      ];

      const allSquares = offsets.map(([offsetLng, offsetLat]) => generateSquare(lng + offsetLng, lat + offsetLat));

      const squarePolygons = {
        type: 'FeatureCollection',
        features: allSquares.map((square) => ({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [square],
          },
        })),
      };

      map.addSource('square-source', {
        type: 'geojson',
        data: squarePolygons,
      });

      map.addLayer({
        id: 'square-layer',
        type: 'fill',
        source: 'square-source',
        layout: {},
        paint: {
          'fill-color': '#ff0000',
          'fill-opacity': 0.5,
        },
      });
    };

    // Helper function to generate a single square around a given center
    const generateSquare = (lng, lat) => {
      const latInMeters = 15 / 111320; // 15 meters in degrees of latitude
      const lngInMeters = 15 / (111320 * Math.cos(lat * (Math.PI / 180))); // Adjust for latitude

      return [
        [lng - lngInMeters / 2, lat - latInMeters / 2], // Bottom left
        [lng + lngInMeters / 2, lat - latInMeters / 2], // Bottom right
        [lng + lngInMeters / 2, lat + latInMeters / 2], // Top right
        [lng - lngInMeters / 2, lat + latInMeters / 2], // Top left
        [lng - lngInMeters / 2, lat - latInMeters / 2], // Closing the square
      ];
    };

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
