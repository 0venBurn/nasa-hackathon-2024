// src/App.js
import React, { useRef } from 'react';
import MapboxComponent from "./components/mapbox/MapboxComponent";
import Toggle from "./components/StateToggle/Toggle";
import "./App.css";
import "mapbox-gl/dist/mapbox-gl.css";
// import './components/mapbox/mapbox.css';
import EmailBoxComponent from "./components/emailBox/emailBoxComponent";
import dateBox from "./components/dateBox/dateBox";


function App() {
  const mapRef = useRef(null);
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

  return (
    <>
      <div id="toggleContainer">
        <Toggle handleToggleChange={handleToggleChange} />
        <div id="Live"></div>
        <div id="Future" style={{ display: "none" }}>
          <EmailBoxComponent />
          <dateBox />
        </div>
      </div>
      <div id="mapContainer">
        <MapboxComponent mapRef={mapRef} /> 
      </div>
    </>
  );
}

export default App;
