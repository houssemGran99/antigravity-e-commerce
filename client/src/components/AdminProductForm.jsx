'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, ArrowLeft } from 'lucide-react';

export default function AdminProductForm({ productId }) {
    const router = useRouter();
    const isEditing = !!productId;

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
    const [error, setError] = useState(null);

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
                    className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </Link>

                <div className="bg-dark-800 rounded-2xl border border-white/5 p-8">
                    <h1 className="text-3xl font-bold text-white mb-8">
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
                                <label className="block text-gray-400 mb-2 text-sm font-medium">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="e.g. Lumix S5IIX"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 mb-2 text-sm font-medium">Brand</label>
                                <select
                                    name="brand"
                                    value={formData.brand || ''}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
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
                                <label className="block text-gray-400 mb-2 text-sm font-medium">Price (TND)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 mb-2 text-sm font-medium">Category</label>
                                <select
                                    name="category"
                                    value={formData.category || ''}
                                    onChange={handleChange}
                                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Stock & Image */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-400 mb-2 text-sm font-medium">Stock Quantity</label>
                                <input
                                    type="number"
                                    name="inStock"
                                    value={formData.inStock}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 mb-2 text-sm font-medium">Image URL</label>
                                <input
                                    type="url"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-medium">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="4"
                                className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                                placeholder="Product description..."
                            />
                        </div>

                        {/* Specs */}
                        <div className="border-t border-white/10 pt-6">
                            <h3 className="text-white font-bold mb-4">Technical Specifications</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-gray-400 mb-2 text-sm font-medium">Resolution</label>
                                    <input
                                        type="text"
                                        name="specs.resolution"
                                        value={formData.specs?.resolution || ''}
                                        onChange={handleChange}
                                        className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        placeholder="e.g. 24.2MP"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2 text-sm font-medium">Video Specs</label>
                                    <input
                                        type="text"
                                        name="specs.video"
                                        value={formData.specs?.video || ''}
                                        onChange={handleChange}
                                        className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        placeholder="e.g. 4K 60p"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2 text-sm font-medium">Sensor Type</label>
                                    <input
                                        type="text"
                                        name="specs.sensor"
                                        value={formData.specs?.sensor || ''}
                                        onChange={handleChange}
                                        className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        placeholder="e.g. Full-Frame"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
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
