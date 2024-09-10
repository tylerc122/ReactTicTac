/// Defines Statistics for each user.

import React from 'react';
import { useAuth } from './AuthContext';

const Statistics = () => {
    const { user } = useAuth();

    // If in offline mode or user cannot be initialized, user stats cannot be initialized
    if (!user || !user.stats) {
        return <div>No statistics available</div>
    }

    // Calculating total games and win %.
    const totalGames = user.stats.wins + user.stats.losses + user.stats.draws;
    const winPercentage = totalGames > 0 ? ((user.stats.wins / totalGames) * 100).toFixed(2) : 0;

    // Return stats formatted to display on the app.
    return (
        <div className="statistics">
            <h2>Player Statistics</h2>
            <p>Wins: {user.stats.wins}</p>
            <p>Losses: {user.stats.losses}</p>
            <p>Draws: {user.stats.draws}</p>
            <p>Total Games: {totalGames}</p>
            <p>Win Percentage: {winPercentage}%</p>
        </div>
    );
};

export default Statistics;