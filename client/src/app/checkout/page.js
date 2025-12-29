'use client';

import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { CartState } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { ArrowLeft, MapPin, Phone, CreditCard, Loader2 } from 'lucide-react';
import Link from 'next/link';

const CheckoutContent = () => {
    const { cart, setCart } = useContext(CartState);
    const { user } = useAuth();
    const router = useRouter();

    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (user) {
            if (user.isAdmin) {
                router.push('/admin');
            }
            // Prefill with user data if available
            if (user.phone) setPhone(user.phone);
            if (user.address) {
                setAddress(user.address.street || '');
                setCity(user.address.city || '');
                setPostalCode(user.address.postalCode || '');
                setCountry(user.address.country || '');
            }
        }
    }, [user, router]);

    // Calculate Prices
    const itemsPrice = cart.reduce((acc, item) => acc + item.price, 0);
    const shippingPrice = itemsPrice > 1000 ? 0 : 50;
    const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        const orderData = {
            orderItems: cart.map(item => ({
                product: item._id,
                name: item.name,
                image: item.imageUrl,
                price: item.price,
                qty: 1
            })),
            shippingAddress: {
                address,
                city,
                postalCode,
                country,
                phone
            },
            paymentMethod: 'CashOnDelivery',
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice
        };

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const data = await res.json();
                console.log('Order Created:', data);
                setCart([]);
                localStorage.removeItem('cart');
                router.push(`/order/success/${data._id}`);
            } else {
                console.error('Order Failed', res.status);
                alert('Failed to place order.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Error placing order.');
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-background pt-24 text-foreground flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <Link href="/shop" className="text-primary hover:underline">Go back to Shop</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/cart" className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors text-foreground">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-4xl font-bold text-foreground">Checkout</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Shipping Form */}
                    <div className="bg-card p-8 rounded-2xl border border-border">
                        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                            <MapPin className="w-6 h-6 text-primary" />
                            Shipping Details
                        </h2>
                        <form onSubmit={submitHandler} className="space-y-6">
                            <div>
                                <label className="block text-muted-foreground mb-2">Address</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-muted-foreground mb-2">City</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-muted-foreground mb-2">Postal Code</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                                        value={postalCode}
                                        onChange={(e) => setPostalCode(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-2">Country</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-2 flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 mt-8 text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Place Order'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-card p-8 rounded-2xl border border-border h-fit">
                        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-primary" />
                            Order Summary
                        </h2>
                        <div className="space-y-4 mb-6">
                            {cart.map((item, index) => (
                                <div key={index} className="flex gap-4 items-center">
                                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-border" />
                                    <div className="flex-1">
                                        <h3 className="text-foreground font-bold">{item.name}</h3>
                                        <p className="text-muted-foreground">{item.price} TND</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-border pt-4 space-y-2">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Items</span>
                                <span>{itemsPrice.toFixed(2)} TND</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Shipping</span>
                                <span>{shippingPrice === 0 ? 'Free' : `${shippingPrice} TND`}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Tax (15%)</span>
                                <span>{taxPrice.toFixed(2)} TND</span>
                            </div>
                            <div className="flex justify-between text-foreground font-bold text-xl pt-4 border-t border-border">
                                <span>Total</span>
                                <span>{totalPrice.toFixed(2)} TND</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckoutPage = () => {
    return (
        <ProtectedRoute>
            <CheckoutContent />
        </ProtectedRoute>
    );
};

export default CheckoutPage;
