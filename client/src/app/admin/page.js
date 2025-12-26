'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, Tag, Users, ShoppingBag, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    const categories = [...new Set((products || []).map(p => p.category?.name || 'Uncategorized'))].sort();

    const filteredProducts = (products || []).filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory ? (product.category?.name || 'Uncategorized') === filterCategory : true;
        return matchesSearch && matchesCategory;
    });

    // 1. Calculate Daily Revenue (Last 7 Days)
    const revenueData = React.useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }).reverse();

        const dataMap = {};
        last7Days.forEach(date => dataMap[date] = 0);

        orders.forEach(order => {
            if (order.isPaid || order.isDelivered) {
                const date = new Date(order.createdAt || order.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (dataMap[date] !== undefined) {
                    dataMap[date] += (order.totalPrice || 0);
                }
            }
        });

        return Object.keys(dataMap).map(date => ({
            date,
            revenue: dataMap[date]
        }));
    }, [orders]);

    // 2. Calculate Top 5 Selling Products
    const topProductsData = React.useMemo(() => {
        const productStats = {};

        orders.forEach(order => {
            if (order.isPaid || order.isDelivered) {
                order.orderItems.forEach(item => {
                    if (productStats[item.name]) {
                        productStats[item.name] += item.qty;
                    } else {
                        productStats[item.name] = item.qty;
                    }
                });
            }
        });

        return Object.entries(productStats)
            .map(([name, sales]) => ({ name, sales }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);
    }, [orders]);

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

            if (productsData.products && Array.isArray(productsData.products)) {
                setProducts(productsData.products);
            } else if (Array.isArray(productsData)) {
                setProducts(productsData);
            } else {
                console.error('Products API returned invalid data:', productsData);
                setProducts([]);
            }

            if (ordersData.orders && Array.isArray(ordersData.orders)) {
                setOrders(ordersData.orders);
            } else if (Array.isArray(ordersData)) {
                setOrders(ordersData);
            } else {
                console.error('Orders API returned invalid data:', ordersData);
                setOrders([]);
            }

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
                            <Tag className="w-5 h-5" />
                            Manage Brands
                        </Link>
                        <Link href="/admin/users" className="bg-dark-800 hover:bg-dark-700 border border-white/10 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all">
                            <Users className="w-5 h-5" />
                            Manage Users
                        </Link>
                        <Link href="/admin/orders" className="bg-dark-800 hover:bg-dark-700 border border-white/10 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all">
                            <ShoppingBag className="w-5 h-5" />
                            Manage Orders
                        </Link>
                        <Link href="/admin/categories" className="bg-dark-800 hover:bg-dark-700 border border-white/10 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all">
                            <Layers className="w-5 h-5" />
                            Manage Categories
                        </Link>
                        <Link href="/admin/new" className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
                            <Plus className="w-5 h-5" />
                            Add New Product
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Revenue Trends Chart */}
                    <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                        <h2 className="text-xl font-bold text-white mb-6">Revenue Trends (Last 7 Days)</h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" strokeOpacity={0.3} vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#888"
                                        tick={{ fill: '#aaa', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888"
                                        tick={{ fill: '#aaa', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value} TND`}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#10b981', strokeWidth: 2 }}
                                        contentStyle={{
                                            backgroundColor: '#1a1a1a',
                                            border: '1px solid #333',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                                        }}
                                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                        formatter={(value) => [`${value.toFixed(2)} TND`, 'Revenue']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Selling Products */}
                    <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                        <h2 className="text-xl font-bold text-white mb-6">Top Selling Products</h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={topProductsData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" strokeOpacity={0.3} horizontal={true} vertical={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={120}
                                        stroke="#888"
                                        tick={{ fill: '#aaa', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                        contentStyle={{
                                            backgroundColor: '#1a1a1a',
                                            border: '1px solid #333',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                                        }}
                                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                        formatter={(value) => [`${value} Sold`, 'Sales']}
                                    />
                                    <Bar dataKey="sales" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    {/* Products by Quantity Chart */}
                    <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                        <h2 className="text-xl font-bold text-white mb-6">Inventory Status</h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[...products].sort((a, b) => (b.inStock || 0) - (a.inStock || 0)).slice(0, 10)}>
                                    <defs>
                                        <linearGradient id="colorInStock" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" strokeOpacity={0.3} vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888"
                                        tick={{ fill: '#aaa', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => value.length > 8 ? `${value.substring(0, 8)}...` : value}
                                        interval={0}
                                    />
                                    <YAxis
                                        stroke="#888"
                                        tick={{ fill: '#aaa', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                        contentStyle={{
                                            backgroundColor: '#1a1a1a',
                                            border: '1px solid #333',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                                        }}
                                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                        formatter={(value) => [`${value} Units`, 'In Stock']}
                                        labelStyle={{ color: '#aaa', marginBottom: '5px' }}
                                    />
                                    <Bar
                                        dataKey="inStock"
                                        name="Stock Quantity"
                                        fill="url(#colorInStock)"
                                        radius={[6, 6, 0, 0]}
                                        barSize={40}
                                    />
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
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                            const RADIAN = Math.PI / 180;
                                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                            return percent > 0.1 ? (
                                                <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
                                                    {`${(percent * 100).toFixed(0)}%`}
                                                </text>
                                            ) : null;
                                        }}
                                        labelLine={false}
                                    >
                                        {[
                                            { name: 'Paid', color: '#10b981' }, // Green
                                            { name: 'Delivered', color: '#3b82f6' }, // Blue
                                            { name: 'Cancelled', color: '#ef4444' }, // Red
                                            { name: 'Pending', color: '#eab308' } // Yellow
                                        ].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" strokeWidth={1} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1a1a1a',
                                            border: '1px solid #333',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                                        }}
                                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                        formatter={(value) => [`${value} Orders`, 'Count']}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-gray-400 font-medium ml-1">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-dark-800 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors flex-1"
                    />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-dark-800 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors md:w-64"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
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
                                {filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-6 flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-dark-900 border border-white/5">
                                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-bold text-white text-lg">{product.name}</span>
                                        </td>
                                        <td className="p-6">{product.brand?.name || product.brand}</td>
                                        <td className="p-6 font-mono text-white">{product.price} TND</td>
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
