'use client';

import React, { useContext, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ShoppingBag, Camera, Menu, Search, Bell, Check, X } from 'lucide-react';
import { CartState } from '../context/CartContext';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Navbar = () => {
    const { cart } = useContext(CartState);
    const { user, login, logout } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href={user?.isAdmin ? "/admin" : "/"} className="flex items-center gap-2 font-bold text-2xl tracking-tighter text-white">
                            <Camera className="w-8 h-8 text-primary" />
                            <span>LUMIÈRE</span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-8">
                            {!user?.isAdmin && (
                                <>
                                    <Link href="/" className="text-gray-300 hover:text-primary transition-colors px-3 py-2 rounded-md font-medium">Home</Link>
                                    <Link href="/shop" className="text-gray-300 hover:text-primary transition-colors px-3 py-2 rounded-md font-medium">Shop</Link>
                                </>
                            )}



                            {!user?.isAdmin && pathname !== '/admin/login' && (
                                <Suspense fallback={<div className="w-48" />}>
                                    <SearchForm />
                                </Suspense>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-full transition-colors relative"
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-dark-900">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-dark-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-3 border-b border-white/5 flex justify-between items-center bg-dark-800/50">
                                            <h3 className="text-sm font-semibold text-white">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-xs text-primary hover:text-blue-400 transition-colors"
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-gray-500 text-sm">
                                                    No notifications
                                                </div>
                                            ) : (
                                                notifications.map(notification => (
                                                    <div
                                                        key={notification._id}
                                                        className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors relative group ${!notification.isRead ? 'bg-primary/5' : ''}`}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className="flex-1">
                                                                <Link
                                                                    href={notification.link || '#'}
                                                                    onClick={() => {
                                                                        setShowNotifications(false);
                                                                        markAsRead(notification._id);
                                                                    }}
                                                                    className={`text-sm block mb-1 ${!notification.isRead ? 'text-white font-medium' : 'text-gray-400'}`}
                                                                >
                                                                    {notification.message}
                                                                </Link>
                                                                <span className="text-xs text-gray-600 block">
                                                                    {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            {!notification.isRead && (
                                                                <button
                                                                    onClick={() => markAsRead(notification._id)}
                                                                    className="text-gray-500 hover:text-primary opacity-0 group-hover:opacity-100 transition-all self-start"
                                                                    title="Mark as read"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link href="/profile" className="flex items-center gap-3 hover:bg-white/5 p-1.5 rounded-full pr-4 transition-colors group">
                                    {/* Using standard img to avoid next/image config issues for external google urls initially */}
                                    <img
                                        src={user.picture}
                                        alt={user.name}
                                        referrerPolicy="no-referrer"
                                        className="w-8 h-8 rounded-full border border-white/20 group-hover:border-primary transition-colors"
                                    />
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{user.name}</span>
                                </Link>
                                <button onClick={logout} className="text-sm text-gray-400 hover:text-white transition-colors ml-2">Logout</button>
                            </div>
                        ) : (
                            pathname !== '/admin/login' && (
                                <div className="overflow-hidden rounded-lg">
                                    <GoogleLogin
                                        onSuccess={credentialResponse => {
                                            login(credentialResponse);
                                        }}
                                        onError={() => {
                                            console.log('Login Failed');
                                        }}
                                        theme="filled_black"
                                        size="medium"
                                        shape="pill"
                                    />
                                </div>
                            )
                        )}

                        {!user?.isAdmin && pathname !== '/admin/login' && (
                            <Link href="/cart" className="relative p-2 hover:bg-white/5 rounded-full transition-colors text-white">
                                <ShoppingBag className="w-6 h-6" />
                                {cart.length > 0 && (
                                    <span className="absolute top-0 right-0 bg-primary text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full text-white">
                                        {cart.length}
                                    </span>
                                )}
                            </Link>
                        )}
                        <button className="md:hidden p-2 text-white">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

const SearchForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

    const handleSearch = (e) => {
        e.preventDefault();
        const current = new URLSearchParams(Array.from(searchParams.entries()));

        if (searchTerm.trim()) {
            current.set('search', searchTerm);
        } else {
            current.delete('search');
        }

        const search = current.toString();
        const query = search ? `?${search}` : "";
        router.push(`/shop${query}`);
    };

    return (
        <form onSubmit={handleSearch} className="relative">
            <input
                name="search"
                type="text"
                placeholder="Search cameras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-dark-800 border border-white/10 rounded-full py-1.5 px-4 pl-10 text-sm focus:outline-none focus:border-primary w-48 transition-all focus:w-64 text-white placeholder-gray-500"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </form>
    );
};
