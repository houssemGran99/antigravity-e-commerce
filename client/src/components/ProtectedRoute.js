'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
        if (!loading && user && adminOnly && !user.isAdmin) {
            router.push('/');
        }
    }, [user, loading, adminOnly, router]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }

    if (!user) {
        return null; // or a redirecting message
    }

    if (adminOnly && !user.isAdmin) {
        return null;
    }

    return children;
};

export default ProtectedRoute;
