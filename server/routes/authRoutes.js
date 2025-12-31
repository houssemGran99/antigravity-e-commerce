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
            { expiresIn: '2d' }
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
        console.log('Using Client ID:', process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 10) + '...' : 'UNDEFINED');

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
            { expiresIn: '2d' }
        );

        res.status(200).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture,
                isAdmin: user.isAdmin,
                googleId: user.googleId
            },
            token: sessionToken
        });
    } catch (error) {
        console.error('Auth Error Stack:', error.stack);
        console.error('Auth Error Details:', error);
        res.status(500).json({ message: 'Authentication failed', error: error.message });
    }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;

        // Basic validation
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'Please enter all required fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name: `${firstName} ${lastName}`,
            email,
            phone,
            password: hashedPassword,
            isAdmin: false
        });

        if (user) {
            // Generate Token
            const token = jwt.sign(
                { id: user._id, isAdmin: user.isAdmin },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            res.status(201).json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    phone: user.phone,
                    googleId: user.googleId
                },
                token
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign(
                { id: user._id, isAdmin: user.isAdmin },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            res.json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    phone: user.phone,
                    picture: user.picture,
                    googleId: user.googleId
                },
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
