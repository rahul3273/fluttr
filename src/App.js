// App.js
import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

const SITE_KEY = 'YOUR_RECAPTCHA_SITE_KEY'; // replace this with your real reCAPTCHA v2 site key

function GenderSelect() {
  const [gender, setGender] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const navigate = useNavigate();

  const handleStart = () => {
    if (!gender) return alert('Please select a gender.');

    setShowConfirm(true); // show 18+ popup
  };

  const handleConfirm = () => {
    if (!captchaVerified) return alert('Please verify you are human.');

    localStorage.setItem('gender', gender);
    navigate('/chat');
  };

  return (
    <div className="app">
      <h1>👋 Welcome to <span style={{ color: '#ff4d6d' }}>Fluttr</span></h1>
      <p>Find someone to chat with, instantly!</p>
      
      <div className="gender-options">
        <button onClick={() => setGender('male')} className={gender === 'male' ? 'selected' : ''}>👨 Male</button>
        <button onClick={() => setGender('female')} className={gender === 'female' ? 'selected' : ''}>👩 Female</button>
        <button onClick={() => setGender('random')} className={gender === 'random' ? 'selected' : ''}>🎲 Random</button>
      </div>

      <button className="start-btn" onClick={handleStart}>🚀 Start Chat</button>

      {showConfirm && (
        <div className="popup">
          <div className="popup-content">
            <h2>🔞 Are you 18 or older?</h2>
            <p>This app is for users aged 18+ only.</p>

            <ReCAPTCHA
              sitekey={SITE_KEY}
              onChange={() => setCaptchaVerified(true)}
            />

            <div style={{ marginTop: '20px' }}>
              <button onClick={handleConfirm} className="start-btn">Yes, Enter Chat</button>
              <button onClick={() => setShowConfirm(false)} style={{ marginLeft: '10px' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatPage() {
  const gender = localStorage.getItem('gender');
  return (
    <div className="app">
      <h2>🎥 Video Chat Room</h2>
      <p>Your gender preference: <strong>{gender}</strong></p>
      <p>🔧 Chat system coming next...</p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GenderSelect />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}
