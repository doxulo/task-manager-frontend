import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        if (!username || !password){
            setError("Please enter a username and password");
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, {
                username,
                password,
            });
            console.log('Login successful:', response.data);

            // Handle successful login (e.g., save token, redirect)
            const token = response.data.token;
            localStorage.setItem('token', token);
            onLogin(); // Update authentication state
            navigate('/dashboard'); // Redirect to dashboard
        } catch (err) {
            if (err.response && err.response.status === 401){
                setError("Invalid Username or Password");
            } else {
                setError("An unexpected error has occurred");
            }

        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;