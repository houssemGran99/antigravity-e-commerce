'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { ShoppingBag, Star, Heart } from 'lucide-react';
import { CartState } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useContext(CartState);
    const { user, wishlist, addToWishlist, removeFromWishlist } = useAuth();

    // Safety check for wishlist array
    const inWishlist = wishlist && wishlist.includes(product._id);

    const toggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent navigating to product details
        if (inWishlist) {
            removeFromWishlist(product._id);
        } else {
            addToWishlist(product._id);
        }
    };

    return (
        <div className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
            <div className="aspect-[4/3] overflow-hidden relative">
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                />

                {user && !user.isAdmin && (
                    <button
                        onClick={toggleWishlist}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-10"
                        aria-label={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                        <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>
                )}
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-sm text-primary font-medium">{product.brand?.name || product.brand || 'Brand'}</p>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                    </div>
                    <span className="bg-muted px-2 py-1 rounded text-sm font-semibold text-foreground">{product.price} TND</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                    <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.round(product.rating || 0) ? 'fill-current' : 'text-muted-foreground'}`}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-muted-foreground">({product.numReviews || 0} reviews)</span>
                </div>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{product.description}</p>

                <div className="flex gap-2">
                    <Link href={`/product/${product._id}`} className="flex-1 text-center bg-muted hover:bg-muted/80 py-2 rounded-lg text-sm font-medium transition-colors text-foreground">
                        View Details
                    </Link>
                    {!user?.isAdmin && (
                        <button
                            onClick={() => addToCart(product)}
                            className="bg-primary hover:bg-blue-600 text-white p-2 rounded-lg transition-colors cursor-pointer"
                            aria-label={`Add ${product.name} to cart`}
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
