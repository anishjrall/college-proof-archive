import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentUpload from './pages/StudentUpload';
import Search from './pages/Search';
import Admin from './pages/Admin';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route
            path="/login"
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/student-upload"
            element={user && user.role === 'student' ? <StudentUpload user={user} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/search"
            element={user && (user.role === 'admin' || user.role === 'staff') ? <Search user={user} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/admin"
            element={user && user.role === 'admin' ? <Admin user={user} /> : <Navigate to="/dashboard" />}
          />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;