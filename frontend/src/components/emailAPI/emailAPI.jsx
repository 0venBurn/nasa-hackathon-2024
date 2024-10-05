import React, { useState } from 'react';
import EmailBoxComponent from './components/emailBox/emailBoxComponent';
import LeadTime from './components/LeadTime/LeadTime';
import CoordinateBar from './components/CoordinateBar/CoordinateBar';

const EmailAPI = () => {
  const [email, setEmail] = useState('');
  const [days, setTime] = useState('');
  const [location, setCoord] = useState('');

  const handleFetch = async () => {
    const data = {
        email,
        days,
        location,
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
      <h1>Parent Component</h1>
      <EmailBoxComponent onValueChange={setEmail} />
      <LeadTime onValueChange={setTime} />
      <CoordinateBar onValueChange={setCoord} />
      <button onClick={handleFetch}>Submit</button>
    </div>
  );
};

export default EmailAPI;