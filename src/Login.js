import React, { useState } from 'react';
import { login } from './api';
import { useAuth } from './AuthContext';

function Login() {
    // useState hooks to manage username, password states.
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login: authLogin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Call login from the API
            const data = await login(username, password);
            // Called authLogin from auth
            authLogin(data);
            console.log('Login successful', data);
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button type="submit">Login</button>
        </form>
    );
}

export default Login;