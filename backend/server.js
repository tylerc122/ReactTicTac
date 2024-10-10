const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const cors = require('cors');
const gameRoutes = require('./routes/gameRoutes');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
};

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: corsOptions
});

let waitingPlayers = new Map();
let activeGames = new Map();

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    socket.on('findMatch', (userId) => {
        console.log(`User ${userId} is looking for a match`);
        waitingPlayers.delete(userId);

        for (let [waitingUserId, waitingSocket] of waitingPlayers) {
            if (waitingUserId !== userId) {
                // Match found
                const gameId = Math.random().toString(36).substr(2, 9);
                waitingSocket.emit('matchFound', { gameId, opponent: userId, start: true });
                socket.emit('matchFound', { gameId, opponent: waitingUserId, start: false });
                waitingPlayers.delete(waitingUserId);
                activeGames.set(gameId, { players: [waitingUserId, userId] });
                console.log(`Match found: ${waitingUserId} vs ${userId}, Game ID: ${gameId}`);
                return;
            }
        }

        // No match found, add to waiting list
        waitingPlayers.set(userId, socket);
        socket.emit('waiting');
        console.log(`User ${userId} added to waiting list`);
    });

   socket.on('cancelMatch', (userId) => {
        console.log(`User ${userId} cancelled match search`);
        waitingPlayers.delete(userId);
    });

    socket.on('move', ({ gameId, position, player }) => {
        socket.to(gameId).emit('opponentMove', { position, player });
    });

    socket.on('disconnect', () => {
        if (waitingPlayer === socket.id) {
            waitingPlayer = null;
        }
        console.log('Client disconnected');
    });
});

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5001;

// Check if the port is in use before trying to listen
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please choose a different port or close the application using this port.`);
        process.exit(1);
    } else {
        console.error('An error occurred:', error);
        process.exit(1);
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Clear waiting players on server start
    waitingPlayer = null;
    console.log('Cleared waiting players');
});