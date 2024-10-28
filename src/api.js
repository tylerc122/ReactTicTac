/// Defines
import axios from "axios";

// Define base URLS for:
// Authentication-related endpoints.
// Game-related endpoints
// We define these URLs and use them to make requests, when an action is performed client-side.
// We use these URLs to make specific requests to our server endpoints. Then using the routes defined server-side
// we handle these specific requests such as login, logout, changing state etc.
const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;
const GAME_URL = `${import.meta.env.VITE_API_URL}/api/game`;

/// Define an asynchronus function that registers a new user.
/// Makes a POST request to the register endpoint.
export const register = async (username, password, confirmPassword) => {
  try {
    // Make a POST request to /api/auth/register with parameters username & password
    // Since this is an async function, we can use the await keyword to have it run like a sync func.
    // We wait for the Promise, which in this case is what axios.post returns, to either fulfill or fail and set it equal to response.
    const response = await axios.post(`${API_URL}/register`, {
      username,
      password,
      confirmPassword,
    });
    // If no errors and promise if fulfilled we execute further, and return the response which has
    // the data from the server.
    return response.data;
  } catch (error) {
    // If an error occurs during our request, throw an error data from the response.
    throw error.response.data;
  }
};

/// Define an async function for logging in, taking parameters username & password
export const login = async (username, password) => {
  try {
    // Send a POST request to our login route
    // axios.post returns a Promise.
    const response = await axios.post(`${API_URL}/login`, {
      username,
      password,
    });

    // If we successfully login, we send a GET request to our user-stats route.
    // This ensures on login we have the stats tied with the account so that we can display them.
    const userStatsResponse = await axios.get(`${API_URL}/user-stats`, {
      // Create a header object
      headers: {
        // Use authorization header
        // response.data.token should have the token to prove that the user is authenticated since there was a successful login.
        Authorization: `Bearer ${response.data.token}`,
      },
    });
    // If both the POST and GET request are completed without failure then we spread all props from POST request
    // and make new object with both login data and stats combined.
    return {
      ...response.data,
      stats: userStatsResponse.data.stats,
    };
    // If GET or POST fail, throw an error.
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export async function getGameState() {
  try {
    const response = await axios.get(`${GAME_URL}/state`, {
      headers: {
        // Everything is similar to previous funcs, other than this line.
        // Since we are no longer using auth routes and our response doesn't contain login information,
        // We get the token from local storage since we assume that we are already logged in.
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch current game state:", error);
    throw error;
  }
}

export async function updateGameState(newState) {
  try {
    const response = await axios.post(
      `${GAME_URL}/state`,
      { newState },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update current game state:", error);
    throw error;
  }
}

export const updateStats = async (userId, result) => {
  try {
    const response = await axios.post(
      `${GAME_URL}/update-stats`,
      { userId, result },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data.stats;
  } catch (error) {
    console.error("Error updating account statistics:", error);
    throw error;
  }
};
