
import React, { useRef, useState } from 'react';
import MapboxComponent from "./components/mapbox/MapboxComponent";
import Toggle from "./components/StateToggle/Toggle";
import "./App.css";
import "mapbox-gl/dist/mapbox-gl.css";

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';


// import './components/mapbox/mapbox.css';
import EmailBoxComponent from "./components/emailBox/emailBoxComponent";
import DateBox from "./components/dateBox/dateBox";
// import CloudCoverage from './components/LeadTime/LeadTime';
import LeadTime from './components/LeadTime/LeadTime';
import CoordinateBar from './components/CoordinateBar/CoordinateBar';

import MetadataDisplay from './components/metadataDisplay/metadataDisplay';
import UserLocation from './components/userLocation/userLocation';
import DownloadButton from './components/downloadButton/downloadButton';



function App() {
  const mapRef = useRef(null);
  const [coordinates, setCoordinates] = useState(''); // State to store coordinates
  const [userCoordinates, setUserCoordinates] = useState(null); // Store user coordinates
  const [dateRange, setDateRange] = useState('2023-01-01/2023-12-31'); //to be changed 

  const handleToggleChange = (selection) => {
    const liveDiv = document.getElementById("Live");
    const futureDiv = document.getElementById("Future");
    if (selection === "Live") {
      liveDiv.style.display = "block";
      futureDiv.style.display = "none";
    } else {
      liveDiv.style.display = "none";
      futureDiv.style.display = "block";
    }
  };

  function drawGridAroundPoint(map, lng, lat) {
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


  const handleLocationSubmit = (location) => {
    setUserCoordinates(location); // Update user coordinates on submit
    setCoordinates(`${location.lng}, ${location.lat}`); // Update coordinates in the input field
  };

  const handleSubmit = (x, y) => {
    mapRef.current.flyTo({
      center: [x, y],
      zoom: 15
    })

    if (mapRef.current.getLayer('square-layer')) {
      mapRef.current.removeLayer('square-layer');
      mapRef.current.removeSource('square-source');
    }

    drawGridAroundPoint(mapRef.current, x, y);

    // Set the coordinates when submitted
    setCoordinates(`${x}, ${y}`); 
  };

  const handleDownload = () => {
    console.log('Download started...');
    // placeholder xoxo
  };


  return (
    <>
      <div id="toggleContainer">
        <Toggle handleToggleChange={handleToggleChange} />
        <div id="Live">
          <DateBox />
          <UserLocation onSubmit={handleLocationSubmit} />
          <CoordinateBar 
            handleSubmit={handleSubmit} 
            coordinates={coordinates} 
            setCoordinates={setCoordinates}
          />
          <DownloadButton onClick={handleDownload}/>
        </div>
        <div id="Future" style={{ display: "none" }}>
          <EmailBoxComponent />
          <p>Lead Time</p>
          <LeadTime />
          <MetadataDisplay coordinates={coordinates} dateRange={dateRange} /> 
        </div>
      </div>
      <div id="mapContainer">
        <MapboxComponent 
          mapRef={mapRef} 
          userCoordinates={userCoordinates} 
          coordinates={coordinates} setCoordinates={setCoordinates}
          drawGridAroundPoint={drawGridAroundPoint}
        />  
      </div>
    </>
  );
}
export default App;