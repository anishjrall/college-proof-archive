import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Search({ user }) {
    const [proofs, setProofs] = useState([]);
    const [studentUSN, setStudentUSN] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Load all documents initially
        fetchProofs();
    }, []);

    // In Search.js - UPDATE the fetchProofs function:
    const fetchProofs = async (usn = '') => {
        setLoading(true);
        setError('');

        const params = new URLSearchParams();
        if (usn && usn.trim() !== '') {
            params.append('studentUSN', usn.trim()); // 🔥 Trim the USN
        }
        params.append('userId', user.id);
        params.append('userRole', user.role);

        try {
            console.log(`🔍 Sending search request for USN: "${usn}"`);
            const response = await fetch(`http://localhost:5000/api/search?${params}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log(`🔍 Received ${data.length} results`);

            if (Array.isArray(data)) {
                setProofs(data);
            } else {
                setProofs([]);
            }
        } catch (error) {
            console.error('❌ Search error:', error);
            setError(error.message || 'Failed to load search results');
            setProofs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProofs(studentUSN);
    };

    const clearSearch = () => {
        setStudentUSN('');
        fetchProofs();
    };

    const showAllDocuments = () => {
        setStudentUSN('');
        fetchProofs();
    };
    const handleStatusUpdate = async (proofId, newStatus, reason = '') => {
        if (!window.confirm(`Are you sure you want to mark this document as ${newStatus}?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/proofs/${proofId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus,
                    rejection_reason: reason,
                    userId: user.id,
                    userRole: user.role
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert(`Document ${newStatus} successfully!`);
                fetchProofs(studentUSN); // Refresh results
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Status update error:', error);
            alert('Failed to update document status');
        }
    };
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-8">
                            <h1 className="text-2xl font-bold text-gray-900">Search Student Documents</h1>
                            <nav className="flex space-x-4">
                                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                                <Link to="/search" className="text-blue-600 font-semibold">Search</Link>
                            </nav>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Welcome, {user.name}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Simple Search Form */}
                <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Search by Student USN</h2>
                        <p className="text-gray-600">Enter student USN to view all their documents</p>
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Student USN</label>
                            <input
                                type="text"
                                placeholder="e.g., 4mc23cs001@college.edu or just 4mc23cs001"
                                value={studentUSN}
                                onChange={(e) => setStudentUSN(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="mt-1 text-sm text-gray-500">Enter full USN or part of it</p>
                        </div>

                        <div className="flex items-end space-x-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium"
                            >
                                {loading ? 'Searching...' : '🔍 Search'}
                            </button>
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={showAllDocuments}
                                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                            >
                                Show All
                            </button>
                        </div>
                    </form>

                    {/* Quick USN Examples */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-2">Quick Search Examples:</h3>
                        <div className="flex flex-wrap gap-2 text-sm">
                            <button
                                onClick={() => setStudentUSN('4mc23cs001')}
                                className="px-3 py-1 bg-white border border-blue-300 text-blue-600 rounded hover:bg-blue-100"
                            >
                                4mc23cs001
                            </button>
                            <button
                                onClick={() => setStudentUSN('4mc23cs002')}
                                className="px-3 py-1 bg-white border border-blue-300 text-blue-600 rounded hover:bg-blue-100"
                            >
                                4mc23cs002
                            </button>
                            <button
                                onClick={() => setStudentUSN('4mc23ec001')}
                                className="px-3 py-1 bg-white border border-blue-300 text-blue-600 rounded hover:bg-blue-100"
                            >
                                4mc23ec001
                            </button>
                            <button
                                onClick={() => setStudentUSN('4mc23me001')}
                                className="px-3 py-1 bg-white border border-blue-300 text-blue-600 rounded hover:bg-blue-100"
                            >
                                4mc23me001
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="bg-white rounded-xl shadow-sm border">
                    <div className="px-6 py-4 border-b">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {studentUSN ? `Results for: ${studentUSN}` : 'All Student Documents'}
                                <span className="ml-2 text-blue-600">({proofs.length})</span>
                            </h2>
                            {loading && <span className="text-blue-500 text-sm">Loading...</span>}
                        </div>
                    </div>

                    <div className="p-6">
                        {error ? (
                            <div className="text-center py-12">
                                <div className="text-red-400 text-6xl mb-4">❌</div>
                                <p className="text-red-500 text-lg">Error loading results</p>
                                <p className="text-red-400 text-sm mt-2">{error}</p>
                            </div>
                        ) : proofs.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-6xl mb-4">
                                    {studentUSN ? '🔍' : '📁'}
                                </div>
                                <p className="text-gray-500 text-lg">
                                    {studentUSN
                                        ? `No documents found for USN: ${studentUSN}`
                                        : 'No student documents found'
                                    }
                                </p>
                                {!studentUSN && (
                                    <p className="text-gray-400 text-sm mt-2">Search for a student USN to see their documents</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Group by student */}
                                {Array.from(new Set(proofs.map(p => p.student_usn))).map(usn => {
                                    const studentDocs = proofs.filter(p => p.student_usn === usn);
                                    const studentName = studentDocs[0]?.uploaded_by_name;

                                    return (
                                        <div key={usn} className="border border-gray-200 rounded-lg">
                                            {/* Student Header */}
                                            <div className="bg-gray-50 px-6 py-4 border-b">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-800">{studentName}</h3>
                                                        <p className="text-gray-600 text-sm">{usn}</p>
                                                    </div>
                                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                                        {studentDocs.length} document{studentDocs.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Student Documents */}
                                            <div className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {studentDocs.map(proof => (
                                                        <div key={proof.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                            <h4 className="font-semibold text-gray-800 mb-2 truncate">
                                                                {proof.event_name}
                                                            </h4>
                                                            <div className="space-y-1 text-sm text-gray-600 mb-3">
                                                                <p>📝 Type: <span className="capitalize">{proof.proof_type}</span></p>
                                                                <p>📅 Date: {new Date(proof.created_at).toLocaleDateString()}</p>
                                                                <p>🏢 {proof.department}</p>
                                                                {proof.description && (
                                                                    <p className="text-gray-700 text-xs mt-2 line-clamp-2">
                                                                        {proof.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            
                                                            <a
                                                                href={`http://localhost:5000/uploads/${proof.file_path}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded text-sm font-medium"
                                                            >
                                                                📥 Download
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Search;