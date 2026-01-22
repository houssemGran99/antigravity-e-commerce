const express = require('express');
const router = express.Router();
const { put, del } = require('@vercel/blob');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload an image to Vercel Blob storage
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *               contentType:
 *                 type: string
 *               data:
 *                 type: string
 *                 description: Base64 encoded image data
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *       500:
 *         description: Upload failed
 */
router.post('/', protect, admin, async (req, res) => {
    try {
        console.log('=== UPLOAD REQUEST RECEIVED ===');
        const { filename, contentType, data } = req.body;

        console.log('Filename:', filename);
        console.log('Content Type:', contentType);
        console.log('Data length:', data ? data.length : 'NO DATA');

        if (!filename || !data) {
            console.log('ERROR: Missing filename or data');
            return res.status(400).json({ message: 'Filename and data are required' });
        }

        // Convert base64 to buffer
        const buffer = Buffer.from(data, 'base64');
        console.log('Buffer size:', buffer.length, 'bytes');

        // Upload to Vercel Blob
        console.log('Uploading to Vercel Blob...');
        const blob = await put(filename, buffer, {
            access: 'public',
            contentType: contentType || 'image/jpeg',
            token: process.env.STORE_READ_WRITE_TOKEN,
        });

        console.log('Upload successful! URL:', blob.url);
        res.json({ url: blob.url });
    } catch (error) {
        console.error('=== UPLOAD ERROR ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ message: 'Failed to upload image', error: error.message });
    }
});

/**
 * @swagger
 * /api/upload:
 *   delete:
 *     summary: Delete an image from Vercel Blob storage
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       500:
 *         description: Delete failed
 */
router.delete('/', protect, admin, async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ message: 'URL is required' });
        }

        await del(url, {
            token: process.env.STORE_READ_WRITE_TOKEN,
        });

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Failed to delete image', error: error.message });
    }
});

module.exports = router;
