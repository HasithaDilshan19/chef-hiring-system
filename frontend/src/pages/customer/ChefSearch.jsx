import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, ChefHat, Star, User, X, Package,
  ArrowRight, Calendar, Clock, Users, CheckCircle2,
  Send, ShieldAlert,
} from 'lucide-react';
import api from '../../services/api';

export default function ChefSearch() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const searchParams  = new URLSearchParams(location.search);
  const packageId     = searchParams.get('package_id');
  const packageName   = searchParams.get('package_name');
  const packageGuests = Number(searchParams.get('guests_count') || 4);
  const packagePrice  = searchParams.get('package_price') || '';

  // ── CHEFS ──────────────────────────────────────────────
  const [chefs,   setChefs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', city: '', cuisine: '' });

  // ── BOOKING MODAL ──────────────────────────────────────
  const [selectedChef, setSelectedChef] = useState(null);   // chef object
  const [bookingForm,  setBookingForm]  = useState({
    event_date:    '',
    event_time:    '',
    event_type:    '',
    location:      '',
    guests_count:  packageGuests,
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError,   setBookingError]   = useState('');

  // ── SUCCESS POPUP ──────────────────────────────────────
  const [showSuccess, setShowSuccess] = useState(false);

  // ── FETCH ──────────────────────────────────────────────
  useEffect(() => { fetchChefs(); }, []);

  const fetchChefs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.name)    params.append('name',    filters.name);
      if (filters.city)    params.append('city',    filters.city);
      if (filters.cuisine) params.append('cuisine', filters.cuisine);
      const res = await api.get(`/chefs?${params.toString()}`);
      if (res.data.status === 'success') setChefs(res.data.chefs);
    } catch (e) {
      console.error('Error fetching chefs:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => { e.preventDefault(); fetchChefs(); };

  const handleClear = async () => {
    setFilters({ name: '', city: '', cuisine: '' });
    setLoading(true);
    try {
      const res = await api.get('/chefs');
      if (res.data.status === 'success') setChefs(res.data.chefs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── OPEN BOOKING MODAL ────────────────────────────────
  const openBookingModal = (chef) => {
    setSelectedChef(chef);
    setBookingError('');
    setBookingForm({
      event_date:   '',
      event_time:   '',
      event_type:   packageName || '',   // pre-fill with package name
      location:     '',
      guests_count: packageGuests,
    });
  };

  const closeBookingModal = () => {
    if (bookingLoading) return;
    setSelectedChef(null);
    setBookingError('');
  };

  // ── SUBMIT BOOKING ────────────────────────────────────
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError('');

    try {
      const payload = {
        chef_id:      Number(selectedChef.id),
        event_date:   bookingForm.event_date,
        event_time:   bookingForm.event_time,
        event_type:   bookingForm.event_type,
        location:     bookingForm.location,
        guests_count: Number(bookingForm.guests_count),
        // attach package info if present
        ...(packageId && {
          package_id:    Number(packageId),
          package_name:  packageName,
          package_price: packagePrice,
          total_price:   packagePrice || null,
        }),
      };

      const res = await api.post('/bookings', payload);

      if (res.data?.status === 'success') {
        setSelectedChef(null);
        setShowSuccess(true);
        // auto-hide success popup after 4 seconds
        setTimeout(() => {
          setShowSuccess(false);
          navigate('/bookings');
        }, 4000);
      } else {
        setBookingError(res.data?.message || 'Failed to submit booking.');
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 422) {
        const errors = err.response?.data?.errors;
        if (errors) {
          const first = Object.values(errors)[0];
          setBookingError(Array.isArray(first) ? first[0] : String(first));
        } else {
          setBookingError(err.response?.data?.message || 'Please check your booking details.');
        }
      } else {
        setBookingError(err.response?.data?.message || 'Failed to submit booking.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── PAGE HEADER ─────────────────────────────── */}
      <div className="mb-8 border-b border-slate-800 pb-6">
        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20 mb-3 inline-block">
          Explore Chefs
        </span>
        <h1 className="text-3xl font-bold text-white mb-2">Find a Chef</h1>
        <p className="text-slate-400">Discover top culinary talent for your next event.</p>
      </div>

      {/* ── PACKAGE BANNER ──────────────────────────── */}
      {packageId && packageName && (
        <div className="flex items-center gap-3 mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <Package size={20} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Package Selected</p>
            <p className="text-sm font-semibold text-white mt-0.5">{packageName}</p>
            <p className="text-xs text-slate-400">
              Click <strong className="text-amber-400">Book with Chef</strong> below to send your booking directly — no extra steps needed.
            </p>
          </div>
          <Link
            to="/packages"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 shrink-0"
          >
            Change <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* ── SEARCH BAR ──────────────────────────────── */}
      <div className="bg-slate-900/40 p-6 rounded-2xl shadow-sm border border-slate-800 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <User className="absolute left-3 top-3 text-slate-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Chef Name (e.g. John)"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-amber-500 text-white transition-colors"
              value={filters.name}
              onChange={(e) => setFilters({...filters, name: e.target.value})}
            />
          </div>
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-3 text-slate-500 h-5 w-5" />
            <input
              type="text"
              placeholder="City (e.g. Colombo)"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-amber-500 text-white transition-colors"
              value={filters.city}
              onChange={(e) => setFilters({...filters, city: e.target.value})}
            />
          </div>
          <div className="flex-1 relative">
            <ChefHat className="absolute left-3 top-3 text-slate-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Cuisine (e.g. Italian)"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-amber-500 text-white transition-colors"
              value={filters.cuisine}
              onChange={(e) => setFilters({...filters, cuisine: e.target.value})}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="bg-slate-800 text-slate-300 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-700 transition flex items-center justify-center border border-slate-700"
              title="Clear Filters"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="submit"
              className="bg-amber-500 text-slate-950 px-8 py-2.5 rounded-xl font-bold hover:bg-amber-600 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Search className="h-5 w-5" />
              Search
            </button>
          </div>
        </form>
      </div>

      {/* ── CHEF GRID ───────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : chefs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chefs.map(chef => (
            <div
              key={chef.id}
              className="bg-slate-900/60 rounded-2xl shadow-sm border border-slate-800 overflow-hidden hover:border-amber-500/30 transition group relative"
            >
              <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-800" />

              <div className="absolute top-12 left-6 w-20 h-20 rounded-full border-4 border-slate-900 bg-slate-950 overflow-hidden shadow-lg flex items-center justify-center">
                {(chef.chef_profile?.photo_url || chef.photo_url) ? (
                  <img src={chef.chef_profile?.photo_url || chef.photo_url} alt={chef.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-slate-500" />
                )}
              </div>

              <div className="px-6 pb-6 pt-10 mt-2">
                <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">{chef.name}</h3>

                <div className="flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
                    {chef.chef_profile?.city || 'Location not specified'}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Available
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                  <div className="flex items-center text-amber-500 font-medium text-sm">
                    <Star className="h-4 w-4 fill-current mr-1 text-amber-400" />
                    {(() => {
                      const r = Number(chef.rating ?? chef.chef_profile?.rating ?? 0);
                      const count = Number(chef.reviews_count ?? chef.chef_profile?.reviews_count ?? 0);
                      if (count > 0 && r > 0) {
                        return (
                          <>
                            <span className="font-bold text-amber-400">{r.toFixed(1)}</span>
                            <span className="text-slate-400 text-xs font-normal ml-1">({count} {count === 1 ? 'review' : 'reviews'})</span>
                          </>
                        );
                      }
                      return <span className="text-slate-400 text-xs font-medium">New (No ratings)</span>;
                    })()}
                  </div>
                  <span className="text-slate-700">•</span>
                  <span className="text-slate-300 font-medium">
                    LKR {parseFloat(chef.chef_profile?.hourly_rate || 0).toLocaleString()}/hr
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(chef.chef_profile?.cuisine_specialities || []).slice(0, 3).map((c, i) => (
                    <span key={i} className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-lg font-medium border border-slate-700">
                      {c}
                    </span>
                  ))}
                </div>

                {/* ── BUTTON: package mode → open modal | normal → go to profile */}
                {packageId ? (
                  <button
                    type="button"
                    onClick={() => openBookingModal(chef)}
                    className="mt-6 w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 py-2.5 rounded-xl font-bold transition shadow-lg shadow-amber-500/20"
                  >
                    <Send size={16} />
                    Book {chef.name} with {packageName}
                  </button>
                ) : (
                  <Link
                    to={`/chefs/${chef.id}`}
                    className="mt-6 block w-full text-center bg-slate-800 text-white py-2.5 rounded-xl font-medium hover:bg-slate-700 transition border border-slate-700 hover:border-slate-600"
                  >
                    View Profile
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800 border-dashed">
          <ChefHat className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">No chefs found</h3>
          <p className="text-slate-400 mt-2">Try adjusting your search filters or trying a different cuisine.</p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          BOOKING MODAL (shown only when package is selected)
      ══════════════════════════════════════════════════ */}
      {selectedChef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-0.5">
                  Package Booking
                </p>
                <h2 className="text-lg font-bold text-white">
                  Book {selectedChef.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeBookingModal}
                disabled={bookingLoading}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition disabled:opacity-40"
              >
                <X size={20} />
              </button>
            </div>

            {/* Package Tag */}
            <div className="mx-6 mt-5 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <Package size={18} className="text-amber-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-slate-400">Selected Package</p>
                  <p className="text-sm font-bold text-amber-300">{packageName}</p>
                </div>
                {packagePrice && (
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400">Package Price</p>
                    <p className="text-sm font-black text-emerald-400">{packagePrice}</p>
                  </div>
                )}
              </div>
              {packagePrice && (
                <div className="mt-3 border-t border-amber-500/20 pt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Estimated Total</span>
                  <span className="text-base font-black text-white">{packagePrice}</span>
                </div>
              )}
            </div>

            {/* Error */}
            {bookingError && (
              <div className="mx-6 mt-4 flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                {bookingError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleBookingSubmit} className="px-6 py-5 space-y-4">

              {/* Event Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Event Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 text-slate-500 h-5 w-5" />
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
                    value={bookingForm.event_date}
                    onChange={(e) => setBookingForm(p => ({...p, event_date: e.target.value}))}
                    disabled={bookingLoading}
                  />
                </div>
              </div>

              {/* Event Time */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Event Time *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 text-slate-500 h-5 w-5" />
                  <input
                    type="time"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
                    value={bookingForm.event_time}
                    onChange={(e) => setBookingForm(p => ({...p, event_time: e.target.value}))}
                    disabled={bookingLoading}
                  />
                </div>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Event Type *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wedding, Birthday, Family Dinner…"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
                  value={bookingForm.event_type}
                  onChange={(e) => setBookingForm(p => ({...p, event_type: e.target.value}))}
                  disabled={bookingLoading}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Venue / Location *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your event venue or address"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
                  value={bookingForm.location}
                  onChange={(e) => setBookingForm(p => ({...p, location: e.target.value}))}
                  disabled={bookingLoading}
                />
              </div>

              {/* Guests Count */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Number of Guests *</label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 text-slate-500 h-5 w-5" />
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
                    value={bookingForm.guests_count}
                    onChange={(e) => setBookingForm(p => ({...p, guests_count: e.target.value}))}
                    disabled={bookingLoading}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeBookingModal}
                  disabled={bookingLoading}
                  className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-medium transition disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-amber-500/20"
                >
                  {bookingLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          SUCCESS POPUP
      ══════════════════════════════════════════════════ */}
      {showSuccess && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={44} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Booking Sent! 🎉</h2>
            <p className="text-slate-400 text-sm mb-1">
              Your booking request for the
            </p>
            <p className="text-amber-400 font-bold text-sm mb-1">"{packageName}" package</p>
            <p className="text-slate-400 text-sm">
              has been sent to the chef. You will receive a confirmation email shortly.
            </p>
            <div className="mt-6 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full animate-[shrink_4s_linear_forwards]" style={{
                animation: 'width 4s linear forwards',
                width: '100%',
              }} />
            </div>
            <p className="text-xs text-slate-500 mt-3">Redirecting to My Bookings…</p>
          </div>
        </div>
      )}

    </div>
  );
}
