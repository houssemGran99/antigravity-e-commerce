'use client';

import React, { useContext } from 'react';
import { CartState } from '../../context/CartContext';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

const CartPage = () => {
    const { cart, removeFromCart } = useContext(CartState);
    const { user } = useAuth();
    const router = useRouter();

    const total = cart.reduce((acc, item) => acc + item.price, 0);



    const handleCheckout = () => {
        if (!user) {
            router.push('/login');
        } else {
            router.push('/checkout');
        }
    };

    if (cart.length === 0) {
        return (
            <div className="pt-20 pb-20 min-h-[60vh] flex flex-col items-center justify-center text-center px-4 text-foreground">
                <div className="bg-muted p-8 rounded-full mb-6">
                    <Trash2 className="w-16 h-16 text-muted-foreground" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
                <p className="text-muted-foreground mb-8 max-w-md">Looks like you haven't added any cameras to your collection yet.</p>
                <Link href="/shop" className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-primary/20">
                    Start Shopping
                </Link>
            </div>
        );
    }

    // Aggregate items
    const groupedCart = cart.reduce((acc, item) => {
        const id = item._id;
        if (!acc[id]) {
            acc[id] = { ...item, quantity: 1 };
        } else {
            acc[id].quantity += 1;
        }
        return acc;
    }, {});

    const uniqueItems = Object.values(groupedCart);

    return (
        <div className="pt-10 pb-20 min-h-screen bg-background text-foreground">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {uniqueItems.map((item) => (
                            <div key={item._id} className="bg-card rounded-2xl p-4 flex gap-4 border border-border items-center">
                                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-background">
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-primary font-medium">{item.brand?.name || item.brand}</p>
                                    <h3 className="text-xl font-bold truncate">{item.name}</h3>
                                    <p className="text-muted-foreground text-sm mt-1 mb-2 line-clamp-1">{item.description}</p>
                                    <div className="flex items-center gap-4">
                                        <p className="text-lg font-bold text-foreground">{item.price} TND</p>
                                        <span className="text-xs font-bold px-2 py-1 bg-muted rounded-full text-foreground">
                                            Qty: {item.quantity}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <p className="font-bold text-lg">{(item.price * item.quantity).toFixed(2)} TND</p>
                                    <button
                                        onClick={() => removeFromCart(item)}
                                        className="p-2 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground rounded-xl transition-colors flex items-center gap-1 text-xs"
                                        title="Remove one"
                                    >
                                        <Trash2 className="w-4 h-4" /> Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-card rounded-2xl p-6 border border-border sticky top-24">
                            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>{total.toFixed(2)} TND</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Shipping</span>
                                    <span className="text-green-500">Free</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Tax (Estimated)</span>
                                    <span>{(total * 0.08).toFixed(2)} TND</span>
                                </div>
                                <div className="h-px bg-border my-4"></div>
                                <div className="flex justify-between text-xl font-bold text-foreground">
                                    <span>Total</span>
                                    <span>{(total * 1.08).toFixed(2)} TND</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="block w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl text-center text-lg transition-all shadow-lg shadow-primary/20"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
