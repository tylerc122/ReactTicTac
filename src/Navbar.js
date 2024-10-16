// Defines the format of the navbar at the top of the screen.
import React from 'react';
import { useAuth } from './AuthContext';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';


function Navbar() {
    const { user, logout } = useAuth();

    console.log('Current user:', user);

    return (
        <AppBar position="fixed">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {user ? `Welcome, ${user.username || 'User'}!` : 'Please log in'}
                </Typography>
                {user && (
                    <Button color="inherit" onClick={logout}>
                        Logout
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
