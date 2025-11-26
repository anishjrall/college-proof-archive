import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Admin({ user, onLogout }) {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalProofs: 0, totalEvents: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
        fetchUsers();
    }, []);

    const fetchStats = async () => {
        try {
            console.log('📊 Fetching admin stats...');
            const response = await fetch('http://localhost:5000/api/admin/stats');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📊 Stats received:', data);
            setStats(data);
        } catch (error) {
            console.error('❌ Stats fetch error:', error);
            setError('Failed to load statistics');
            // Set default stats if API fails
            setStats({ totalUsers: 0, totalProofs: 0, totalEvents: 0 });
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            console.log('👥 Fetching users...');
            const response = await fetch('http://localhost:5000/api/admin/users');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('👥 Users received:', data);
            setUsers(data);
        } catch (error) {
            console.error('❌ Users fetch error:', error);
            setError('Failed to load users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        if (!window.confirm(`Change this user's role to ${newRole}?`)) return;

        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error);
            }

            alert('User role updated successfully!');
            fetchUsers(); // Refresh the list
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const getRoleBadge = (role) => {
        const roleConfig = {
            admin: { color: 'bg-red-100 text-red-800', label: '👑 Admin' },
            staff: { color: 'bg-blue-100 text-blue-800', label: '👨‍🏫 Staff' },
            student: { color: 'bg-green-100 text-green-800', label: '🎓 Student' }
        };
        const config = roleConfig[role] || roleConfig.student;
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-8">
                            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                            <nav className="flex space-x-4">
                                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                                <Link to="/admin" className="text-blue-600 font-semibold">Admin</Link>
                            </nav>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Welcome, {user.name}</span>
                            <button
                                onClick={onLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Users</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Proofs</h3>
                        <p className="text-3xl font-bold text-green-600">{stats.totalProofs}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Events</h3>
                        <p className="text-3xl font-bold text-purple-600">{stats.totalEvents}</p>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border">
                    <div className="px-6 py-4 border-b flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
                        <button
                            onClick={fetchUsers}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center">
                                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                            <p className="mt-2 text-gray-600">Loading users...</p>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                ) : users.map(userItem => (
                                    <tr key={userItem.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{userItem.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{userItem.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getRoleBadge(userItem.role)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(userItem.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={userItem.role}
                                                onChange={(e) => handleRoleUpdate(userItem.id, e.target.value)}
                                                className="text-sm border border-gray-300 rounded px-2 py-1"
                                            >
                                                <option value="student">Student</option>
                                                <option value="staff">Staff</option>
                                                <option value="admin">Admin</option>
                                            </select>
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
}

export default Admin;