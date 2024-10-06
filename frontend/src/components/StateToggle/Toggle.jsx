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
      <div style={{ display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          gap: "4rem",
          margin: "1.5rem" }}>
        <button
          onClick={() => handleClick("Live")}
            style={{
              cursor: "pointer",
            padding: "10px 20px",
            backgroundColor: selected === "Live" ? "#1a1a1a" : "#fff",
            color: selected === "Live" ? "#fff" : "#1a1a1a",
            border: selected === "Live" ? "2px solid #000" : "2px solid #ccc",
            borderRadius: "4px",
            marginRight: "10px",
          }}
        >
          Live
        </button>
        <button
          onClick={() => handleClick("Future")}
          style={{
            cursor: "pointer",
            padding: "10px 20px",
            backgroundColor: selected === "Future" ? "#1a1a1a" : "#fff",
            color: selected === "Future" ? "#fff" : "#1a1a1a",
            border: selected === "Future" ? "2px solid #000" : "2px solid #ccc",
            borderRadius: "4px",
          }}
        >
          Future
        </button>
      </div>
    </div>
  );
};

export default Toggle;
