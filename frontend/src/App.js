import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Chat from './components/Auth/Chat';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import './App.css'; // Import custom CSS file for styling

const App = () => {
  const [sessionId, setSessionId] = useState(null);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setSessionId={setSessionId} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chat" element={<Chat sessionId={sessionId} />} />
          {/* Add other routes */}
        </Routes>
      </div>
    </Router>
  );
};

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to the AI Chatbot</h1>
      <p>Ask me anything and I'll do my best to assist you!</p>
      <button onClick={() => window.location.href = '/login'}>Go to Login</button>
    </div>
  );
};

export default App;
