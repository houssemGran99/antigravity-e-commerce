'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [productsRes, ordersRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const productsData = await productsRes.json();
            const ordersData = await ordersRes.json();

            setProducts(productsData);
            setOrders(ordersData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await fetch(`/api/products/${id}`, {
                    method: 'DELETE',
                });
                setProducts(products.filter(product => product._id !== id));
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center text-white">
                <div className="text-2xl">Loading Dashboard...</div>
            </div>
        );
    }

    return (
        <div className="pt-10 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
                    <div className="flex gap-4">
                        <Link href="/admin/brands" className="bg-dark-800 hover:bg-dark-700 border border-white/10 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all">
                            Manage Brands
                        </Link>
                        <Link href="/admin/users" className="bg-dark-800 hover:bg-dark-700 border border-white/10 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all">
                            Manage Users
                        </Link>
                        <Link href="/admin/orders" className="bg-dark-800 hover:bg-dark-700 border border-white/10 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all">
                            Manage Orders
                        </Link>
                        <Link href="/admin/categories" className="bg-dark-800 hover:bg-dark-700 border border-white/10 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all">
                            Manage Categories
                        </Link>
                        <Link href="/admin/new" className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
                            <Plus className="w-5 h-5" />
                            Add New Product
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Products by Quantity Chart */}
                    <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                        <h2 className="text-xl font-bold text-white mb-6">Inventory Status</h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[...products].sort((a, b) => (b.inStock || 0) - (a.inStock || 0)).slice(0, 10)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888' }} tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value} />
                                    <YAxis stroke="#888" tick={{ fill: '#888' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="inStock" name="Stock Quantity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Order Status Chart */}
                    <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                        <h2 className="text-xl font-bold text-white mb-6">Order Statistics</h2>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Paid', value: orders.filter(o => o.isPaid && !o.isDelivered && !o.isCancelled).length },
                                            { name: 'Delivered', value: orders.filter(o => o.isDelivered).length },
                                            { name: 'Cancelled', value: orders.filter(o => o.isCancelled).length },
                                            { name: 'Pending', value: orders.filter(o => !o.isPaid && !o.isCancelled).length }
                                        ].filter(item => item.value > 0)}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {[
                                            { name: 'Paid', color: '#10b981' }, // Green
                                            { name: 'Delivered', color: '#3b82f6' }, // Blue
                                            { name: 'Cancelled', color: '#ef4444' }, // Red
                                            { name: 'Pending', color: '#eab308' } // Yellow
                                        ].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-800 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-400">
                            <thead className="bg-dark-900/50 text-white uppercase text-sm font-bold">
                                <tr>
                                    <th className="p-6">Product</th>
                                    <th className="p-6">Brand</th>
                                    <th className="p-6">Price</th>
                                    <th className="p-6 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-6 flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-dark-900 border border-white/5">
                                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-bold text-white text-lg">{product.name}</span>
                                        </td>
                                        <td className="p-6">{product.brand?.name || product.brand}</td>
                                        <td className="p-6 font-mono text-white">${product.price}</td>
                                        <td className="p-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/product/${product._id}`} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="View">
                                                    <Eye className="w-5 h-5" />
                                                </Link>
                                                <Link href={`/admin/edit/${product._id}`} className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-400 hover:text-blue-300 transition-colors" title="Edit">
                                                    <Edit className="w-5 h-5" />
                                                </Link>
                                                <button onClick={() => handleDelete(product._id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 hover:text-red-300 transition-colors" title="Delete">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
