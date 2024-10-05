// src/components/EmailBoxComponent.jsx
import React, { useState } from 'react';
import './emailBox.css'; // Import any required CSS

const EmailBoxComponent = () => {
  const [email, setEmail] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  return (
    <div className="email-box">
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={handleEmailChange}
        className="email-input"
      />
    </div>
  );
};

export default EmailBoxComponent;
