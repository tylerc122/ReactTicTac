import React from 'react';
import { useAuth } from './AuthContext';

function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav>
            {user ? (
                <>
                    <span>Welcome, {user.username}!</span>
                    <button onClick={logout}>Logout</button>
                </>
            ) : (
                <span>Please log in</span>
            )}
        </nav>
    );
}

export default Navbar;