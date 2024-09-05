const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// POST route for registration. 
router.post('/register', async (req, res) => {
    try {
        // Get the required elements from the client's request body.
        const { username, password } = req.body;

        // We must check whether or not this user already exists in our db.
        // We verify that they don't exist by checking if their username exists, since we require unique usernames,
        // this is the only thing we need to check.
        const existingUser = await User.findOne({ username });

        // If username exists, log into console
        if (existingUser) {
            console.log('Username already exists: ' + username);
            return res.status(400).json({ error: 'Username already exists' });
        }

        // If username doesn't exist:
        // Hash the users password with bcrypt.
        const hashedPassword = await bcrypt.hash(password, 10);

        // Creating new user instance with the password we just hashed.
        const user = new User({ username, password: hashedPassword });
        await user.save();

        // Give a success message.
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Registration error: ', error);
        res.status(500).json({ error: 'Error registering user' });
    }
});

// POST route for login
router.post('/login', async (req, res) => {
    try {

        console.log('Received login request:', req.body);
        // Get the required elements from the client's request body.
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

        // A JWT token is created and signed using our secret key.
        // This token will serve as proof that the current user that logged in is authenticated, allowing subsequent requests to be approved faster.
        // For example if we wanted to update stats, our API takes a token as authentication.
        const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET);

        // Log that the login was successful.
        console.log('Login successful for user:', username);
        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
});

/// POST route for updating stats.
router.post('/updateStats', async (req, res) => {
    try {

        // Get the elements we need from the request body to update stats.
        const { userId, result } = req.body;
        // Set our user const to the user we find by findById.
        const user = await User.findById(userId);

        // If user is null, meaning the userId isn't valid in our DB
        if (!user) {
            // Make sure we know that the user wasn't found.
            return res.status(404).json({ error: 'User was not found' });
        }

        // Switch case so we can easily update stats tied to a profile
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

        // Save the changes made to the user stats.
        await user.save();

        // Log that the account stats were updated correctly. 
        res.json({ message: 'Account statistics updated successfully', stats: user.stats });
    } catch (error) {
        // Unless an error is caught, in that case log the error.
        console.error('Error updating account statistics', error);
        res.status(500).json({ error: 'Error updating account statistics' });
    }
});

/// GET route for getting the stats tied to an account.
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

module.exports = router;