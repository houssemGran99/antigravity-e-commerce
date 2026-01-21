'use client';

import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { Camera, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, User, Phone } from 'lucide-react';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { login, loginUser, registerUser } = useAuth();
    const { theme, systemTheme } = useTheme();
    const router = useRouter();
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Login State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register State
    const [registerData, setRegisterData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '+216',
        password: '',
        confirmPassword: ''
    });

    const currentTheme = theme === 'system' ? systemTheme : theme;
    // Always use filled_black for the dark aesthetic of this page, or match theme
    const googleTheme = 'filled_black';

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!loginEmail || !loginPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        const res = await loginUser(loginEmail, loginPassword);
        setLoading(false);

        if (res.success) {
            router.push('/');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        const { firstName, lastName, email, phone, password, confirmPassword } = registerData;

        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        const res = await registerUser(registerData);
        setLoading(false);

        if (res.success) {
            router.push('/');
        }
    };

    const countryCodes = [
        { code: '+216', country: 'TN', flag: '🇹🇳' },
        { code: '+1', country: 'US', flag: '🇺🇸' },
        { code: '+33', country: 'FR', flag: '🇫🇷' },
        { code: '+44', country: 'UK', flag: '🇬🇧' },
        { code: '+49', country: 'DE', flag: '🇩🇪' },
        { code: '+39', country: 'IT', flag: '🇮🇹' },
        { code: '+34', country: 'ES', flag: '🇪🇸' },
        { code: '+213', country: 'DZ', flag: '🇩🇿' },
        { code: '+212', country: 'MA', flag: '🇲🇦' },
    ];

    const [countryCode, setCountryCode] = useState('+216');
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const numericValue = value.replace(/[^0-9]/g, '').slice(0, 8);
            setPhoneNumber(numericValue);
            setRegisterData({ ...registerData, phone: `${countryCode}${numericValue}` });
        } else if (name === 'countryCode') {
            setCountryCode(value);
            setRegisterData({ ...registerData, phone: `${value}${phoneNumber}` });
        } else {
            setRegisterData({ ...registerData, [name]: value });
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-black text-white">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-12 lg:px-24 py-12 relative z-10 bg-background lg:bg-black">
                <div className="max-w-md mx-auto w-full">
                    {/* Logo */}
                    <Link href="/" className="inline-flex items-center gap-2 mb-12 hover:opacity-80 transition-opacity">
                        <Camera className="w-8 h-8 text-primary" />
                        <span className="font-bold text-2xl tracking-tighter text-white">LUMIÈRE</span>
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2 tracking-tight text-white">
                            {mode === 'login' ? 'Welcome back' : 'Create an account'}
                        </h1>
                        <p className="text-gray-400">
                            {mode === 'login'
                                ? 'Sign in to continue to your account'
                                : 'Join our community of photographers'}
                        </p>
                    </div>

                    {/* Google Login */}
                    <div className="mb-8">
                        <div className="w-full overflow-hidden rounded-lg">
                            <GoogleLogin
                                onSuccess={(credentialResponse) => {
                                    login(credentialResponse);
                                    router.push('/');
                                }}
                                onError={() => {
                                    console.log('Login Failed');
                                    toast.error('Google Login Failed');
                                }}
                                theme="filled_black"
                                size="large"
                                width="100%"
                                text="continue_with"
                                shape="rect"
                            />
                        </div>
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-800" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-black px-4 text-gray-500">or continue with email</span>
                        </div>
                    </div>

                    {mode === 'login' ? (
                        <form onSubmit={handleLoginSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-200">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                    <input
                                        type="email"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-white placeholder-gray-600"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-200">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-white placeholder-gray-600"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3.5 text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <div className="flex justify-end">
                                    <button type="button" className="text-sm text-primary hover:text-blue-400 font-medium transition-colors">
                                        Forgot password?
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 mt-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-200">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={registerData.firstName}
                                        onChange={handleRegisterChange}
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-primary text-white placeholder-gray-600"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-200">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={registerData.lastName}
                                        onChange={handleRegisterChange}
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-primary text-white placeholder-gray-600"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-200">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={registerData.email}
                                        onChange={handleRegisterChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-primary text-white placeholder-gray-600"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-200">Phone</label>
                                <div className="relative flex">
                                    <div className="absolute left-3 top-3.5 z-10 w-5 h-5 flex items-center justify-center pointer-events-none text-gray-400">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <select
                                        name="countryCode"
                                        value={countryCode}
                                        onChange={handleRegisterChange}
                                        className="w-[110px] pl-10 pr-2 py-3 bg-gray-900 border border-r-0 border-gray-800 rounded-l-lg focus:outline-none focus:border-primary text-white text-sm appearance-none cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
                                    >
                                        {countryCodes.map((c) => (
                                            <option key={c.country} value={c.code}>
                                                {c.flag} {c.code}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={phoneNumber}
                                        onChange={handleRegisterChange}
                                        maxLength={8}
                                        className="flex-1 px-4 py-3 bg-gray-900 border border-gray-800 rounded-r-lg focus:outline-none focus:border-primary text-white placeholder-gray-600"
                                        placeholder="00 000 000"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-200">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={registerData.password}
                                        onChange={handleRegisterChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-primary text-white placeholder-gray-600"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-200">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={registerData.confirmPassword}
                                        onChange={handleRegisterChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-primary text-white placeholder-gray-600"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center">
                        <p className="text-gray-400">
                            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                className="text-primary hover:text-blue-400 font-medium transition-colors"
                            >
                                {mode === 'login' ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block lg:w-1/2 relative bg-gray-900">
                <img
                    src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                    alt="Camera Lens"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />

                <div className="absolute bottom-12 left-12 right-12">
                    <h2 className="text-4xl font-bold text-white mb-4">"Capture moments that last forever"</h2>
                    <p className="text-gray-300 text-lg">Join the world's best community for photographers and gear enthusiasts.</p>
                </div>
            </div>
        </div>
    );
}
