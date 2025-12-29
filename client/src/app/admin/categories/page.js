'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Edit, Layers } from 'lucide-react';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', parent: '' });
    const [isEditing, setIsEditing] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            setCategories(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This cannot be undone.')) {
            try {
                await fetch(`/api/categories/${id}`, { method: 'DELETE' });
                setCategories(categories.filter(c => c._id !== id));
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const url = isEditing ? `/api/categories/${isEditing}` : '/api/categories';
            const method = isEditing ? 'PUT' : 'POST';

            const payload = {
                name: formData.name,
                parent: formData.parent || null
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

            const savedCategory = await response.json();

            if (isEditing) {
                setCategories(categories.map(c => c._id === isEditing ? savedCategory : c));
                setIsEditing(null);
            } else {
                setCategories([...categories, savedCategory]);
            }

            setFormData({ name: '', parent: '' });
            fetchCategories(); // Refresh to ensure parent relationships are populated if needed
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (category) => {
        setIsEditing(category._id);
        setFormData({
            name: category.name,
            parent: category.parent ? category.parent._id : ''
        });
    };

    const handleCancel = () => {
        setIsEditing(null);
        setFormData({ name: '', parent: '' });
        setError(null);
    };

    if (loading) return <div className="text-foreground text-center pt-20">Loading...</div>;

    return (
        <div className="pt-10 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href="/admin" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
                    <Layers className="w-8 h-8 text-primary" />
                    Manage Categories
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="md:col-span-1">
                        <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-foreground mb-4">
                                {isEditing ? 'Edit Category' : 'Add New Category'}
                            </h2>

                            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-muted-foreground text-sm mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-muted-foreground text-sm mb-1">Parent Category</label>
                                    <select
                                        value={formData.parent}
                                        onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                                    >
                                        <option value="">None (Top Level)</option>
                                        {categories
                                            .filter(c => c._id !== isEditing) // Prevent self-parenting loop
                                            .map(c => (
                                                <option key={c._id} value={c._id}>{c.name}</option>
                                            ))
                                        }
                                    </select>
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
                                            className="px-4 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
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
                        <div className="bg-card rounded-2xl border border-border overflow-hidden">
                            <table className="w-full text-left text-muted-foreground">
                                <thead className="bg-muted/50 text-foreground uppercase text-xs font-bold">
                                    <tr>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Parent</th>
                                        <th className="p-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {categories.map((category) => (
                                        <tr key={category._id} className="hover:bg-muted/50 transition-colors">
                                            <td className="p-4 font-medium text-foreground">{category.name}</td>
                                            <td className="p-4 text-sm">{category.parent?.name || '-'}</td>
                                            <td className="p-4 flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors"
                                                    aria-label={`Edit ${category.name}`}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category._id)}
                                                    className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                                    aria-label={`Delete ${category.name}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {categories.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="p-8 text-center text-muted-foreground">
                                                No categories yet. Add one!
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
