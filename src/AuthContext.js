import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
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

    const login = (userData) => {
        const decodedToken = jwtDecode(userData.token);
        setUser({
            id: decodedToken.userId,
            username: decodedToken.username,
            stats: userData.stats || { wins: 0, losses: 0, draws: 0 },
            token: userData.token,
        });

        localStorage.setItem('token', userData.token);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

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