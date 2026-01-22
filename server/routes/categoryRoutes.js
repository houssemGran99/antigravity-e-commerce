const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// GET all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({}).populate('parent', 'name');
        res.json(categories);
    } catch (error) {
        console.error('Categories fetch error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// POST new category
router.post('/', async (req, res) => {
    try {
        const { name, parent } = req.body;
        const category = new Category({ name, parent: parent || null });
        const savedCategory = await category.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        res.status(400).json({ message: 'Error creating category', error: error.message });
    }
});

// PUT update category
router.put('/:id', async (req, res) => {
    try {
        const { name, parent } = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, parent: parent || null },
            { new: true }
        );
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(400).json({ message: 'Error updating category' });
    }
});

// DELETE category
router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
