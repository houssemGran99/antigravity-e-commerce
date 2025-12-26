import React, { Suspense } from 'react';
import AddToCartButton from '../../../components/AddToCartButton';
import ProductCard from '../../../components/ProductCard';
import ProductImage from '../../../components/ProductImage';
import ReviewSection from '../../../components/ReviewSection';
// We use a simple fetch to get data

async function getProduct(id) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://antigravity-e-commerce-uv1a.vercel.app';
    const url = `${apiUrl}/api/products/${id}`;
    console.log(`[ProductDetails] Fetching: ${url}`);
    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
            console.error(`[ProductDetails] Failed to fetch: ${res.status} ${res.statusText}`);
            return null;
        }
        return res.json();
    } catch (e) {
        console.error('[ProductDetails] Error:', e);
        return null;
    }
}

async function getSimilarProducts(id) {
    if (!id) return [];
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://antigravity-e-commerce-uv1a.vercel.app';
        const res = await fetch(`${apiUrl}/api/products/${id}/related`, { cache: 'no-store' });
        if (!res.ok) return [];
        return res.json();
    } catch (e) {
        console.error('Error fetching similar products:', e);
        return [];
    }
}

export async function generateMetadata({ params }) {
    const product = await getProduct((await params).id);
    return {
        title: product ? `${product.name} | Lumière` : 'Product Not Found',
    };
}

export default async function ProductPage({ params }) {
    const { id } = await params;
    const product = await getProduct(id);
    const similarProducts = product ? await getSimilarProducts(id) : [];

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <div className="text-2xl text-red-500">Product not found</div>
            </div>
        );
    }

    return (
        <div className="pt-10 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Section */}
                    <div className="bg-dark-800 rounded-2xl overflow-hidden p-8 border border-white/5">
                        <ProductImage src={product.imageUrl} alt={product.name} />
                    </div>

                    {/* Details Section */}
                    <div>
                        <div className="mb-6">
                            <h2 className="text-primary font-bold tracking-wide uppercase mb-2">{product.brand?.name || product.brand}</h2>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{product.name}</h1>
                            <p className="text-3xl text-white font-light">{product.price} TND</p>
                        </div>

                        <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                            {product.description}
                        </p>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-dark-800 p-4 rounded-xl text-center border border-white/5">
                                <p className="text-gray-400 text-sm mb-1">Resolution</p>
                                <p className="font-bold text-white">{product.specs?.resolution || 'N/A'}</p>
                            </div>
                            <div className="bg-dark-800 p-4 rounded-xl text-center border border-white/5">
                                <p className="text-gray-400 text-sm mb-1">Video</p>
                                <p className="font-bold text-white">{product.specs?.video || 'N/A'}</p>
                            </div>
                            <div className="bg-dark-800 p-4 rounded-xl text-center border border-white/5">
                                <p className="text-gray-400 text-sm mb-1">Sensor</p>
                                <p className="font-bold text-white">{product.specs?.sensor || 'N/A'}</p>
                            </div>
                        </div>

                        <AddToCartButton product={product} />
                    </div>
                </div>

                {/* Reviews Section */}
                <ReviewSection
                    productId={product._id}
                    reviews={product.reviews}
                    rating={product.rating}
                    numReviews={product.numReviews}
                />

                {/* Similar Products Section */}
                {similarProducts.length > 0 && (
                    <div className="mt-20 border-t border-white/10 pt-12">
                        <h2 className="text-3xl font-bold text-white mb-8">Similar Products</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {similarProducts.map((p) => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
