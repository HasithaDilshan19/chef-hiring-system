import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ChefHat, Calendar, Star, Check, X, ShieldAlert, Camera, User, Clock, MapPin, Users, AlertCircle } from 'lucide-react';
import { ToastContainer, useToast } from '../../components/ui/Toast';
import ConfirmModal from '../../components/ui/ConfirmModal';

const ChefDashboard = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toasts, showToast, dismissToast } = useToast();
  const [modal, setModal] = useState({ open: false });
  const [actionLoading, setActionLoading] = useState(false);
  const closeModal = () => setModal((m) => ({ ...m, open: false }));
  
  // Profile form state
  const [experience, setExperience] = useState('');
  const [rate, setRate] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [availability, setAvailability] = useState('available');
  const [specialities, setSpecialities] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const availableCuisines = ['Sri Lankan', 'Indian', 'Western', 'Chinese', 'Italian'];

  const fetchChefStats = async () => {
    try {
      const response = await api.get('/chef/stats');
      const statsData = response.data.data;
      setData(statsData);
      
      // Populate form fields
      if (statsData.profile) {
        setExperience(statsData.profile.experience_years);
        setRate(statsData.profile.hourly_rate);
        setCity(statsData.profile.city || '');
        setBio(statsData.profile.bio || '');
        setAvailability(statsData.profile.availability_status || 'available');
        setSpecialities(statsData.profile.cuisine_specialities || []);
        if (statsData.profile.photo_url) {
          setPhotoPreview(statsData.profile.photo_url);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch chef statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChefStats();
  }, []);

  const handleCuisineToggle = (cuisine) => {
    if (specialities.includes(cuisine)) {
      setSpecialities(specialities.filter((c) => c !== cuisine));
    } else {
      setSpecialities([...specialities, cuisine]);
    }
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const executeBookingAction = async (bookingId, action) => {
    setActionLoading(true);
    closeModal();
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: action });
      fetchChefStats();
      const msgs = {
        accepted:  { msg: '🎉 Booking accepted! The customer will be notified.',  type: 'success' },
        cancelled: { msg: '❌ Booking declined. The customer has been notified.', type: 'warning' },
      };
      const { msg, type } = msgs[action] || { msg: `Booking updated to ${action}.`, type: 'info' };
      showToast(msg, type);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update booking.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = (booking) => {
    setModal({
      open: true,
      title: 'Accept This Booking?',
      message: `You are about to accept the "${booking.event_type}" gig from ${booking.customer?.name}. The customer will be notified immediately.`,
      confirmText: 'Yes, Accept',
      cancelText: 'No, Go Back',
      variant: 'success',
      onConfirm: () => executeBookingAction(booking.id, 'accepted'),
    });
  };

  const handleDecline = (booking) => {
    setModal({
      open: true,
      title: 'Decline This Booking?',
      message: `Are you sure you want to decline the "${booking.event_type}" request from ${booking.customer?.name}? This action cannot be undone.`,
      confirmText: 'Yes, Decline',
      cancelText: 'No, Go Back',
      variant: 'danger',
      onConfirm: () => executeBookingAction(booking.id, 'cancelled'),
    });
  };

  const handleToggleAvailability = async (newStatus) => {
    setAvailability(newStatus);
    setSuccessMsg('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('availability_status', newStatus);
      if (experience) formData.append('experience_years', experience);
      if (rate) formData.append('hourly_rate', rate);
      if (city) formData.append('city', city);
      if (bio) formData.append('bio', bio);
      formData.append('_method', 'PUT');

      const response = await api.post('/chef/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'success') {
        setSuccessMsg(`Availability status updated to "${newStatus.toUpperCase()}"!`);
        fetchChefStats();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update availability status.');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMsg('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('experience_years', experience);
      formData.append('hourly_rate', rate);
      formData.append('city', city);
      formData.append('bio', bio);
      formData.append('availability_status', availability);
      
      specialities.forEach((item, index) => {
        formData.append(`cuisine_specialities[${index}]`, item);
      });
      
      if (photoFile) {
        formData.append('photo', photoFile);
      }
      
      formData.append('_method', 'PUT');

      const response = await api.post('/chef/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.status === 'success') {
        setSuccessMsg('Your chef profile has been updated successfully!');
        fetchChefStats();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950 text-white">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { stats, bookings } = data || {};
  const pendingBookings = (bookings || []).filter(b => b.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Confirm Modal */}
      <ConfirmModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        variant={modal.variant}
        loading={actionLoading}
        onConfirm={modal.onConfirm}
        onCancel={closeModal}
      />

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-8 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-800 bg-slate-900 shrink-0">
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-amber-500/10 text-amber-500">
                <ChefHat size={32} />
              </div>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20">
                Professional Chef Workspace
              </span>
              <span className={`px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1.5 ${
                availability === 'available'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : availability === 'busy'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${availability === 'available' ? 'bg-emerald-400 animate-pulse' : 'bg-current'}`}></span>
                <span className="capitalize">{availability}</span>
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mt-2">{user?.name}</h1>
            <p className="text-sm text-slate-400">Manage your profile, availability status, and event gigs.</p>
          </div>
        </div>
      </header>

      {error && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex gap-2">
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex gap-2">
          <Check size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Total Booking Requests</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{stats?.total_bookings || 0}</h3>
          </div>
          <div className="p-4 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/10">
            <Calendar size={24} />
          </div>
        </div>

        <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Pending Approvals</p>
            <h3 className="text-3xl font-bold mt-1 text-rose-400">{stats?.pending_bookings || 0}</h3>
          </div>
          <div className="p-4 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/10">
            <Star size={24} />
          </div>
        </div>

        <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Average Rating</p>
            <h3 className="text-3xl font-bold mt-1 text-amber-400">
              ★ {stats?.reviews_count > 0 ? Number(stats?.rating ?? 0).toFixed(1) : (stats?.rating !== undefined && stats?.rating !== null ? Number(stats.rating).toFixed(1) : '0.0')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {stats?.reviews_count > 0 ? `${stats.reviews_count} ${stats.reviews_count === 1 ? 'review' : 'reviews'}` : 'No reviews received yet'}
            </p>
          </div>
          <div className="p-4 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/10">
            <ChefHat size={24} />
          </div>
        </div>

        <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Reliability Score</p>
            <h3 className="text-3xl font-bold mt-1 text-emerald-400">{stats?.reliability || '100'}%</h3>
          </div>
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10">
            <Check size={24} />
          </div>
        </div>
      </div>

      {/* Pending Bookings Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock size={20} className="text-amber-400" />
            Pending Booking Requests
            {pendingBookings.length > 0 && (
              <span className="ml-2 px-2.5 py-0.5 bg-rose-500/20 text-rose-400 text-xs font-bold rounded-full border border-rose-500/30">
                {pendingBookings.length}
              </span>
            )}
          </h2>
        </div>

        {pendingBookings.length === 0 ? (
          <div className="p-8 bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-slate-800/60 rounded-full mb-3">
              <Calendar size={28} className="text-slate-500" />
            </div>
            <p className="text-slate-400 font-medium">No pending booking requests</p>
            <p className="text-slate-600 text-sm mt-1">New requests from customers will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pendingBookings.map((booking) => (
              <div key={booking.id} className="p-5 bg-slate-900/60 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-all duration-200">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <User size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{booking.customer?.name || 'Customer'}</p>
                      <p className="text-xs text-slate-500">{booking.customer?.email}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded-full border border-amber-500/20 uppercase tracking-wide">
                    Pending
                  </span>
                </div>

                {/* Event Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <ChefHat size={14} className="text-amber-400 shrink-0" />
                    <span className="text-slate-200 font-medium">{booking.event_type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar size={13} className="text-slate-500 shrink-0" />
                    <span>{booking.event_date} at {booking.event_time}</span>
                  </div>
                  {booking.location && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin size={13} className="text-slate-500 shrink-0" />
                      <span className="truncate">{booking.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Users size={13} className="text-slate-500 shrink-0" />
                    <span>{booking.guests_count} guests</span>
                    {booking.total_price && (
                      <span className="ml-auto text-emerald-400 font-semibold">LKR {Number(booking.total_price).toLocaleString()}</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => handleDecline(booking)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-950 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    <X size={14} />
                    Decline
                  </button>
                  <button
                    onClick={() => handleAccept(booking)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    <Check size={14} />
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Profile Editor */}
        <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-bold mb-4 text-white">Update Chef Profile</h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            
            <div className="flex flex-col items-center sm:flex-row sm:items-center gap-6 pb-4 mb-4 border-b border-slate-800/50">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-900 flex items-center justify-center shrink-0">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-slate-500" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-amber-500 text-slate-900 p-1.5 rounded-full cursor-pointer hover:bg-amber-400 transition-colors shadow-lg border border-slate-900 group-hover:scale-110">
                  <Camera size={14} />
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                </label>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-sm font-semibold text-white">Profile Photo</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Upload a photo to appear in search results. Max 2MB.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Availability Status (Click to Change)
              </label>
              <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-xl">
                {['available', 'busy', 'unavailable'].map((statusOption) => (
                  <button
                    key={statusOption}
                    type="button"
                    onClick={() => handleToggleAvailability(statusOption)}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg cursor-pointer capitalize transition-all ${
                      availability === statusOption
                        ? statusOption === 'available'
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : statusOption === 'busy'
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {statusOption === 'available' ? 'Available (Active)' : statusOption === 'busy' ? 'Busy' : 'Unavailable'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Hourly Rate (LKR)
                </label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Base City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Cuisine Specialities
              </label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {availableCuisines.map((cuisine) => {
                  const isSelected = specialities.includes(cuisine);
                  return (
                    <button
                      type="button"
                      key={cuisine}
                      onClick={() => handleCuisineToggle(cuisine)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      {cuisine}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Bio / Specialties Description
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 text-sm mt-4"
            >
              {updating ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChefDashboard;
