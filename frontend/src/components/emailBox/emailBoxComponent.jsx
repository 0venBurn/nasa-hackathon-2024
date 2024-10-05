// src/components/EmailBoxComponent.jsx
import React, { useState } from 'react';
import './emailBox.css'; // Import any required CSS

const emailBoxComponent = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple email validation
    const validateEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    };

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Simulate success response
    setSuccess(true);
    setError('');
    setEmail('');
  };

  return (
    <div className="email-box-container">
      <h2>Subscribe to our newsletter</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Subscribe</button>
      </form>
      {success && <p className="success-message">Thank you for subscribing!</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default emailBoxComponent;
