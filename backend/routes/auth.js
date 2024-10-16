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
        const { username, password, confirmPassword } = req.body;

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

        if(password === confirmPassword){
        // Creating new user instance with the password we just hashed.
        const user = new User({ username, password: hashedPassword });
        await user.save();
        }
        else {
            return res.status(400).json({ error: 'Passwords do not match'});
        }

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