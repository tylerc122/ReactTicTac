/// Model for user

const mongoose = require('mongoose');

// Each user must have a username, and a password.
// The user must be unique as we don't want to deal with multiple users of the same name.
// Though, every password need not be unique.
// Account statistics will also be stored for each user. These statistics will track wins, losses, and draws.
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    stats: { wins: { type: Number, default: 0 }, losses: { type: Number, default: 0 }, draws: { type: Number, default: 0 } }
});

// Define a virtual property 'totalGames', we store this virtually instead of on the db since it would be redundant
// to store it as a seperate value since it can be derived from already existing properties.
// We define the getter function so that every time we need this stat, we calculate it on the fly by adding W/L/D.
userSchema.virtual('totalGames').get(function () {
    return this.stats.wins + this.stats.losses + this.stats.draws;
});

// Define another virtual property, same ordeal as totalGames, calculated on the fly instead of being stored.
// If total games isn't greater than zero, we return zero, other than that, return win % rounded to 2 decimal.
userSchema.virtual('winPercentage').get(function () {
    const totalGames = this.totalGames;
    return totalGames > 0 ? (this.stats.wins / totalGames * 100).toFixed(2) : 0;
});

// Compiles the schema into a model using mongoose.model, and makes it available to use in other files
// by setting the value of said model into module.exports.
module.exports = mongoose.model('User', userSchema);