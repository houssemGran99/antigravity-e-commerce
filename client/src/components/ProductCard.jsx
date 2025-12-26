'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { ShoppingBag, Star } from 'lucide-react';
import { CartState } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useContext(CartState);
    const { user } = useAuth();

    return (
        <div className="group relative bg-dark-800 rounded-2xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
            <div className="aspect-[4/3] overflow-hidden">
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                />
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-sm text-primary font-medium">{product.brand?.name || product.brand || 'Brand'}</p>
                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{product.name}</h3>
                    </div>
                    <span className="bg-white/10 px-2 py-1 rounded text-sm font-semibold text-white">{product.price} TND</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                    <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.round(product.rating || 0) ? 'fill-current' : 'text-gray-600'}`}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-gray-500">({product.numReviews || 0} reviews)</span>
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>

                <div className="flex gap-2">
                    <Link href={`/product/${product._id}`} className="flex-1 text-center bg-white/5 hover:bg-white/10 py-2 rounded-lg text-sm font-medium transition-colors text-white">
                        View Details
                    </Link>
                    {!user?.isAdmin && (
                        <button
                            onClick={() => addToCart(product)}
                            className="bg-primary hover:bg-blue-600 text-white p-2 rounded-lg transition-colors cursor-pointer"
                        >
                            <ShoppingBag className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
