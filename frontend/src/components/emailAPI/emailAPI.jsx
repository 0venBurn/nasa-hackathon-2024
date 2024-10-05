import React, { useState } from 'react';

const EmailAPI = ({email, leadTime, cloudCoverage, location} ) => {

  const handleFetch = async () => {
    const data = {
        email,
      leadTime,
        cloudCoverage,
        location
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Success:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <br></br>
      <button onClick={handleFetch}>Submit</button>
    </div>
  );
};

export default EmailAPI;