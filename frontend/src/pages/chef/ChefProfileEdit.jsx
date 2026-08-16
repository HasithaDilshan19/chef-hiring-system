import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, AlertCircle, Camera, User, MapPin } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ChefProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // -------------------------------------------------------
  // CITY COORDINATES
  // -------------------------------------------------------
  const cityCoordinates = {
    Colombo: {
      latitude: 6.927179,
      longitude: 79.861244,
    },
    Nugegoda: {
      latitude: 6.901500,
      longitude: 79.880000,
    },
    Kandy: {
      latitude: 7.290572,
      longitude: 80.633728,
    },
    Galle: {
      latitude: 6.053519,
      longitude: 80.220978,
    },
    Negombo: {
      latitude: 7.208300,
      longitude: 79.835800,
    },
  };

  const [formData, setFormData] = useState({
    bio: '',
    hourly_rate: '',
    city: '',
    latitude: '',
    longitude: '',
    availability_status: 'available',
    cuisine_specialities: [],
  });

  const [cuisineInput, setCuisineInput] = useState('');

  // -------------------------------------------------------
  // FETCH CHEF PROFILE
  // -------------------------------------------------------
  const fetchProfile = async () => {
    try {
      const response = await api.get(`/chefs/${user.id}`);

      if (response.data.status === 'success') {
        const profile = response.data.chef.chef_profile || {};

        setFormData({
          bio: profile.bio || '',
          hourly_rate: profile.hourly_rate || '',
          city: profile.city || '',
          latitude: profile.latitude || '',
          longitude: profile.longitude || '',
          availability_status:
            profile.availability_status || 'available',
          cuisine_specialities:
            profile.cuisine_specialities || [],
        });

        if (profile.photo_url) {
          setPhotoPreview(profile.photo_url);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  // -------------------------------------------------------
  // HANDLE CITY CHANGE
  // -------------------------------------------------------
  const handleCityChange = (e) => {
    const selectedCity = e.target.value;

    const coordinates = cityCoordinates[selectedCity];

    if (coordinates) {
      setFormData((prev) => ({
        ...prev,
        city: selectedCity,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        city: selectedCity,
        latitude: '',
        longitude: '',
      }));
    }
  };

  // -------------------------------------------------------
  // ADD CUISINE
  // -------------------------------------------------------
  const handleAddCuisine = (e) => {
    e.preventDefault();

    const cuisine = cuisineInput.trim();

    if (
      cuisine &&
      !formData.cuisine_specialities.includes(cuisine)
    ) {
      setFormData((prev) => ({
        ...prev,
        cuisine_specialities: [
          ...prev.cuisine_specialities,
          cuisine,
        ],
      }));

      setCuisineInput('');
    }
  };

  // -------------------------------------------------------
  // REMOVE CUISINE
  // -------------------------------------------------------
  const handleRemoveCuisine = (cuisine) => {
    setFormData((prev) => ({
      ...prev,
      cuisine_specialities:
        prev.cuisine_specialities.filter(
          (item) => item !== cuisine
        ),
    }));
  };

  // -------------------------------------------------------
  // PHOTO CHANGE
  // -------------------------------------------------------
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // -------------------------------------------------------
  // SUBMIT
  // -------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError('');

    try {
      const formPayload = new FormData();

      // Basic fields
      formPayload.append('bio', formData.bio || '');
      formPayload.append(
        'hourly_rate',
        formData.hourly_rate || ''
      );
      formPayload.append('city', formData.city || '');
      formPayload.append(
        'availability_status',
        formData.availability_status || 'available'
      );

      // IMPORTANT:
      // Send latitude and longitude to Laravel
      formPayload.append(
        'latitude',
        formData.latitude || ''
      );

      formPayload.append(
        'longitude',
        formData.longitude || ''
      );

      // Cuisine array
      formData.cuisine_specialities.forEach(
        (item, index) => {
          formPayload.append(
            `cuisine_specialities[${index}]`,
            item
          );
        }
      );

      // Photo
      if (photoFile) {
        formPayload.append('photo', photoFile);
      }

      // Laravel method spoofing
      formPayload.append('_method', 'PUT');

      console.log('Sending Chef Profile:', {
        city: formData.city,
        latitude: formData.latitude,
        longitude: formData.longitude,
        cuisine_specialities:
          formData.cuisine_specialities,
      });

      const response = await api.post(
        '/chef/profile',
        formPayload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.status === 'success') {
        alert(
          `Profile updated successfully!\n\nCity: ${formData.city}\nLatitude: ${formData.latitude}\nLongitude: ${formData.longitude}`
        );

        navigate('/chef');
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          'Failed to update profile'
      );
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------
  // LOADING
  // -------------------------------------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // -------------------------------------------------------
  // UI
  // -------------------------------------------------------
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Edit Profile
          </h1>

          <p className="text-slate-400">
            Update your chef details and availability.
          </p>
        </div>

        <button
          onClick={() => navigate('/chef')}
          className="text-slate-400 hover:text-white font-medium transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-2 mb-6">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900/60 rounded-2xl border border-slate-800 p-8 space-y-6"
      >

        {/* PHOTO */}
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-6 border-b border-slate-800">

          <div className="relative group">

            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-950 flex items-center justify-center shrink-0">

              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-slate-500" />
              )}

            </div>

            <label className="absolute bottom-0 right-0 bg-amber-500 text-slate-900 p-1.5 rounded-full cursor-pointer hover:bg-amber-400 transition-colors shadow-lg border-2 border-slate-900 group-hover:scale-110">

              <Camera size={16} />

              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handlePhotoChange}
              />

            </label>

          </div>

          <div className="text-center sm:text-left mt-2">

            <h3 className="text-lg font-semibold text-white">
              Profile Photo
            </h3>

            <p className="text-sm text-slate-400 mt-1">
              Upload a professional photo to stand out to customers.
              Max size: 2MB.
            </p>

            <label className="inline-block mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors border border-slate-700">

              Choose Image

              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handlePhotoChange}
              />

            </label>

          </div>

        </div>

        {/* BIO */}
        <div>

          <label className="block text-sm font-medium text-slate-300 mb-2">
            Bio / About Me
          </label>

          <textarea
            rows="4"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 resize-none transition-colors"
            value={formData.bio}
            onChange={(e) =>
              setFormData({
                ...formData,
                bio: e.target.value,
              })
            }
            placeholder="Tell customers about your culinary journey..."
          />

        </div>

        {/* RATE + CITY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* RATE */}
          <div>

            <label className="block text-sm font-medium text-slate-300 mb-2">
              Hourly Rate (LKR)
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
              value={formData.hourly_rate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hourly_rate: e.target.value,
                })
              }
              placeholder="e.g. 2000"
            />

          </div>

          {/* CITY */}
          <div>

            <label className="block text-sm font-medium text-slate-300 mb-2">
              <span className="flex items-center gap-2">
                <MapPin size={16} className="text-amber-400" />
                City / Base Location
              </span>
            </label>

            <select
              value={formData.city}
              onChange={handleCityChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
            >

              <option value="">
                Select City
              </option>

              <option value="Colombo">
                Colombo
              </option>

              <option value="Nugegoda">
                Nugegoda
              </option>

              <option value="Kandy">
                Kandy
              </option>

              <option value="Galle">
                Galle
              </option>

              <option value="Negombo">
                Negombo
              </option>

            </select>

          </div>

        </div>

        {/* COORDINATES DISPLAY */}
        {formData.latitude && formData.longitude && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">

            <div className="flex items-center gap-2 mb-3">

              <MapPin
                size={18}
                className="text-amber-400"
              />

              <span className="text-sm font-semibold text-white">
                Location Coordinates
              </span>

            </div>

            <div className="grid grid-cols-2 gap-4">

              <div>
                <p className="text-xs text-slate-500">
                  Latitude
                </p>

                <p className="text-sm text-amber-400 font-mono">
                  {formData.latitude}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Longitude
                </p>

                <p className="text-sm text-amber-400 font-mono">
                  {formData.longitude}
                </p>
              </div>

            </div>

            <p className="text-xs text-slate-500 mt-3">
              Coordinates are automatically assigned based on the
              selected city and are used for distance-based chef
              recommendations.
            </p>

          </div>
        )}

        {/* AVAILABILITY */}
        <div>

          <label className="block text-sm font-medium text-slate-300 mb-2">
            Availability Status
          </label>

          <select
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors appearance-none"
            value={formData.availability_status}
            onChange={(e) =>
              setFormData({
                ...formData,
                availability_status: e.target.value,
              })
            }
          >

            <option value="available">
              Available for Bookings
            </option>

            <option value="busy">
              Busy (Fully Booked)
            </option>

            <option value="offline">
              Offline / Vacation
            </option>

          </select>

        </div>

        {/* CUISINE */}
        <div>

          <label className="block text-sm font-medium text-slate-300 mb-2">
            Cuisine Specialties
          </label>

          <div className="flex gap-2 mb-3">

            <input
              type="text"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
              value={cuisineInput}
              onChange={(e) =>
                setCuisineInput(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddCuisine(e);
                }
              }}
              placeholder="e.g. Italian, Sri Lankan"
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

            {formData.cuisine_specialities.map(
              (cuisine, idx) => (
                <span
                  key={idx}
                  className="bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-amber-500/20"
                >

                  {cuisine}

                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveCuisine(cuisine)
                    }
                    className="text-amber-500 hover:text-amber-300 transition-colors ml-1"
                  >
                    ✕
                  </button>

                </span>
              )
            )}

            {formData.cuisine_specialities.length === 0 && (
              <span className="text-slate-500 text-sm italic">
                No specialties added yet.
              </span>
            )}

          </div>

        </div>

        {/* SAVE */}
        <div className="pt-6 mt-6 border-t border-slate-800">

          <button
            type="submit"
            disabled={saving}
            className="w-full flex justify-center items-center gap-2 bg-amber-500 text-slate-950 px-6 py-3.5 rounded-xl font-bold hover:bg-amber-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >

            <Save className="h-5 w-5" />

            {saving
              ? 'Saving Changes...'
              : 'Save Profile'}

          </button>

        </div>

      </form>
    </div>
  );
}