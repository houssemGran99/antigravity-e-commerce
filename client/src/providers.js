'use client';

import { AuthProvider } from './context/AuthContext';
import CartContext from './context/CartContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { NotificationProvider } from './context/NotificationContext';

export function Providers({ children }) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <AuthProvider>
                <NotificationProvider>
                    <CartContext>
                        {children}
                    </CartContext>
                </NotificationProvider>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}
