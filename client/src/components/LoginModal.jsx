'use client';

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { X, Camera } from 'lucide-react';

const LoginModal = ({ isOpen, onClose }) => {
    const { login } = useAuth();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-dark-900 border border-white/10 rounded-2xl p-8 max-w-md w-full relative shadow-2xl animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                        <Camera className="w-8 h-8 text-primary" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-gray-400 mb-8">Please log in to continue to checkout</p>

                    <div className="w-full flex justify-center">
                        <GoogleLogin
                            onSuccess={(credentialResponse) => {
                                login(credentialResponse);
                                onClose();
                            }}
                            onError={() => {
                                console.log('Login Failed');
                            }}
                            theme="filled_black"
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
