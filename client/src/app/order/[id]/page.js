'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, MapPin, Phone, CreditCard, Copy, Check } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import ConfirmModal from '../../../components/ConfirmModal';
import toast from 'react-hot-toast';

const OrderDetailContent = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (id) {
            fetchOrder();
        }
    }, [id]);

    const fetchOrder = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            } else {
                const err = await res.json();
                setError(err.message || 'Order not found');
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            setError('Failed to fetch order');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/orders/${id}/cancel`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const updatedOrder = await res.json();
                setOrder(updatedOrder);
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
        }
    };

    const copyOrderId = () => {
        navigator.clipboard.writeText(order._id);
        setCopied(true);
        toast.success('Order ID copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const getStatusIcon = () => {
        if (order.isCancelled) return <XCircle className="w-6 h-6 text-red-500" />;
        if (order.isDelivered) return <CheckCircle className="w-6 h-6 text-green-500" />;
        if (order.isPaid) return <Truck className="w-6 h-6 text-blue-500" />;
        return <Clock className="w-6 h-6 text-yellow-500" />;
    };

    const getStatusText = () => {
        if (order.isCancelled) return 'Cancelled';
        if (order.isDelivered) return 'Delivered';
        if (order.isPaid) return 'Confirmed';
        return 'Pending Confirmation';
    };

    const getStatusColor = () => {
        if (order.isCancelled) return 'bg-red-500/10 text-red-400 border-red-500/20';
        if (order.isDelivered) return 'bg-green-500/10 text-green-400 border-green-500/20';
        if (order.isPaid) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-muted rounded w-1/4"></div>
                        <div className="bg-card rounded-2xl p-8 border border-border">
                            <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-muted rounded w-2/3"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-foreground mb-2">Order Not Found</h1>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <Link
                        href="/orders"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Orders
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
                    <div className="flex items-center gap-4 mb-8">
                        <Link
                            href="/orders"
                            className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                        </Link>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-foreground">
                                    Order Details
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor()}`}>
                                    {getStatusText()}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-muted-foreground text-sm font-mono">
                                    #{order._id}
                                </p>
                                <button
                                    onClick={copyOrderId}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Status Timeline */}
                            <div className="bg-card rounded-2xl border border-border p-6">
                                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                    {getStatusIcon()}
                                    Order Status
                                </h2>
                                <div className="flex items-center justify-between">
                                    <div className={`flex flex-col items-center ${order.isCancelled ? 'opacity-50' : ''}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.isCancelled ? 'bg-muted' : 'bg-green-500/20'}`}>
                                            <CheckCircle className={`w-5 h-5 ${order.isCancelled ? 'text-muted-foreground' : 'text-green-500'}`} />
                                        </div>
                                        <span className="text-xs text-muted-foreground mt-2">Placed</span>
                                    </div>
                                    <div className={`flex-1 h-1 mx-2 ${order.isPaid && !order.isCancelled ? 'bg-green-500' : 'bg-muted'}`}></div>
                                    <div className={`flex flex-col items-center ${!order.isPaid || order.isCancelled ? 'opacity-50' : ''}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.isPaid && !order.isCancelled ? 'bg-green-500/20' : 'bg-muted'}`}>
                                            <CreditCard className={`w-5 h-5 ${order.isPaid && !order.isCancelled ? 'text-green-500' : 'text-muted-foreground'}`} />
                                        </div>
                                        <span className="text-xs text-muted-foreground mt-2">Confirmed</span>
                                    </div>
                                    <div className={`flex-1 h-1 mx-2 ${order.isDelivered && !order.isCancelled ? 'bg-green-500' : 'bg-muted'}`}></div>
                                    <div className={`flex flex-col items-center ${!order.isDelivered || order.isCancelled ? 'opacity-50' : ''}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.isDelivered && !order.isCancelled ? 'bg-green-500/20' : 'bg-muted'}`}>
                                            <Truck className={`w-5 h-5 ${order.isDelivered && !order.isCancelled ? 'text-green-500' : 'text-muted-foreground'}`} />
                                        </div>
                                        <span className="text-xs text-muted-foreground mt-2">Delivered</span>
                                    </div>
                                </div>
                                {order.isCancelled && (
                                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                        <p className="text-red-400 text-sm">This order has been cancelled.</p>
                                    </div>
                                )}
                            </div>

                            {/* Order Items */}
                            <div className="bg-card rounded-2xl border border-border p-6">
                                <h2 className="text-lg font-bold text-foreground mb-4">Order Items</h2>
                                <div className="space-y-4">
                                    {order.orderItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl">
                                            {item.image && (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-16 h-16 object-cover rounded-lg border border-border"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <p className="text-foreground font-medium">{item.name}</p>
                                                <p className="text-muted-foreground text-sm">Qty: {item.qty}</p>
                                            </div>
                                            <span className="text-foreground font-bold">
                                                {(item.price * item.qty).toFixed(2)} TND
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <div className="bg-card rounded-2xl border border-border p-6">
                                <h2 className="text-lg font-bold text-foreground mb-4">Order Summary</h2>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="text-foreground">{order.itemsPrice?.toFixed(2) || order.totalPrice.toFixed(2)} TND</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="text-foreground">{order.shippingPrice?.toFixed(2) || '0.00'} TND</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tax</span>
                                        <span className="text-foreground">{order.taxPrice?.toFixed(2) || '0.00'} TND</span>
                                    </div>
                                    <div className="border-t border-border pt-3 flex justify-between">
                                        <span className="text-foreground font-bold">Total</span>
                                        <span className="text-foreground font-bold text-lg">{order.totalPrice.toFixed(2)} TND</span>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-card rounded-2xl border border-border p-6">
                                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    Shipping Address
                                </h2>
                                {order.shippingAddress ? (
                                    <div className="text-sm space-y-1">
                                        <p className="text-foreground">{order.shippingAddress.street}</p>
                                        <p className="text-muted-foreground">
                                            {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                                        </p>
                                        <p className="text-muted-foreground">{order.shippingAddress.country}</p>
                                        {order.shippingAddress.phone && (
                                            <p className="text-muted-foreground flex items-center gap-1 mt-2">
                                                <Phone className="w-4 h-4" />
                                                {order.shippingAddress.phone}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm">No shipping address provided</p>
                                )}
                            </div>

                            {/* Order Date */}
                            <div className="bg-card rounded-2xl border border-border p-6">
                                <h2 className="text-lg font-bold text-foreground mb-4">Order Date</h2>
                                <p className="text-foreground">
                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>

                            {/* Actions */}
                            {!order.isCancelled && !order.isDelivered && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-xl transition-colors"
                                >
                                    Cancel Order
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleCancelOrder}
                title="Cancel Order?"
                message="Are you sure you want to cancel this order? This action cannot be undone."
            />
        </>
    );
};

export default function OrderDetailPage() {
    return (
        <ProtectedRoute>
            <OrderDetailContent />
        </ProtectedRoute>
    );
}
