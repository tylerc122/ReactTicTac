import React from 'react';
import { useAuth } from './AuthContext';

const Statistics = () => {
    const { user } = useAuth();

    if (!user || !user.stats) {
        return <div>No statistics available</div>
    }

    const { wins, losses, draws } = user.stats;
    const totalGames = user.stats.wins + user.stats.losses + user.stats.draws;
    const winPercentage = totalGames > 0 ? ((user.stats.wins / totalGames) * 100).toFixed(2) : 0;


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