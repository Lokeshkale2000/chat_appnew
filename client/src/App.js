import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css'; 

const socket = io(`https://chat-appnew-fvsmh71vj-lokeshkale2000s-projects.vercel.app/`); 

const App = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    
    const handleChatMessage = (data) => {
      setChat((prevChat) => [...prevChat, data]);
    };

    
    const handleChatHistory = (messages) => {
      setChat(messages);
    };

   
    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.on('chatMessage', handleChatMessage);
    socket.on('chatHistory', handleChatHistory);
    socket.on('onlineUsers', handleOnlineUsers);

    return () => {
      socket.off('chatMessage', handleChatMessage);
      socket.off('chatHistory', handleChatHistory);
      socket.off('onlineUsers', handleOnlineUsers);
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      socket.emit('joinChat', username);
      setIsLoggedIn(true);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const data = { message, author: username };
      socket.emit('chatMessage', data);
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      {!isLoggedIn ? (
        <div className="login">
          <h2>Enter Group userName</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Enter username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button type="submit">Join Chat</button>
          </form>
        </div>
      ) : (
        <>
          <h1> Chat App</h1>
          <div className="online-users">
            <h3>Group Member Online :</h3>
            <ul>
              {onlineUsers.map((user) => (
                <li key={user.id}>{user.username}</li>
              ))}
            </ul>
          </div>

          <div className="chat-box">
            {chat.map((msg, index) => (
              <div
                key={index}
                className={`message ${
                  msg.author === username ? 'right' : 'left'
                }`}
              >
                <div className="message-content">
                  <p>{msg.message}</p>
                  <span className="message-info">
                    <strong>{msg.author}</strong> ({msg.timestamp}) 
                  </span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit">Send</button>
          </form>
        </>
      )}
    </div>
  );
};

export default App;
