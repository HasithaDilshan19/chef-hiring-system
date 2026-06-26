import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Users, ChefHat, Calendar, CheckCircle2, ShieldAlert, LogOut } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setData(response.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch system data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950 text-white">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { stats, chefs, bookings, customers } = data || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-8 border-b border-slate-800">
        <div>
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20">
            System Administrator
          </span>
          <h1 className="text-3xl font-bold text-white mt-2">Control Panel</h1>
          <p className="text-sm text-slate-400">Welcome, {user?.name}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-red-500/30 hover:text-red-400 rounded-xl transition-all duration-200 cursor-pointer text-sm"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </header>

      {error && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex gap-2">
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Total Registered Chefs</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{stats?.total_chefs || 0}</h3>
          </div>
          <div className="p-4 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/10">
            <ChefHat size={24} />
          </div>
        </div>

        <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Total Customers</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{stats?.total_users || 0}</h3>
          </div>
          <div className="p-4 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/10">
            <Users size={24} />
          </div>
        </div>

        <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Total Event Bookings</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{stats?.total_bookings || 0}</h3>
          </div>
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10">
            <Calendar size={24} />
          </div>
        </div>

        <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Pending Requests</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{stats?.pending_bookings || 0}</h3>
          </div>
          <div className="p-4 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/10">
            <ShieldAlert size={24} />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Registered Chefs */}
        <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-bold mb-4 text-white">Registered Chefs</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/60 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Chef</th>
                  <th className="px-4 py-3">Specialities</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {chefs?.map((chef) => (
                  <tr key={chef.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{chef.name}</div>
                      <div className="text-xs text-slate-400">{chef.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {chef.chef_profile?.cuisine_specialities?.map((specialty, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded border border-slate-700">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{chef.chef_profile?.city}</td>
                    <td className="px-4 py-3">
                      <span className="text-amber-400 font-semibold">★ {chef.chef_profile?.rating}</span>
                    </td>
                  </tr>
                ))}
                {chefs?.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-slate-500">No chefs registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Global Bookings */}
        <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-bold mb-4 text-white">Event Bookings Log</h2>
          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
            {bookings?.map((booking) => (
              <div key={booking.id} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all duration-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-white">{booking.event_type}</h4>
                    <p className="text-xs text-slate-400">{booking.event_date} | {booking.event_time}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase border ${
                    booking.status === 'pending'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : booking.status === 'accepted'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-900 text-xs text-slate-400">
                  <div>
                    <span className="block text-slate-500">Customer</span>
                    <span className="text-slate-300">{booking.customer?.name}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Booked Chef</span>
                    <span className="text-slate-300">{booking.chef?.name}</span>
                  </div>
                </div>
              </div>
            ))}
            {bookings?.length === 0 && (
              <p className="text-center py-4 text-slate-500">No booking logs present.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
