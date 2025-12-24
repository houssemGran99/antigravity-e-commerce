'use client';

import React, { createContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

export const CartState = createContext();

const CartContext = ({ children }) => {
    const [cart, setCart] = useState([]);
    const { user } = useAuth();
    const [isInitialized, setIsInitialized] = useState(false);
    const prevUser = useRef(user);

    // Handle Logout: Clear cart when user transitions from logged in to logged out
    useEffect(() => {
        if (prevUser.current && !user) {
            setCart([]);
            localStorage.removeItem('cart');
        }
        prevUser.current = user;
    }, [user]);

    // Initial Load
    useEffect(() => {
        const loadCart = async () => {
            if (user) {
                // Fetch from backend if logged in
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch('/api/cart', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        const flatCart = [];
                        data.items.forEach(item => {
                            if (item.product) {
                                for (let i = 0; i < item.quantity; i++) {
                                    flatCart.push(item.product);
                                }
                            }
                        });
                        setCart(flatCart);

                    } else {
                        console.error('CartContext: Failed to load backend cart', res.status);
                    }
                } catch (error) {
                    console.error('Failed to load cart', error);
                }
            } else {
                // Load from local storage if guest
                const savedCart = localStorage.getItem('cart');
                if (savedCart) {
                    setCart(JSON.parse(savedCart));
                }
            }
            setIsInitialized(true);
        };
        loadCart();
    }, [user]);

    // Sync on transition to logged in (Login action)
    useEffect(() => {
        const syncCart = async () => {
            if (user && isInitialized) {
                const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
                if (localCart.length > 0) {
                    try {
                        const token = localStorage.getItem('token');
                        const res = await fetch('/api/cart/sync', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify({ items: localCart })
                        });
                        if (res.ok) {
                            const data = await res.json();
                            const flatCart = [];
                            data.items.forEach(item => {
                                if (item.product) {
                                    for (let i = 0; i < item.quantity; i++) {
                                        flatCart.push(item.product);
                                    }
                                }
                            });
                            setCart(flatCart);
                            localStorage.removeItem('cart');
                        } else {
                            console.error('CartContext: Sync failed status', res.status);
                        }
                    } catch (error) {
                        console.error('Sync failed', error);
                    }
                }
            }
        };

        if (user && isInitialized) {
            syncCart();
        }
    }, [user, isInitialized]);

    // Save to LocalStorage if Guest
    useEffect(() => {
        if (!user && isInitialized) {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }, [cart, user, isInitialized]);

    const addToCart = async (product) => {
        const newCart = [...cart, product];
        setCart(newCart);

        if (user) {
            try {
                const token = localStorage.getItem('token');
                await fetch('/api/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ productId: product._id })
                });
            } catch (error) {
                console.error('Error adding to cloud cart', error);
            }
        }
    };

    const removeFromCart = async (productOrId) => {
        const productId = productOrId._id || productOrId;

        let removed = false;
        const newCart = cart.filter(item => {
            if (!removed && (item._id === productId || item === productId)) {
                removed = true;
                return false;
            }
            return true;
        });
        setCart(newCart);

        if (user) {
            try {
                const token = localStorage.getItem('token');
                await fetch('/api/cart/remove', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ productId: productId })
                });
            } catch (error) {
                console.error('Error removing from cloud cart', error);
            }
        }
    };

    return (
        <CartState.Provider value={{ cart, setCart, addToCart, removeFromCart }}>
            {children}
        </CartState.Provider>
    );
};

export default CartContext;
