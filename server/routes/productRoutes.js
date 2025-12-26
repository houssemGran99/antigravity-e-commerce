const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The camera name
 *         brand:
 *           type: string
 *           description: The brand name
 *         price:
 *           type: number
 *           description: The price of the camera
 *         description:
 *           type: string
 *           description: Detailed description
 *         imageUrl:
 *           type: string
 *           description: URL of the product image
 *         inStock:
 *           type: number
 *           description: Quantity in stock
 *       example:
 *         name: Lumix S5IIX
 *         brand: Panasonic
 *         price: 2199
 *         description: A hybrid powerhouse
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Returns the list of all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: The list of the products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
// GET all products with filtering
router.get('/', async (req, res) => {
    try {
        const { category, brand, search } = req.query;
        let query = {};

        if (category) query.category = category;
        if (brand) query.brand = brand;

        // Price Filter
        const minPrice = req.query.minPrice;
        const maxPrice = req.query.maxPrice;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Resolution Filter
        const resolution = req.query.resolution;
        if (resolution) {
            query['specs.resolution'] = { $regex: resolution, $options: 'i' };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const pageSize = Number(req.query.limit) || 12; // Default 12 products per page
        const page = Number(req.query.pageNumber) || 1;

        const count = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate('category', 'name')
            .populate('brand', 'name')
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     responses:
 *       200:
 *         description: The product description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: The product was not found
 */
// GET product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST new product
router.post('/', async (req, res) => {
    try {
        const product = new Product(req.body);
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error creating product' });
    }
});

// PUT update product
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: 'Error updating product' });
    }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            // Allow multiple reviews
            // const alreadyReviewed = product.reviews.find(
            //     (r) => r.user.toString() === req.user._id.toString()
            // );

            // if (alreadyReviewed) {
            //     return res.status(400).json({ message: 'Product already reviewed' });
            // }

            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment: comment || '', // Default to empty string if no comment
                user: req.user._id,
            };

            product.reviews.push(review);

            product.numReviews = product.reviews.length;

            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;

            await product.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get related products
// @route   GET /api/products/:id/related
router.get('/:id/related', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // 1. Find products in the same category
        let related = await Product.find({
            category: product.category,
            _id: { $ne: product._id }
        }).limit(4);

        // 2. If less than 4, fill with similar price range (+/- 30%)
        if (related.length < 4) {
            const limit = 4 - related.length;
            const minPrice = product.price * 0.7;
            const maxPrice = product.price * 1.3;

            const excludeIds = [product._id, ...related.map(p => p._id)];

            const priceRelated = await Product.find({
                price: { $gte: minPrice, $lte: maxPrice },
                _id: { $nin: excludeIds }
            }).limit(limit);

            related = [...related, ...priceRelated];
        }

        res.json(related);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
