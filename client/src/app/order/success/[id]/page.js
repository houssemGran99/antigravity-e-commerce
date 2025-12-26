'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, Truck, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import ProtectedRoute from '../../../../components/ProtectedRoute';

// To access params in client component more easily in Next 15, we can also unwrap them or use a wrapper.
// But for cleaner structure, let's just use the page props paradigm if we make it a page.
// Wait, client components in app dir receive params? Yes, as props.

const OrderSuccessContent = ({ id }) => {
    useEffect(() => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }, []);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 text-white">
            <div className="bg-dark-800 p-12 rounded-3xl border border-white/10 max-w-lg w-full text-center">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">Order Confirmed!</h1>
                <p className="text-gray-400 text-lg mb-8">
                    Your order <span className="text-white font-mono font-bold">#{id}</span> has been placed successfully.
                </p>

                <div className="bg-dark-900 rounded-xl p-6 mb-8 text-left border border-white/5">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <Truck className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold mb-1">Estimated Delivery</h3>
                            <p className="text-gray-400 text-sm">3-5 Business Days</p>
                            <p className="text-gray-500 text-xs mt-2">We've sent a confirmation email with details.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Link href="/shop" className="bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 block w-full">
                        Continue Shopping
                    </Link>
                    <Link href="/profile" className="text-gray-400 hover:text-white py-2 flex items-center justify-center gap-2 transition-colors">
                        View My Orders <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default function OrderSuccessPage() {
    const params = useParams();

    return (
        <ProtectedRoute>
            <OrderSuccessContent id={params?.id} />
        </ProtectedRoute>
    );
}
