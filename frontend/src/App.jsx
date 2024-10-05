import React, { useRef, useState } from 'react';
import React, { useRef, useState } from 'react';
import MapboxComponent from "./components/mapbox/MapboxComponent";
import Toggle from "./components/StateToggle/Toggle";
import "./App.css";
import "mapbox-gl/dist/mapbox-gl.css";

// import './components/mapbox/mapbox.css';
import EmailBoxComponent from "./components/emailBox/emailBoxComponent";
import DateBox from "./components/dateBox/dateBox";
import CloudCoverage from './components/LeadTime/LeadTime';
import LeadTime from './components/LeadTime/LeadTime';
import CoordinateBar from './components/CoordinateBar/CoordinateBar';

import MetadataDisplay from './components/metadataDisplay/metadataDisplay';
import UserLocation from './components/userLocation/userLocation';


function App() {
  const mapRef = useRef(null);
  const [userCoordinates, setUserCoordinates] = useState(null); // Store user coordinates
  const handleToggleChange = (selection) => {
    // Hide the div that isn't selected
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

  const handleLocationSubmit = (location) => {
    setUserCoordinates(location); // Update user coordinates on submit
  };


  const handleSubmit = (x, y) => {
    mapRef.current.flyTo({
      center: [x,y],
    })
  };

  return (
    <>
      <div id="toggleContainer">
        <Toggle handleToggleChange={handleToggleChange} />
        <div id="Live">
          <DateBox />
          <UserLocation onSubmit={handleLocationSubmit} />
          <CoordinateBar handleSubmit={handleSubmit} />
        </div>
        <div id="Future" style={{ display: "none" }}>
          <EmailBoxComponent />
          <p>Lead Time</p>
          <LeadTime />
          <MetadataDisplay />
          
        </div>
      </div>
      <div id="mapContainer">
        <MapboxComponent mapRef={mapRef} userCoordinates={userCoordinates} />  
      </div>
    </>
  );
}
export default App;