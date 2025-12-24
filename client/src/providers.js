'use client';

import { AuthProvider } from './context/AuthContext';
import CartContext from './context/CartContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

export function Providers({ children }) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <AuthProvider>
                <CartContext>
                    {children}
                </CartContext>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}
