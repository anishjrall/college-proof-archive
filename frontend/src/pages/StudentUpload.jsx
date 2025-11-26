import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function StudentUpload({ user }) {
  const [formData, setFormData] = useState({
    eventName: '',
    eventType: '',
    department: '',
    academicYear: '',
    proofType: 'photo',
    description: ''
  });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('eventName', formData.eventName);
    data.append('eventType', formData.eventType);
    data.append('department', formData.department);
    data.append('academicYear', formData.academicYear);
    data.append('proofType', formData.proofType);
    data.append('description', formData.description);
    data.append('userId', user.id);
    data.append('userRole', user.role);

    try {
      console.log('📤 Starting upload...');
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: data
      });

      const result = await response.json();
      console.log('📤 Upload response:', result);

      if (response.ok) {
        setMessage('✅ Document uploaded successfully! Redirecting...');

        // Clear form
        setFormData({
          eventName: '', eventType: '', department: '', academicYear: '', proofType: 'photo', description: ''
        });
        setFile(null);
        document.getElementById('fileInput').value = '';

        // 🔥 REDIRECT TO DASHBOARD
        setTimeout(() => {
          navigate('/dashboard', { replace: true }); // This will trigger a fresh load
        }, 1500);

      } else {
        setMessage(`❌ Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      setMessage('❌ Upload failed - check server connection');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of your component remains the same

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">Upload Your Document</h1>
              <nav className="flex space-x-4">
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                <Link to="/student-upload" className="text-blue-600 font-semibold">Upload</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Name *</label>
                <input
                  type="text"
                  placeholder="Enter event name"
                  value={formData.eventName}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
                <input
                  type="text"
                  placeholder="e.g., Workshop, Seminar, Sports"
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                <input
                  type="text"
                  placeholder="e.g., Computer Science, Physics"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year *</label>
                <input
                  type="text"
                  placeholder="e.g., 2024-25"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Proof Type *</label>
              <select
                value={formData.proofType}
                onChange={(e) => setFormData({ ...formData, proofType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="photo">📷 Photo</option>
                <option value="pdf">📄 PDF Document</option>
                <option value="certificate">🏆 Certificate</option>
                <option value="report">📊 Report</option>
                <option value="hackathon">💻 Hackathon</option>
                <option value="achievement">⭐ Achievement</option>
                <option value="project">🔧 Project</option>
                <option value="assignment">📝 Assignment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                placeholder="Brief description of the event..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File *</label>
              <input
                id="fileInput"
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              <p className="mt-1 text-sm text-gray-500">Supported: Images, PDFs, Documents</p>
            </div>

            {message && (
              <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                '📤 Upload Document'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StudentUpload;