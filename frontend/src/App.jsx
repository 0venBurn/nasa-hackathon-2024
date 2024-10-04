// src/App.js
import React from "react";
import MapboxComponent from "./components/MapboxComponent";
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
        <h1>Mapbox Example</h1>
        <MapboxComponent />
        <></>
      </div>
    </>
  );
}

export default App;
