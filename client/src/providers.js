'use client';

import { AuthProvider } from './context/AuthContext';
import CartContext from './context/CartContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

import { NotificationProvider } from './context/NotificationContext';

export function Providers({ children }) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <AuthProvider>
                <NotificationProvider>
                    <CartContext>
                        {children}
                        <Toaster position="top-right" />
                    </CartContext>
                </NotificationProvider>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}
