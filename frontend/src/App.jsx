// src/App.js
import React from "react";
import MapboxComponent from "./components/mapbox/MapboxComponent";
import Toggle from "./components/StateToggle/Toggle";

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
        <h1>Mapbox</h1>
        <MapboxComponent />
        <></>
      </div>
    </>
  );
}

export default App;
