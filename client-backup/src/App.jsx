import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Profile from './pages/Profile';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import AdminDashboard from './pages/AdminDashboard';
import AdminCategories from './pages/AdminCategories';
import AdminBrands from './pages/AdminBrands';
import AdminUsers from './pages/AdminUsers'; // Import AdminUsers
import AdminOrders from './pages/AdminOrders';
import ProductForm from './pages/ProductForm';
import AdminLogin from './pages/AdminLogin'; // Import AdminLogin
import CartContext from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartContext>
                    <div className="min-h-screen bg-dark-900 text-white">
                        <Navbar />
                        <main>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/shop" element={<Shop />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/product/:id" element={<ProductDetails />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/checkout" element={
                                    <ProtectedRoute>
                                        <Checkout />
                                    </ProtectedRoute>
                                } />
                                <Route path="/order/success/:id" element={
                                    <ProtectedRoute>
                                        <OrderSuccess />
                                    </ProtectedRoute>
                                } />

                                {/* Admin Login Route */}
                                <Route path="/admin/login" element={<AdminLogin />} />

                                {/* Admin Routes */}
                                <Route path="/admin" element={
                                    <ProtectedRoute adminOnly>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/users" element={
                                    <ProtectedRoute adminOnly>
                                        <AdminUsers />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/orders" element={
                                    <ProtectedRoute adminOnly>
                                        <AdminOrders />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/categories" element={
                                    <ProtectedRoute adminOnly>
                                        <AdminCategories />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/brands" element={
                                    <ProtectedRoute adminOnly>
                                        <AdminBrands />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/new" element={
                                    <ProtectedRoute adminOnly>
                                        <ProductForm />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/edit/:id" element={
                                    <ProtectedRoute adminOnly>
                                        <ProductForm />
                                    </ProtectedRoute>
                                } />
                            </Routes>
                        </main>
                    </div>
                </CartContext>
            </AuthProvider>
        </Router>
    );
}

export default App;
