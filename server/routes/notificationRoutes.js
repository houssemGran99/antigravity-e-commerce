const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all notifications (Admin only)
// @route   GET /api/notifications
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const notifications = await Notification.find({}).sort({ createdAt: -1 }).limit(50); // Limit to last 50
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private/Admin
router.put('/:id/read', protect, admin, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (notification) {
            notification.isRead = true;
            const updatedNotification = await notification.save();
            res.json(updatedNotification);
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Mark ALL notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private/Admin
router.put('/read-all', protect, admin, async (req, res) => {
    try {
        await Notification.updateMany({ isRead: false }, { isRead: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


module.exports = router;
