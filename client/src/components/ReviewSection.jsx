'use client';

import React, { useState } from 'react';
import { Star, User, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ReviewSection = ({ productId, reviews = [], rating, numReviews }) => {
    const { user } = useAuth();
    const [comment, setComment] = useState('');
    const [userRating, setUserRating] = useState(5);
    const [loading, setLoading] = useState(false);

    // We'll optimistically update the UI or just reload the page for MVP simplicity
    // But ideally we'd update the list locally. For now, let's trigger a refresh.
    const [localReviews, setLocalReviews] = useState(reviews);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ rating: userRating, comment }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Review Submitted!');
                setComment('');
                setUserRating(5);
                // For simplicity, reload to see changes or we could append to localReviews
                window.location.reload();
            } else {
                toast.error(data.message || 'Error submitting review');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-20 border-t border-white/10 pt-12">
            <h2 className="text-3xl font-bold text-white mb-8">Reviews</h2>

            {localReviews.length === 0 && (
                <div className="bg-white/5 rounded-xl p-6 text-center text-gray-400 mb-8 border border-white/5">
                    No reviews yet. Be the first to review this product!
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* List of Reviews */}
                <div className="space-y-6">
                    {localReviews.map((review) => (
                        <div key={review._id} className="bg-dark-800 p-6 rounded-xl border border-white/5">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-white">{review.name}</span>
                                </div>
                                <div className="flex text-yellow-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-600'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 mb-3 ml-13">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                            <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                        </div>
                    ))}
                </div>

                {/* Review Form */}
                <div>
                    <div className="bg-dark-800 p-8 rounded-2xl border border-white/5 sticky top-24">
                        <h3 className="text-xl font-bold text-white mb-6">Write a Customer Review</h3>
                        {user ? (
                            <form onSubmit={submitHandler} className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Rating</label>
                                    <select
                                        value={userRating}
                                        onChange={(e) => setUserRating(Number(e.target.value))}
                                        className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                    >
                                        <option value="1">1 - Poor</option>
                                        <option value="2">2 - Fair</option>
                                        <option value="3">3 - Good</option>
                                        <option value="4">4 - Very Good</option>
                                        <option value="5">5 - Excellent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Comment (Optional)</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows="4"
                                        className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none"
                                        placeholder="Share your thoughts about this product..."
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Review'}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-400 mb-4">Please sign in to write a review</p>
                                <a href="/login" className="inline-block bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg transition-colors">
                                    Sign In
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewSection;
