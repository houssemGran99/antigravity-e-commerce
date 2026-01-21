'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, ExternalLink, XCircle, CheckCircle, ShoppingBag, Package, Download } from 'lucide-react';
import OrderDetailsModal from '../../../components/OrderDetailsModal';
import toast from 'react-hot-toast';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [filterPaid, setFilterPaid] = useState('all');
    const [filterDelivered, setFilterDelivered] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, [page, filterPaid, filterDelivered, filterStatus]); // Fetch on change

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (page !== 1) setPage(1); // Reset to page 1 on search change
            else fetchOrders();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Build Query params
            const params = new URLSearchParams();
            params.append('pageNumber', page);
            if (searchTerm) params.append('keyword', searchTerm);
            if (filterPaid !== 'all') params.append('payment', filterPaid);
            if (filterDelivered !== 'all') params.append('delivery', filterDelivered);
            if (filterStatus !== 'all') params.append('status', filterStatus);

            const res = await fetch(`/api/orders?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setOrders(data.orders);
                setPages(data.pages);
                setTotal(data.total);
            } else {
                console.error('Failed to fetch orders:', data.message);
                toast.error('Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'Date', 'Status', 'Payment', 'Delivery', 'Total'];
        const csvContent = [
            headers.join(','),
            ...orders.map(order => [
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
        toast.success('Orders exported successfully');
    };

    return (
        <div className="pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <Link href="/admin" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-foreground">
                        <ShoppingBag className="w-8 h-8 text-primary" />
                        Manage Orders
                    </h1>
                </div>

                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by Order ID or User..."
                                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-foreground focus:outline-none focus:border-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-muted-foreground text-sm">
                                Total Orders: <span className="text-foreground font-bold">{total}</span>
                            </div>
                            <button
                                onClick={handleExport}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-green-600/20 whitespace-nowrap"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="p-4 border-b border-border flex flex-wrap gap-4 bg-muted/30">
                        <select
                            value={filterPaid}
                            onChange={(e) => setFilterPaid(e.target.value)}
                            className="bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer hover:bg-muted/50 transition-colors [&>option]:bg-neutral-900 [&>option]:text-white"
                        >
                            <option value="all">Payment: All</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                        </select>
                        <select
                            value={filterDelivered}
                            onChange={(e) => setFilterDelivered(e.target.value)}
                            className="bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer hover:bg-muted/50 transition-colors [&>option]:bg-neutral-900 [&>option]:text-white"
                        >
                            <option value="all">Delivery: All</option>
                            <option value="delivered">Delivered</option>
                            <option value="processing">Processing</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer hover:bg-muted/50 transition-colors [&>option]:bg-neutral-900 [&>option]:text-white"
                        >
                            <option value="all">Status: All</option>
                            <option value="active">Active</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse bg-card">
                            <thead>
                                <tr className="bg-muted/50 text-muted-foreground text-sm uppercase">
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
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="p-8 text-center text-muted-foreground">Loading orders...</td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="p-8 text-center text-muted-foreground">No orders found matching your search.</td>
                                    </tr>
                                ) : (
                                    orders.map(order => (
                                        <tr key={order._id} className="hover:bg-muted/50 transition-colors">
                                            <td className="p-4 font-mono text-sm text-primary">{order._id.substring(0, 10)}...</td>
                                            <td className="p-4 text-foreground font-medium">{order.user?.name || 'Unknown User'}</td>
                                            <td className="p-4 text-muted-foreground">{order.shippingAddress?.phone || 'N/A'}</td>
                                            <td className="p-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="p-4 text-foreground font-bold">{order.totalPrice.toFixed(2)} TND</td>
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
                                                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-lg transition-colors cursor-pointer"
                                                    title="View Details"
                                                    aria-label={`View details for order ${order._id}`}
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

                    {/* Pagination */}
                    {pages > 1 && (
                        <div className="p-4 border-t border-border flex justify-center items-center gap-2">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="px-3 py-1 bg-background border border-border rounded-lg text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/50"
                            >
                                Previous
                            </button>
                            <span className="text-muted-foreground text-sm">
                                Page <span className="text-foreground font-bold">{page}</span> of {pages}
                            </span>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page === pages}
                                className="px-3 py-1 bg-background border border-border rounded-lg text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/50"
                            >
                                Next
                            </button>
                        </div>
                    )}
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
