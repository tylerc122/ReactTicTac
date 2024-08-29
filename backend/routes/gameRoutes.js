const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

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

router.post('/update-stats', auth, (req, res) => {
    const userId = req.user.id;
    const { result } = req.body;

    console.log(`Updating stats for user ${userId}: ${result}`);

    res.json({ message: 'Stats updated successfully' });
});

module.exports = router;