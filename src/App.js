import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Login from './Login';
import Register from './Register';
import LandingPage from './LandingPage';

const connectSocket = () => {
  const socket = io(process.env.REACT_APP_API_URL, {
    transports: ['websocket'],
    reconnectionAttempts: 5, // Retry up to 5 times
    reconnectionDelay: 1000, // Wait 1 second before retrying
  });

  socket.on('connect', () => {
    console.log('Connected to socket.io server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from socket.io server');
  });

  socket.on('reconnect_attempt', (attempt) => {
    console.log(`Reconnection attempt ${attempt}`);
  });

  return socket;
};

// Move ProtectedRoute outside of App component to prevent recreation on each render
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, login, loading } = useAuth();
  const [verifying, setVerifying] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.post(`${process.env.REACT_APP_API_URL}/verifyToken`, { token })
        .then(response => {
          if (response.data.valid) {
            login();
          } else {
            localStorage.removeItem('token');
          }
          setVerifying(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setVerifying(false);
        });
    } else {
      setVerifying(false);
    }
  }, [login]);

  // Show loading state while auth is initializing or token is being verified
  if (loading || verifying) {
    return <div>Loading...</div>;
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  const [testData, setTestData] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/test`)
      .then(response => setTestData(response.data))
      .catch(error => console.error('Error fetching test data:', error));

    const newSocket = connectSocket();
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute>
          <div>
            <h1>Task Manager Dashboard</h1>
            {testData && <p>Database Time: {testData[0].now}</p>}
            {/* Main application components */}
          </div>
        </ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;