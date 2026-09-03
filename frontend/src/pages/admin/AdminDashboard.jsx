import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Users, 
  ChefHat, 
  Calendar, 
  CheckCircle2, 
  ShieldAlert, 
  LogOut,
  Package,
  BookOpen,
  UserCog,
  PlusCircle,
  X,
  Mail,
  Phone,
  MapPin,
  Clock,
  Star,
  Award,
  User,
  Briefcase,
  MessageSquare,
  Check,
  X as XIcon
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  //  Chef Details Popup State
  const [selectedChef, setSelectedChef] = useState(null);
  const [showChefPopup, setShowChefPopup] = useState(false);
  const [popupLoading, setPopupLoading] = useState(false);

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

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const handleChefStatusUpdate = async (id, status) => {
    try {
      await api.put(`/admin/chef/${id}/status`, { status });
      fetchAdminStats();
      setShowChefPopup(false);
      setSelectedChef(null);
    } catch (err) {
      console.error('Failed to update chef status', err);
      setError('Failed to update chef status.');
    }
  };

  //  Open Chef Details Popup
  const handleChefClick = async (chef) => {
    setPopupLoading(true);
    setSelectedChef(chef);
    setShowChefPopup(true);
    
    // Fetch detailed chef profile if needed
    try {
      const response = await api.get(`/chefs/${chef.id}`);
      if (response.data?.status === 'success') {
        setSelectedChef(prev => ({
          ...prev,
          ...response.data.chef,
          chef_profile: response.data.chef?.chef_profile || prev.chef_profile
        }));
      }
    } catch (err) {
      console.error('Failed to fetch chef details:', err);
    } finally {
      setPopupLoading(false);
    }
  };

  //  Close Popup
  const closeChefPopup = () => {
    setShowChefPopup(false);
    setSelectedChef(null);
  };

  //  Navigation Functions
  const navigateToUsers = () => {
    navigate('/admin/users');
  };

  const navigateToBookings = () => {
    navigate('/admin/bookings');
  };

  const navigateToPackages = () => {
    navigate('/admin/packages');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950 text-white">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { stats, chefs, pending_chefs, bookings, customers } = data || {};

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
        
        <div className="flex items-center gap-3">
          <button
            onClick={navigateToUsers}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 rounded-xl transition-all duration-200 cursor-pointer text-sm"
          >
            <UserCog size={16} />
            <span>Users</span>
          </button>

          <button
            onClick={navigateToBookings}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 rounded-xl transition-all duration-200 cursor-pointer text-sm"
          >
            <BookOpen size={16} />
            <span>Bookings</span>
          </button>

          <button
            onClick={navigateToPackages}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 rounded-xl transition-all duration-200 cursor-pointer text-sm"
          >
            <Package size={16} />
            <span>Packages</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-red-500/30 hover:text-red-400 rounded-xl transition-all duration-200 cursor-pointer text-sm"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
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
            <h3 className="text-3xl font-bold mt-1 text-white">{stats?.pending_chef_requests || 0}</h3>
          </div>
          <div className="p-4 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/10">
            <ShieldAlert size={24} />
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div 
          onClick={navigateToUsers}
          className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl hover:bg-blue-500/10 hover:border-blue-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500/20 transition">
              <UserCog size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Manage Users</h3>
              <p className="text-sm text-slate-400">View & manage all users</p>
            </div>
          </div>
        </div>

        <div 
          onClick={navigateToBookings}
          className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 transition">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Manage Bookings</h3>
              <p className="text-sm text-slate-400">View all event bookings</p>
            </div>
          </div>
        </div>

        <div 
          onClick={navigateToPackages}
          className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl hover:bg-amber-500/10 hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 group-hover:bg-amber-500/20 transition">
              <Package size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Foodie Packages</h3>
              <p className="text-sm text-slate-400">Manage platform packages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Chef Requests - Clickable Cards */}
      {pending_chefs && pending_chefs.length > 0 && (
        <div className="mb-8 p-6 bg-amber-500/10 rounded-2xl border border-amber-500/20">
          <h2 className="text-xl font-bold mb-4 text-amber-400 flex items-center gap-2">
            <ShieldAlert size={24} />
            Pending Chef Registrations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {pending_chefs.map(chef => (
              <div 
                key={chef.id} 
                className="p-4 bg-slate-900 rounded-xl border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group"
                onClick={() => handleChefClick(chef)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition">
                      {chef.name}
                    </h3>
                    <p className="text-xs text-slate-400">{chef.email}</p>
                    <p className="text-xs text-slate-400 mt-1">Phone: {chef.phone || 'N/A'}</p>
                  </div>
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-lg uppercase flex-shrink-0">
                    Pending
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between gap-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleChefStatusUpdate(chef.id, 'rejected')}
                    className="flex-1 py-2 bg-slate-950 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 text-xs font-semibold rounded-lg transition-all"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleChefStatusUpdate(chef.id, 'active')}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-all"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* =====================================================
          CHEF DETAILS POPUP
      ===================================================== */}
      {showChefPopup && selectedChef && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Popup Header */}
            <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                  <ChefHat size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Chef Details</h2>
                  <p className="text-xs text-slate-400">Registration Information</p>
                </div>
              </div>
              <button
                onClick={closeChefPopup}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Popup Content */}
            <div className="p-6 space-y-6">
              
              {/* Loading State */}
              {popupLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Chef Profile Image & Basic Info */}
                  <div className="flex items-start gap-6">
                    {/* Profile Image */}
                    <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-amber-500/30 overflow-hidden flex-shrink-0">
                      {selectedChef.photo_url ? (
                        <img 
                          src={selectedChef.photo_url} 
                          alt={selectedChef.name}
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-700 flex items-center justify-center text-3xl font-bold text-slate-400">
                          {selectedChef.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white">{selectedChef.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full">
                          {selectedChef.role || 'Chef'}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          selectedChef.status === 'active' 
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : selectedChef.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {selectedChef.status || 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-3 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Mail size={14} /> {selectedChef.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={14} /> {selectedChef.phone || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chef Profile Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Briefcase size={14} /> Professional Details
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Experience</span>
                            <span className="text-white font-medium">
                              {selectedChef.chef_profile?.experience_years || 0} Years
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Hourly Rate</span>
                            <span className="text-amber-400 font-medium">
                              LKR {selectedChef.chef_profile?.hourly_rate || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">City</span>
                            <span className="text-white font-medium">
                              {selectedChef.chef_profile?.city || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Rating</span>
                            <span className="text-amber-400 font-medium">
                              ★ {selectedChef.chef_profile?.rating || '0.0'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Total Reviews</span>
                            <span className="text-white font-medium">
                              {selectedChef.reviews_count || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Award size={14} /> Specialities
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedChef.chef_profile?.cuisine_specialities?.length > 0 ? (
                            selectedChef.chef_profile.cuisine_specialities.map((specialty, idx) => (
                              <span key={idx} className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full border border-amber-500/20">
                                {specialty}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-sm">No specialities specified</span>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <MessageSquare size={14} /> Bio
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {selectedChef.chef_profile?.bio || 'No bio provided yet.'}
                        </p>
                      </div>

                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Clock size={14} /> Account Info
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Joined</span>
                            <span className="text-white">
                              {selectedChef.created_at ? new Date(selectedChef.created_at).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">User ID</span>
                            <span className="text-white font-mono text-xs">#{selectedChef.id}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  {selectedChef.chef_profile?.bio && (
                    <div className="bg-slate-800/30 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About Chef</h4>
                      <p className="text-sm text-slate-300 leading-relaxed">{selectedChef.chef_profile.bio}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-slate-700">
                    <button
                      onClick={closeChefPopup}
                      className="flex-1 px-4 py-2.5 border border-slate-700 text-slate-400 hover:text-white rounded-xl transition"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleChefStatusUpdate(selectedChef.id, 'rejected')}
                      className="flex-1 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <XIcon size={16} /> Reject
                    </button>
                    <button
                      onClick={() => handleChefStatusUpdate(selectedChef.id, 'active')}
                      className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <Check size={16} /> Accept
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;