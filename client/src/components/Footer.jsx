'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
    const { user } = useAuth();

    if (user?.isAdmin) {
        return null;
    }

    return (
        <footer className="bg-muted border-t border-border pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tighter text-foreground">
                            <Camera className="w-8 h-8 text-primary" />
                            <span>LUMIÈRE</span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Capturing life's most precious moments with precision and style. We offer the finest selection of premium photography equipment for professionals and enthusiasts alike.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-foreground font-bold text-lg mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">Home</Link></li>
                            <li><Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors text-sm">Shop</Link></li>
                            <li><Link href="/cart" className="text-muted-foreground hover:text-primary transition-colors text-sm">Cart</Link></li>
                            <li><Link href="/profile" className="text-muted-foreground hover:text-primary transition-colors text-sm">My Account</Link></li>
                        </ul>
                    </div>

                    {/* About Section (Moved from Navbar) */}
                    <div>
                        <h3 className="text-foreground font-bold text-lg mb-6">About Us</h3>
                        <ul className="space-y-3">
                            <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">Our Story</Link></li>
                            <li><Link href="/about#careers" className="text-muted-foreground hover:text-primary transition-colors text-sm">Careers</Link></li>
                            <li><Link href="/about#terms" className="text-muted-foreground hover:text-primary transition-colors text-sm">Terms & Conditions</Link></li>
                            <li><Link href="/about#privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-foreground font-bold text-lg mb-6">Contact</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-muted-foreground text-sm">
                                <MapPin className="w-5 h-5 text-primary shrink-0" />
                                <span>123 Camera Boulevard,<br />Photography District, NY 10001</span>
                            </li>
                            <li className="flex items-center gap-3 text-muted-foreground text-sm">
                                <Phone className="w-4 h-4 text-primary shrink-0" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-3 text-muted-foreground text-sm">
                                <Mail className="w-4 h-4 text-primary shrink-0" />
                                <span>hello@lumiere.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-muted-foreground text-sm">
                        © {new Date().getFullYear()} Lumière Camera Shop. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Facebook"><Facebook className="w-5 h-5" /></a>
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter"><Twitter className="w-5 h-5" /></a>
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram"><Instagram className="w-5 h-5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
