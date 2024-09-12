const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

const gameStates = {};

// GET route to fetch the game state
router.get('/state', auth, (req, res) => {
    const userId = req.user.id;
    const gameState = gameStates[userId] || Array(9).fill(null);
    res.json(gameState);
});

// POST route to update the game state
router.post('/state', auth, (req, res) => {
    const userId = req.user.id;
    const { newState } = req.body;

    if (!Array.isArray(newState) || newState.length !== 9) {
        return res.status(400).json({ message: 'Invalid game state' });
    }

    gameStates[userId] = newState;
    res.json({ message: 'Game state updated successfully' });
});

/// POST route for updating stats.
router.post('/update-stats', auth, async (req, res) => {
    try {

        // Get the elements we need from the request body to update stats.
        const userId = req.user.id;
        const { result } = req.body;

        // Set our user const to the user we find by findById.
        const user = await User.findById(userId);

        // If user is null, meaning the userId isn't valid in our DB
        if (!user) {
            return res.status(404).json({ message: 'User could not be found' });
        }

        // Switch case so we can easily update stats tied to an account.
        switch (result) {
            case 'win':
                user.stats.wins += 1;
                break;
            case 'loss':
                user.stats.losses += 1;
                break;
            case 'draw':
                user.stats.draws += 1;
                break;
            default:
                return res.status(400).json({ message: 'Invalid result' });
        }

        // Make sure we calculate total games and win percentages correctly.
        const totalGames = user.wins + user.losses + user.draws;
        user.winPercentage = totalGames > 0 ? (user.wins / totalGames) * 100 : 0;

        // Save the changes made to the user stats.
        await user.save();

        // Let client know that the stats are successfully updates with new stats.
        res.json({
            message: 'Stats updated successfully',
            stats: {
                wins: user.stats.wins,
                losses: user.stats.losses,
                draws: user.stats.draws,
                winPercentage: user.winPercentage
            }
        });
    } catch (error) {
        console.error('Error updating stats:', error);
        res.status(500).json({ message: 'Server error while updating stats' });
    }
});

module.exports = router;