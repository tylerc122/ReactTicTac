import axios from 'axios';

const API_URL = 'http://localhost:5001/api/auth';
const GAME_URL = 'http://localhost:5001/api/game';

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
    try {
        const response = await axios.get(`${GAME_URL}/state`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch current game state:', error);
        throw error;
    }
}

export async function updateGameState(newState) {
    try {
        const response = await axios.post(`${GAME_URL}/state`,
            { newState },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Failed to update current game state:', error);
        throw error;
    }
}

export const updateStats = async (userId, result) => {
    try {
        const response = await axios.post(`${GAME_URL}/updateStats`, { userId, result }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error updating account statistics:', error);
        throw error;
    }
};