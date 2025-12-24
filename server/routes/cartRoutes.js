const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { protect } = require('../middleware/authMiddleware');

// Get User Cart
router.get('/', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product').populate({
            path: 'items.product',
            populate: { path: 'brand' } // Populate brand inside product
        });

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
            await cart.save();
        }

        res.json(cart);
    } catch (error) {
        console.error('Get Cart Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Sync Local Cart with DB
router.post('/sync', protect, async (req, res) => {
    try {
        const { items } = req.body; // Local items
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        // Merge logic: Add local items to DB if not already present or update quantity
        for (const localItem of items) {
            // Check if item has a valid ID (it should)
            const productId = localItem._id || localItem.product?._id || localItem.product;

            if (!productId) continue;

            const existingItemIndex = cart.items.findIndex(item =>
                item.product.toString() === productId.toString()
            );

            if (existingItemIndex > -1) {
                // Determine if we should override or add.
                // For simplicity in sync, we can assume "max" or just keep DB version if exists.
                // Or better: Local wins if it's a fresh login session?
                // Let's implement: Add local quantity to DB quantity, assuming they are new additions from guest session?
                // Actually common pattern: Local overrides DB or merges.
                // Safest: Use local quantity if provided? 

                // Let's try: Update DB item to match local ONLY if local is "newer" (hard to tell).
                // Let's go with: Add quantites if it exists? No, that might double count.
                // Let's assume the user wants the union of items.
                // If item exists, we keep the DB quantity (presumed saved state) unless we want to force local state.

                // Better approach for "Sync on Login":
                // If I added items as guest, I want them added to my saved cart.
                // So if DB has product A (qty 1) and Local has product B (qty 1). Result: A, B.
                // If DB has product A (qty 1) and Local has product A (qty 2). Result: A (qty 3)? Or MAX(1, 2)?
                // Let's just Add them up for now, it's safer than losing.

                // HOWEVER, localItem structure from frontend context is usually the full product object.
                // We need to handle that.

                // Simplified Sync: We accept { product: ID, quantity: Qty } from frontend.
                // BUT frontend CartContext right now just has an array of products, defaulting quantity to 1 implicitly in the simple version?
                // Looking at CartContext: `setCart([...cart, product]);` -> It's a list of products. Duplicates mean quantity > 1?
                // Or does it handle quantity?
                // Let's check CartContext again.
                // Ah, current CartContext is simple: `[product1, product2]`.
                // So we need to count occurrences for quantity.
            } else {
                cart.items.push({
                    product: productId,
                    quantity: localItem.quantity || 1
                });
            }
        }

        // Actually, let's just accept the merged list from frontend if possible?
        // No, backend should handle the merge to be secure.

        // REVISIT: The current CartContext (checked in previous turn) is:
        // const [cart, setCart] = useState([]);
        // addToCart = (product) => setCart([...cart, product]);
        // It treats cart as a flat list of items. If I add the same item twice, it appears twice in the array.
        // My backend model expects { product, quantity }.
        // I need to adapt the backend to handle this flat list or upgrade the frontend.
        // upgrading the frontend to use quantity is better, but might break things.
        // Let's stick to: Backend accepts flat list, converts to quantity map, merges with DB.

        // Wait, if I change backend to be smart, frontend can stay simple?
        // Or I should upgrade frontend context to be robust first?

        // Let's robustify the sync logic to handle the simplistic frontend array `[prod1, prod1, prod2]`.

        const localCounts = {};
        for (const item of items) {
            const id = item._id || item;
            localCounts[id] = (localCounts[id] || 0) + 1;
        }

        for (const [prodId, qty] of Object.entries(localCounts)) {
            const existingItemIndex = cart.items.findIndex(item => item.product.toString() === prodId);
            if (existingItemIndex > -1) {
                // Add the guest quantity to stored quantity
                cart.items[existingItemIndex].quantity += qty;
            } else {
                cart.items.push({ product: prodId, quantity: qty });
            }
        }

        await cart.save();

        // Return full cart populated
        const fullCart = await Cart.findById(cart._id).populate('items.product').populate({
            path: 'items.product',
            populate: { path: 'brand' } // Populate brand inside product
        });

        res.json(fullCart);

    } catch (error) {
        console.error('Sync Cart Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Add Item
router.post('/add', protect, async (req, res) => {
    try {
        const { productId } = req.body;
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += 1;
        } else {
            cart.items.push({ product: productId, quantity: 1 });
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Remove Item (Decrease quantity or remove)
router.post('/remove', protect, async (req, res) => {
    try {
        const { productId } = req.body;
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (existingItemIndex > -1) {
            if (cart.items[existingItemIndex].quantity > 1) {
                cart.items[existingItemIndex].quantity -= 1;
            } else {
                cart.items.splice(existingItemIndex, 1);
            }
            await cart.save();
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
