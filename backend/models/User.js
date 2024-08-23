/// Model for user

const mongoose = require('mongoose');

// Each user must have a username, and a password.
// The user must be unique as we don't want to deal with multiple users of the same name.
// Though, every password need not be uniqe.
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    stats: { wins: { type: Number, default: 0 }, losses: { type: Number, default: 0 }, draws: { type: Number, default: 0 } }
});
userSchema.virtual('totalGames').get(function () {
    return this.stats.wins + this.stats.losses + this.stats.draws;
});

userSchema.virtual('winPercentage').get(function () {
    const totalGames = this.totalGames;
    return totalGames > 0 ? (this.stats.wins / totalGames * 100).toFixed(2) : 0;
});
module.exports = mongoose.model('User', userSchema);