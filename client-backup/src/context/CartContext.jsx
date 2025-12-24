import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export const CartState = createContext();

const CartContext = ({ children }) => {
    const [cart, setCart] = useState([]);
    const { user } = useAuth();
    const [isInitialized, setIsInitialized] = useState(false);

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
                        // Flatten backend items to match frontend structure [prod, prod]
                        // Backend returns items: [{ product: {...}, quantity: 2 }]
                        // Frontend expects: [product, product, product] (based on current simple implementation)

                        // NOTE: Adapting frontend to use current simple state structure
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
                // Determine if we need to sync local items.
                // For simplicity, we can strict sync: send current cart to backend
                // But preventing infinite loop is key.
                // Let's rely on explicit actions (add/remove) for updates, and initial load.
                // BUT, what if I added items as guest then logged in?
                // I need to send those items to the server ONCE.

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
                            // Update local state with merged result
                            const flatCart = [];
                            data.items.forEach(item => {
                                if (item.product) {
                                    for (let i = 0; i < item.quantity; i++) {
                                        flatCart.push(item.product);
                                    }
                                }
                            });
                            setCart(flatCart);
                            // Clear local storage cart as it's now in cloud? 
                            // Or keep it as cache? Let's clear to avoid confusion/duplication on next load?
                            // No, best to just rely on backend state when logged in.
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
        // Initial sync logic is tricky with useEffect dependencies.
        // We'll trust the flow:
        // 1. App Loads (User null) -> Load LocalStorage.
        // 2. User logs in -> User becomes set.
        // 3. Effect triggers. If LocalStorage has items, Sync them.

        if (user && isInitialized) {
            syncCart();
        }
    }, [user, isInitialized]); // Run when user changes (login)

    // Save to LocalStorage if Guest
    useEffect(() => {
        if (!user && isInitialized) {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }, [cart, user, isInitialized]);

    const addToCart = async (product) => {
        // Optimistic UI update
        const newCart = [...cart, product];
        setCart(newCart);

        if (user) {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ productId: product._id })
                });
            } catch (error) {
                console.error('Error adding to cloud cart', error);
                // Rollback? complex.
            }
        }
    };

    const removeFromCart = async (productOrId) => {
        // Handle both product object or ID
        const productId = productOrId._id || productOrId;

        // Frontend logic: Remove ONE instance
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
