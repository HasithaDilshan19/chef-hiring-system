import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ChefProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    bio: '',
    hourly_rate: '',
    city: '',
    availability_status: 'available',
    cuisine_specialities: []
  });
  
  const [cuisineInput, setCuisineInput] = useState('');

  const fetchProfile = async () => {
    try {
      // The current chef's profile can be fetched by getting their own user ID
      const response = await api.get(`/chefs/${user.id}`);
      if (response.data.status === 'success') {
        const profile = response.data.chef.chef_profile || {};
        setFormData({
          bio: profile.bio || '',
          hourly_rate: profile.hourly_rate || '',
          city: profile.city || '',
          availability_status: profile.availability_status || 'available',
          cuisine_specialities: profile.cuisine_specialities || []
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user.id]);

  const handleAddCuisine = (e) => {
    e.preventDefault();
    if (cuisineInput.trim() && !formData.cuisine_specialities.includes(cuisineInput.trim())) {
      setFormData({
        ...formData,
        cuisine_specialities: [...formData.cuisine_specialities, cuisineInput.trim()]
      });
      setCuisineInput('');
    }
  };

  const handleRemoveCuisine = (cuisine) => {
    setFormData({
      ...formData,
      cuisine_specialities: formData.cuisine_specialities.filter(c => c !== cuisine)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await api.put('/chef/profile', formData);
      if (response.data.status === 'success') {
        alert('Profile updated successfully!');
        navigate('/chef');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
          <p className="text-slate-400">Update your chef details and availability.</p>
        </div>
        <button 
          onClick={() => navigate('/chef')}
          className="text-slate-400 hover:text-white font-medium transition-colors"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-2 mb-6">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900/60 rounded-2xl border border-slate-800 p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Bio / About Me</label>
          <textarea 
            rows="4"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 resize-none transition-colors"
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            placeholder="Tell customers about your culinary journey..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Hourly Rate ($)</label>
            <input 
              type="number" 
              min="0"
              step="0.01"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
              value={formData.hourly_rate}
              onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
              placeholder="e.g. 50.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">City / Base Location</label>
            <input 
              type="text" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              placeholder="e.g. Colombo"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Availability Status</label>
          <select 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors appearance-none"
            value={formData.availability_status}
            onChange={(e) => setFormData({...formData, availability_status: e.target.value})}
          >
            <option value="available">Available for Bookings</option>
            <option value="busy">Busy (Fully Booked)</option>
            <option value="offline">Offline / Vacation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Cuisine Specialties</label>
          <div className="flex gap-2 mb-3">
            <input 
              type="text" 
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
              value={cuisineInput}
              onChange={(e) => setCuisineInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleAddCuisine(e);
              }}
              placeholder="e.g. Italian, Sri Lankan (Press Enter)"
            />
            <button 
              type="button"
              onClick={handleAddCuisine}
              className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors border border-slate-700"
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.cuisine_specialities.map((cuisine, idx) => (
              <span key={idx} className="bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-amber-500/20">
                {cuisine}
                <button 
                  type="button"
                  onClick={() => handleRemoveCuisine(cuisine)}
                  className="text-amber-500 hover:text-amber-300 transition-colors ml-1"
                >
                  ✕
                </button>
              </span>
            ))}
            {formData.cuisine_specialities.length === 0 && (
              <span className="text-slate-500 text-sm italic">No specialties added yet.</span>
            )}
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-800">
          <button 
            type="submit" 
            disabled={saving}
            className="w-full flex justify-center items-center gap-2 bg-amber-500 text-slate-950 px-6 py-3.5 rounded-xl font-bold hover:bg-amber-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            <Save className="h-5 w-5" />
            {saving ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
