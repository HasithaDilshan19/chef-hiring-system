import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ChefDashboard from './pages/ChefDashboard';
import UserDashboard from './pages/UserDashboard';
import ChefSearch from './pages/ChefSearch';
import ChefDetails from './pages/ChefDetails';
import ChefProfileEdit from './pages/ChefProfileEdit';
import Layout from './components/layout/Layout';

// Helper component to redirect authenticated users to their correct dashboard
const RootRedirect = () => {
  const { user, token } = useAuth();
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else if (user.role === 'chef') {
    return <Navigate to="/chef" replace />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Role-Based Routes */}
          <Route element={<Layout />}>
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chef"
              element={
                <ProtectedRoute allowedRoles={['chef']}>
                  <ChefDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute allowedRoles={['user', 'admin']}>
                  <ChefSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chefs/:id"
              element={
                <ProtectedRoute allowedRoles={['user', 'admin']}>
                  <ChefDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chef/profile/edit"
              element={
                <ProtectedRoute allowedRoles={['chef']}>
                  <ChefProfileEdit />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Default / Fallback Route */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
