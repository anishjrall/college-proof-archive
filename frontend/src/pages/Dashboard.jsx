import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Dashboard({ user, onLogout }) {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  // 🔥 FIX: Add proper dependencies and error handling
  useEffect(() => {
    if (user) {
      fetchProofs();
    }
  }, [user]); // Re-fetch when user changes

  const fetchProofs = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching proofs for user:', user.id, user.role);

      const response = await fetch(
        `http://localhost:5000/api/proofs?userId=${user.id}&userRole=${user.role}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📄 Proofs received:', data);
      setProofs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error fetching proofs:', error);
      setProofs([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 ADD: Manual refresh function
  const handleRefresh = () => {
    fetchProofs();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.role === 'student' ? 'My Documents' : 'Proof Archive System'}
              </h1>
              <nav className="flex space-x-4">
                <Link to="/dashboard" className="text-blue-600 font-semibold">
                  {user.role === 'student' ? 'My Dashboard' : 'Dashboard'}
                </Link>

                {user.role === 'student' && (
                  <Link to="/student-upload" className="text-gray-600 hover:text-gray-900">Upload</Link>
                )}

                {(user.role === 'admin' || user.role === 'staff') && (
                  <Link to="/search" className="text-gray-600 hover:text-gray-900">Search</Link>
                )}

                {user.role === 'admin' && (
                  <Link to="/admin" className="text-gray-600 hover:text-gray-900">Admin</Link>
                )}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {/* 🔥 ADD REFRESH BUTTON */}
              <button
                onClick={handleRefresh}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
              >
                🔄 Refresh
              </button>

              <div className="text-right">
                <span className="text-gray-700 block">{user.name}</span>
                <span className="text-sm text-gray-500 block">
                  {user.role === 'student' ? user.email.split('@')[0] : user.role}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 🔥 ADD LOADING STATE */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading documents...</p>
          </div>
        )}

        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {user.role === 'student' ? 'My Documents' : 'Total Documents'}
                </h3>
                <p className="text-3xl font-bold text-blue-600">{proofs.length}</p>
              </div>

              {user.role === 'student' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Uploads</h3>
                  <p className="text-3xl font-bold text-green-600">{proofs.length}</p>
                </div>
              )}

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">This Year</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {proofs.filter(p => p.academic_year && (p.academic_year.includes('2024') || p.academic_year === 'Student')).length}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  {user.role === 'student' ? 'My Recent Documents' : 'Recent Documents'}
                </h2>
                <button
                  onClick={handleRefresh}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  🔄 Refresh List
                </button>
              </div>
              <div className="p-6">
                {proofs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">
                      {user.role === 'student' ? '📁' : '🔍'}
                    </div>
                    <p className="text-gray-500 text-lg">
                      {user.role === 'student'
                        ? 'No documents uploaded yet'
                        : 'No documents found'
                      }
                    </p>
                    {user.role === 'student' && (
                      <Link
                        to="/student-upload"
                        className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                      >
                        Upload Your First Document
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {proofs.map(proof => (
                      <div key={proof.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-semibold text-gray-800 mb-2 truncate">
                          {proof.event_name || proof.proof_type}
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>📝 Type: <span className="capitalize">{proof.proof_type}</span></p>
                          <p>🏢 {proof.department || 'Student Uploads'}</p>
                          <p>📅 {proof.academic_year || 'Student'}</p>
                          {user.role !== 'student' && (
                            <p>👤 By: {proof.uploaded_by_name}</p>
                          )}
                        </div>
                        <a
                          href={`http://localhost:5000/uploads/${proof.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded text-sm font-medium"
                        >
                          View File
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;