import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Search, MapPin, ChefHat, Star, Award, DollarSign, Calendar, Compass, ShieldAlert, LogOut, Check, X, Camera, User as UserIcon } from 'lucide-react';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [recommendedChefs, setRecommendedChefs] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);

  // Location and search filters
  const [city, setCity] = useState('Colombo');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  
  // Coordinates mapping for distance calculations
  const cityCoords = {
    Colombo: { lat: 6.927179, lng: 79.861244 },
    Nugegoda: { lat: 6.901500, lng: 79.880000 },
    Kandy: { lat: 7.290572, lng: 80.633728 },
    Galle: { lat: 6.053519, lng: 80.220978 },
  };

  // Booking modal state
  const [bookingChef, setBookingChef] = useState(null);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('Lunch (12:00 PM)');
  const [eventType, setEventType] = useState('Family Gathering');
  const [venueLocation, setVenueLocation] = useState('');
  const [guestsCount, setGuestsCount] = useState('20');
  const [hoursCount, setHoursCount] = useState('4');
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchUserData = async () => {
    try {
      const coords = cityCoords[city] || cityCoords.Colombo;
      let url = `/user/stats?latitude=${coords.lat}&longitude=${coords.lng}`;
      if (selectedCuisine) {
        url += `&cuisine=${selectedCuisine}`;
      }
      
      const response = await api.get(url);
      setBookings(response.data.data.bookings);
      setRecommendedChefs(response.data.data.recommended_chefs);
      setCuisines(response.data.data.cuisine_list);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [city, selectedCuisine]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await api.post('/user/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'success') {
        setSuccessMsg('Profile photo updated successfully!');
        // Reload user session data to update global auth context and header
        window.location.reload(); 
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookingChef) return;

    setBookingLoading(true);
    setError('');
    setSuccessMsg('');

    const hours = parseInt(hoursCount) || 1;
    const rate = parseFloat(bookingChef.chef_profile.hourly_rate);
    const totalPrice = rate * hours;

    try {
      await api.post('/bookings', {
        chef_id: bookingChef.id,
        event_date: eventDate,
        event_time: eventTime,
        event_type: eventType,
        location: venueLocation,
        guests_count: parseInt(guestsCount),
        total_price: totalPrice,
      });

      setSuccessMsg(`Booking request for ${bookingChef.name} sent successfully!`);
      setBookingChef(null); // Close modal
      fetchUserData(); // Reload bookings
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit booking request.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950 text-white">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-8 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-800 bg-slate-900 shrink-0 flex items-center justify-center relative">
              {photoUploading && (
                <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-10">
                  <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              {user?.photo_url ? (
                <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-8 h-8 text-slate-500" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-amber-500 text-slate-900 p-1.5 rounded-full cursor-pointer hover:bg-amber-400 transition-colors shadow-lg border border-slate-900 group-hover:scale-110">
              <Camera size={12} />
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={photoUploading} />
            </label>
          </div>
          <div>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20">
              Sri Lankan Chef Finder
            </span>
            <h1 className="text-3xl font-bold text-white mt-2">Welcome, {user?.name}</h1>
            <p className="text-sm text-slate-400">Quickly find and book available chefs near your event venue.</p>
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

      <div className="grid grid-cols-1 gap-8">
        {/* Main Content: Chef Recommendation / Search */}
        <div className="space-y-6">
          {/* Location-aware search filters */}
          <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Compass className="text-amber-400 shrink-0" size={24} />
              <div className="w-full">
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">Your Event Venue City</span>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-transparent text-white font-bold border-b border-slate-700 focus:outline-none py-1 w-full md:w-48 text-sm"
                >
                  <option value="Colombo">Colombo (Western)</option>
                  <option value="Nugegoda">Nugegoda (Western)</option>
                  <option value="Kandy">Kandy (Central)</option>
                  <option value="Galle">Galle (Southern)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 w-full md:w-auto justify-start md:justify-end">
              <button
                onClick={() => setSelectedCuisine('')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  !selectedCuisine
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                All Specialities
              </button>
              {cuisines.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => setSelectedCuisine(cuisine)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    selectedCuisine === cuisine
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Location-aware chef recommendation list */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              <ChefHat className="text-amber-500" size={22} />
              <span>Recommended Chefs (Sorted Closest to Venue)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendedChefs.map((chef) => (
                <div key={chef.id} className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-amber-500/20 hover:bg-slate-900/50 transition-all duration-300">
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-800 bg-slate-900 shrink-0">
                          {(chef.chef_profile?.photo_url || chef.photo_url) ? (
                            <img src={chef.chef_profile?.photo_url || chef.photo_url} alt={chef.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                              <UserIcon className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-white">{chef.name}</h3>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                            <MapPin size={12} className="text-amber-400" />
                            <span>{chef.chef_profile.city} ({chef.distance} km away)</span>
                          </p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-bold font-mono shrink-0">
                        <Star size={12} fill="currentColor" />
                        <span>{parseFloat(chef.chef_profile.rating).toFixed(1)}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-4">
                      {chef.chef_profile.cuisine_specialities.map((cuisine, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-950 text-slate-300 text-[10px] rounded border border-slate-800 font-semibold">
                          {cuisine}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-slate-400 mt-4 line-clamp-2 italic">
                      "{chef.chef_profile.bio || 'Professional chef registered on Rasawathee system.'}"
                    </p>

                    <div className="mt-4 pt-4 border-t border-slate-900 flex items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Award size={14} className="text-slate-500" />
                        <span>{chef.chef_profile.experience_years} Years Exp</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-amber-400">
                        <DollarSign size={14} className="text-amber-500" />
                        <span>LKR {parseFloat(chef.chef_profile.hourly_rate).toLocaleString()}/hr</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setBookingChef(chef);
                      // Default date tomorrow
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setEventDate(tomorrow.toISOString().split('T')[0]);
                    }}
                    className="mt-6 w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                  >
                    Instantly Hire / Book
                  </button>
                </div>
              ))}

              {recommendedChefs.length === 0 && (
                <div className="col-span-2 text-center p-12 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl text-slate-500">
                  No active available chefs matching your filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {bookingChef && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setBookingChef(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <ChefHat className="text-amber-500" size={28} />
              <div>
                <h3 className="font-bold text-white text-lg">Hire {bookingChef.name}</h3>
                <p className="text-xs text-amber-400">Rate: LKR {parseFloat(bookingChef.chef_profile.hourly_rate).toLocaleString()}/hr</p>
              </div>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Event Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Time Slot
                  </label>
                  <select
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="Morning (08:00 AM)">Morning (08:00 AM)</option>
                    <option value="Lunch (12:00 PM)">Lunch (12:00 PM)</option>
                    <option value="Afternoon (04:00 PM)">Afternoon (04:00 PM)</option>
                    <option value="Dinner (07:00 PM)">Dinner (07:00 PM)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Event Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="Family Gathering">Family Gathering</option>
                    <option value="Wedding Function">Wedding Function</option>
                    <option value="Funeral / Alms Giving">Funeral / Alms Giving</option>
                    <option value="Birthday Party">Birthday Party</option>
                    <option value="Religious Event">Religious Event</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Guests Count
                  </label>
                  <input
                    type="number"
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(e.target.value)}
                    min="1"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Cooking Hours
                  </label>
                  <input
                    type="number"
                    value={hoursCount}
                    onChange={(e) => setHoursCount(e.target.value)}
                    min="1"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Venue Location Address
                </label>
                <input
                  type="text"
                  value={venueLocation}
                  onChange={(e) => setVenueLocation(e.target.value)}
                  placeholder="Street address, City"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Total Calculation */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-400">Total Bill Estimate</span>
                <span className="text-amber-400 font-mono text-base">
                  LKR {((parseFloat(bookingChef.chef_profile.hourly_rate) || 0) * (parseInt(hoursCount) || 1)).toLocaleString()}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBookingChef(null)}
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-950/70 border border-slate-800 text-slate-400 text-sm font-semibold rounded-xl cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 text-sm font-bold rounded-xl cursor-pointer transition-all disabled:opacity-50"
                >
                  {bookingLoading ? 'Submitting...' : 'Confirm Book Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
