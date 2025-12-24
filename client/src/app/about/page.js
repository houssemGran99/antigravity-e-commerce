import React from 'react';

export default function About() {
    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-white">
            <h1 className="text-4xl font-bold mb-8">About Lumière</h1>
            <div className="bg-dark-800 p-8 rounded-2xl border border-white/10">
                <p className="text-lg text-gray-300 mb-4">
                    Welcome to Lumière, your premier destination for professional photography equipment.
                    We are passionate about capturing moments and empowering creators with the best tools in the industry.
                </p>
                <p className="text-lg text-gray-300">
                    Founded in 2024, we curate a selection of cameras, lenses, and accessories from top brands like
                    Canon, Nikon, Sony, and Fujifilm. Whether you are a seasoned professional or just starting your journey,
                    we are here to support your creative vision.
                </p>
            </div>
        </div>
    );
}
