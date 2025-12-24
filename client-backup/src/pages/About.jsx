import React from 'react';
import { Camera, Shield, Truck, Users } from 'lucide-react';

const About = () => {
    return (
        <div className="pt-10 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Capturing Moments, <span className="text-primary">Inspiring Creators</span></h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        We are passionate about photography and dedicated to providing the best gear for professionals and enthusiasts alike.
                    </p>
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
                    <div>
                        <img
                            src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                            alt="Camera Lens"
                            className="rounded-2xl shadow-2xl border border-white/10"
                        />
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-white">Our Story</h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Founded in 2024, Lumière started as a small project by a group of photography lovers who wanted to make high-quality camera gear accessible to everyone. We believe that the right tool can unlock your creative potential.
                        </p>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Today, we offer a curated selection of the world's best cameras, lenses, and accessories, backed by expert advice and support.
                        </p>
                    </div>
                </div>

                {/* Values Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-dark-800 p-8 rounded-2xl border border-white/5 text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Shield className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Quality Guarantee</h3>
                        <p className="text-gray-400">All our products are genuine and come with official warranties.</p>
                    </div>
                    <div className="bg-dark-800 p-8 rounded-2xl border border-white/5 text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Truck className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Fast Shipping</h3>
                        <p className="text-gray-400">We ship worldwide with secure packaging and tracking.</p>
                    </div>
                    <div className="bg-dark-800 p-8 rounded-2xl border border-white/5 text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Expert Support</h3>
                        <p className="text-gray-400">Our team of photographers is here to help you choose the right gear.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
