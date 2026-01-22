'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, ShoppingBag, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';
import ProtectedRoute from '../../components/ProtectedRoute';
import toast from 'react-hot-toast';

const OrdersContent = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);

    useEffect(() => {
        if (user && !user.isAdmin) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/orders/myorders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const initiateCancel = (orderId) => {
        setOrderToCancel(orderId);
        setIsModalOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (!orderToCancel) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/orders/${orderToCancel}/cancel`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const updatedOrder = await res.json();
                setOrders(orders.map(order => order._id === updatedOrder._id ? updatedOrder : order));
                toast.success('Order cancelled successfully');
            } else {
                const err = await res.json();
                toast.error(err.message || 'Failed to cancel order');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error('Error cancelling order');
        } finally {
            setIsModalOpen(false);
            setOrderToCancel(null);
        }
    };

    const getStatusIcon = (order) => {
        if (order.isCancelled) return <XCircle className="w-5 h-5 text-red-500" />;
        if (order.isDelivered) return <CheckCircle className="w-5 h-5 text-green-500" />;
        if (order.isPaid) return <Truck className="w-5 h-5 text-blue-500" />;
        return <Clock className="w-5 h-5 text-yellow-500" />;
    };

    const getStatusText = (order) => {
        if (order.isCancelled) return 'Cancelled';
        if (order.isDelivered) return 'Delivered';
        if (order.isPaid) return 'Confirmed';
        return 'Pending Confirmation';
    };

    const aggregateOrderItems = (items) => {
        const grouped = items.reduce((acc, item) => {
            const key = item.product || item._id || item.name;
            if (!acc[key]) {
                acc[key] = { ...item, qty: Number(item.qty || 1) };
            } else {
                acc[key].qty += Number(item.qty || 1);
            }
            return acc;
        }, {});
        return Object.values(grouped);
    };

    if (!user) return null;

    // Redirect admins to admin orders page
    if (user.isAdmin) {
        return (
            <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-foreground mb-4">Admin Account</h1>
                    <p className="text-muted-foreground mb-6">Admins can manage all orders from the admin dashboard.</p>
                    <Link
                        href="/admin/orders"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                    >
                        Go to Admin Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                                    <ShoppingBag className="w-8 h-8 text-primary" />
                                    My Orders
                                </h1>
                                <p className="text-muted-foreground text-sm mt-1">
                                    Track and manage your order history
                                </p>
                            </div>
                        </div>
                        <div className="text-muted-foreground text-sm">
                            {orders.length} order{orders.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {/* Orders List */}
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-card rounded-2xl p-6 border border-border animate-pulse">
                                    <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
                                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-muted rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="bg-card rounded-2xl p-12 border border-border text-center">
                            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-foreground mb-2">No orders yet</h2>
                            <p className="text-muted-foreground mb-6">
                                You haven't placed any orders yet. Start shopping to see your orders here!
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                            >
                                Browse Products
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div
                                    key={order._id}
                                    className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all duration-300"
                                >
                                    {/* Order Header */}
                                    <div className="bg-muted/30 px-6 py-4 border-b border-border flex flex-wrap justify-between items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            {getStatusIcon(order)}
                                            <div>
                                                <p className="text-foreground font-medium">
                                                    Order #{order._id.substring(0, 8).toUpperCase()}
                                                </p>
                                                <p className="text-muted-foreground text-sm">
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${order.isCancelled
                                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                : order.isDelivered
                                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                    : order.isPaid
                                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                }`}>
                                                {getStatusText(order)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="p-6">
                                        <div className="space-y-3 mb-4">
                                            {aggregateOrderItems(order.orderItems).map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-12 h-12 object-cover rounded-lg border border-border"
                                                            />
                                                        )}
                                                        <div>
                                                            <p className="text-foreground font-medium">{item.name}</p>
                                                            <p className="text-muted-foreground text-sm">Qty: {item.qty}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-foreground font-medium">
                                                        {(item.price * item.qty).toFixed(2)} TND
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Order Footer */}
                                        <div className="border-t border-border pt-4 flex flex-wrap justify-between items-center gap-4">
                                            <div>
                                                <span className="text-muted-foreground text-sm">Total</span>
                                                <p className="text-foreground font-bold text-xl">
                                                    {order.totalPrice.toFixed(2)} TND
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {!order.isCancelled && !order.isDelivered && (
                                                    <button
                                                        onClick={() => initiateCancel(order._id)}
                                                        className="px-4 py-2 text-sm text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-colors"
                                                    >
                                                        Cancel Order
                                                    </button>
                                                )}
                                                <Link
                                                    href={`/order/${order._id}`}
                                                    className="px-4 py-2 text-sm bg-primary hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmCancel}
                title="Cancel Order?"
                message="Are you sure you want to cancel this order? This action cannot be undone."
            />
        </>
    );
};

export default function OrdersPage() {
    return (
        <ProtectedRoute>
            <OrdersContent />
        </ProtectedRoute>
    );
}
