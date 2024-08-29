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

router.post('/update-stats', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { result } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User could not be found' });
        }
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

        const totalGames = user.wins + user.losses + user.draws;
        user.winPercentage = totalGames > 0 ? (user.wins / totalGames) * 100 : 0;

        await user.save();

        console.log(`Succesfully updated stats for user ${userId}: ${result}`);

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