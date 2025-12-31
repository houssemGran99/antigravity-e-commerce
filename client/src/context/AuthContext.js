'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState([]);
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch('/api/users/notifications', { // fixed endpoint path to match valid routes if needed, wait. 
                // Step 1628 showed notificationRoutes mounted at /api/notifications? 
                // Wait, I need to check where notificationRoutes is mounted in server/index.js.
                // But usually it's /api/notifications or /api/users/notifications.
                // Navbar used `/api/users/notifications/...` in lines 32 and 46.
                // So likely it is /api/users/notifications.
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchWishlist = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch('/api/users/wishlist', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setWishlist(data.map(item => item._id)); // Store IDs for easy checking
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    };

    useEffect(() => {
        // Check for saved token on load
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                // Check expiry immediately
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser(JSON.parse(savedUser));
                    fetchWishlist();
                    fetchNotifications();
                }
            } catch (error) {
                logout();
            }
        }
        setLoading(false);

        // Periodically check for token expiration
        const intervalId = setInterval(() => {
            const currentToken = localStorage.getItem('token');
            if (currentToken) {
                try {
                    const decoded = jwtDecode(currentToken);
                    if (decoded.exp * 1000 < Date.now()) {
                        logout();
                    }
                } catch (error) {
                    logout();
                }
            }
        }, 60000); // Check every minute

        return () => clearInterval(intervalId);
    }, []);

    const addToWishlist = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/users/wishlist/${productId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const newWishlist = await res.json();
                setWishlist(newWishlist);
                toast.success('Added to wishlist');
            }
        } catch (error) {
            toast.error('Failed to add to wishlist');
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/users/wishlist/${productId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const newWishlist = await res.json();
                setWishlist(newWishlist);
                toast.success('Removed from wishlist');
            }
        } catch (error) {
            toast.error('Failed to remove from wishlist');
        }
    };

    const login = async (googleData) => {
        try {
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: googleData.credential }),
            });

            if (!res.ok) {
                const text = await res.text();
                try {
                    const errorData = JSON.parse(text);
                    throw new Error(errorData.message || errorData.error || 'Login failed');
                } catch (e) {
                    // If parsing fails, use the raw text (truncated)
                    console.error('Server response:', text);
                    throw new Error(`Login failed: ${res.status} ${res.statusText}`);
                }
            }

            const data = await res.json();

            setUser(data.user);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            fetchWishlist(); // Fetch wishlist on login
            fetchNotifications();

            toast.success(`Welcome back, ${data.user.name}!`);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.message || 'Login failed');
            return { success: false, error: error.message };
        }
    };

    const loginAdmin = async (username, password) => {
        try {
            const res = await fetch('/api/auth/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Login failed');
            }

            const data = await res.json();

            setUser(data.user);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            fetchNotifications();

            toast.success('Admin login successful');
            return { success: true };
        } catch (error) {
            console.error('Admin Login error:', error);
            toast.error(error.message || 'Admin login failed');
            return { success: false, error: error.message };
        }
    };

    const registerUser = async (userData) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Registration failed');
            }

            const data = await res.json();

            setUser(data.user);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            fetchNotifications();

            toast.success('Registration successful!');
            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Registration failed');
            return { success: false, error: error.message };
        }
    };

    const loginUser = async (email, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Login failed');
            }

            const data = await res.json();

            setUser(data.user);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            fetchWishlist();
            fetchNotifications();

            toast.success(`Welcome back, ${data.user.name}!`);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.message || 'Login failed');
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        googleLogout();
        setUser(null);
        setWishlist([]); // Clear wishlist
        setNotifications([]);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, login, loginAdmin, loginUser, registerUser, logout, loading, wishlist, addToWishlist, removeFromWishlist, notifications, fetchNotifications }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
