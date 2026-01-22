'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, LogOut, Phone, Save, Edit2, X, Lock, ShoppingBag, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';
import ProtectedRoute from '../../components/ProtectedRoute';

const ProfileContent = () => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [activeTab, setActiveTab] = useState('orders');

    const [address, setAddress] = useState({ street: '', city: '', postalCode: '', country: '' });

    useEffect(() => {
        if (user) {
            setPhoneNumber(user.phone || '');
            setAddress(user.address || { street: '', city: '', postalCode: '', country: '' });
            if (!user.isAdmin) {
                fetchOrders();
            } else {
                setLoading(false);
                setActiveTab('profile');
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

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast.error("New passwords don't match");
            return;
        }
        if (passwords.new.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    password: passwords.new,
                    currentPassword: passwords.current
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Password updated. Please login again.');
                setIsChangingPassword(false);
                setPasswords({ current: '', new: '', confirm: '' });

                // Manual logout to avoid redirect to home
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Force hard redirect to ensure state is cleared and we go to admin login
                window.location.href = '/admin/login';
            } else {
                toast.error(data.message || 'Failed to update password');
            }
        } catch (error) {
            console.error('Password update error:', error);
            toast.error('Error updating password');
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

    return (
        <>
            <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-foreground mb-8">My Profile</h1>

                <div className="flex flex-col gap-6">
                    {/* Tabs Navigation */}
                    <div className="flex gap-4 border-b border-border pb-1">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-4 py-2 font-medium text-sm transition-colors relative ${activeTab === 'profile' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Profile Settings
                            {activeTab === 'profile' && <span className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-primary rounded-full"></span>}
                        </button>
                        {!user.isAdmin && (
                            <>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`px-4 py-2 font-medium text-sm transition-colors relative flex items-center gap-2 ${activeTab === 'orders' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    My Orders
                                    {activeTab === 'orders' && <span className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-primary rounded-full"></span>}
                                </button>
                                <button
                                    onClick={() => setActiveTab('address')}
                                    className={`px-4 py-2 font-medium text-sm transition-colors relative ${activeTab === 'address' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
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
                                <div className="bg-card rounded-2xl p-8 border border-border shadow-xl">
                                    <div className="flex flex-col items-center gap-6 mb-8 text-center">
                                        <img
                                            src={user.picture}
                                            alt={user.name}
                                            referrerPolicy="no-referrer"
                                            className="w-32 h-32 rounded-full border-4 border-primary/20"
                                        />
                                        <div>
                                            <h2 className="text-2xl font-bold text-foreground mb-1">{user.name}</h2>
                                            <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                                                <Mail className="w-3 h-3" /> {user.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="bg-muted p-4 rounded-xl border border-border">
                                            <div className="flex items-center gap-2 text-primary mb-1 text-sm font-semibold">
                                                <User className="w-4 h-4" /> Account Type
                                            </div>
                                            <p className="text-foreground">
                                                {user.googleId ? 'Google Account' : 'Standard Account'}
                                            </p>
                                        </div>

                                        <div className="bg-muted p-4 rounded-xl border border-border">
                                            <div className="flex items-center gap-2 text-primary mb-1 text-sm font-semibold">
                                                <Shield className="w-4 h-4" /> Role
                                            </div>
                                            <p className="text-foreground">
                                                {user.isAdmin ? 'Administrator' : 'Customer'}
                                            </p>
                                        </div>

                                        {!user.isAdmin && (
                                            <div className="bg-muted p-4 rounded-xl border border-border">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                                                        <Phone className="w-4 h-4" /> Phone Number
                                                    </div>
                                                    {!isEditing && (
                                                        <button onClick={() => setIsEditing(true)} className="text-muted-foreground hover:text-foreground transition-colors">
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
                                                            className="w-full bg-background border border-border rounded px-2 py-1 text-foreground text-sm focus:outline-none focus:border-primary"
                                                            placeholder="Enter phone number"
                                                            autoFocus
                                                        />
                                                        <button type="submit" className="text-green-500 hover:text-green-400">
                                                            <Save className="w-4 h-4" />
                                                        </button>
                                                        <button type="button" onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </form>
                                                ) : (
                                                    <p className="text-foreground text-sm">
                                                        {user.phone || 'Not set'}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Change Password Section (Admin Only) */}
                                        {user.isAdmin && (
                                            <div className="bg-muted p-4 rounded-xl border border-border">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                                                        <Lock className="w-4 h-4" /> Security
                                                    </div>
                                                    <button
                                                        onClick={() => setIsChangingPassword(!isChangingPassword)}
                                                        className="text-muted-foreground hover:text-foreground transition-colors text-xs border border-border px-2 py-1 rounded"
                                                    >
                                                        {isChangingPassword ? 'Cancel' : 'Change Password'}
                                                    </button>
                                                </div>

                                                {isChangingPassword && (
                                                    <form onSubmit={handleChangePassword} className="space-y-3">
                                                        <div>
                                                            <input
                                                                type="password"
                                                                placeholder="Current Password"
                                                                value={passwords.current}
                                                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <input
                                                                type="password"
                                                                placeholder="New Password"
                                                                value={passwords.new}
                                                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <input
                                                                type="password"
                                                                placeholder="Confirm New Password"
                                                                value={passwords.confirm}
                                                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary"
                                                                required
                                                            />
                                                        </div>
                                                        <button
                                                            type="submit"
                                                            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition-colors text-sm"
                                                        >
                                                            Update Password
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        )}
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
                                        <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
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
                        )}

                        {/* Address Book Tab */}
                        {(!user.isAdmin && activeTab === 'address') && (
                            <div className="max-w-2xl mx-auto w-full">
                                <div className="bg-card rounded-2xl p-8 border border-border shadow-xl">
                                    <h2 className="text-2xl font-bold text-foreground mb-6">Address Book</h2>
                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div>
                                            <label className="block text-muted-foreground mb-2 text-sm">Street Address</label>
                                            <input
                                                type="text"
                                                required
                                                value={address.street}
                                                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                                className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                                                placeholder="123 Camera St"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-muted-foreground mb-2 text-sm">City</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={address.city}
                                                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                                    className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                                                    placeholder="New York"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-muted-foreground mb-2 text-sm">Postal Code</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={address.postalCode}
                                                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                                                    className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                                                    placeholder="10001"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-muted-foreground mb-2 text-sm">Country</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={address.country}
                                                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                                                    className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                                                    placeholder="United States"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-muted-foreground mb-2 text-sm">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary transition-colors"
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
