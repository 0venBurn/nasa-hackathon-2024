// src/App.js
import React from 'react';
import MapboxComponent from './components/mapbox/MapboxComponent';
import './App.css';
import 'mapbox-gl/dist/mapbox-gl.css'; 
import './components/mapbox/mapbox.css';

function App() {
  return (
    <div>
      <h1>Mapbox</h1>
      <MapboxComponent />
    </div>
  );
}

export default App;
