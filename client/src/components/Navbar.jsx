'use client';

import React, { useContext, useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ShoppingBag, Camera, Menu, Search, Bell, Check, Heart, Sun, Moon, Laptop, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CartState } from '../context/CartContext';
import { useTheme } from 'next-themes';

const Navbar = () => {
    const { user, login, logout, notifications, fetchNotifications } = useAuth();
    const { cart } = useContext(CartState);
    const pathname = usePathname();
    const [showNotifications, setShowNotifications] = useState(false);
    // const notifications = user?.notifications || []; // Now from context
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const currentTheme = theme === 'system' ? systemTheme : theme;

    if (pathname === '/login' || pathname === '/admin/login') return null;

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications(); // Refresh notifications
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/users/notifications/read-all', {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // Toggle Theme
    const toggleTheme = () => {
        if (theme === 'dark') setTheme('light');
        else if (theme === 'light') setTheme('system');
        else setTheme('dark');
    };

    const ThemeIcon = () => {
        if (!mounted) return <Sun className="w-5 h-5" />;
        if (theme === 'dark') return <Moon className="w-5 h-5" />;
        if (theme === 'light') return <Sun className="w-5 h-5" />;
        return <Laptop className="w-5 h-5" />;
    };

    return (
        <>
            <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Link href={user?.isAdmin ? "/admin" : "/"} className="flex items-center gap-2 font-bold text-2xl tracking-tighter text-foreground">
                                <Camera className="w-8 h-8 text-primary" />
                                <span>LUMIÈRE</span>
                            </Link>
                        </div>

                        <div className="hidden md:block">
                            <div className="ml-10 flex items-center space-x-8">
                                {!user?.isAdmin && (
                                    <>
                                        <Link href="/" className="text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-md font-medium">Home</Link>
                                        <Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-md font-medium">Shop</Link>
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
                                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors relative"
                                        aria-label="Notifications"
                                    >
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-background">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {showNotifications && (
                                        <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="p-3 border-b border-border flex justify-between items-center bg-muted/50">
                                                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={markAllAsRead}
                                                        className="text-xs text-primary hover:text-blue-400 transition-colors"
                                                        aria-label="Mark all notifications as read"
                                                    >
                                                        Mark all read
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="p-8 text-center text-muted-foreground text-sm">
                                                        No notifications
                                                    </div>
                                                ) : (
                                                    notifications.map(notification => (
                                                        <div
                                                            key={notification._id}
                                                            className={`p-4 border-b border-border hover:bg-muted transition-colors relative group ${!notification.isRead ? 'bg-primary/5' : ''}`}
                                                        >
                                                            <div className="flex gap-3">
                                                                <div className="flex-1">
                                                                    <Link
                                                                        href={notification.link || '#'}
                                                                        onClick={() => {
                                                                            setShowNotifications(false);
                                                                            markAsRead(notification._id);
                                                                        }}
                                                                        className={`text-sm block mb-1 ${!notification.isRead ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                                                                    >
                                                                        {notification.message}
                                                                    </Link>
                                                                    <span className="text-xs text-muted-foreground block">
                                                                        {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                                {!notification.isRead && (
                                                                    <button
                                                                        onClick={() => markAsRead(notification._id)}
                                                                        className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-all self-start"
                                                                        title="Mark as read"
                                                                        aria-label="Mark as read"
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

                            <button
                                onClick={toggleTheme}
                                className="p-2 text-gray-400 hover:text-foreground hover:bg-muted rounded-full transition-colors"
                                aria-label="Toggle Theme"
                            >
                                <ThemeIcon />
                            </button>

                            {user ? (
                                <div className="flex items-center gap-3">
                                    <Link href="/profile" className="flex items-center gap-3 hover:bg-muted p-1.5 rounded-full pr-4 transition-colors group" aria-label="My Profile">
                                        {/* Using standard img to avoid next/image config issues for external google urls initially */}
                                        <img
                                            src={user.picture || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                            alt={user.name}
                                            referrerPolicy="no-referrer"
                                            className="w-8 h-8 rounded-full border border-border group-hover:border-primary transition-colors"
                                        />
                                        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{user.name}</span>
                                    </Link>
                                    <button onClick={logout} className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-2">Logout</button>
                                </div>
                            ) : (
                                pathname !== '/admin/login' && pathname !== '/login' && (
                                    <Link
                                        href="/login"
                                        className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-full font-medium transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                                    >
                                        <UserIcon className="w-4 h-4" />
                                        <span>Sign In</span>
                                    </Link>
                                )
                            )}

                            {!user?.isAdmin && pathname !== '/admin/login' && (
                                <>
                                    <Link href="/wishlist" className="p-2 hover:bg-muted rounded-full transition-colors text-foreground" aria-label="My Wishlist">
                                        <Heart className="w-6 h-6" />
                                    </Link>
                                    <Link href="/cart" className="relative p-2 hover:bg-muted rounded-full transition-colors text-foreground" aria-label="Shopping Cart">
                                        <ShoppingBag className="w-6 h-6" />
                                        {cart.length > 0 && (
                                            <span className="absolute top-0 right-0 bg-primary text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full text-white">
                                                {cart.length}
                                            </span>
                                        )}
                                    </Link>
                                </>
                            )}
                            <button className="md:hidden p-2 text-foreground" aria-label="Open Menu">
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </>
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
                className="bg-card border border-border rounded-full py-1.5 px-4 pl-10 text-sm focus:outline-none focus:border-primary w-48 transition-all focus:w-64 text-foreground placeholder-muted-foreground"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </form>
    );
};
