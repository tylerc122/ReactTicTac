import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Create a new context
const AuthContext = createContext(null);

// Manages auth state and provides it to the children comps
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // This runs automatically when the component mounts
    useEffect(() => {
        // Get token from local storage,
        const token = localStorage.getItem('token');
        // if valid, decode the token and assign basic attributes.
        if (token) {
            const decodedToken = jwtDecode(token);
            setUser({
                id: decodedToken.userId,
                token: token,
                username: decodedToken.username,
                stats: { wins: 0, losses: 0, draws: 0 }
            });
        }
    }, []);

    // Login runs after a user logs in.
    const login = (userData) => {
        // Sets the user state and saves the token to local storage.
        const decodedToken = jwtDecode(userData.token);
        setUser({
            id: decodedToken.userId,
            username: decodedToken.username,
            stats: userData.stats || { wins: 0, losses: 0, draws: 0 },
            token: userData.token,
        });

        localStorage.setItem('token', userData.token);
    };

    // Removes token on logout
    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

    // Updates the user.
    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    }
    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);