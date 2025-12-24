import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, LogOut } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const Profile = () => {
    const { user, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);

    useEffect(() => {
        if (user) {
            fetchOrders();
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
                // Optional: Show success toast instead of alert
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

    if (!user) {
        return (
            <div className="pt-24 pb-12 text-center text-white">
                <p>Please login to view your profile.</p>
            </div>
        );
    }

    return (
        <>
            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Details */}
                    <div className="lg:col-span-1">
                        <div className="bg-dark-800 rounded-2xl p-8 border border-white/10 shadow-xl sticky top-24">
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
                                    <p className="text-gray-300">Google Account</p>
                                </div>

                                <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-2 text-primary mb-1 text-sm font-semibold">
                                        <Shield className="w-4 h-4" /> Role
                                    </div>
                                    <p className="text-gray-300">
                                        {user.isAdmin ? 'Administrator' : 'Customer'}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors font-medium border border-red-500/20"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-white mb-6">Order History</h2>

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
                                                        className="text-xs text-red-400 hover:text-red-300 underline"
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

export default Profile;
