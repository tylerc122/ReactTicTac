import React, { useState } from 'react';
import { login, register } from './api';
import { useAuth } from './AuthContext';

function Login() {
    // useState hooks to manage username, password states.
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [message, setMessage] = useState('')
    const { login: authLogin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Checking if registering
            if (isRegistering) {
                // Registration logic
                await register(username, password);
                setMessage('Registration success! You are now able to log in');
                setIsRegistering(false);
            } else {
                // Call login from API
                const data = await login(username, password);
                authLogin({
                    ...data,
                    username: username
                });
            }
        } catch (error) {
            // Actually have message indicating failure instead of just logging in the console.
            setMessage(isRegistering ? 'Registration failed. Please refresh and try again.' : 'Login failed. Double check your credentials.')
        }
    };

    // Style for the message, currently, message is blue if successful, red if anything but successful.
    const messageStyle = {
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '4px',
        fontWeight: 'bold',
        backgroundColor: message === 'Registration success! You are now able to log in' ? '#e6f3ff' : '#f8d7da',
        color: message === 'Registration success! You are now able to log in' ? '#0066cc' : '#721c24',
    };

    return (
        <div>
            {message && <div style={messageStyle}>{message}</div>}
            <form onSubmit={handleSubmit}>
                <input
                    // On submit
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
                <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
                <button type="button" onClick={() => {
                    setIsRegistering(!isRegistering);
                    setMessage('');
                }}>
                    {isRegistering ? 'Switch to Login' : 'Switch to Register'}
                </button>
            </form>
        </div>
    );
}

export default Login;