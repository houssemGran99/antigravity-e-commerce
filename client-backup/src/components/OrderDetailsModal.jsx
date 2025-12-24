import React from 'react';
import { X, User, MapPin, Package, Phone, Mail, Calendar } from 'lucide-react';

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-dark-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            Order Details
                            <span className="text-primary font-mono text-sm">#{order._id}</span>
                        </h2>
                        <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {new Date(order.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">

                    {/* Customer Info */}
                    <div className="space-y-6">
                        <div className="bg-dark-900/30 p-4 rounded-xl border border-white/5">
                            <h3 className="text-primary font-bold mb-4 flex items-center gap-2">
                                <User className="w-4 h-4" /> Customer
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Name</p>
                                    <p className="text-gray-200">{order.user?.name || 'Guest User'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                                    <p className="text-gray-200 flex items-center gap-2">
                                        <Mail className="w-3 h-3" />
                                        {order.user?.email || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-dark-900/30 p-4 rounded-xl border border-white/5">
                            <h3 className="text-primary font-bold mb-4 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Shipping
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Address</p>
                                    <p className="text-gray-200">{order.shippingAddress.address}</p>
                                    <p className="text-gray-200">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                    <p className="text-gray-200">{order.shippingAddress.country}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Phone</p>
                                    <p className="text-gray-200 flex items-center gap-2">
                                        <Phone className="w-3 h-3" />
                                        {order.shippingAddress.phone}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h3 className="text-primary font-bold mb-4 flex items-center gap-2">
                            <Package className="w-4 h-4" /> Items ({order.orderItems.length})
                        </h3>
                        <div className="space-y-3">
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="flex gap-4 p-3 bg-dark-900/30 rounded-lg border border-white/5">
                                    <div className="w-12 h-12 bg-dark-800 rounded-md overflow-hidden flex-shrink-0">
                                        {/* Placeholder for image if not available in item, or use item.image if stored */}
                                        <div className="w-full h-full bg-gray-700 flex items-center justify-center text-xs text-gray-400">IMG</div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white line-clamp-2">{item.name}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-gray-400">{item.qty} x ${item.price}</p>
                                            <p className="text-sm font-bold text-white">${(item.qty * item.price).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400 text-sm">Subtotal</span>
                                <span className="text-white">${order.itemsPrice?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400 text-sm">Shipping</span>
                                <span className="text-white">${order.shippingPrice?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                                <span className="text-white font-bold">Total</span>
                                <span className="text-xl font-bold text-primary">${order.totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Status Bar */}
                <div className="p-4 bg-dark-900 border-t border-white/10 flex justify-end gap-4">
                    <div className={`px-4 py-2 rounded-lg text-sm font-bold border ${order.isPaid ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                        {order.isPaid ? 'PAID' : 'PENDING PAYMENT'}
                    </div>
                    <div className={`px-4 py-2 rounded-lg text-sm font-bold border ${order.isDelivered ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                        {order.isDelivered ? 'DELIVERED' : 'PROCESSING'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
