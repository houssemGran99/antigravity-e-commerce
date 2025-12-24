const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/admin-login
router.post('/admin-login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isAdmin) {
            return res.status(401).json({ message: 'Not authorized as admin' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate Local JWT
        const sessionToken = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture,
                isAdmin: user.isAdmin
            },
            token: sessionToken
        });

    } catch (error) {
        console.error('Admin Auth Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;
        console.log('Received login request at', new Date().toISOString());

        // Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();

        const { sub: googleId, email, name, picture } = payload;

        // Find or Create User
        let user = await User.findOne({ googleId });

        if (!user) {
            // Check if email already exists
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                user = existingEmail;
                user.googleId = googleId;
                user.picture = picture;
                await user.save();
            } else {
                user = new User({
                    name,
                    email,
                    googleId,
                    picture,
                    isAdmin: false // Default to false
                });
                await user.save();
            }
        } else {
            // Update info if changed
            user.name = name;
            user.picture = picture;
            await user.save();
        }

        // Generate Local JWT
        const sessionToken = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture,
                isAdmin: user.isAdmin
            },
            token: sessionToken
        });
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
});

module.exports = router;
