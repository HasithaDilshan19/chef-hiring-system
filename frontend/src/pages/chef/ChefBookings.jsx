import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Calendar, Check, X, ShieldAlert, DollarSign, Users, MapPin, Clock } from 'lucide-react';

const ChefBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchBookings = async () => {
    try {
      // The chef stats endpoint returns all the bookings for this chef
      const response = await api.get('/chef/stats');
      const statsData = response.data.data;
      setBookings(statsData.bookings || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleBookingAction = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      setSuccessMsg(`Booking successfully updated to ${newStatus}.`);
      fetchBookings();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-8 border-b border-slate-800">
        <div>
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20">
            Booking Management
          </span>
          <h1 className="text-3xl font-bold text-white mt-2">Gig Requests</h1>
          <p className="text-sm text-slate-400">View and manage all your upcoming and past event bookings.</p>
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

      <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings?.map((booking) => (
            <div
              key={booking.id}
              className={`flex flex-col p-6 rounded-2xl border transition-all ${
                booking.status === 'pending'
                  ? 'bg-slate-900 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                  : 'bg-slate-950/80 border-slate-800/80'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{booking.event_type}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-amber-500 flex-shrink-0" />
                      <span>{new Date(booking.event_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-500 flex-shrink-0" />
                      <span>{booking.event_time}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border ${
                  booking.status === 'pending'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : booking.status === 'accepted'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : booking.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                }`}>
                  {booking.status}
                </span>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                  <div className="bg-blue-500/10 p-2 rounded-lg">
                    <Users size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Customer</span>
                    <div className="text-sm font-medium text-slate-200">{booking.customer?.name}</div>
                    <div className="text-xs text-slate-400">{booking.customer?.phone || 'No phone provided'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                  <div className="bg-amber-500/10 p-2 rounded-lg">
                    <MapPin size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Venue Location</span>
                    <div className="text-sm font-medium text-slate-200">{booking.location}</div>
                    <div className="text-xs text-slate-400">{booking.guests_count} Guests Expected</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                  <div className="bg-emerald-500/10 p-2 rounded-lg">
                    <DollarSign size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Agreed Budget</span>
                    <div className="text-sm font-mono font-bold text-emerald-400">LKR {parseFloat(booking.total_price).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                {booking.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleBookingAction(booking.id, 'rejected')}
                      className="flex-1 py-2.5 bg-slate-900 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-xl cursor-pointer transition-all duration-200 font-semibold text-sm flex justify-center items-center gap-2"
                    >
                      <X size={16} /> Decline
                    </button>
                    <button
                      onClick={() => handleBookingAction(booking.id, 'accepted')}
                      className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl cursor-pointer transition-all duration-200 text-sm flex justify-center items-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                      <Check size={16} /> Accept Gig
                    </button>
                  </div>
                )}

                {booking.status === 'accepted' && (
                  <button
                    onClick={() => handleBookingAction(booking.id, 'completed')}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl cursor-pointer transition-all duration-200 text-sm flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <Check size={16} /> Mark as Completed
                  </button>
                )}
                
                {['completed', 'cancelled', 'rejected'].includes(booking.status) && (
                  <div className="text-center text-xs text-slate-500 font-medium py-2">
                    No further actions required
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {bookings?.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 bg-slate-950/50 rounded-2xl border border-slate-800 border-dashed">
              <Calendar size={48} className="text-slate-700 mb-4" />
              <p className="text-lg font-medium">No booking requests found.</p>
              <p className="text-sm mt-1">When customers book you for events, they will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChefBookings;
