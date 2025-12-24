import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
    return (
        <div className="relative overflow-hidden bg-dark-900 py-24 sm:py-32">
            <div className="absolute inset-0 z-0">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl opacity-50"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                    <span className="block text-white">Capture the World</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">In Perfect Detail</span>
                </h1>
                <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                    Discover our curated collection of professional-grade cameras and lenses.
                    Designed for creators who demand excellence.
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/shop" className="group flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-full font-semibold transition-all">
                        Shop Collection
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-semibold transition-all backdrop-blur-sm">
                        Learn More
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Hero;
