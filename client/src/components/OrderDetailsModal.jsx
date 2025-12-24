'use client';

import React from 'react';
import { X, Package, Calendar, User, MapPin, Mail, Phone, Truck, CheckCircle, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const OrderDetailsModal = ({ isOpen, onClose, order, onOrderUpdated }) => {
    const { user } = useAuth();
    if (!isOpen || !order) return null;

    const deliverOrder = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/orders/${order._id}/deliver`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) {
                const updatedOrder = await res.json();
                if (onOrderUpdated) onOrderUpdated(updatedOrder);
                onClose(); // Close modal to refresh or update local state if passed
            }
        } catch (error) {
            console.error('Error delivering order:', error);
        }
    };

    const payOrder = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/orders/${order._id}/pay`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'COMPLETED', update_time: Date.now() }) // Mock payment result
            });
            if (res.ok) {
                const updatedOrder = await res.json();
                if (onOrderUpdated) onOrderUpdated(updatedOrder);
                onClose();
            }
        } catch (error) {
            console.error('Error paying order:', error);
        }
    };
    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-zoom-in-95">
                <div className="sticky top-0 bg-dark-800/95 backdrop-blur-md p-6 border-b border-white/10 flex justify-between items-center z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Package className="w-6 h-6 text-primary" />
                        Order Details <span className="text-gray-500 font-mono text-base">#{order._id.substring(0, 8)}...</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Status & Date */}
                    <div className="flex flex-wrap gap-4 justify-between items-center bg-dark-900/50 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="w-5 h-5" />
                            {new Date(order.createdAt).toLocaleString()}
                        </div>
                        <div className="flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${order.isPaid ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                {order.isPaid ? 'Paid' : 'Pending Payment'}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${order.isDelivered ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                {order.isDelivered ? 'Delivered' : 'Processing'}
                            </span>
                            {order.isCancelled && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold border bg-red-500/10 text-red-400 border-red-500/20">
                                    Cancelled
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            Customer Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5">
                                <p className="text-sm text-gray-400 mb-1">Name</p>
                                <p className="text-white font-medium">{order.user?.name || 'Guest'}</p>
                            </div>
                            <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5">
                                <p className="text-sm text-gray-400 mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
                                <p className="text-white font-medium break-all">{order.user?.email || 'N/A'}</p>
                            </div>
                            <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5 md:col-span-2">
                                <p className="text-sm text-gray-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Shipping Address</p>
                                <p className="text-white font-medium">
                                    {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.country}
                                </p>
                                <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {order.shippingAddress?.phone}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Items Ordered</h3>
                        <div className="bg-dark-900/50 rounded-xl border border-white/5 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-gray-400">
                                    <tr>
                                        <th className="p-3">Product</th>
                                        <th className="p-3 text-center">Qty</th>
                                        <th className="p-3 text-right">Price</th>
                                        <th className="p-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {order.orderItems.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-dark-800" />
                                                    <span className="text-white font-medium">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-center text-gray-300">x{item.qty}</td>
                                            <td className="p-3 text-right text-gray-300">${item.price}</td>
                                            <td className="p-3 text-right text-white font-bold">${(item.price * item.qty).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="border-t border-white/10 pt-4">
                        <div className="flex justify-end">
                            <div className="w-full md:w-1/2 space-y-2">
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal</span>
                                    <span>${(order.itemsPrice || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Shipping</span>
                                    <span>{order.shippingPrice === 0 ? 'Free' : `$${(order.shippingPrice || 0).toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Tax</span>
                                    <span>${(order.taxPrice || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-white font-bold text-xl pt-2 border-t border-white/10">
                                    <span>Total</span>
                                    <span>${(order.totalPrice || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Admin Actions */}
                {user?.isAdmin && !order.isCancelled && (
                    <div className="p-6 bg-dark-900/30 border-t border-white/10 flex flex-wrap gap-4 justify-end">
                        {!order.isPaid && (
                            <button
                                onClick={payOrder}
                                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all"
                            >
                                <CreditCard className="w-5 h-5" />
                                Mark as Paid
                            </button>
                        )}
                        {!order.isDelivered && (
                            <button
                                onClick={deliverOrder}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
                            >
                                <Truck className="w-5 h-5" />
                                Mark as Delivered
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetailsModal;
