'use client';

import React, { useContext, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Camera, Menu, Search } from 'lucide-react';
import { CartState } from '../context/CartContext';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { cart } = useContext(CartState);
    const { user, login, logout } = useAuth();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/shop?search=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href={user?.isAdmin ? "/admin" : "/"} className="flex items-center gap-2 font-bold text-2xl tracking-tighter text-white">
                            <Camera className="w-8 h-8 text-primary" />
                            <span>LUMIÈRE</span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-8">
                            {!user?.isAdmin && (
                                <>
                                    <Link href="/" className="text-gray-300 hover:text-primary transition-colors px-3 py-2 rounded-md font-medium">Home</Link>
                                    <Link href="/shop" className="text-gray-300 hover:text-primary transition-colors px-3 py-2 rounded-md font-medium">Shop</Link>
                                </>
                            )}



                            {!user?.isAdmin && (
                                <form onSubmit={handleSearch} className="relative">
                                    <input
                                        name="search"
                                        type="text"
                                        placeholder="Search cameras..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-dark-800 border border-white/10 rounded-full py-1.5 px-4 pl-10 text-sm focus:outline-none focus:border-primary w-48 transition-all focus:w-64 text-white placeholder-gray-500"
                                    />
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </form>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link href="/profile" className="flex items-center gap-3 hover:bg-white/5 p-1.5 rounded-full pr-4 transition-colors group">
                                    {/* Using standard img to avoid next/image config issues for external google urls initially */}
                                    <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-white/20 group-hover:border-primary transition-colors" />
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{user.name}</span>
                                </Link>
                                <button onClick={logout} className="text-sm text-gray-400 hover:text-white transition-colors ml-2">Logout</button>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-lg">
                                <GoogleLogin
                                    onSuccess={credentialResponse => {
                                        login(credentialResponse);
                                    }}
                                    onError={() => {
                                        console.log('Login Failed');
                                    }}
                                    theme="filled_black"
                                    size="medium"
                                    shape="pill"
                                />
                            </div>
                        )}

                        {!user?.isAdmin && (
                            <Link href="/cart" className="relative p-2 hover:bg-white/5 rounded-full transition-colors text-white">
                                <ShoppingBag className="w-6 h-6" />
                                {cart.length > 0 && (
                                    <span className="absolute top-0 right-0 bg-primary text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full text-white">
                                        {cart.length}
                                    </span>
                                )}
                            </Link>
                        )}
                        <button className="md:hidden p-2 text-white">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
