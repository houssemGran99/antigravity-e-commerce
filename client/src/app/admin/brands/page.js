'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Edit, Tag } from 'lucide-react';

export default function AdminBrands() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', logoUrl: '' });
    const [isEditing, setIsEditing] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const response = await fetch('/api/brands');
            const data = await response.json();
            setBrands(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching brands:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This cannot be undone.')) {
            try {
                await fetch(`/api/brands/${id}`, { method: 'DELETE' });
                setBrands(brands.filter(b => b._id !== id));
            } catch (error) {
                console.error('Error deleting brand:', error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const url = isEditing ? `/api/brands/${isEditing}` : '/api/brands';
            const method = isEditing ? 'PUT' : 'POST';

            const payload = {
                name: formData.name,
                logoUrl: formData.logoUrl || null
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to save');
            }

            const savedBrand = await response.json();

            if (isEditing) {
                setBrands(brands.map(b => b._id === isEditing ? savedBrand : b));
                setIsEditing(null);
            } else {
                setBrands([...brands, savedBrand]);
            }

            setFormData({ name: '', logoUrl: '' });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (brand) => {
        setIsEditing(brand._id);
        setFormData({
            name: brand.name,
            logoUrl: brand.logoUrl || ''
        });
    };

    const handleCancel = () => {
        setIsEditing(null);
        setFormData({ name: '', logoUrl: '' });
        setError(null);
    };

    if (loading) return <div className="text-white text-center pt-20">Loading...</div>;

    return (
        <div className="pt-10 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href="/admin" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                    <Tag className="w-8 h-8 text-primary" />
                    Manage Brands
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="md:col-span-1">
                        <div className="bg-dark-800 rounded-2xl border border-white/5 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-white mb-4">
                                {isEditing ? 'Edit Brand' : 'Add New Brand'}
                            </h2>

                            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Logo URL (Optional)</label>
                                    <input
                                        type="url"
                                        value={formData.logoUrl}
                                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                        className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-primary hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition-colors flex justify-center items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {isEditing ? 'Update' : 'Add'}
                                    </button>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="md:col-span-2">
                        <div className="bg-dark-800 rounded-2xl border border-white/5 overflow-hidden">
                            <table className="w-full text-left text-gray-400">
                                <thead className="bg-dark-900/50 text-white uppercase text-xs font-bold">
                                    <tr>
                                        <th className="p-4">Brand</th>
                                        <th className="p-4">Logo</th>
                                        <th className="p-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {brands.map((brand) => (
                                        <tr key={brand._id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-medium text-white">{brand.name}</td>
                                            <td className="p-4">
                                                {brand.logoUrl ? (
                                                    <img src={brand.logoUrl} alt={brand.name} className="w-8 h-8 object-contain bg-white rounded p-1" />
                                                ) : '-'}
                                            </td>
                                            <td className="p-4 flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(brand)}
                                                    className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(brand._id)}
                                                    className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {brands.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="p-8 text-center text-gray-500">
                                                No brands yet. Add one!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
