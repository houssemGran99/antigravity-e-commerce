'use client';

import React, { useState } from 'react';
import { Star, User, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ReviewSection = ({ productId, reviews = [], rating, numReviews }) => {
    const { user } = useAuth();
    const [comment, setComment] = useState('');
    const [userRating, setUserRating] = useState(5);
    const [loading, setLoading] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [reviewToDelete, setReviewToDelete] = useState(null);

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

    const handleReplySubmit = async (reviewId) => {
        if (!replyText.trim()) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/products/${productId}/reviews/${reviewId}/reply`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ reply: replyText }),
            });

            if (res.ok) {
                toast.success('Reply submitted');
                setReplyText('');
                setReplyingTo(null);
                // Optimistically update
                const updatedReviews = localReviews.map(r =>
                    r._id === reviewId ? { ...r, adminReply: replyText } : r
                );
                setLocalReviews(updatedReviews);
            } else {
                toast.error('Failed to submit reply');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (reviewId) => {
        setReviewToDelete(reviewId);
    };

    const confirmDeleteReview = async () => {
        if (!reviewToDelete) return;

        // Optimistically remove
        const previousReviews = [...localReviews];
        setLocalReviews(localReviews.filter(r => r._id !== reviewToDelete));
        const idToDelete = reviewToDelete;
        setReviewToDelete(null);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/products/${productId}/reviews/${idToDelete}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (res.ok) {
                toast.success('Review deleted');
            } else {
                // Revert if failed
                setLocalReviews(previousReviews);
                toast.error('Failed to delete review');
            }
        } catch (error) {
            console.error(error);
            setLocalReviews(previousReviews);
            toast.error('Something went wrong');
        }
    };

    return (
        <div className="mt-20 border-t border-border pt-12">
            <h2 className="text-3xl font-bold text-foreground mb-8">Reviews</h2>

            {localReviews.length === 0 && (
                <div className="bg-muted rounded-xl p-6 text-center text-muted-foreground mb-8 border border-border">
                    No reviews yet. Be the first to review this product!
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* List of Reviews */}
                <div className="space-y-6">
                    {localReviews.map((review) => (
                        <div key={review._id} className="bg-card p-6 rounded-xl border border-border">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-foreground">{review.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-muted-foreground'}`}
                                            />
                                        ))}
                                    </div>
                                    {user?.isAdmin && (
                                        <button
                                            onClick={() => handleDeleteClick(review._id)}
                                            className="text-red-400 hover:text-red-600 transition-colors p-1"
                                            title="Delete Review"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground mb-3 ml-13">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                            <p className="text-muted-foreground leading-relaxed mb-4">{review.comment}</p>

                            {/* Admin Reply Display */}
                            {review.adminReply && (
                                <div className="mt-4 ml-6 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                                    <p className="text-xs font-bold text-primary mb-1">Response from Store</p>
                                    <p className="text-sm text-foreground">{review.adminReply}</p>
                                </div>
                            )}

                            {/* Admin Reply Form */}
                            {user?.isAdmin && !review.adminReply && (
                                <div className="mt-4 border-t border-border pt-4">
                                    {replyingTo === review._id ? (
                                        <div className="space-y-3 animate-fade-in">
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Write a reply..."
                                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                                                rows="3"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleReplySubmit(review._id)}
                                                    disabled={loading}
                                                    className="bg-primary hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    {loading ? 'Sending...' : 'Send Reply'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setReplyingTo(null);
                                                        setReplyText('');
                                                    }}
                                                    className="bg-muted hover:bg-muted/80 text-foreground text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setReplyingTo(review._id)}
                                            className="text-primary hover:text-blue-500 text-sm font-medium transition-colors"
                                        >
                                            Reply to Customer
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Review Form */}
                {!user?.isAdmin && (
                    <div>
                        <div className="bg-card p-8 rounded-2xl border border-border sticky top-24">
                            <h3 className="text-xl font-bold text-foreground mb-6">Write a Customer Review</h3>
                            {user ? (
                                <form onSubmit={submitHandler} className="space-y-4">
                                    <div>
                                        <label className="block text-muted-foreground text-sm mb-2">Rating</label>
                                        <select
                                            value={userRating}
                                            onChange={(e) => setUserRating(Number(e.target.value))}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors [&>option]:bg-card [&>option]:text-foreground"                                        >
                                            <option value="1">1 - Poor</option>
                                            <option value="2">2 - Fair</option>
                                            <option value="3">3 - Good</option>
                                            <option value="4">4 - Very Good</option>
                                            <option value="5">5 - Excellent</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-muted-foreground text-sm mb-2">Comment (Optional)</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            rows="4"
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
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
                                    <p className="text-muted-foreground mb-4">Please sign in to write a review</p>
                                    <a href="/login" className="inline-block bg-muted hover:bg-muted/80 text-foreground px-6 py-2 rounded-lg transition-colors">
                                        Sign In
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Review Delete Confirmation Modal */}
                {reviewToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                        <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl p-6 animate-zoom-in-95">
                            <div className="flex flex-col items-center text-center p-4">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">Delete Review?</h3>
                                <p className="text-muted-foreground mb-6">
                                    Are you sure you want to delete this review? This action cannot be undone.
                                </p>
                                <div className="flex gap-4 w-full">
                                    <button
                                        onClick={() => setReviewToDelete(null)}
                                        className="flex-1 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDeleteReview}
                                        className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-lg shadow-red-600/20"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
