const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    message: { type: String, required: true },
    type: { type: String, default: 'order' }, // 'order', 'system', 'user'
    link: { type: String }, // e.g., '/admin/orders/123'
    isRead: { type: Boolean, default: false },
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
