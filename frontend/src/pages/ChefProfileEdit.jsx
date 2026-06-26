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

  useEffect(() => {
    fetchProfile();
  }, []);

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
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600">Update your chef details and availability.</p>
        </div>
        <button 
          onClick={() => navigate('/chef')}
          className="text-gray-500 hover:text-gray-700 font-medium"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 mb-6">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio / About Me</label>
          <textarea 
            rows="4"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            placeholder="Tell customers about your culinary journey..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
            <input 
              type="number" 
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.hourly_rate}
              onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
              placeholder="e.g. 50.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City / Base Location</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              placeholder="e.g. Colombo"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Availability Status</label>
          <select 
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            value={formData.availability_status}
            onChange={(e) => setFormData({...formData, availability_status: e.target.value})}
          >
            <option value="available">Available for Bookings</option>
            <option value="busy">Busy (Fully Booked)</option>
            <option value="offline">Offline / Vacation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Specialties</label>
          <div className="flex gap-2 mb-3">
            <input 
              type="text" 
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
              className="bg-gray-100 px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-200 transition"
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.cuisine_specialities.map((cuisine, idx) => (
              <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 border border-blue-100">
                {cuisine}
                <button 
                  type="button"
                  onClick={() => handleRemoveCuisine(cuisine)}
                  className="text-blue-400 hover:text-blue-600"
                >
                  ✕
                </button>
              </span>
            ))}
            {formData.cuisine_specialities.length === 0 && (
              <span className="text-gray-400 text-sm italic">No specialties added yet.</span>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <button 
            type="submit" 
            disabled={saving}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            <Save className="h-5 w-5" />
            {saving ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
