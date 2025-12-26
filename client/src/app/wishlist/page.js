'use client';

import React, { useEffect, useState } from 'react';
import ProductCard from '../../components/ProductCard';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { Heart, Loader2 } from 'lucide-react';

export default function WishlistPage() {
    const { user, loading: authLoading } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlistItems = async () => {
            if (!user) return;
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/users/wishlist', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setWishlistItems(data);
                }
            } catch (error) {
                console.error('Error fetching wishlist:', error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            if (user) {
                fetchWishlistItems();
            } else {
                setLoading(false);
            }
        }
    }, [user, authLoading]);

    if (loading || authLoading) {
        return (
            <div className="min-h-screen pt-20 flex justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen pt-32 px-4">
                <div className="max-w-md mx-auto text-center">
                    <Heart className="w-16 h-16 text-gray-600 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold text-white mb-4">Your Wishlist is Empty</h1>
                    <p className="text-gray-400 mb-8">Log in to view your wishlist and save your favorite items.</p>
                    <Link href="/login" className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold transition-all">
                        Login Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Heart className="w-8 h-8 text-primary fill-primary" />
                    <h1 className="text-4xl font-bold text-white">My Wishlist</h1>
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="text-center py-20 bg-dark-800/30 rounded-2xl border border-white/5">
                        <p className="text-xl text-gray-400 mb-6">No items saved yet.</p>
                        <Link href="/shop" className="text-primary hover:text-white font-medium transition-colors border-b border-primary hover:border-white pb-1">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {wishlistItems.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
