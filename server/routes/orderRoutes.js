const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { protect, admin } = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
        return;
    } else {
        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
        });

        const createdOrder = await order.save();

        // Decrement Product Stock immediately on order creation
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.inStock = product.inStock - item.qty;
                await product.save();
            }
        }

        // 1. Create In-App Notification
        try {
            await Notification.create({
                message: `New Order #${createdOrder._id} from ${req.user.name} - ${totalPrice} TND`,
                type: 'order',
                link: `/admin/orders`,
                user: null, // Admin notification
                isRead: false
            });
        } catch (error) {
            console.error('Failed to create notification:', error);
        }

        // Notify Admin via Email
        try {
            const adminEmail = process.env.FROM_EMAIL; // Sending to shop owner
            const orderLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/orders/${createdOrder._id}`; // Conceptual link

            await sendEmail({
                email: adminEmail,
                subject: `New Order Received! ID: ${createdOrder._id}`,
                message: `You have received a new order from ${req.user.name}.\n\nOrder ID: ${createdOrder._id}\nTotal: ${totalPrice} TND\nItems: ${orderItems.length}\n\nCheck the dashboard for details.`
            });
            console.log(`[New Order] Admin notification sent to ${adminEmail}`);
        } catch (error) {
            console.error('[New Order] Failed to send admin notification:', error);
        }

        res.status(201).json(createdOrder);
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const User = require('../models/User');

// @desc    Create new order
// ... (lines 9-82 remains same, skipping for brevity in replacement if possible, but I must match TargetContent exactly)

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword || '';

    // Build query conditions
    const query = {};

    // Search Logic
    if (keyword) {
        // Find users matching name
        const userIds = await User.find({ name: { $regex: keyword, $options: 'i' } }).distinct('_id');

        query.$or = [
            { user: { $in: userIds } },
            {
                $expr: {
                    $regexMatch: {
                        input: { $toString: "$_id" },
                        regex: keyword,
                        options: "i"
                    }
                }
            }
        ];
    }

    // Filter Logic
    if (req.query.payment && req.query.payment !== 'all') {
        query.isPaid = req.query.payment === 'paid';
    }
    if (req.query.delivery && req.query.delivery !== 'all') {
        query.isDelivered = req.query.delivery === 'delivered';
    }
    if (req.query.status && req.query.status !== 'all') {
        if (req.query.status === 'cancelled') {
            query.isCancelled = true;
        } else {
            query.isCancelled = false; // 'active'
        }
    }

    const count = await Order.countDocuments(query);
    const orders = await Order.find(query)
        .populate('user', 'id name email')
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ orders, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            res.status(401);
            throw new Error('Not authorized to cancel this order');
        }

        if (order.isDelivered) {
            res.status(400);
            throw new Error('Cannot cancel delivered order');
        }

        order.isCancelled = true;
        order.cancelledAt = Date.now();

        const updatedOrder = await order.save();

        // Notify Admin via In-App Notification
        try {
            await Notification.create({
                message: `Order #${order._id} has been cancelled by the customer.`,
                type: 'order',
                link: `/admin/orders`,
                user: null, // Admin notification
                isRead: false
            });
        } catch (error) {
            console.error('Failed to create cancellation notification:', error);
        }

        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin

// ... (existing imports)

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put('/:id/deliver', protect, admin, async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();

        const updatedOrder = await order.save();

        // Notify User via In-App Notification
        try {
            await Notification.create({
                message: `Your Order #${order._id} has been Delivered!`,
                type: 'order',
                link: `/profile`,
                user: order.user._id,
                isRead: false
            });
        } catch (error) {
            console.error('Failed to create delivery notification:', error);
        }

        // Send email
        try {
            console.log(`[Order Deliver] Attempting to send email to ${order.user.email} for order ${order._id}`);
            await sendEmail({
                email: order.user.email,
                subject: 'Your Order Has Been Shipped! - Lumière',
                message: `Hello ${order.user.name},\n\nWe are excited to let you know that your order ${order._id} has been approved and shipped! \n\nThank you for shopping with us.\n\nBest regards,\nThe Lumière Team`
            });
            console.log('[Order Deliver] Email sent successfully');
        } catch (error) {
            console.error('[Order Deliver] Failed to send email:', error);
            // We don't want to fail the request if email fails, just log it
        }

        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
router.put('/:id/pay', protect, admin, async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
        };

        const updatedOrder = await order.save();

        // Notify User via In-App Notification
        try {
            await Notification.create({
                message: `Payment Received for Order #${order._id}. Thank you!`,
                type: 'order',
                link: `/profile`,
                user: order.user, // Assuming populated or just ID is fine if schema is Ref
                isRead: false
            });
        } catch (error) {
            console.error('Failed to create payment notification:', error);
        }

        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

module.exports = router;
