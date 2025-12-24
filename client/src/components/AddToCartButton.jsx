'use client';

import React, { useContext, useState } from 'react';
import { CartState } from '../context/CartContext';

const AddToCartButton = ({ product }) => {
    const { addToCart } = useContext(CartState);
    const [added, setAdded] = useState(false);

    const handleAddToCart = () => {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <button
            onClick={handleAddToCart}
            className={`w-full font-bold py-4 rounded-xl text-lg transition-all shadow-lg cursor-pointer ${added
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/20'
                : 'bg-primary hover:bg-blue-600 text-white shadow-primary/20'
                }`}
        >
            {added ? 'Added to Cart!' : 'Add to Cart'}
        </button>
    );
};

export default AddToCartButton;
