'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, ExternalLink, XCircle, CheckCircle, ShoppingBag, Package, Download } from 'lucide-react';
import OrderDetailsModal from '../../../components/OrderDetailsModal';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filterPaid, setFilterPaid] = useState('all');
    const [filterDelivered, setFilterDelivered] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/orders', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setOrders(data);
            } else {
                console.error('Failed to fetch orders:', data.message);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPaid = filterPaid === 'all' ? true : filterPaid === 'paid' ? order.isPaid : !order.isPaid;
        const matchesDelivered = filterDelivered === 'all' ? true : filterDelivered === 'delivered' ? order.isDelivered : !order.isDelivered;
        const matchesStatus = filterStatus === 'all' ? true : filterStatus === 'active' ? !order.isCancelled : order.isCancelled;

        return matchesSearch && matchesPaid && matchesDelivered && matchesStatus;
    });

    const handleExport = () => {
        const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'Date', 'Status', 'Payment', 'Delivery', 'Total'];
        const csvContent = [
            headers.join(','),
            ...filteredOrders.map(order => [
                order._id,
                `"${order.user?.name || 'Guest'}"`,
                order.user?.email || '',
                order.shippingAddress?.phone || '',
                new Date(order.createdAt).toLocaleDateString(),
                order.isCancelled ? 'Cancelled' : 'Active',
                order.isPaid ? 'Paid' : 'Pending',
                order.isDelivered ? 'Delivered' : 'Processing',
                order.totalPrice.toFixed(2)
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <Link href="/admin" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                        <ShoppingBag className="w-8 h-8 text-primary" />
                        Manage Orders
                    </h1>
                </div>

                <div className="bg-dark-800 rounded-2xl border border-white/10 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by Order ID or User..."
                                className="w-full bg-dark-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-gray-400 text-sm">
                                Total Orders: <span className="text-white font-bold">{filteredOrders.length}</span>
                            </div>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                            >
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="p-4 border-b border-white/10 flex flex-wrap gap-4 bg-dark-900/30">
                        <select
                            value={filterPaid}
                            onChange={(e) => setFilterPaid(e.target.value)}
                            className="bg-dark-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary cursor-pointer hover:bg-dark-700 transition-colors"
                        >
                            <option value="all">Payment: All</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                        </select>
                        <select
                            value={filterDelivered}
                            onChange={(e) => setFilterDelivered(e.target.value)}
                            className="bg-dark-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary cursor-pointer hover:bg-dark-700 transition-colors"
                        >
                            <option value="all">Delivery: All</option>
                            <option value="delivered">Delivered</option>
                            <option value="processing">Processing</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-dark-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary cursor-pointer hover:bg-dark-700 transition-colors"
                        >
                            <option value="all">Status: All</option>
                            <option value="active">Active</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse bg-dark-800">
                            <thead>
                                <tr className="bg-white/5 text-gray-400 text-sm uppercase">
                                    <th className="p-4 font-semibold">ID</th>
                                    <th className="p-4 font-semibold">User</th>
                                    <th className="p-4 font-semibold">Phone</th>
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold">Total</th>
                                    <th className="p-4 font-semibold">Paid</th>
                                    <th className="p-4 font-semibold">Delivered</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="p-8 text-center text-gray-500">Loading orders...</td>
                                    </tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="p-8 text-center text-gray-500">No orders found matching your search.</td>
                                    </tr>
                                ) : (
                                    filteredOrders.map(order => (
                                        <tr key={order._id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-mono text-sm text-primary">{order._id.substring(0, 10)}...</td>
                                            <td className="p-4 text-white font-medium">{order.user?.name || 'Unknown User'}</td>
                                            <td className="p-4 text-gray-400">{order.shippingAddress?.phone || 'N/A'}</td>
                                            <td className="p-4 text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="p-4 text-white font-bold">{order.totalPrice.toFixed(2)} TND</td>
                                            <td className="p-4">
                                                {order.isPaid ? (
                                                    <span className="text-green-500 flex items-center gap-1 font-medium text-sm">
                                                        <CheckCircle className="w-4 h-4" /> Paid
                                                    </span>
                                                ) : (
                                                    <span className="text-yellow-500 flex items-center gap-1 font-medium text-sm">
                                                        <XCircle className="w-4 h-4" /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {order.isDelivered ? (
                                                    <span className="text-green-500 flex items-center gap-1 font-medium text-sm">
                                                        <CheckCircle className="w-4 h-4" /> Delivered
                                                    </span>
                                                ) : (
                                                    <span className="text-blue-500 flex items-center gap-1 font-medium text-sm">
                                                        <Package className="w-4 h-4" /> Processing
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {order.isCancelled ? (
                                                    <span className="px-2 py-1 rounded bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20">
                                                        CANCELLED
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20">
                                                        ACTIVE
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                                    title="View Details"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <OrderDetailsModal
                    isOpen={!!selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    order={selectedOrder}
                    onOrderUpdated={() => {
                        fetchOrders();
                        setSelectedOrder(null);
                    }}
                />
            </div>
        </div>
    );
};

export default AdminOrders;
