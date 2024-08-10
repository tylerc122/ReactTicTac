const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

dotenv.config();
console.log('MONGODB_URI:', process.env.MONGODB_URI);

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);

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