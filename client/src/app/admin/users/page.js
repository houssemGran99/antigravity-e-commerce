'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Users } from 'lucide-react';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            // Ensure data is an array before setting state
            setUsers(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
            setLoading(false);
        }
    };



    const filteredUsers = users.filter(user =>
        !user.isAdmin &&
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="text-foreground text-center pt-20">Loading...</div>;

    return (
        <div className="pt-10 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href="/admin" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary" />
                        Manage Users
                    </h1>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-card border border-border rounded-lg py-2 pl-10 pr-4 text-foreground focus:outline-none focus:border-primary w-full md:w-64"
                        />
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                </div>

                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-muted-foreground">
                            <thead className="bg-muted/50 text-foreground uppercase text-xs font-bold">
                                <tr>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Phone</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-muted/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {user.picture && !user.imgError ? (
                                                    <img
                                                        src={user.picture}
                                                        alt={user.name}
                                                        className="w-8 h-8 rounded-full object-cover border border-border"
                                                        referrerPolicy="no-referrer"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.parentElement.querySelector('.fallback-avatar').style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground font-bold text-xs border border-border fallback-avatar ${user.picture && !user.imgError ? 'hidden' : 'flex'}`}>
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-foreground">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">{user.email}</td>
                                        <td className="p-4 text-muted-foreground">{user.phone || '-'}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${user.isAdmin
                                                ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                                                : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                                }`}>
                                                {user.isAdmin ? 'ADMIN' : 'USER'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-muted-foreground">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
