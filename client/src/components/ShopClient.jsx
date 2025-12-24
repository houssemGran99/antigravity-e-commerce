'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';

const ShopClient = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
    const [loading, setLoading] = useState(true);

    const updateFilters = (key, value) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));

        if (!value) {
            current.delete(key);
        } else {
            current.set(key, value);
        }

        const search = current.toString();
        const query = search ? `?${search}` : "";

        router.push(`/shop${query}`);
        if (key === 'category') setSelectedCategory(value);
        if (key === 'brand') setSelectedBrand(value);
    };

    useEffect(() => {
        // Fetch Filters
        const fetchFilters = async () => {
            try {
                const [catRes, brandRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/brands')
                ]);
                setCategories(await catRes.json());
                setBrands(await brandRes.json());
            } catch (error) {
                console.error('Error fetching filters:', error);
            }
        };
        fetchFilters();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Construct query directly from searchParams to ensure sync
                const apiParams = new URLSearchParams(searchParams.toString());
                // ensure we are hitting the backend
                const response = await fetch(`/api/products?${apiParams.toString()}`);
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchParams]);

    return (
        <div className="pt-10 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold mb-8 text-white">Shop</h1>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="w-full md:w-64 bg-dark-800 p-6 rounded-2xl border border-white/5 h-fit">
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-white mb-4">Categories</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => updateFilters('category', '')}
                                    className={`block text-left w-full px-2 py-1 rounded transition-colors ${!selectedCategory ? 'text-primary font-bold' : 'text-gray-400 hover:text-white'}`}
                                >
                                    All Categories
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat._id}
                                        onClick={() => updateFilters('category', cat._id)}
                                        className={`block text-left w-full px-2 py-1 rounded transition-colors ${selectedCategory === cat._id ? 'text-primary font-bold' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">Brands</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => updateFilters('brand', '')}
                                    className={`block text-left w-full px-2 py-1 rounded transition-colors ${!selectedBrand ? 'text-primary font-bold' : 'text-gray-400 hover:text-white'}`}
                                >
                                    All Brands
                                </button>
                                {brands.map(brand => (
                                    <button
                                        key={brand._id}
                                        onClick={() => updateFilters('brand', brand._id)}
                                        className={`block text-left w-full px-2 py-1 rounded transition-colors ${selectedBrand === brand._id ? 'text-primary font-bold' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        {brand.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="text-center text-white py-20">Loading products...</div>
                        ) : products.length === 0 ? (
                            <div className="text-center text-gray-500 py-20 bg-dark-800 rounded-2xl border border-white/5">
                                No products found matching these filters.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopClient;
