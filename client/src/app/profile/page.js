'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, LogOut, Phone, Save, Edit2, X } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import ProtectedRoute from '../../components/ProtectedRoute';

const ProfileContent = () => {
    const { user, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [activeTab, setActiveTab] = useState('profile');

    const [address, setAddress] = useState({ street: '', city: '', postalCode: '', country: '' });

    useEffect(() => {
        if (user) {
            setPhoneNumber(user.phone || '');
            setAddress(user.address || { street: '', city: '', postalCode: '', country: '' });
            if (!user.isAdmin) {
                fetchOrders();
            } else {
                setLoading(false);
            }
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
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to cancel order');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            alert('Error cancelling order');
        } finally {
            setIsModalOpen(false);
            setOrderToCancel(null);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ phone: phoneNumber, address })
            });

            if (res.ok) {
                const updatedUser = await res.json();

                // Update local storage so AuthContext picks up the changes on reload
                // Ideally AuthContext should expose a method to update user, but this works with reload
                const currentUserRel = JSON.parse(localStorage.getItem('user'));
                // Merge to ensure we don't lose token if it was part of user object (though it's usually separate)
                // The API returns the full user object with token in the response as well based on previous check

                localStorage.setItem('user', JSON.stringify(updatedUser));
                // Token is also returned in response of update profile based on route
                if (updatedUser.token) {
                    localStorage.setItem('token', updatedUser.token);
                }

                setIsEditing(false);
                window.location.reload(); // Simple refresh to sync context on load
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error('Check console', error);
        }
    };

    if (!user) return null;

    return (
        <>
            <div className="min-h-screen bg-dark-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

                <div className="flex flex-col gap-6">
                    {/* Tabs Navigation */}
                    <div className="flex gap-4 border-b border-white/10 pb-1">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-4 py-2 font-medium text-sm transition-colors relative ${activeTab === 'profile' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
                        >
                            Profile Settings
                            {activeTab === 'profile' && <span className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-primary rounded-full"></span>}
                        </button>
                        {!user.isAdmin && (
                            <>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`px-4 py-2 font-medium text-sm transition-colors relative ${activeTab === 'orders' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Order History
                                    {activeTab === 'orders' && <span className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-primary rounded-full"></span>}
                                </button>
                                <button
                                    onClick={() => setActiveTab('address')}
                                    className={`px-4 py-2 font-medium text-sm transition-colors relative ${activeTab === 'address' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Address Book
                                    {activeTab === 'address' && <span className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-primary rounded-full"></span>}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Tab Content */}
                    <div className="grid grid-cols-1 gap-8">
                        {/* Profile Tab */}
                        {((user.isAdmin && activeTab !== 'address') || activeTab === 'profile') && (
                            <div className="max-w-2xl mx-auto w-full">
                                <div className="bg-dark-800 rounded-2xl p-8 border border-white/10 shadow-xl">
                                    <div className="flex flex-col items-center gap-6 mb-8 text-center">
                                        <img
                                            src={user.picture}
                                            alt={user.name}
                                            className="w-32 h-32 rounded-full border-4 border-primary/20"
                                        />
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                                            <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                                                <Mail className="w-3 h-3" /> {user.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-2 text-primary mb-1 text-sm font-semibold">
                                                <User className="w-4 h-4" /> Account Type
                                            </div>
                                            <p className="text-gray-300">
                                                {!user.isAdmin ? 'Google Account' : 'Standard Account'}
                                            </p>
                                        </div>

                                        <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-2 text-primary mb-1 text-sm font-semibold">
                                                <Shield className="w-4 h-4" /> Role
                                            </div>
                                            <p className="text-gray-300">
                                                {user.isAdmin ? 'Administrator' : 'Customer'}
                                            </p>
                                        </div>

                                        <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                                                    <Phone className="w-4 h-4" /> Phone Number
                                                </div>
                                                {!isEditing && (
                                                    <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-white transition-colors">
                                                        <Edit2 className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                            {isEditing ? (
                                                <form onSubmit={handleUpdateProfile} className="flex gap-2">
                                                    <input
                                                        type="tel"
                                                        value={phoneNumber}
                                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                                        className="w-full bg-dark-800 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-primary"
                                                        placeholder="Enter phone number"
                                                        autoFocus
                                                    />
                                                    <button type="submit" className="text-green-500 hover:text-green-400">
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button type="button" onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-400">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </form>
                                            ) : (
                                                <p className="text-gray-300 text-sm">
                                                    {user.phone || 'Not set'}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors font-medium border border-red-500/20 cursor-pointer"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Order History Tab */}
                        {(!user.isAdmin && activeTab === 'orders') && (
                            <div className="w-full">
                                {loading ? (
                                    <div className="text-center py-12 text-gray-500 animate-pulse">Loading orders...</div>
                                ) : orders.length === 0 ? (
                                    <div className="bg-dark-800 rounded-2xl p-12 border border-white/10 text-center">
                                        <p className="text-gray-400 mb-4">You haven't placed any orders yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div key={order._id} className="bg-dark-800 rounded-xl p-6 border border-white/10 hover:border-primary/30 transition-colors">
                                                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                                    <div>
                                                        <p className="text-primary font-mono text-sm mb-1">#{order._id}</p>
                                                        <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {order.isCancelled ? (
                                                            <span className="px-3 py-1 rounded-full text-xs font-bold border bg-red-500/10 text-red-400 border-red-500/20">
                                                                Cancelled
                                                            </span>
                                                        ) : (
                                                            <>
                                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${order.isPaid ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                                                    {order.isPaid ? 'Paid' : 'Pending Payment'}
                                                                </span>
                                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${order.isDelivered ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                                                    {order.isDelivered ? 'Delivered' : 'Processing'}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    {order.orderItems.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-300">
                                                                <span className="text-gray-500 mr-2">{item.qty}x</span>
                                                                {item.name}
                                                            </span>
                                                            <span className="text-gray-400">${item.price}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                                                    <span className="text-gray-400 text-sm">Total Amount</span>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-white font-bold text-lg">${order.totalPrice.toFixed(2)}</span>
                                                        {!order.isCancelled && !order.isDelivered && (
                                                            <button
                                                                onClick={() => initiateCancel(order._id)}
                                                                className="text-xs text-red-400 hover:text-red-300 underline cursor-pointer"
                                                            >
                                                                Cancel Order
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Address Book Tab */}
                        {(!user.isAdmin && activeTab === 'address') && (
                            <div className="max-w-2xl mx-auto w-full">
                                <div className="bg-dark-800 rounded-2xl p-8 border border-white/10 shadow-xl">
                                    <h2 className="text-2xl font-bold text-white mb-6">Address Book</h2>
                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div>
                                            <label className="block text-gray-400 mb-2 text-sm">Street Address</label>
                                            <input
                                                type="text"
                                                required
                                                value={address.street}
                                                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                                className="w-full bg-dark-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                                                placeholder="123 Camera St"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-gray-400 mb-2 text-sm">City</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={address.city}
                                                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                                    className="w-full bg-dark-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                                                    placeholder="New York"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-400 mb-2 text-sm">Postal Code</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={address.postalCode}
                                                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                                                    className="w-full bg-dark-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                                                    placeholder="10001"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-gray-400 mb-2 text-sm">Country</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={address.country}
                                                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                                                    className="w-full bg-dark-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                                                    placeholder="United States"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-400 mb-2 text-sm">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    className="w-full bg-dark-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                                                    placeholder="+1 (555) 000-0000"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                        >
                                            <Save className="w-5 h-5" />
                                            Save Address
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
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

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <ProfileContent />
        </ProtectedRoute>
    );
}
