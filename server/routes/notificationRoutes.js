const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let query;
        if (req.user.isAdmin) {
            // Admins see global admin notifications (user: null/undefined) AND their own
            query = {
                $or: [
                    { user: null },
                    { user: { $exists: false } },
                    { user: req.user._id }
                ],
                isRead: false // Only fetch unread
            };
        } else {
            // Users only see their own unread
            query = { user: req.user._id, isRead: false };
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Ownership check
        const isOwner = notification.user && notification.user.toString() === req.user._id.toString();
        const isAdminAlert = !notification.user && req.user.isAdmin;

        if (!isOwner && !isAdminAlert) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        notification.isRead = true;
        const updatedNotification = await notification.save();
        res.json(updatedNotification);
    } catch (error) {
        console.error('Error reading notification:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Mark ALL notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, async (req, res) => {
    try {
        let query;
        if (req.user.isAdmin) {
            query = {
                $or: [
                    { user: null },
                    { user: { $exists: false } },
                    { user: req.user._id }
                ],
                isRead: false
            };
        } else {
            query = { user: req.user._id, isRead: false };
        }

        await Notification.updateMany(query, { isRead: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all read:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});


module.exports = router;
