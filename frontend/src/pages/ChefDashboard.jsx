import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ChefHat, ToggleLeft, ToggleRight, DollarSign, Calendar, Star, FileText, Check, X, ShieldAlert, LogOut, Camera, User } from 'lucide-react';

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

      await api.post('/chef/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
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



  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950 text-white">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { stats } = data || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
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
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20">
              Professional Chef Workspace
            </span>
            <h1 className="text-3xl font-bold text-white mt-2">{user?.name}</h1>
            <p className="text-sm text-slate-400">Manage your profile, availability, and event gigs.</p>
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
