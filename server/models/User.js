const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    googleId: {
        type: String
    },
    phone: {
        type: String
    },
    address: {
        street: String,
        city: String,
        postalCode: String,
        country: String
    },
    username: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String
    },
    picture: {
        type: String
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
