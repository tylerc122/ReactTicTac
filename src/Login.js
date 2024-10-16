import React, { useState } from 'react';
import { login, register } from './api';
import { useAuth } from './AuthContext';
import { Box, TextField, Button, Typography, Container, Alert } from '@mui/material';


function Login() {
    // useState hooks to manage username, password states.
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [message, setMessage] = useState('')
    const { login: authLogin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            // Enforcing that password length is at least 8 characters
            if (isRegistering && password.length <= 8) {
                setMessage('Password must be longer than 8 characters');
                return;
            }
            // Checking if registering
            if(isRegistering){
                if (password !== confirmPassword) {
                    setMessage('Passwords do not match');
                    return;
                }
                // Registration logic
                const response = await register(username, password, confirmPassword);
                if (!response.ok) {
                    const errorData = await response.json();
                    setMessage(errorData.error || 'Registration failed. Please try again.');
                    return;
                }
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
            setMessage('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    {isRegistering ? 'Register' : 'Sign In'}
                </Typography>
                {message && (
                    <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ width: '100%', mt: 2 }}>
                        {message}
                    </Alert>
                )}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {isRegistering &&
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        id="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    }
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {isRegistering ? 'Register' : 'Sign In'}
                    </Button>
                    <Button
                        fullWidth
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setMessage('');
                        }}
                    >
                        {isRegistering ? 'Switch to Login' : 'Switch to Register'}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default Login;