import React, { useState } from 'react';
import { login, register } from './api';
import { useAuth } from './AuthContext';

function Login() {
    // useState hooks to manage username, password states.
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const { login: authLogin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isRegistering) {
                await register(username, password);
                console.log('Registration success!');
                setIsRegistering(false);
            } else {
                // Call login from the API
                const data = await login(username, password);
                // Called authLogin from auth
                authLogin({
                    token: data.token,
                    username: username,
                });
                console.log('Login successful', data);
            }
        } catch (error) {
            console.error(isRegistering ? 'Registration failed' : 'Login failed', error);
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
            <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
            <button type="button" onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? 'Switch to Login' : 'Switch to Register'}
            </button>
        </form>
    );
}

export default Login;