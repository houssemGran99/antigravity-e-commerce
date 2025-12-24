import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [loading, setLoading] = useState(true);

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
        // Fetch Products with filters and search
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams(window.location.search);
                const search = params.get('search');

                if (selectedCategory) params.append('category', selectedCategory);
                if (selectedBrand) params.append('brand', selectedBrand);
                // Note: window.location.search already contains 'search' if present, but we need to ensure state sync or manual append
                // Actually, mixing state-based filters (category/brand) with URL-based search can be tricky if not unified.
                // Let's rely on constructing new params from state + URL search.

                const apiParams = new URLSearchParams();
                if (selectedCategory) apiParams.append('category', selectedCategory);
                if (selectedBrand) apiParams.append('brand', selectedBrand);
                if (search) apiParams.append('search', search);

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
    }, [selectedCategory, selectedBrand, window.location.search]); // Listen to URL changes for search

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
                                    onClick={() => setSelectedCategory('')}
                                    className={`block text-left w-full px-2 py-1 rounded transition-colors ${selectedCategory === '' ? 'text-primary font-bold' : 'text-gray-400 hover:text-white'}`}
                                >
                                    All Categories
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat._id}
                                        onClick={() => setSelectedCategory(cat._id)}
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
                                    onClick={() => setSelectedBrand('')}
                                    className={`block text-left w-full px-2 py-1 rounded transition-colors ${selectedBrand === '' ? 'text-primary font-bold' : 'text-gray-400 hover:text-white'}`}
                                >
                                    All Brands
                                </button>
                                {brands.map(brand => (
                                    <button
                                        key={brand._id}
                                        onClick={() => setSelectedBrand(brand._id)}
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

export default Shop;
