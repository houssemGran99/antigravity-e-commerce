'use client';

import React, { useContext, useState } from 'react';
import { CartState } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const AddToCartButton = ({ product }) => {
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useContext(CartState);
    const { user } = useAuth();
    const [added, setAdded] = useState(false);

    if (user?.isAdmin) return null;

    const handleAddToCart = () => {
        addToCart(product, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
        setQuantity(1); // Reset to 1 after adding
    };

    const increment = () => setQuantity(prev => prev + 1);
    const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 bg-dark-900/50 p-2 rounded-xl border border-white/5 w-fit">
                <button
                    onClick={decrement}
                    className="w-10 h-10 flex items-center justify-center bg-dark-800 hover:bg-white/10 rounded-lg text-white font-bold transition-colors"
                >
                    -
                </button>
                <span className="text-xl font-bold text-white w-8 text-center">{quantity}</span>
                <button
                    onClick={increment}
                    className="w-10 h-10 flex items-center justify-center bg-dark-800 hover:bg-white/10 rounded-lg text-white font-bold transition-colors"
                >
                    +
                </button>
            </div>

            <button
                onClick={handleAddToCart}
                className={`w-full font-bold py-4 rounded-xl text-lg transition-all shadow-lg cursor-pointer ${added
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/20'
                    : 'bg-primary hover:bg-blue-600 text-white shadow-primary/20'
                    }`}
            >
                {added ? `Added ${quantity} to Cart!` : 'Add to Cart'}
            </button>
        </div>
    );
};

export default AddToCartButton;
