// models/Game.js
const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    state: { type: Array, required: true },  // This will store the board state, e.g., [null, 'X', 'O', ...]
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

gameSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Game', gameSchema);
