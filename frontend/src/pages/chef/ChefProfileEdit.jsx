import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, AlertCircle, Camera, User, MapPin, Package, Plus, Trash2, X } from 'lucide-react';
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
  // PACKAGES STATE
  // -------------------------------------------------------
  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [packageSaving, setPackageSaving] = useState(false);
  const [packageError, setPackageError] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    price: '',
    guests_count: 2,
    duration_hours: 3,
    features: [],
  });

  // -------------------------------------------------------
  // CITY COORDINATES
  // -------------------------------------------------------
  const cityCoordinates = {
    Colombo: { latitude: 6.927179, longitude: 79.861244 },
    Nugegoda: { latitude: 6.901500, longitude: 79.880000 },
    Kandy: { latitude: 7.290572, longitude: 80.633728 },
    Galle: { latitude: 6.053519, longitude: 80.220978 },
    Jaffna: { latitude: 9.661498, longitude: 80.012229 },
    Negombo: { latitude: 7.208300, longitude: 79.835800 },
    Kurunegala: { latitude: 7.481775, longitude: 80.360886 },
    Kuliyapitiya: { latitude: 7.469085, longitude: 80.040125 },
    Anuradhapura: { latitude: 8.311351, longitude: 80.403730 },
    Polonnaruwa: { latitude: 7.939634, longitude: 81.000305 },
    Matara: { latitude: 5.954920, longitude: 80.554956 },
    Hambantota: { latitude: 6.124592, longitude: 81.118525 },
    Ratnapura: { latitude: 6.682776, longitude: 80.399222 },
    Badulla: { latitude: 6.993402, longitude: 81.055000 },
    'Nuwara Eliya': { latitude: 6.949717, longitude: 80.789107 },
    Batticaloa: { latitude: 7.717013, longitude: 81.692415 },
    Trincomalee: { latitude: 8.587320, longitude: 81.215212 },
    Ampara: { latitude: 7.291244, longitude: 81.672439 },
    Kalutara: { latitude: 6.585390, longitude: 79.960739 },
    Gampaha: { latitude: 7.087310, longitude: 79.992686 },
    Kegalle: { latitude: 7.251329, longitude: 80.346429 },
    Matale: { latitude: 7.467469, longitude: 80.623416 },
    Puttalam: { latitude: 8.036186, longitude: 79.828292 },
    Vavuniya: { latitude: 8.754228, longitude: 80.498188 },
    Mannar: { latitude: 8.981033, longitude: 79.904412 },
    Kilinochchi: { latitude: 9.380289, longitude: 80.398642 },
    Mullaitivu: { latitude: 9.267324, longitude: 80.814324 },
    Monaragala: { latitude: 6.872421, longitude: 81.350727 },
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
      fetchPackages();
    }
  }, [user?.id]);

  // -------------------------------------------------------
  // FETCH PACKAGES
  // -------------------------------------------------------
  const fetchPackages = async () => {
    try {
      setPackagesLoading(true);
      const response = await api.get('/chef/packages');
      if (response.data.status === 'success') {
        setPackages(response.data.packages || []);
      }
    } catch (err) {
      console.error('Failed to load packages', err);
    } finally {
      setPackagesLoading(false);
    }
  };

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

              {Object.keys(cityCoordinates).map((cityName) => (
                <option key={cityName} value={cityName}>
                  {cityName}
                </option>
              ))}

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

      {/* =========================================================
          PACKAGES SECTION (outside the profile form)
      ========================================================= */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Package className="text-amber-400" size={22} />
              My Service Packages
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Create packages that customers can see on your profile.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setShowPackageForm(true); setPackageError(''); }}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl font-bold text-sm transition-colors"
          >
            <Plus size={16} /> Add Package
          </button>
        </div>

        {/* PACKAGE FORM MODAL */}
        {showPackageForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">New Package</h3>
                <button type="button" onClick={() => setShowPackageForm(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {packageError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-4">
                  {packageError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Package Name *</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
                    value={newPackage.name}
                    onChange={e => setNewPackage(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Romantic Dinner for Two"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                  <textarea
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm resize-none"
                    value={newPackage.description}
                    onChange={e => setNewPackage(p => ({ ...p, description: e.target.value }))}
                    placeholder="Describe what's included..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Price</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
                      value={newPackage.price}
                      onChange={e => setNewPackage(p => ({ ...p, price: e.target.value }))}
                      placeholder="e.g. LKR 8,000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Guests</label>
                    <input
                      type="number"
                      min={1}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
                      value={newPackage.guests_count}
                      onChange={e => setNewPackage(p => ({ ...p, guests_count: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Hours</label>
                    <input
                      type="number"
                      min={1}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
                      value={newPackage.duration_hours}
                      onChange={e => setNewPackage(p => ({ ...p, duration_hours: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Features / Includes</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
                      value={featureInput}
                      onChange={e => setFeatureInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const f = featureInput.trim();
                          if (f && !newPackage.features.includes(f)) {
                            setNewPackage(p => ({ ...p, features: [...p.features, f] }));
                            setFeatureInput('');
                          }
                        }
                      }}
                      placeholder="e.g. Fresh ingredients supplied"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const f = featureInput.trim();
                        if (f && !newPackage.features.includes(f)) {
                          setNewPackage(p => ({ ...p, features: [...p.features, f] }));
                          setFeatureInput('');
                        }
                      }}
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newPackage.features.map((f, i) => (
                      <span key={i} className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5">
                        {f}
                        <button type="button" onClick={() => setNewPackage(p => ({ ...p, features: p.features.filter((_, fi) => fi !== i) }))} className="text-amber-500 hover:text-amber-300">✕</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPackageForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={packageSaving}
                  onClick={async () => {
                    if (!newPackage.name.trim()) {
                      setPackageError('Package name is required.');
                      return;
                    }
                    setPackageSaving(true);
                    setPackageError('');
                    try {
                      const response = await api.post('/chef/packages', newPackage);
                      if (response.data.status === 'success') {
                        setPackages(prev => [response.data.package, ...prev]);
                        setNewPackage({ name: '', description: '', price: '', guests_count: 2, duration_hours: 3, features: [] });
                        setFeatureInput('');
                        setShowPackageForm(false);
                      }
                    } catch (err) {
                      setPackageError(err.response?.data?.message || 'Failed to save package.');
                    } finally {
                      setPackageSaving(false);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors disabled:opacity-60"
                >
                  {packageSaving ? 'Saving...' : 'Save Package'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PACKAGES LIST */}
        {packagesLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : packages.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center">
            <Package className="mx-auto text-slate-600 mb-3" size={36} />
            <p className="text-slate-400 text-sm">No packages yet. Add your first one above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map(pkg => (
              <div
                key={pkg.id}
                className="relative bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/30 transition-colors"
              >
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm('Delete this package?')) return;
                    try {
                      await api.delete(`/chef/packages/${pkg.id}`);
                      setPackages(prev => prev.filter(p => p.id !== pkg.id));
                    } catch (err) {
                      alert('Failed to delete package.');
                    }
                  }}
                  className="absolute top-4 right-4 text-slate-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>

                <h3 className="text-white font-bold text-base pr-8">{pkg.name}</h3>
                {pkg.description && (
                  <p className="text-slate-400 text-sm mt-1 leading-5">{pkg.description}</p>
                )}

                <div className="flex flex-wrap gap-3 mt-3 text-xs font-semibold text-slate-400">
                  {pkg.price && (
                    <span className="text-amber-400 font-bold text-sm">{pkg.price}</span>
                  )}
                  <span>👥 Up to {pkg.guests_count} guests</span>
                  <span>⏱ {pkg.duration_hours}h</span>
                </div>

                {pkg.features && pkg.features.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="text-emerald-400">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}