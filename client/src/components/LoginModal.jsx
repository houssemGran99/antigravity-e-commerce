'use client';

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { X, Camera } from 'lucide-react';
import { useTheme } from 'next-themes';

const LoginModal = ({ isOpen, onClose }) => {
    const { login } = useAuth();
    const { theme, systemTheme } = useTheme();

    if (!isOpen) return null;

    const currentTheme = theme === 'system' ? systemTheme : theme;
    const googleTheme = currentTheme === 'dark' ? 'filled_black' : 'outline';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full relative shadow-2xl animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                        <Camera className="w-8 h-8 text-primary" />
                    </div>

                    <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
                    <p className="text-muted-foreground mb-8">Please log in to continue to checkout</p>

                    <div className="w-full flex justify-center">
                        <GoogleLogin
                            onSuccess={(credentialResponse) => {
                                login(credentialResponse);
                                onClose();
                            }}
                            onError={() => {
                                console.log('Login Failed');
                            }}
                            theme={googleTheme}
                            size="large"
                            shape="pill"
                            width="100%"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
