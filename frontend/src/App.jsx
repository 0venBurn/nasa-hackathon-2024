import React, { useRef, useState } from "react";
import MapboxComponent from "./components/mapbox/MapboxComponent";
import Toggle from "./components/StateToggle/Toggle";
import "./App.css";
import "mapbox-gl/dist/mapbox-gl.css";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// import './components/mapbox/mapbox.css';
import EmailBoxComponent from "./components/emailBox/emailBoxComponent";
import DateBox from "./components/dateBox/dateBox";
// import CloudCoverage from './components/LeadTime/LeadTime';
import LeadTime from "./components/LeadTime/LeadTime";
import CoordinateBar from "./components/CoordinateBar/CoordinateBar";

import MetadataDisplay from "./components/metadataDisplay/metadataDisplay";
import UserLocation from "./components/userLocation/userLocation";
import DownloadButton from "./components/downloadButton/downloadButton";
import CloudCoverage from "./components/CloudCoverage/CloudCoverage";
import EmailAPI from "./components/emailAPI/emailAPI";

import DummyGraphs from './components/metadataDisplay/imageDisplay';


function App() {
  const mapRef = useRef(null);
  const [coordinates, setCoordinates] = useState(""); // State to store coordinates
  const [clouds, setClouds] = useState(""); // State to store coordinates
  const [userCoordinates, setUserCoordinates] = useState(null); // Store user coordinates
  const [dateRange, setDateRange] = useState("2024-06-01/2024-06-17"); //to be changed
  const [leadTime, setLeadTime] = useState("");
  const [email, setEmail] = useState("");
  const [showImage, setShowImage] = useState(false);

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

  const randomArray = Array.from({ length: 9 }, () => Math.random());

  function drawGridAroundPoint(map, lng, lat, colors) {
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
      features: allSquares.map((square, index) => ({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [square],
        },
        properties: {
          // Set a property for coloring based on the index
          colorIndex: colors[index],
        },
      })),
    };

    map.addSource('square-source', {
      type: 'geojson',
      data: squarePolygons,
    });

    // Define the gradient colors
    const colorRamp = [
      'rgba(255, 255, 255, 1)', // White
      'rgba(0, 255, 0, 1)',     // Green
    ];

    // Add the layer for squares
    map.addLayer({
      id: 'square-layer',
      type: 'fill',
      source: 'square-source',
      layout: {},
      paint: {
        // Use an expression to interpolate between colors based on the colorIndex
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'colorIndex'],
          0, colorRamp[0], // Index 0 -> White
          1, colorRamp[1], // Index 8 -> Green
        ],
        'fill-opacity': 0.5,
      },
    });
}

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
      zoom: 15,
    });

    if (mapRef.current.getLayer("square-layer")) {
      mapRef.current.removeLayer("square-layer");
      mapRef.current.removeSource("square-source");
    }

    console.log(randomArray)
    drawGridAroundPoint(mapRef.current, x, y, randomArray);

    // Set the coordinates when submitted
    setCoordinates(`${x}, ${y}`);
    setShowImage(true); //show dummy image
  };

  const handleDownload = () => {
    console.log("Download started...");
    // placeholder xoxo
  };

  return (
    <>
      <header className="header">
  <div className="logo-container">
    <img src="\src\assets\NASA_logo.svg.png" alt="NASA Logo" className="logo" />
      <img src="\src\assets\logo.jpeg" alt="Custom Logo for Team Rock Lickers" className="logo" />
      <h1 className="title">Space Apps 2024</h1>
  </div>
</header>
      <body>
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
          {/* {showImage && <DummyGraphs />} */}
          <MetadataDisplay coordinates={coordinates} dateRange={dateRange} />
          <DownloadButton onClick={handleDownload} />
        </div>
        <div id="Future" style={{ display: "none" }}>
          <UserLocation />
          <CoordinateBar
            handleSubmit={handleSubmit}
            coordinates={coordinates}
            setCoordinates={setCoordinates}
          />
          <EmailBoxComponent email={email} setEmail={setEmail} />
          <LeadTime />
          <CloudCoverage
            clouds={clouds}
            setClouds={setClouds}
            minimum={"1"}
            maximum={"100"}
            labels={"Cloud Coverage"}
          />

          <EmailAPI
            email={email}
            leadTime={leadTime}
            cloudCoverage={clouds}
            location={coordinates}
          />
        </div>
      </div>
      <div id="mapContainer">
        <MapboxComponent
          mapRef={mapRef}
          userCoordinates={userCoordinates}
          coordinates={coordinates}
          setCoordinates={setCoordinates}
          drawGridAroundPoint={drawGridAroundPoint}
        />
      </div>
      </body>
    </>
  );
}
export default App;
