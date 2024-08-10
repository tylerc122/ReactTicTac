/// Model for user

const mongoose = require('mongoose');

// Each user must have a username, and a password.
// The user must be unique as we don't want to deal with multiple users of the same name.
// Though, every password need not be uniqe.
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);