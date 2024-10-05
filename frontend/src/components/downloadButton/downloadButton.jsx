import React from "react";

// PLACEHOLDER BUTTON ONLY NO FUNCTION BC THAT TAKES EFFORT 
const DownloadButton = ({ onClick = () => alert("Button clicked!"), text = "Download" }) => {
    return (
        <button className="download-button" onClick={onClick} disabled>
            {text}
        </button>

    );
};

export default DownloadButton