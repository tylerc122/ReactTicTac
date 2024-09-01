import axios from 'axios';

// Define base URLS for:
// Authentication-related endpoints.
// Game-related endpoints
// We define these URLs and use them to make requests, when an action is performed client-side.
// We use these URLs to make specific requests to our server endpoints. Then using the routes defined server-side
// we handle these specific requests such as login, logout, changing state etc.
const API_URL = 'http://localhost:5001/api/auth';
const GAME_URL = 'http://localhost:5001/api/game';

/// Define an asynchronus function that registers a new user.
/// Makes a post request to the register endpoint.
export const register = async (username, password) => {
    try {
        // Make a post request to /api/auth/register with parameters username & password
        // Since this is an async function, we can use the await keyword to have it run like a sync func.
        // We wait for the Promise, which in this case is what axios.post returns, to either fulfill or fail and set it equal to response.
        const response = await axios.post(`${API_URL}/register`, { username, password });
        // If no errors and promise if fulfilled we execute further, and return the response which has
        // the data from the server.
        return response.data;
    } catch (error) {
        // If an error occurs during our request, throw an error data from the response.
        throw error.response.data;
    }
};

export const login = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { username, password });

        const userStatsResponse = await axios.get(`${API_URL}/user-stats`, {
            headers: {
                'Authorization': `Bearer ${response.data.token}`
            }
        });
        return {
            ...response.data,
            stats: userStatsResponse.data.stats
        };
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
        const response = await axios.post(`${GAME_URL}/update-stats`, { userId, result }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data.stats;
    } catch (error) {
        console.error('Error updating account statistics:', error);
        throw error;
    }
};