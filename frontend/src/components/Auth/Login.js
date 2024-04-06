import React, { useState, useEffect } from 'react';
import { Link,  useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css'; // Import custom CSS file for styling

const Login = ({ setSessionId }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // Use history for programmatic navigation

  // Check for existing session ID upon component mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem('sessionId');
    if (storedSessionId) {
      // Redirect to chat page with previous session ID
      navigate('/chat');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      if (response.data.success) {
        // Handle successful login
        console.log(response.data.message);
        // Set the session ID
        console.log("Session ID: ", response.data.sessionId)
        setSessionId(response.data.sessionId);
        // Store session ID in localStorage
        localStorage.setItem('sessionId', response.data.sessionId);
        // Redirect to chat page
        navigate('/chat');
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <div className="auth-option">
        <p>Don't have an account?</p>
        <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  );
};

export default Login;
