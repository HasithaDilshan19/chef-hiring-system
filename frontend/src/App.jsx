import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBookings from './pages/admin/AdminBookings';
import AdminSettings from './pages/admin/AdminSettings';
import ChefDashboard from './pages/chef/ChefDashboard';
import ChefProfileEdit from './pages/chef/ChefProfileEdit';
import ChefBookings from './pages/chef/ChefBookings';
import UserDashboard from './pages/customer/UserDashboard';
import ChefSearch from './pages/customer/ChefSearch';
import ChefDetails from './pages/customer/ChefDetails';
import UserBookings from './pages/customer/UserBookings';
import UserProfile from './pages/customer/UserProfile';
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
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSettings />
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
              path="/chef/bookings"
              element={
                <ProtectedRoute allowedRoles={['chef']}>
                  <ChefBookings />
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
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserBookings />
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
