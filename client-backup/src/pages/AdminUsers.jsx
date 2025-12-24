import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Mail, Calendar, Shield, User } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('AdminUsers: Fetching users...');
            const response = await fetch('/api/users', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('AdminUsers: Response status:', response.status);

            if (!response.ok) {
                const errText = await response.text();
                console.error('AdminUsers: Fetch failed', errText);
                setLoading(false);
                return;
            }

            const data = await response.json();
            console.log('AdminUsers: Data received:', data);
            setUsers(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <div className="text-2xl animate-pulse">Loading Users...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/admin" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-4xl font-bold text-white">Manage Users</h1>
                </div>

                <div className="bg-dark-800 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-400">
                            <thead className="bg-dark-900/50 text-white uppercase text-sm font-bold">
                                <tr>
                                    <th className="p-6">User</th>
                                    <th className="p-6">Email</th>
                                    <th className="p-6">Role</th>
                                    <th className="p-6">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-6 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg border border-white/10">
                                                {user.picture ? (
                                                    <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{user.name ? user.name.charAt(0).toUpperCase() : <User />}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-lg">{user.name || 'Admin User'}</div>
                                                <div className="text-sm text-gray-500">@{user.username || 'google_user'}</div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-500" />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${user.isAdmin ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                                                {user.isAdmin ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                                {user.isAdmin ? 'Admin' : 'Customer'}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 font-mono text-sm">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                {new Date(user.createdAt).toLocaleDateString()}
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

export default AdminUsers;
