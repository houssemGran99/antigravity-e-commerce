'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for saved token on load
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                // Check expiry
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser(JSON.parse(savedUser));
                }
            } catch (error) {
                logout();
            }
        }
        setLoading(false);
    }, []);

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
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || 'Login failed');
            }

            const data = await res.json();

            setUser(data.user);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
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

            return { success: true };
        } catch (error) {
            console.error('Admin Login error:', error);
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        googleLogout();
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, login, loginAdmin, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
