import React from "react";

// PLACEHOLDER BUTTON ONLY NO FUNCTION BC THAT TAKES EFFORT 
const CompareButton = ({ onClick = () => alert("Button clicked!"), text = "Compare" }) => {
    return (
        <button className="download-button" onClick={onClick} disabled>
            {text}
        </button>

    );
};

export default CompareButton