import React, { useState } from "react";
import "./Toggle.css";

const Toggle = ({ handleToggleChange }) => {
  const [selected, setSelected] = useState("Live");

  // Handle the click to toggle between Live and Future
  const handleClick = (selection) => {
    setSelected(selection);
    if (handleToggleChange) handleToggleChange(selection);
  };

  return (
    <div className="stateToggle">
      <div style={{ display: "flex" }}>
        <div
          onClick={() => handleClick("Live")}
          style={{
            cursor: "pointer",
            padding: "10px 20px",
            backgroundColor: selected === "Live" ? "#ddd" : "#fff",
            border: selected === "Live" ? "2px solid #000" : "2px solid #ccc",
            borderRadius: "4px",
            marginRight: "10px",
          }}
        >
          Live
        </div>
        <div
          onClick={() => handleClick("Future")}
          style={{
            cursor: "pointer",
            padding: "10px 20px",
            backgroundColor: selected === "Future" ? "#ddd" : "#fff",
            border: selected === "Future" ? "2px solid #000" : "2px solid #ccc",
            borderRadius: "4px",
          }}
        >
          Future
        </div>
      </div>
    </div>
  );
};

export default Toggle;
