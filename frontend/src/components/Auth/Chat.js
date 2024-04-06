import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Chat.css';

const Chat = ({ }) => {
  const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId'));
  const [inputMessage, setInputMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(`/chat/history/${sessionId}`);
        setChatHistory(response.data);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();
  }, [sessionId]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      console.log('Session ID:', sessionId);
      const response = await axios.post('http://localhost:5000/chatbot', { message: inputMessage, session_id: sessionId });
      const chatbotResponse = response.data.message;

      setChatHistory(prevChatHistory => [...prevChatHistory, { user: inputMessage, chatbot: chatbotResponse }]);
      setInputMessage('');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Send request to logout endpoint
      const response = await axios.get('http://localhost:5000/logout');
      if (response.data.success) {
        // Clear session ID and redirect to login page
        localStorage.removeItem('sessionId');
        window.location.href = '/login';
      } else {
        console.error('Logout failed:', response.data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {/* Render Logout button */}
      <button onClick={handleLogout}>Logout</button>
      <div className="chat-history">
        {chatHistory.map((chat, index) => (
          <div key={index}>
            <div>User: {chat.user}</div>
            <div>Chatbot: {chat.chatbot}</div>
          </div>
        ))}
      </div>
      <div className="input-box">
        <input
          type="text"
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          placeholder="Type your message here..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
