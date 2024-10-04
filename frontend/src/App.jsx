// src/App.js
import React from "react";
import MapboxComponent from "./components/mapbox/MapboxComponent";
import Toggle from "./components/StateToggle/Toggle";
import './App.css';
import 'mapbox-gl/dist/mapbox-gl.css'; 
import './components/mapbox/mapbox.css';

function App() {

  const handleToggleChange = (selection) => {
    console.log(`Selected ${selection}`)
  }

  return (
    <>
      <div>
        <Toggle  handleToggleChange={handleToggleChange}/>
      </div>
      <div>
          <MapboxComponent />
      </div>
    </>
  );
}

export default App;
