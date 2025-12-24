import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { CartState } from '../context/CartContext';

const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart } = useContext(CartState);
    const [product, setProduct] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [added, setAdded] = React.useState(false);

    React.useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/products/${id}`);
                if (!response.ok) {
                    throw new Error('Product not found');
                }
                const data = await response.json();
                setProduct(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <div className="text-2xl">Loading...</div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <div className="text-2xl text-red-500">Error: {error || 'Product not found'}</div>
            </div>
        );
    }

    return (
        <div className="pt-10 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Section */}
                    <div className="bg-dark-800 rounded-2xl overflow-hidden p-8 border border-white/5">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-auto rounded-lg shadow-2xl" />
                    </div>

                    {/* Details Section */}
                    <div>
                        <div className="mb-6">
                            <h2 className="text-primary font-bold tracking-wide uppercase mb-2">{product.brand?.name || product.brand}</h2>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{product.name}</h1>
                            <p className="text-3xl text-white font-light">${product.price}</p>
                        </div>

                        <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                            {product.description}
                        </p>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-dark-800 p-4 rounded-xl text-center border border-white/5">
                                <p className="text-gray-400 text-sm mb-1">Resolution</p>
                                <p className="font-bold text-white">{product.specs.resolution}</p>
                            </div>
                            <div className="bg-dark-800 p-4 rounded-xl text-center border border-white/5">
                                <p className="text-gray-400 text-sm mb-1">Video</p>
                                <p className="font-bold text-white">{product.specs.video}</p>
                            </div>
                            <div className="bg-dark-800 p-4 rounded-xl text-center border border-white/5">
                                <p className="text-gray-400 text-sm mb-1">Sensor</p>
                                <p className="font-bold text-white">{product.specs.sensor}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className={`w-full font-bold py-4 rounded-xl text-lg transition-all shadow-lg ${added
                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/20'
                                : 'bg-primary hover:bg-blue-600 text-white shadow-primary/20'
                                }`}
                        >
                            {added ? 'Added to Cart!' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
