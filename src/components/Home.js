import React, { useState } from 'react';

function Home({ onContinue }) {
  const [gender, setGender] = useState('Random');
  const [mode, setMode] = useState('video');
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const handleContinue = () => {
    if (!ageConfirmed) {
      alert('Please confirm you are 18+');
      return;
    }
    onContinue({ gender, mode });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome to Fluttr ❤️</h1>
      <p>Find love or make friends via video or chat.</p>

      <label>Gender:</label>
      <select onChange={(e) => setGender(e.target.value)}>
        <option>Male</option>
        <option>Female</option>
        <option>Other</option>
        <option>Random</option>
      </select><br /><br />

      <label>Chat Mode:</label>
      <select onChange={(e) => setMode(e.target.value)}>
        <option value="video">Video</option>
        <option value="text">Text</option>
      </select><br /><br />

      <label>
        <input type="checkbox" onChange={() => setAgeConfirmed(!ageConfirmed)} />
        I confirm I am 18+
      </label><br /><br />

      <button onClick={handleContinue}>Start Chatting</button>
    </div>
  );
}

export default Home;
