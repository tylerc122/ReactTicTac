const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const cors = require('cors');
const gameRoutes = require('./routes/gameRoutes');


dotenv.config();

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
};


const app = express();

// Middleware for each request that comes through the server, i.e logging in, registering etc.
// Cors makes sure that the origin of the request is valid, meaning its allowed to access the server.
app.use(cors(corsOptions));

// Express allows us to parse the request body making it easier for the request to be processed and fulfilled
// in our specified route.
app.use(express.json());

// Checks the url path and directs it to its route.
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);


// Connects using the url we provided in .env file.
mongoose.connect(process.env.MONGODB_URI)

    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Broken broken broken fix it');
});

// Server running on port 5001.
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
    .on('error', (error) => {
        if (error.syscall !== 'listen') {
            throw error;
        }
        switch (error.code) {
            case 'EACCES':
                console.error(`Port ${PORT} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(`Port ${PORT} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    });