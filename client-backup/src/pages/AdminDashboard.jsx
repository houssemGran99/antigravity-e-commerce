import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            setProducts(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await fetch(`/api/products/${id}`, {
                    method: 'DELETE',
                });
                setProducts(products.filter(product => product._id !== id));
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <div className="text-2xl">Loading Dashboard...</div>
            </div>
        );
    }

    return (
        <div className="pt-10 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
                    <div className="flex gap-4">
                        <Link to="/admin/brands" className="bg-dark-800 hover:bg-dark-700 border border-white/10 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all">
                            Manage Brands
                        </Link>
                        <Link to="/admin/users" className="bg-dark-800 hover:bg-dark-700 border border-white/10 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all">
                            Manage Users
                        </Link>
                        <Link to="/admin/orders" className="bg-dark-800 hover:bg-dark-700 border border-white/10 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all">
                            Manage Orders
                        </Link>
                        <Link to="/admin/categories" className="bg-dark-800 hover:bg-dark-700 border border-white/10 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all">
                            Manage Categories
                        </Link>
                        <Link to="/admin/new" className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
                            <Plus className="w-5 h-5" />
                            Add New Product
                        </Link>
                    </div>
                </div>

                <div className="bg-dark-800 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-400">
                            <thead className="bg-dark-900/50 text-white uppercase text-sm font-bold">
                                <tr>
                                    <th className="p-6">Product</th>
                                    <th className="p-6">Brand</th>
                                    <th className="p-6">Price</th>
                                    <th className="p-6 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-6 flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-dark-900 border border-white/5">
                                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-bold text-white text-lg">{product.name}</span>
                                        </td>
                                        <td className="p-6">{product.brand?.name || product.brand}</td>
                                        <td className="p-6 font-mono text-white">${product.price}</td>
                                        <td className="p-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link to={`/product/${product._id}`} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="View">
                                                    <Eye className="w-5 h-5" />
                                                </Link>
                                                <Link to={`/admin/edit/${product._id}`} className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-400 hover:text-blue-300 transition-colors" title="Edit">
                                                    <Edit className="w-5 h-5" />
                                                </Link>
                                                <button onClick={() => handleDelete(product._id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 hover:text-red-300 transition-colors" title="Delete">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
