'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, ArrowLeft, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function AdminProductForm({ productId }) {
    const router = useRouter();
    const isEditing = !!productId;
    const fileInputRef = useRef(null);

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        price: '',
        description: '',
        imageUrl: '',
        category: '',
        specs: {
            resolution: '',
            video: '',
            sensor: ''
        },
        inStock: 0
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch categories and brands
                const [catRes, brandRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/brands')
                ]);

                const catData = await catRes.json();
                const brandData = await brandRes.json();

                setCategories(catData);
                setBrands(brandData);

                if (isEditing) {
                    await fetchProduct();
                }
            } catch (err) {
                console.error(err);
                setError(err.message);
            }
        };
        loadData();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            const response = await fetch(`/api/products/${productId}`);
            if (!response.ok) throw new Error('Product not found');
            const data = await response.json();

            // Handle populated fields
            if (data.category && typeof data.category === 'object') {
                data.category = data.category._id;
            }
            if (data.brand && typeof data.brand === 'object') {
                data.brand = data.brand._id;
            }

            // Ensure default values for specs if missing
            if (!data.specs) {
                data.specs = { resolution: '', video: '', sensor: '' };
            }

            setFormData(data);
            if (data.imageUrl) {
                setImagePreview(data.imageUrl);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle file upload to Vercel Blob
    const handleFileUpload = async (file) => {
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('Image size must be less than 10MB');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            console.log('=== FRONTEND: Starting upload ===');
            // Convert file to base64
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64String = reader.result.split(',')[1];
                    resolve(base64String);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            // Generate unique filename
            const timestamp = Date.now();
            const extension = file.name.split('.').pop();
            const filename = `products/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

            // Get token from localStorage
            const token = localStorage.getItem('token');
            console.log('Token exists:', !!token);
            console.log('Filename:', filename);
            console.log('Base64 length:', base64.length);

            // Upload to Vercel Blob via our API
            console.log('Sending request to /api/upload...');
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    filename,
                    contentType: file.type,
                    data: base64
                })
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.log('Error response:', errorData);
                throw new Error(errorData.message || 'Failed to upload image');
            }

            const { url } = await response.json();
            console.log('Upload successful! URL:', url);

            // Update form data with new image URL
            setFormData(prev => ({ ...prev, imageUrl: url }));
            setImagePreview(url);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    // Handle drag events
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, imageUrl: '' }));
        setImagePreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const url = isEditing ? `/api/products/${productId}` : '/api/products';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to save product');

            router.push('/admin');
            router.refresh();
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="pt-10 pb-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link
                    href="/admin"
                    className="flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </Link>

                <div className="bg-card rounded-2xl border border-border p-8">
                    <h1 className="text-3xl font-bold text-foreground mb-8">
                        {isEditing ? 'Edit Product' : 'Add New Product'}
                    </h1>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name & Brand */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-muted-foreground mb-2 text-sm font-medium">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="e.g. Lumix S5IIX"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-2 text-sm font-medium">Brand</label>
                                <select
                                    name="brand"
                                    value={formData.brand || ''}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all [&>option]:bg-neutral-900 [&>option]:text-white"
                                >
                                    <option value="">Select Brand</option>
                                    {brands.map(b => (
                                        <option key={b._id} value={b._id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Price & Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-muted-foreground mb-2 text-sm font-medium">Price (TND)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-2 text-sm font-medium">Category</label>
                                <select
                                    name="category"
                                    value={formData.category || ''}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all [&>option]:bg-neutral-900 [&>option]:text-white"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Stock */}
                        <div>
                            <label className="block text-muted-foreground mb-2 text-sm font-medium">Stock Quantity</label>
                            <input
                                type="number"
                                name="inStock"
                                value={formData.inStock}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                placeholder="0"
                            />
                        </div>

                        {/* Image Upload Section */}
                        <div>
                            <label className="block text-muted-foreground mb-2 text-sm font-medium">Product Image</label>

                            {/* Image Preview or Upload Zone */}
                            {imagePreview ? (
                                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-background">
                                    <img
                                        src={imagePreview}
                                        alt="Product preview"
                                        className="w-full h-full object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className={`relative w-full aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer
                                        ${dragActive
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:border-primary/50 bg-background hover:bg-muted/50'
                                        }
                                        ${uploading ? 'pointer-events-none opacity-60' : ''}
                                    `}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        onChange={handleFileInputChange}
                                        className="hidden"
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                        {uploading ? (
                                            <>
                                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                                <p className="text-muted-foreground text-sm">Uploading...</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-4 rounded-full bg-primary/10">
                                                    <Upload className="w-8 h-8 text-primary" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-foreground font-medium">
                                                        Drop your image here or <span className="text-primary">browse</span>
                                                    </p>
                                                    <p className="text-muted-foreground text-sm mt-1">
                                                        JPEG, PNG, WebP or GIF (max 10MB)
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Manual URL Input (fallback) */}
                            <div className="mt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex-1 h-px bg-border"></div>
                                    <span className="text-muted-foreground text-xs">OR enter URL manually</span>
                                    <div className="flex-1 h-px bg-border"></div>
                                </div>
                                <input
                                    type="url"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={(e) => {
                                        handleChange(e);
                                        setImagePreview(e.target.value);
                                    }}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-muted-foreground mb-2 text-sm font-medium">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="4"
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                                placeholder="Product description..."
                            />
                        </div>

                        {/* Specs */}
                        <div className="border-t border-border pt-6">
                            <h3 className="text-foreground font-bold mb-4">Technical Specifications</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-muted-foreground mb-2 text-sm font-medium">Resolution</label>
                                    <input
                                        type="text"
                                        name="specs.resolution"
                                        value={formData.specs?.resolution || ''}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        placeholder="e.g. 24.2MP"
                                    />
                                </div>
                                <div>
                                    <label className="block text-muted-foreground mb-2 text-sm font-medium">Video Specs</label>
                                    <input
                                        type="text"
                                        name="specs.video"
                                        value={formData.specs?.video || ''}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        placeholder="e.g. 4K 60p"
                                    />
                                </div>
                                <div>
                                    <label className="block text-muted-foreground mb-2 text-sm font-medium">Sensor Type</label>
                                    <input
                                        type="text"
                                        name="specs.sensor"
                                        value={formData.specs?.sensor || ''}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        placeholder="e.g. Full-Frame"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || uploading || !formData.imageUrl}
                            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl text-lg transition-all shadow-lg shadow-primary/20 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                'Saving...'
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    {isEditing ? 'Save Changes' : 'Create Product'}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
