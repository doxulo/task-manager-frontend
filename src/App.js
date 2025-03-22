import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_URL); // Connect to the backend

function App() {
    const [testData, setTestData] = useState(null);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/test`)
            .then(response => setTestData(response.data))
            .catch(error => console.error('Error fetching test data:', error));

        socket.on('connect', () => {
            console.log('Connected to socket.io server');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from socket.io server');
        });

        return () => {
            socket.disconnect();
        };

    }, []);

    return (
        <div>
            <h1>Task Manager</h1>
            {testData && <p>Database Time: {testData[0].now}</p>}
        </div>
    );
}

export default App;