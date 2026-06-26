import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ChefHat, ToggleLeft, ToggleRight, DollarSign, Calendar, Star, FileText, Check, X, ShieldAlert, LogOut } from 'lucide-react';

const ChefDashboard = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Profile form state
  const [experience, setExperience] = useState('');
  const [rate, setRate] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [availability, setAvailability] = useState('available');
  const [specialities, setSpecialities] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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
        setCity(statsData.profile.city);
        setBio(statsData.profile.bio || '');
        setAvailability(statsData.profile.availability_status);
        setSpecialities(statsData.profile.cuisine_specialities || []);
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMsg('');
    setError('');

    try {
      await api.put('/chef/profile', {
        experience_years: parseInt(experience),
        cuisine_specialities: specialities,
        hourly_rate: parseFloat(rate),
        city,
        bio,
        availability_status: availability,
      });
      setSuccessMsg('Your chef profile has been updated successfully!');
      fetchChefStats();
    } catch (err) {
      console.error(err);
      setError('Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  const handleBookingAction = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      setSuccessMsg(`Booking successfully updated to ${newStatus}.`);
      fetchChefStats();
    } catch (err) {
      console.error(err);
      setError('Failed to update booking status.');
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-8 border-b border-slate-800">
        <div>
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20">
            Professional Chef Workspace
          </span>
          <h1 className="text-3xl font-bold text-white mt-2">{user?.name}</h1>
          <p className="text-sm text-slate-400">Manage your profile, availability, and event gigs.</p>
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
            <h3 className="text-3xl font-bold mt-1 text-amber-400">★ {stats?.rating || '5.0'}</h3>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Editor (Left Panel) */}
        <div className="lg:col-span-5 p-6 bg-slate-900/40 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-bold mb-4 text-white">Update Chef Profile</h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Availability Status
              </label>
              <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-xl">
                {['available', 'busy', 'unavailable'].map((statusOption) => (
                  <button
                    key={statusOption}
                    type="button"
                    onClick={() => setAvailability(statusOption)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer capitalize transition-all ${
                      availability === statusOption
                        ? statusOption === 'available'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {statusOption}
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
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 text-sm"
            >
              {updating ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Gig Requests (Right Panel) */}
        <div className="lg:col-span-7 p-6 bg-slate-900/40 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-bold mb-4 text-white">Hiring & Booking Requests</h2>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {bookings?.map((booking) => (
              <div
                key={booking.id}
                className={`p-5 rounded-2xl border transition-all ${
                  booking.status === 'pending'
                    ? 'bg-slate-900 border-amber-500/20 hover:border-amber-500/40'
                    : 'bg-slate-950/80 border-slate-800/80'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white">{booking.event_type}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Date: <span className="text-slate-200">{booking.event_date}</span> | Time:{' '}
                      <span className="text-slate-200">{booking.event_time}</span>
                    </p>
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

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-400 py-3 border-t border-b border-slate-950">
                  <div>
                    <span className="block text-slate-500 uppercase tracking-wide text-[10px]">Customer</span>
                    <span className="text-slate-300 font-semibold">{booking.customer?.name}</span>
                    <span className="block text-[10px] text-slate-400">{booking.customer?.phone}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 uppercase tracking-wide text-[10px]">Guests Count</span>
                    <span className="text-slate-300 font-semibold">{booking.guests_count} Pax</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 uppercase tracking-wide text-[10px]">Agreed Budget</span>
                    <span className="text-amber-400 font-semibold font-mono">LKR {parseFloat(booking.total_price).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    <span className="block text-slate-500 uppercase tracking-wide text-[10px]">Venue Location</span>
                    <span className="text-slate-300">{booking.location}</span>
                  </div>
                  
                  {booking.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBookingAction(booking.id, 'cancelled')}
                        className="p-2 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-xl cursor-pointer transition-all duration-200"
                        title="Decline Offer"
                      >
                        <X size={16} />
                      </button>
                      <button
                        onClick={() => handleBookingAction(booking.id, 'accepted')}
                        className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-all duration-200"
                      >
                        <Check size={14} />
                        <span>Accept Gig</span>
                      </button>
                    </div>
                  )}

                  {booking.status === 'accepted' && (
                    <button
                      onClick={() => handleBookingAction(booking.id, 'completed')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-all duration-200"
                    >
                      <Check size={14} />
                      <span>Mark Completed</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
            {bookings?.length === 0 && (
              <p className="text-center py-6 text-slate-500">No booking requests found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefDashboard;
