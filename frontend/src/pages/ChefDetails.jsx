import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ChefHat, Star, Clock, Calendar, Users, DollarSign } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ChefDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chef, setChef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  const [bookingForm, setBookingForm] = useState({
    event_date: '',
    event_time: '',
    event_type: '',
    location: '',
    guests_count: 1
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    fetchChefDetails();
  }, [id]);

  const fetchChefDetails = async () => {
    try {
      const response = await api.get(`/chefs/${id}`);
      if (response.data.status === 'success') {
        setChef(response.data.chef);
      }
    } catch (error) {
      console.error('Error fetching chef details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError('');

    try {
      const payload = {
        chef_id: chef.id,
        ...bookingForm
      };
      
      const response = await api.post('/bookings', payload);
      
      if (response.data.status === 'success') {
        setShowBookingModal(false);
        alert('Booking requested successfully!');
        navigate('/dashboard'); // redirect customer to dashboard to see their bookings
      }
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError(error.response?.data?.message || 'Failed to submit booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!chef) {
    return <div className="text-center py-20 text-gray-500">Chef not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-end -mt-16 mb-6">
            <div className="w-32 h-32 bg-white rounded-full p-1 shadow-md border border-gray-100 relative z-10">
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl font-bold">
                {chef.name.charAt(0)}
              </div>
            </div>
            
            {user?.role === 'customer' && (
              <button 
                onClick={() => setShowBookingModal(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm"
              >
                Book {chef.name.split(' ')[0]}
              </button>
            )}
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{chef.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-2">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {chef.chef_profile?.city || 'Location not specified'}
              </div>
              <div className="flex items-center gap-1 text-amber-500 font-medium">
                <Star className="h-4 w-4 fill-current" />
                {chef.chef_profile?.rating || 'New'} Rating
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {chef.chef_profile?.experience_years || 0} Years Experience
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {chef.chef_profile?.hourly_rate || '0'}/hr
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About the Chef</h2>
            <p className="text-gray-600 leading-relaxed">
              {chef.chef_profile?.bio || 'This chef has not provided a bio yet.'}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {chef.chef_profile?.cuisine_specialities?.length > 0 ? (
                chef.chef_profile.cuisine_specialities.map((cuisine, idx) => (
                  <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-100">
                    {cuisine}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">Not specified</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Book {chef.name}</h2>
            
            {bookingError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                {bookingError}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                  <input 
                    type="date" 
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={bookingForm.event_date}
                    onChange={(e) => setBookingForm({...bookingForm, event_date: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                  <input 
                    type="time" 
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={bookingForm.event_time}
                    onChange={(e) => setBookingForm({...bookingForm, event_time: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type (e.g., Wedding, Birthday)</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={bookingForm.event_type}
                  onChange={(e) => setBookingForm({...bookingForm, event_type: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location / Venue</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={bookingForm.location}
                  onChange={(e) => setBookingForm({...bookingForm, location: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                  <input 
                    type="number" 
                    min="1"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={bookingForm.guests_count}
                    onChange={(e) => setBookingForm({...bookingForm, guests_count: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-8">
                <button 
                  type="submit" 
                  disabled={bookingLoading}
                  className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? 'Submitting...' : 'Request Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
