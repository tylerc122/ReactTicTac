// Defines the format of the navbar at the top of the screen.
import React from 'react';
import { useAuth } from './AuthContext';

function Navbar() {
    const { user, logout } = useAuth();

    console.log('Current user:', user);

    return (
        <nav style={{ background: '#f8f8f8', padding: '10px', textAlign: 'center', borderBottom: '1px solid #ccc', position: 'fixed', left: 0, top: 0, width: '100%'}}>
            {user ? (
                <>
                    <span>Welcome, {user.username || 'User'}!</span>
                    <button onClick={logout} style={{ marginLeft: '20px' }}>Logout</button>
                </>
            ) : (
                <span>Please log in</span>
            )}
        </nav>
    );
}

export default Navbar;
