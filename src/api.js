import axios from 'axios';

const API_URL = 'http://localhost:5001/api/auth';

export const register = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/register`, { username, password });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const login = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { username, password });
        return response.data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error
    }
};

export async function getGameState() {
    const response = await fetch('${API_URL}/game-state', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch current game state');
    }
    return response.json();
}

export async function updateGameState(newState) {
    const response = await fetch('${API_URL}/game-state', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getIteam('token')}`,
        },
        body: JSON.stringify({ state, newState }),
    });
    if (!response.ok) {
        throw new Error('Failed to update current game state');
    }
    return response.json();
}