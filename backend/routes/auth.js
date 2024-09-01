const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// This route handles registering
router.post('/register', async (req, res) => {
    try {
        // Get the username & password from user.
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Username already exists: ' + username);
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash the users password with bcrypt.
        const hashedPassword = await bcrypt.hash(password, 10);

        // Creating new user instance with the password we just hashed.
        const user = new User({ username, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Registration error: ', error);
        res.status(500).json({ error: 'Error registering user' });
    }
});

// This route handles logging in.
router.post('/login', async (req, res) => {
    try {
        console.log('Received login request:', req.body);
        // Get username & password.
        const { username, password } = req.body;
        // Check if the user exists in our database i.e they have registered.
        const user = await User.findOne({ username });
        // If not, tell them they need to register.
        if (!user) {
            console.log('User not found:', username);
            return res.status(400).json({ error: 'Invalid credentials: Please register' });
        }
        // Same thing w/ password.
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('Invalid password for user:', username);
            return res.status(400).json({ error: 'Invalid credentials: Incorrect password' });
        }
        const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET);
        console.log('Login successful for user:', username);
        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
});

router.post('/updateStats', async (req, res) => {
    try {
        const { userId, result } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User was not found' });
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
                return res.status(400).json({ error: 'Not a valid result' });
        }
        await user.save();
        res.json({ message: 'Account statistics updated successfully', stats: user.stats });
    } catch (error) {
        console.error('Error updating account statistics', error);
        res.status(500).json({ error: 'Error updating account statistics' });
    }
});

<<<<<<< HEAD
router.post('/game-state', async (req, res) => {

})
=======
router.get('/user-stats', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User unable to be found' });
        }
        res.json({ stats: user.stats });
    } catch (error) {
        console.error('Error getting stats'.error);
        res.status(500).json({ message: 'Server error' });
    }
});

>>>>>>> temp-branch
module.exports = router;