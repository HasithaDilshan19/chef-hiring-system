import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Calendar, Check, X, ShieldAlert, DollarSign, Users, MapPin, Clock, CheckCircle2, Filter } from 'lucide-react';
import { ToastContainer, useToast } from '../../components/ui/Toast';
import ConfirmModal from '../../components/ui/ConfirmModal';

const ChefBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  //  Status Filter State
  const [statusFilter, setStatusFilter] = useState('all');

  // Cancellation reason panel (inline)
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');

  // Confirm modal state
  const [modal, setModal] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: 'Yes, Confirm',
    cancelText: 'No, Go Back',
    variant: 'warning',
    onConfirm: null,
  });

  const { toasts, showToast, dismissToast } = useToast();

  const fetchBookings = async () => {
    try {
      const response = await api.get('/chef/stats');
      const fetchedBookings = response.data.data.bookings || [];
      setBookings(fetchedBookings);
      setFilteredBookings(fetchedBookings);
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

  //  Filter Bookings by Status
  useEffect(() => {
    let result = bookings;

    if (statusFilter !== 'all') {
      result = result.filter(booking => booking.status === statusFilter);
    }

    setFilteredBookings(result);
  }, [statusFilter, bookings]);

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const executeAction = async (bookingId, newStatus, reason = null) => {
    setActionLoading(true);
    closeModal();
    try {
      const payload = { status: newStatus };
      if (newStatus === 'cancelled' && reason) {
        payload.cancellation_reason = reason;
      }
      await api.put(`/bookings/${bookingId}/status`, payload);
      setCancellingBookingId(null);
      setCancellationReason('');
      fetchBookings();

      const messages = {
        accepted:  { msg: '🎉 Booking accepted! The customer will be notified.',    type: 'success' },
        rejected:  { msg: '🚫 Booking request declined.',                           type: 'error'   },
        completed: { msg: '✅ Booking marked as completed. Great work!',             type: 'success' },
        cancelled: { msg: '❌ Booking cancelled. The customer has been notified.',   type: 'warning' },
      };
      const { msg, type } = messages[newStatus] || { msg: `Booking updated to ${newStatus}.`, type: 'info' };
      showToast(msg, type);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update booking.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  /* ─── Button handlers — open modal first ─── */
  const confirmAccept = (booking) => {
    setModal({
      open: true,
      title: 'Accept This Booking?',
      message: `You are about to accept the "${booking.event_type}" gig from ${booking.customer?.name}. The customer will be notified immediately.`,
      confirmText: 'Yes, Accept',
      cancelText: 'No, Go Back',
      variant: 'success',
      onConfirm: () => executeAction(booking.id, 'accepted'),
    });
  };

  const confirmDecline = (booking) => {
    setModal({
      open: true,
      title: 'Decline This Booking?',
      message: `Are you sure you want to decline the "${booking.event_type}" request from ${booking.customer?.name}? This action cannot be undone.`,
      confirmText: 'Yes, Decline',
      cancelText: 'No, Go Back',
      variant: 'danger',
      onConfirm: () => executeAction(booking.id, 'rejected'),
    });
  };

  const confirmComplete = (booking) => {
    setModal({
      open: true,
      title: 'Mark as Completed?',
      message: `Confirm that the "${booking.event_type}" event for ${booking.customer?.name} has been successfully completed.`,
      confirmText: 'Yes, Complete',
      cancelText: 'Not Yet',
      variant: 'success',
      onConfirm: () => executeAction(booking.id, 'completed'),
    });
  };

  const confirmCancel = (booking, reason) => {
    setModal({
      open: true,
      title: 'Cancel This Booking?',
      message: `Are you sure you want to cancel the "${booking.event_type}" gig? The customer will be informed of the cancellation.`,
      confirmText: 'Yes, Cancel',
      cancelText: 'No, Go Back',
      variant: 'danger',
      onConfirm: () => executeAction(booking.id, 'cancelled', reason),
    });
  };

  //  Clear filter
  const clearFilter = () => {
    setStatusFilter('all');
  };

  //  Get status count
  const getStatusCount = (status) => {
    return bookings.filter(b => b.status === status).length;
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
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Confirm Modal */}
      <ConfirmModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        variant={modal.variant}
        loading={actionLoading}
        onConfirm={modal.onConfirm}
        onCancel={closeModal}
      />

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-8 border-b border-slate-800">
        <div>
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20">
            Booking Management
          </span>
          <h1 className="text-3xl font-bold text-white mt-2">Gig Requests</h1>
          <p className="text-sm text-slate-400">View and manage all your upcoming and past event bookings.</p>
        </div>
        <div className="text-sm text-slate-400 bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800">
          Total: <span className="text-white font-bold">{filteredBookings.length}</span> bookings
        </div>
      </header>

      {error && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex gap-2">
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      )}

      {/*  Filter Section */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white appearance-none focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
          >
            <option value="all">All Statuses ({bookings.length})</option>
            <option value="pending">Pending ({getStatusCount('pending')})</option>
            <option value="accepted"> Accepted ({getStatusCount('accepted')})</option>
            <option value="completed"> Completed ({getStatusCount('completed')})</option>
            <option value="cancelled"> Cancelled ({getStatusCount('cancelled')})</option>
            <option value="rejected"> Rejected ({getStatusCount('rejected')})</option>
          </select>
        </div>

        {statusFilter !== 'all' && (
          <button
            onClick={clearFilter}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition flex items-center gap-2 text-sm"
          >
            <X size={16} />
            Clear Filter
          </button>
        )}

        {statusFilter !== 'all' && (
          <span className="text-sm text-slate-400">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </span>
        )}
      </div>

      <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className={`flex flex-col p-6 rounded-2xl border transition-all ${
                booking.status === 'pending'
                  ? 'bg-slate-900 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                  : booking.status === 'accepted'
                  ? 'bg-slate-900 border-blue-500/20'
                  : booking.status === 'completed'
                  ? 'bg-slate-900 border-emerald-500/20'
                  : booking.status === 'cancelled'
                  ? 'bg-slate-900 border-rose-500/20'
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
                  booking.status === 'pending'   ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : booking.status === 'accepted'  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : booking.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                }`}>
                  {booking.status}
                </span>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                  <div className="bg-blue-500/10 p-2 rounded-lg"><Users size={16} className="text-blue-400" /></div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Customer</span>
                    <div className="text-sm font-medium text-slate-200">{booking.customer?.name}</div>
                    <div className="text-xs text-slate-400">{booking.customer?.phone || 'No phone provided'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                  <div className="bg-amber-500/10 p-2 rounded-lg"><MapPin size={16} className="text-amber-400" /></div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Venue Location</span>
                    <div className="text-sm font-medium text-slate-200">{booking.location}</div>
                    <div className="text-xs text-slate-400">{booking.guests_count} Guests Expected</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                  <div className="bg-emerald-500/10 p-2 rounded-lg"><DollarSign size={16} className="text-emerald-400" /></div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Agreed Budget</span>
                    <div className="text-sm font-mono font-bold text-emerald-400">LKR {parseFloat(booking.total_price).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                {/* PENDING: Accept / Decline */}
                {booking.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => confirmDecline(booking)}
                      className="flex-1 py-2.5 bg-slate-900 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-xl cursor-pointer transition-all duration-200 font-semibold text-sm flex justify-center items-center gap-2"
                    >
                      <X size={16} /> Decline
                    </button>
                    <button
                      onClick={() => confirmAccept(booking)}
                      className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl cursor-pointer transition-all duration-200 text-sm flex justify-center items-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                      <Check size={16} /> Accept Gig
                    </button>
                  </div>
                )}

                {/* ACCEPTED: Cancel / Complete */}
                {booking.status === 'accepted' && (
                  cancellingBookingId === booking.id ? (
                    <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-rose-500/20">
                      <label className="block text-xs font-semibold text-rose-400 uppercase tracking-wider">
                        Reason for Cancellation
                      </label>
                      <textarea
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        placeholder="Please enter the reason (e.g. medical emergency, double booking)..."
                        rows="2"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-rose-500 resize-none"
                      />
                      <div className="flex gap-2.5">
                        <button
                          type="button"
                          onClick={() => { setCancellingBookingId(null); setCancellationReason(''); }}
                          className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 rounded-lg cursor-pointer transition-all text-xs"
                        >
                          Go Back
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!cancellationReason.trim()) {
                              showToast('Please enter a cancellation reason first.', 'warning');
                              return;
                            }
                            confirmCancel(booking, cancellationReason);
                          }}
                          className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg cursor-pointer transition-all text-xs shadow-lg shadow-rose-500/10"
                        >
                          Confirm Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setCancellingBookingId(booking.id); setCancellationReason(''); }}
                        className="flex-1 py-2.5 bg-slate-900 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-xl cursor-pointer transition-all duration-200 font-semibold text-sm flex justify-center items-center gap-2"
                      >
                        <X size={16} /> Cancel Gig
                      </button>
                      <button
                        onClick={() => confirmComplete(booking)}
                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl cursor-pointer transition-all duration-200 text-sm flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20"
                      >
                        <CheckCircle2 size={16} /> Complete
                      </button>
                    </div>
                  )
                )}

                {['completed', 'cancelled', 'rejected'].includes(booking.status) && (
                  <div className="text-center text-xs text-slate-500 font-medium py-2">
                    No further actions required
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredBookings.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 bg-slate-950/50 rounded-2xl border border-slate-800 border-dashed">
              <Calendar size={48} className="text-slate-700 mb-4" />
              <p className="text-lg font-medium">
                {statusFilter !== 'all' 
                  ? `No ${statusFilter} bookings found` 
                  : 'No booking requests found.'}
              </p>
              <p className="text-sm mt-1">
                {statusFilter !== 'all' 
                  ? 'Try changing the filter to see all bookings.' 
                  : 'When customers book you for events, they will appear here.'}
              </p>
              {statusFilter !== 'all' && (
                <button
                  onClick={clearFilter}
                  className="mt-4 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl text-sm transition"
                >
                  Show All Bookings
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/*  Footer Stats */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
        <div className="flex flex-wrap gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Pending: {getStatusCount('pending')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Accepted: {getStatusCount('accepted')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Completed: {getStatusCount('completed')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            Cancelled: {getStatusCount('cancelled')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Rejected: {getStatusCount('rejected')}
          </span>
        </div>
        <span>
          Showing {filteredBookings.length} of {bookings.length} bookings
        </span>
      </div>
    </div>
  );
};

export default ChefBookings;