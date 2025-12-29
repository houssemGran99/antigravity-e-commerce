'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const ShopClient = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [selectedResolution, setSelectedResolution] = useState(searchParams.get('resolution') || '');
    const [page, setPage] = useState(Number(searchParams.get('pageNumber')) || 1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const updateFilters = (key, value) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));

        if (!value) {
            current.delete(key);
        } else {
            current.set(key, value);
        }

        // Reset to page 1 when changing filters
        if (key !== 'pageNumber') {
            current.set('pageNumber', '1');
            setPage(1);
        } else {
            // If we are just changing page, keep it sync
            setPage(Number(value));
        }

        const search = current.toString();
        const query = search ? `?${search}` : "";

        router.push(`/shop${query}`);
        if (key === 'category') setSelectedCategory(value);
        if (key === 'brand') setSelectedBrand(value);
        if (key === 'minPrice') setMinPrice(value);
        if (key === 'maxPrice') setMaxPrice(value);
        if (key === 'resolution') setSelectedResolution(value);
    };

    // Debounce price update to avoid too many refreshes
    const handlePriceChange = (e, type) => {
        const value = e.target.value;
        if (type === 'min') setMinPrice(value);
        else setMaxPrice(value);
    };

    const applyPriceFilter = () => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        if (minPrice) current.set('minPrice', minPrice);
        else current.delete('minPrice');

        if (maxPrice) current.set('maxPrice', maxPrice);
        else current.delete('maxPrice');

        // Reset to page 1 when applying price filter
        current.set('pageNumber', '1');
        setPage(1);

        router.push(`/shop?${current.toString()}`);
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

    // ... (useEffect for filters)

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const apiParams = new URLSearchParams(searchParams.toString());
                if (!apiParams.has('pageNumber')) apiParams.set('pageNumber', 1);

                const response = await fetch(`/api/products?${apiParams.toString()}`);
                const data = await response.json();

                // Backend now returns { products, page, pages, total }
                if (data.products) {
                    setProducts(data.products);
                    setTotalPages(data.pages);
                    setPage(data.page);
                } else {
                    // Fallback if API hasn't updated or returns array
                    setProducts(Array.isArray(data) ? data : []);
                }
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
                <h1 className="text-4xl font-bold mb-8 text-foreground">Shop</h1>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="w-full md:w-64 bg-card p-6 rounded-2xl border border-border h-fit space-y-8 sticky top-24">
                        {/* Search Filter input removed/not present in view, assuming handled in Navbar */}
                        {/* Price Filter - Enhanced UI */}
                        <div className="bg-muted p-4 rounded-xl border border-border">
                            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <span className="text-primary">$</span> Price Range
                            </h3>
                            <div className="space-y-6">
                                <div className="px-2">
                                    <Slider
                                        range
                                        min={0}
                                        max={10000}
                                        defaultValue={[0, 10000]}
                                        value={[Number(minPrice) || 0, Number(maxPrice) || 10000]}
                                        onChange={(val) => {
                                            setMinPrice(val[0]);
                                            setMaxPrice(val[1]);
                                        }}
                                        step={100}
                                        trackStyle={{ backgroundColor: '#2563eb' }}
                                        handleStyle={{ borderColor: '#2563eb', backgroundColor: '#2563eb' }}
                                        railStyle={{ backgroundColor: 'currentColor', opacity: 0.1 }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Min (TND)</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={minPrice}
                                            onChange={(e) => handlePriceChange(e, 'min')}
                                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Max (TND)</label>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={maxPrice}
                                            onChange={(e) => handlePriceChange(e, 'max')}
                                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={applyPriceFilter}
                                    className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors text-sm shadow-lg shadow-primary/20"
                                >
                                    Apply Filter
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-foreground mb-4">Categories</h3>
                            <div className="space-y-1">
                                <button
                                    onClick={() => updateFilters('category', '')}
                                    className={`block text-left w-full px-3 py-2 rounded-lg transition-all text-sm ${!selectedCategory ? 'bg-primary text-white font-medium shadow-md shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                                >
                                    All Categories
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat._id}
                                        onClick={() => updateFilters('category', cat._id)}
                                        className={`block text-left w-full px-3 py-2 rounded-lg transition-all text-sm ${selectedCategory === cat._id ? 'bg-primary text-white font-medium shadow-md shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-foreground mb-4">Brands</h3>
                            <div className="space-y-1">
                                <button
                                    onClick={() => updateFilters('brand', '')}
                                    className={`block text-left w-full px-3 py-2 rounded-lg transition-all text-sm ${!selectedBrand ? 'bg-primary text-white font-medium shadow-md shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                                >
                                    All Brands
                                </button>
                                {brands.map(brand => (
                                    <button
                                        key={brand._id}
                                        onClick={() => updateFilters('brand', brand._id)}
                                        className={`block text-left w-full px-3 py-2 rounded-lg transition-all text-sm ${selectedBrand === brand._id ? 'bg-primary text-white font-medium shadow-md shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
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
                            <div className="text-center text-foreground py-20">Loading products...</div>
                        ) : products.length === 0 ? (
                            <div className="text-center text-muted-foreground py-20 bg-card rounded-2xl border border-border">
                                No products found matching these filters.
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                                    {products.map((product) => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2">
                                        <button
                                            onClick={() => updateFilters('pageNumber', String(page - 1))}
                                            disabled={page === 1}
                                            className="px-4 py-2 bg-card text-foreground rounded-lg disabled:opacity-50 hover:bg-muted transition-colors border border-border"
                                        >
                                            Previous
                                        </button>

                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => updateFilters('pageNumber', String(i + 1))}
                                                className={`w-10 h-10 rounded-lg font-medium transition-colors ${page === i + 1
                                                    ? 'bg-primary text-white'
                                                    : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => updateFilters('pageNumber', String(page + 1))}
                                            disabled={page === totalPages}
                                            className="px-4 py-2 bg-card text-foreground rounded-lg disabled:opacity-50 hover:bg-muted transition-colors border border-border"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopClient;
