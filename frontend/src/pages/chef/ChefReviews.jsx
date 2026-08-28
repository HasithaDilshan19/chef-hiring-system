import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Star, MessageSquare, ShieldAlert, Award, TrendingUp, User, ThumbsUp, Filter, ChefHat } from 'lucide-react';

const ChefReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const fetchChefReviews = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/chef-reviews/${user.id}`);
      if (res.data?.status === 'success') {
        const reviewList = res.data.reviews || [];
        setReviews(reviewList);
        setAverageRating(res.data.average_rating || 0);
        setReviewsCount(res.data.reviews_count || reviewList.length);
      } else {
        setError(res.data?.message || 'Failed to fetch reviews.');
      }
    } catch (err) {
      console.error('Error fetching chef reviews:', err);
      // Fallback: try getting via chef profile details
      try {
        const chefRes = await api.get(`/chefs/${user.id}`);
        if (chefRes.data?.status === 'success') {
          const reviewList = chefRes.data.reviews || [];
          setReviews(reviewList);
          setAverageRating(chefRes.data.average_rating || 0);
          setReviewsCount(chefRes.data.review_count || reviewList.length);
        }
      } catch (fallbackErr) {
        setError('Failed to load reviews.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChefReviews();
  }, [user]);

  // Calculate rating distribution
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    const star = Math.round(Number(r.rating || 0));
    if (ratingCounts[star] !== undefined) {
      ratingCounts[star]++;
    }
  });

  const positiveReviewsCount = (ratingCounts[5] || 0) + (ratingCounts[4] || 0);
  const satisfactionRate = reviewsCount > 0 ? Math.round((positiveReviewsCount / reviewsCount) * 100) : 100;

  // Filter reviews
  const filteredReviews = reviews.filter(r => {
    if (selectedFilter === 'all') return true;
    return Math.round(Number(r.rating || 0)) === Number(selectedFilter);
  });

  const renderStars = (rating, size = 18) => {
    const numericRating = Number(rating || 0);
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={
              star <= Math.round(numericRating)
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-700'
            }
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950 text-white">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-8 border-b border-slate-800">
        <div>
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20">
            Ratings & Customer Feedback
          </span>
          <h1 className="text-3xl font-bold text-white mt-2">My Reviews & Rating</h1>
          <p className="text-sm text-slate-400">See what clients are saying about your culinary services.</p>
        </div>
      </header>

      {error && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex gap-2">
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Rating Score Card */}
        <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400 font-medium">Average Rating</span>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Star size={22} fill="currentColor" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-extrabold text-white">
                {reviewsCount > 0 ? Number(averageRating).toFixed(1) : '0.0'}
              </h2>
              <span className="text-slate-500 text-lg font-semibold">/ 5.0</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              {renderStars(averageRating, 18)}
              <span className="text-xs text-slate-400">({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})</span>
            </div>
          </div>
        </div>

        {/* Total Reviews Card */}
        <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400 font-medium">Total Reviews</span>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <MessageSquare size={22} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-4xl font-extrabold text-white">{reviewsCount}</h2>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <TrendingUp size={14} className="text-emerald-400" />
              <span>Feedback collected from completed bookings</span>
            </p>
          </div>
        </div>

        {/* Satisfaction Score Card */}
        <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400 font-medium">Satisfaction Rate</span>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <ThumbsUp size={22} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-4xl font-extrabold text-emerald-400">{satisfactionRate}%</h2>
            <p className="text-xs text-slate-400 mt-2">
              Positive ratings (4 & 5 stars) from clients
            </p>
          </div>
        </div>
      </div>

      {/* Rating Breakdown & Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Breakdown bars */}
        <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Award size={18} className="text-amber-400" />
            Rating Breakdown
          </h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(star => {
              const count = ratingCounts[star] || 0;
              const percent = reviewsCount > 0 ? (count / reviewsCount) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-medium text-slate-300 flex items-center gap-1">
                    {star} <Star size={12} className="text-amber-400 fill-amber-400" />
                  </span>
                  <div className="flex-1 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-400 font-mono">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter buttons */}
        <div className="lg:col-span-2 p-6 bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Filter size={18} className="text-amber-400" />
              Filter Client Reviews
            </h3>
            <p className="text-xs text-slate-400 mb-4">Select a star rating to filter customer feedback.</p>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  selectedFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                All Reviews ({reviewsCount})
              </button>
              {[5, 4, 3, 2, 1].map(star => (
                <button
                  key={star}
                  onClick={() => setSelectedFilter(String(star))}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                    selectedFilter === String(star)
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span>{star} Star</span>
                  <Star size={12} className={selectedFilter === String(star) ? 'text-slate-950 fill-slate-950' : 'text-amber-400 fill-amber-400'} />
                  <span className="opacity-70">({ratingCounts[star] || 0})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review List */}
      <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6">
        <h3 className="text-xl font-bold text-white mb-6">
          Reviews List {selectedFilter !== 'all' && `(${selectedFilter} Star)`}
        </h3>

        {filteredReviews.length === 0 ? (
          <div className="text-center py-16 bg-slate-950/50 rounded-2xl border border-slate-800 border-dashed">
            <ChefHat className="h-16 w-16 text-slate-700 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-white">No reviews found</h4>
            <p className="text-slate-400 text-sm mt-1">
              {reviews.length === 0
                ? 'You have not received any customer reviews yet.'
                : `No ${selectedFilter}-star reviews found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review, idx) => {
              const reviewer = review?.user || {};
              const reviewerName = reviewer?.name || review?.user_name || 'Customer';
              const reviewerPhoto = reviewer?.photo_url || reviewer?.photo || null;
              const dateString = review.created_at
                ? new Date(review.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Recent';

              return (
                <div
                  key={review.id || idx}
                  className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800/80 hover:border-amber-500/30 transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center text-slate-400 shrink-0">
                        {reviewerPhoto ? (
                          <img src={reviewerPhoto} alt={reviewerName} className="w-full h-full object-cover" />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{reviewerName}</h4>
                        <p className="text-xs text-slate-400">{reviewer?.email || 'Verified Customer'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {renderStars(review.rating, 16)}
                      <span className="text-xs text-slate-500 font-mono">{dateString}</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/50 mt-3 text-slate-300 text-sm italic leading-relaxed">
                    "{review.comment}"
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChefReviews;
