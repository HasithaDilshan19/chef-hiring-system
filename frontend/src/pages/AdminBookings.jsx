import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CalendarDays, ShieldAlert, MessageSquare, MapPin, DollarSign, Calendar, Clock, ChefHat, User, Check } from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendEmail = async (bookingId) => {
    try {
      setSuccessMsg('');
      setError('');
      const response = await api.post(`/admin/bookings/${bookingId}/email-alert`);
      if (response.data.status === 'success') {
        setSuccessMsg(response.data.message);
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email alert.');
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      if (response.data.status === 'success') {
        setBookings(response.data.bookings);
      }
    } catch (err) {
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <header className="mb-8 border-b border-slate-800 pb-6">
        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20 mb-3 inline-block">
          Booking Management
        </span>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <CalendarDays className="text-amber-500" size={32} />
          All Platform Bookings
        </h1>
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

      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col hover:border-amber-500/30 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{booking.event_type}</h3>
                  <div className="flex gap-4 text-xs text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-amber-500" />
                      {new Date(booking.event_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-500" />
                      {booking.event_time}
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border ${
                  booking.status === 'pending' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                  booking.status === 'accepted' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  booking.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  'bg-slate-500/10 text-slate-400 border-slate-500/20'
                }`}>
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {/* Chef Details */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800/80 space-y-3">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
                    <ChefHat size={16} className="text-amber-500" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chef Details</span>
                  </div>
                  <div className="text-sm font-semibold text-white">{booking.chef?.name || 'Unknown'}</div>
                  <div className="text-xs text-slate-400">ID: {booking.chef?.id}</div>
                  <div className="text-xs text-slate-400 font-mono">{booking.chef?.phone || 'No Phone Number'}</div>
                  
                  {booking.chef?.phone && (
                    <button
                      onClick={() => handleSendEmail(booking.id)}
                      className="mt-2 w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-lg text-xs font-bold transition-colors flex justify-center items-center gap-2"
                    >
                      <MessageSquare size={14} /> Send Email Alert
                    </button>
                  )}
                </div>

                {/* Customer Details */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800/80 space-y-3">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
                    <User size={16} className="text-blue-500" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Details</span>
                  </div>
                  <div className="text-sm font-semibold text-white">{booking.customer?.name || 'Unknown'}</div>
                  <div className="text-xs text-slate-400">ID: {booking.customer?.id}</div>
                  <div className="text-xs text-slate-400 font-mono">{booking.customer?.phone || 'No Phone Number'}</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin size={16} className="text-slate-500" />
                  {booking.location} ({booking.guests_count} Guests)
                </div>
                <div className="font-mono font-bold text-emerald-400">
                  LKR {parseFloat(booking.total_price).toLocaleString()}
                </div>
              </div>
            </div>
          ))}

          {bookings.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center bg-slate-950/50 rounded-2xl border border-slate-800 border-dashed text-slate-500">
              <CalendarDays size={48} className="mb-4 text-slate-700" />
              <p className="text-lg font-medium">No bookings found across the platform.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
