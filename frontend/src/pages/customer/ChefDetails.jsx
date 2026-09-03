import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import {
  MapPin,
  Star,
  Clock,
  Calendar,
  Users,
  DollarSign,
  MessageSquare,
  X,
  Send,
  User,
  CheckCircle,
  Edit,
  Trash2,
  Package,
} from 'lucide-react';

import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ChefDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // =========================================================
  // CHEF
  // =========================================================

  const [chef, setChef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // =========================================================
  // REVIEWS
  // =========================================================

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // =========================================================
  // REVIEW MODAL (Add/Edit)
  // =========================================================

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: '',
  });

  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // =========================================================
  // DELETE REVIEW
  // =========================================================

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // =========================================================
  // BOOKING
  // =========================================================

  const [showBookingModal, setShowBookingModal] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    event_date: '',
    event_time: '',
    event_type: '',
    location: '',
    guests_count: 1,
    duration_hours: 1,
  });

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // =========================================================
  // PACKAGES
  // =========================================================

  const [chefPackages, setChefPackages] = useState([]);
  const [adminPackages, setAdminPackages] = useState([]);

  // =========================================================
  // PACKAGE BOOKING MODAL
  // =========================================================

  const [showPackageBookingModal, setShowPackageBookingModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [packageBookingForm, setPackageBookingForm] = useState({
    event_date: '',
    event_time: '',
    event_type: '',
    location: '',
    guests_count: 1,
  });

  const [packageBookingLoading, setPackageBookingLoading] = useState(false);
  const [packageBookingError, setPackageBookingError] = useState('');
  const [packageBookingSuccess, setPackageBookingSuccess] = useState('');

  // =========================================================
  // READ PACKAGE FROM URL (passed from FoodiePackages → ChefSearch)
  // =========================================================

  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const urlPackageId   = urlParams.get('package_id');
  const urlPackageName = urlParams.get('package_name');
  const urlGuests      = urlParams.get('guests_count');

  // =========================================================
  // GET CHEF PROFILE
  // =========================================================

  const getChefProfile = (chefData) => {
    return (
      chefData?.chef_profile ||
      chefData?.chefProfile ||
      chefData?.profile ||
      {}
    );
  };

  // =========================================================
  // NORMALIZE REVIEW
  // =========================================================

  const normalizeReview = (review) => {
    if (!review || typeof review !== 'object') {
      return null;
    }

    const rating = Number(
      review.rating ??
      review.stars ??
      review.rating_value ??
      review.review_rating ??
      0
    );

    const comment =
      review.comment ??
      review.review ??
      review.message ??
      review.content ??
      '';

    const userObject =
      review.user ??
      review.customer ??
      review.reviewer ??
      review.user_data ??
      null;

    let userId = null;
    
    if (userObject && typeof userObject === 'object') {
      userId = userObject.id ?? userObject.user_id ?? userObject.customer_id ?? null;
    }
    
    if (!userId) {
      userId = 
        review.user_id ??
        review.customer_id ??
        review.reviewer_id ??
        null;
    }

    let userName = '';
    
    if (userObject && typeof userObject === 'object') {
      userName = 
        userObject.name ??
        userObject.full_name ??
        userObject.username ??
        '';
    }
    
    if (!userName) {
      userName =
        review.user_name ??
        review.customer_name ??
        review.reviewer_name ??
        '';
    }

    let userPhoto = null;
    
    if (userObject && typeof userObject === 'object') {
      userPhoto =
        userObject.photo_url ??
        userObject.photo ??
        userObject.profile_photo ??
        userObject.profile_photo_url ??
        userObject.avatar ??
        userObject.profile ??
        userObject.image ??
        null;
    }
    
    if (!userPhoto) {
      userPhoto =
        review.user_photo ??
        review.user_photo_url ??
        review.customer_photo ??
        review.reviewer_photo ??
        review.photo_url ??
        review.profile_photo ??
        review.avatar ??
        null;
    }

    if (userPhoto && !userPhoto.startsWith('http') && !userPhoto.startsWith('//')) {
      userPhoto = `${process.env.REACT_APP_API_URL || ''}${userPhoto}`;
    }

    return {
      ...review,
      id: review.id ?? null,
      rating: rating,
      comment: String(comment || ''),
      user_id: userId,
      customer_id: userId,
      
      user: userObject && typeof userObject === 'object'
        ? {
            ...userObject,
            id: userObject.id ?? userId,
            name: userName || 'Customer',
            photo_url: userPhoto,
            photo: userPhoto,
            profile_photo: userPhoto,
            avatar: userPhoto,
          }
        : userName
        ? {
            id: userId,
            name: userName,
            photo_url: userPhoto,
            photo: userPhoto,
            profile_photo: userPhoto,
            avatar: userPhoto,
          }
        : null,
      
      customer: userObject && typeof userObject === 'object'
        ? {
            ...userObject,
            id: userObject.id ?? userId,
            name: userName || 'Customer',
            photo_url: userPhoto,
            photo: userPhoto,
            profile_photo: userPhoto,
            avatar: userPhoto,
          }
        : userName
        ? {
            id: userId,
            name: userName,
            photo_url: userPhoto,
            photo: userPhoto,
            profile_photo: userPhoto,
            avatar: userPhoto,
          }
        : null,
      
      created_at:
        review.created_at ??
        review.createdAt ??
        review.date ??
        null,
    };
  };

  // =========================================================
  // NORMALIZE REVIEWS
  // =========================================================

  const normalizeReviews = (data) => {
    if (!data) {
      return [];
    }

    if (Array.isArray(data)) {
      return data
        .map(item => {
          if (item && typeof item === 'object' && !item.data) {
            return normalizeReview(item);
          }
          if (item && typeof item === 'object' && item.data) {
            return normalizeReview(item.data);
          }
          return null;
        })
        .filter(Boolean);
    }

    if (typeof data === 'object') {
      if (Array.isArray(data.data)) {
        return data.data
          .map(item => {
            if (item && typeof item === 'object') {
              return normalizeReview(item);
            }
            return null;
          })
          .filter(Boolean);
      }

      if (Array.isArray(data.reviews)) {
        return data.reviews
          .map(item => {
            if (item && typeof item === 'object') {
              return normalizeReview(item);
            }
            return null;
          })
          .filter(Boolean);
      }

      if (data.data && typeof data.data === 'object' && Array.isArray(data.data.reviews)) {
        return data.data.reviews
          .map(item => {
            if (item && typeof item === 'object') {
              return normalizeReview(item);
            }
            return null;
          })
          .filter(Boolean);
      }

      if (data.chef && typeof data.chef === 'object' && Array.isArray(data.chef.reviews)) {
        return data.chef.reviews
          .map(item => {
            if (item && typeof item === 'object') {
              return normalizeReview(item);
            }
            return null;
          })
          .filter(Boolean);
      }

      if (data.data && typeof data.data === 'object' && 
          data.data.chef && typeof data.data.chef === 'object' &&
          Array.isArray(data.data.chef.reviews)) {
        return data.data.chef.reviews
          .map(item => {
            if (item && typeof item === 'object') {
              return normalizeReview(item);
            }
            return null;
          })
          .filter(Boolean);
      }
    }

    return [];
  };

  // =========================================================
  // CALCULATE RATING
  // =========================================================

  const calculateRatingFromReviews = (reviewList) => {
    if (!Array.isArray(reviewList) || reviewList.length === 0) {
      return 0;
    }

    const ratings = reviewList
      .map((review) => Number(review?.rating || 0))
      .filter((rating) => rating >= 1 && rating <= 5);

    if (ratings.length === 0) {
      return 0;
    }

    const total = ratings.reduce((sum, rating) => sum + rating, 0);
    return total / ratings.length;
  };

  // =========================================================
  // GET BACKEND RATING
  // =========================================================

  const getBackendRating = (data) => {
    const possibleRatings = [
      data?.average_rating,
      data?.avg_rating,
      data?.rating,
      data?.chef?.average_rating,
      data?.chef?.avg_rating,
      data?.chef?.rating,
      data?.chef_profile?.average_rating,
      data?.chef_profile?.avg_rating,
      data?.chef_profile?.rating,
      data?.data?.average_rating,
      data?.data?.avg_rating,
      data?.data?.rating,
      data?.data?.chef?.average_rating,
      data?.data?.chef?.avg_rating,
      data?.data?.chef?.rating,
    ];

    for (const value of possibleRatings) {
      const number = Number(value);
      if (value !== undefined && value !== null && value !== '' && !Number.isNaN(number) && number >= 0 && number <= 5) {
        return number;
      }
    }

    return 0;
  };

  // =========================================================
  // GET BACKEND REVIEW COUNT
  // =========================================================

  const getBackendReviewCount = (data) => {
    const possibleCounts = [
      data?.review_count,
      data?.reviews_count,
      data?.total_reviews,
      data?.chef?.review_count,
      data?.chef?.reviews_count,
      data?.chef?.total_reviews,
      data?.data?.review_count,
      data?.data?.reviews_count,
      data?.data?.total_reviews,
      data?.data?.chef?.review_count,
      data?.data?.chef?.reviews_count,
      data?.data?.chef?.total_reviews,
    ];

    for (const value of possibleCounts) {
      const number = Number(value);
      if (value !== undefined && value !== null && value !== '' && !Number.isNaN(number) && number >= 0) {
        return number;
      }
    }

    return 0;
  };

  // =========================================================
  // UPDATE RATING FROM REVIEWS
  // =========================================================

  const updateRatingFromReviews = (reviewList, responseData = null) => {
    const backendRating = getBackendRating(responseData);
    const calculatedRating = calculateRatingFromReviews(reviewList);
    const finalRating = calculatedRating > 0 ? calculatedRating : backendRating;

    const backendCount = getBackendReviewCount(responseData);
    const finalCount = reviewList.length > 0 ? reviewList.length : backendCount;

    setAverageRating(finalRating);
    setReviewCount(finalCount);

    console.log('Updated rating:', finalRating);
    console.log('Updated review count:', finalCount);
    console.log('Total reviews in list:', reviewList.length);
  };

  // =========================================================
  // APPLY CHEF RESPONSE
  // =========================================================

  const applyChefResponse = (responseData, existingReviews = null) => {
    const chefData = 
      responseData?.chef ??
      responseData?.data?.chef ??
      responseData?.data ??
      responseData ??
      null;

    let reviewData = [];

    if (Array.isArray(existingReviews) && existingReviews.length > 0) {
      reviewData = existingReviews;
    } else {
      if (Array.isArray(responseData?.reviews)) {
        reviewData = normalizeReviews(responseData.reviews);
      }
      
      if (reviewData.length === 0) {
        reviewData = normalizeReviews(responseData);
      }
      
      if (reviewData.length === 0 && chefData) {
        reviewData = normalizeReviews(chefData);
      }
    }

    // Extract chef packages from response
    if (Array.isArray(responseData?.packages)) {
      setChefPackages(responseData.packages);
    }

    console.log('====================================');
    console.log('FULL RESPONSE:', responseData);
    console.log('CHEF DATA:', chefData);
    console.log('REVIEWS FOUND:', reviewData);
    console.log('TOTAL REVIEWS:', reviewData.length);
    console.log('====================================');

    setChef(chefData);
    setReviews(reviewData);
    updateRatingFromReviews(reviewData, responseData);
  };

  // =========================================================
  // FETCH SEPARATE REVIEWS
  // =========================================================

  const fetchReviews = async () => {
    if (!id) {
      console.log('No chef ID available');
      return;
    }

    try {
      console.log('Fetching reviews from:', `/chef-reviews/${id}`);
      
      const response = await api.get(`/chef-reviews/${id}`);
      
      console.log('REVIEWS API RESPONSE:', response.data);
      
      let reviewData = [];
      
      if (response.data?.reviews && Array.isArray(response.data.reviews)) {
        reviewData = normalizeReviews(response.data.reviews);
      } else {
        reviewData = normalizeReviews(response.data);
      }
      
      console.log('FINAL REVIEW DATA:', reviewData);
      console.log('TOTAL REVIEWS FROM API:', reviewData.length);
      
      if (reviewData.length > 0) {
        setReviews(reviewData);
        updateRatingFromReviews(reviewData, response.data);
      } else {
        const chefResponse = await api.get(`/chefs/${id}`);
        const chefReviewData = normalizeReviews(chefResponse.data);
        
        if (chefReviewData.length > 0) {
          setReviews(chefReviewData);
          updateRatingFromReviews(chefReviewData, chefResponse.data);
        } else {
          setReviews([]);
          
          const backendRating = getBackendRating(response.data);
          const backendCount = getBackendReviewCount(response.data);
          
          setAverageRating(backendRating);
          setReviewCount(backendCount);
        }
      }
    } catch (err) {
      console.warn('Reviews endpoint failed:', err.response?.status, err.response?.data || err.message);
      
      try {
        const chefResponse = await api.get(`/chefs/${id}`);
        const chefReviewData = normalizeReviews(chefResponse.data);
        
        if (chefReviewData.length > 0) {
          setReviews(chefReviewData);
          updateRatingFromReviews(chefReviewData, chefResponse.data);
        }
      } catch (fallbackErr) {
        console.warn('Fallback chef endpoint also failed:', fallbackErr.message);
      }
    }
  };

  // =========================================================
  // FETCH CHEF DETAILS
  // =========================================================

  useEffect(() => {
    if (!id) {
      setError('Chef ID is missing.');
      setLoading(false);
      setReviewsLoading(false);
      return;
    }

    fetchChefDetails();
  }, [id]);

  const fetchChefDetails = async () => {
    try {
      setLoading(true);
      setReviewsLoading(true);
      setError('');

      const response = await api.get(`/chefs/${id}`);
      
      console.log('CHEF DETAILS API RESPONSE:', response.data);

      if (response.data?.status === 'success' || response.data) {
        applyChefResponse(response.data);
        await fetchReviews();

        // Fetch admin packages in parallel
        try {
          const adminRes = await api.get('/admin/packages');
          if (adminRes.data?.status === 'success') {
            setAdminPackages(adminRes.data.packages || []);
          }
        } catch (_) {
          // Admin packages are optional — fail silently
        }
      } else {
        setChef(null);
        setReviews([]);
        setAverageRating(0);
        setReviewCount(0);
        setError(response.data?.message || 'Failed to load chef details.');
      }
    } catch (err) {
      console.error('Error fetching chef details:', err);
      setChef(null);
      setReviews([]);
      setAverageRating(0);
      setReviewCount(0);
      setError(err.response?.data?.message || 'Failed to load chef details.');
    } finally {
      setLoading(false);
      setReviewsLoading(false);
    }
  };

  // =========================================================
  // REFRESH REVIEWS
  // =========================================================

  const refreshReviews = async () => {
    try {
      setReviewsLoading(true);
      await fetchReviews();
    } catch (err) {
      console.error('Error refreshing reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  // =========================================================
  // OPEN PACKAGE BOOKING MODAL
  // =========================================================

  const handleOpenPackageBooking = (pkg) => {
    setSelectedPackage(pkg);
    setPackageBookingError('');
    setPackageBookingSuccess('');
    setPackageBookingForm({
      event_date: '',
      event_time: '',
      event_type: pkg?.name || '',
      location: '',
      guests_count: pkg?.guests_count || 1,
    });
    setShowPackageBookingModal(true);
  };

  // =========================================================
  // CLOSE PACKAGE BOOKING MODAL
  // =========================================================

  const handleClosePackageBooking = () => {
    if (packageBookingLoading) return;
    setShowPackageBookingModal(false);
    setSelectedPackage(null);
    setPackageBookingForm({
      event_date: '',
      event_time: '',
      event_type: '',
      location: '',
      guests_count: 1,
    });
    setPackageBookingError('');
    setPackageBookingSuccess('');
  };

  // =========================================================
  // SUBMIT PACKAGE BOOKING
  // =========================================================

  const handlePackageBookingSubmit = async (e) => {
    e.preventDefault();

    setPackageBookingError('');
    setPackageBookingSuccess('');

    if (!user) {
      setPackageBookingError('Please login to make a booking.');
      return;
    }

    if (!chef?.id) {
      setPackageBookingError('Chef information is missing.');
      return;
    }

    if (!selectedPackage) {
      setPackageBookingError('Please select a package.');
      return;
    }

    if (!packageBookingForm.event_date || !packageBookingForm.event_time) {
      setPackageBookingError('Please select event date and time.');
      return;
    }

    setPackageBookingLoading(true);

    try {
      const payload = {
        chef_id: Number(chef.id),
        package_id: Number(selectedPackage.id),
        package_name: selectedPackage.name,
        package_price: selectedPackage.price || '',
        event_date: packageBookingForm.event_date,
        event_time: packageBookingForm.event_time,
        event_type: packageBookingForm.event_type || selectedPackage.name,
        location: packageBookingForm.location,
        guests_count: Number(packageBookingForm.guests_count),
        total_price: selectedPackage.price || '',
      };

      console.log('PACKAGE BOOKING PAYLOAD:', payload);

      const response = await api.post('/bookings', payload);

      console.log('PACKAGE BOOKING RESPONSE:', response.data);

      if (response.data?.status === 'success') {
        setPackageBookingSuccess('Booking requested successfully!');
        
        setTimeout(() => {
          setShowPackageBookingModal(false);
          setSelectedPackage(null);
          setPackageBookingForm({
            event_date: '',
            event_time: '',
            event_type: '',
            location: '',
            guests_count: 1,
          });
          setPackageBookingSuccess('');
          alert('Booking requested successfully!');
          navigate('/dashboard');
        }, 1000);
      } else {
        setPackageBookingError(response.data?.message || 'Failed to submit booking.');
      }
    } catch (err) {
      console.error('PACKAGE BOOKING ERROR:', err);

      const status = err.response?.status;
      const responseData = err.response?.data;

      if (status === 422) {
        const errors = responseData?.errors;
        if (errors) {
          const firstError = Object.values(errors)[0];
          setPackageBookingError(Array.isArray(firstError) ? firstError[0] : String(firstError));
        } else {
          setPackageBookingError(responseData?.message || 'Please check your booking details.');
        }
      } else if (status === 401) {
        setPackageBookingError('Please login to make a booking.');
      } else {
        setPackageBookingError(responseData?.message || 'Failed to submit booking. Please try again.');
      }
    } finally {
      setPackageBookingLoading(false);
    }
  };

  // =========================================================
  // STAR DISPLAY
  // =========================================================

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
                : 'text-gray-300'
            }
          />
        ))}
      </div>
    );
  };

  // =========================================================
  // RATING SELECT
  // =========================================================

  const handleRatingSelect = (rating) => {
    setReviewForm((previous) => ({
      ...previous,
      rating,
    }));
    setReviewError('');
  };

  // =========================================================
  // OPEN REVIEW MODAL (Add)
  // =========================================================

  const handleOpenReviewModal = () => {
    setIsEditing(false);
    setEditingReviewId(null);
    setReviewError('');
    setReviewSuccess('');
    setReviewForm({
      rating: 0,
      comment: '',
    });
    setShowReviewModal(true);
  };

  // =========================================================
  // OPEN EDIT REVIEW MODAL
  // =========================================================

  const handleEditReview = (review) => {
    setIsEditing(true);
    setEditingReviewId(review.id);
    setReviewError('');
    setReviewSuccess('');
    setReviewForm({
      rating: review.rating || 0,
      comment: review.comment || '',
    });
    setShowReviewModal(true);
  };

  // =========================================================
  // CLOSE REVIEW MODAL
  // =========================================================

  const handleCloseReviewModal = () => {
    if (reviewLoading) {
      return;
    }
    setShowReviewModal(false);
    setIsEditing(false);
    setEditingReviewId(null);
    setReviewForm({
      rating: 0,
      comment: '',
    });
    setReviewError('');
    setReviewSuccess('');
  };

  // =========================================================
  // SUBMIT REVIEW (Add/Update)
  // =========================================================

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    setReviewError('');
    setReviewSuccess('');

    if (!user) {
      setReviewError('Please login to submit a review.');
      return;
    }

    if (!reviewForm.rating || Number(reviewForm.rating) < 1 || Number(reviewForm.rating) > 5) {
      setReviewError('Please select a rating from 1 to 5 stars.');
      return;
    }

    if (!chef?.id) {
      setReviewError('Chef information is missing.');
      return;
    }

    setReviewLoading(true);

    try {
      const payload = {
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      };

      let response;

      if (isEditing && editingReviewId) {
        console.log('UPDATING REVIEW:', payload);
        response = await api.put(`/chef-reviews/${editingReviewId}`, payload);
      } else {
        console.log('SUBMITTING REVIEW:', payload);
        response = await api.post(`/chefs/${chef.id}/reviews`, payload);
      }

      console.log('REVIEW RESPONSE:', response.data);

      if (response.data?.status === 'success') {
        let updatedReview = response.data?.review ?? null;

        if (updatedReview && typeof updatedReview === 'object' && !Array.isArray(updatedReview)) {
          updatedReview = normalizeReview(updatedReview);
        }

        if (!updatedReview) {
          updatedReview = normalizeReview({
            id: isEditing ? editingReviewId : `temp-${Date.now()}`,
            rating: Number(reviewForm.rating),
            comment: reviewForm.comment.trim(),
            user_id: user?.id,
            customer_id: user?.id,
            user: user,
            customer: user,
            created_at: new Date().toISOString(),
          });
        }

        setReviews((previousReviews) => {
          let updatedReviews;

          if (isEditing) {
            updatedReviews = previousReviews.map((review) => 
              review.id === editingReviewId ? updatedReview : review
            );
          } else {
            const exists = previousReviews.some((review) => {
              if (updatedReview?.id && review?.id) {
                return String(review.id) === String(updatedReview.id);
              }
              return false;
            });

            if (exists) {
              return previousReviews;
            }

            updatedReviews = [updatedReview, ...previousReviews];
          }

          const newRating = calculateRatingFromReviews(updatedReviews);
          setAverageRating(newRating);
          setReviewCount(updatedReviews.length);

          return updatedReviews;
        });

        setReviewSuccess(
          isEditing 
            ? 'Your review has been updated successfully!' 
            : 'Your review has been submitted successfully!'
        );

        setTimeout(async () => {
          await refreshReviews();
        }, 500);

        setTimeout(() => {
          setShowReviewModal(false);
          setIsEditing(false);
          setEditingReviewId(null);
          setReviewForm({
            rating: 0,
            comment: '',
          });
          setReviewSuccess('');
        }, 800);
      } else {
        setReviewError(response.data?.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('REVIEW SUBMISSION ERROR:', err);

      const status = err.response?.status;
      const responseData = err.response?.data;

      if (status === 422) {
        const errors = responseData?.errors;
        if (errors) {
          const firstError = Object.values(errors)[0];
          setReviewError(Array.isArray(firstError) ? firstError[0] : String(firstError));
        } else {
          setReviewError(responseData?.message || 'Please check your review details.');
        }
      } else if (status === 401) {
        setReviewError('Please login to submit a review.');
      } else if (status === 403) {
        setReviewError(responseData?.message || 'You are not allowed to submit a review.');
      } else if (status === 404) {
        setReviewError('Review endpoint was not found.');
      } else if (status === 409) {
        setReviewError(responseData?.message || 'You have already reviewed this chef.');
      } else {
        setReviewError(responseData?.message || 'Failed to submit review. Please try again.');
      }
    } finally {
      setReviewLoading(false);
    }
  };

  // =========================================================
  // OPEN DELETE MODAL
  // =========================================================

  const handleDeleteClick = (reviewId) => {
    setDeleteReviewId(reviewId);
    setShowDeleteModal(true);
  };

  // =========================================================
  // CONFIRM DELETE REVIEW
  // =========================================================

  const handleDeleteConfirm = async () => {
    if (!deleteReviewId) return;

    setDeleteLoading(true);

    try {
      console.log('DELETING REVIEW:', deleteReviewId);
      
      const response = await api.delete(`/chef-reviews/${deleteReviewId}`);
      
      console.log('DELETE RESPONSE:', response.data);

      if (response.data?.status === 'success') {
        setReviews((previousReviews) => {
          const updatedReviews = previousReviews.filter(
            (review) => review.id !== deleteReviewId
          );
          
          const newRating = calculateRatingFromReviews(updatedReviews);
          setAverageRating(newRating);
          setReviewCount(updatedReviews.length);

          return updatedReviews;
        });

        setShowDeleteModal(false);
        setDeleteReviewId(null);

        setTimeout(async () => {
          await refreshReviews();
        }, 500);
      } else {
        setReviewError(response.data?.message || 'Failed to delete review.');
      }
    } catch (err) {
      console.error('DELETE REVIEW ERROR:', err);

      const status = err.response?.status;
      const responseData = err.response?.data;

      if (status === 401) {
        alert('Please login to delete a review.');
      } else if (status === 403) {
        alert(responseData?.message || 'You are not allowed to delete this review.');
      } else if (status === 404) {
        alert('Review not found.');
      } else {
        alert(responseData?.message || 'Failed to delete review. Please try again.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // =========================================================
  // CLOSE DELETE MODAL
  // =========================================================

  const handleDeleteClose = () => {
    if (deleteLoading) return;
    setShowDeleteModal(false);
    setDeleteReviewId(null);
  };

  // =========================================================
  // BOOKING SUBMIT
  // =========================================================

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    setBookingLoading(true);
    setBookingError('');

    if (!user) {
      setBookingError('Please login to make a booking.');
      setBookingLoading(false);
      return;
    }

    if (!chef?.id) {
      setBookingError('Chef information is missing.');
      setBookingLoading(false);
      return;
    }

    try {
      const chefProfileObj = chef?.chef_profile || chef?.chefProfile || chef?.profile || {};
      const rate = parseFloat(chefProfileObj.hourly_rate ?? chefProfileObj.hourlyRate ?? 0);
      const duration = parseFloat(bookingForm.duration_hours || 0);
      const calculatedTotalPrice = rate * duration;

      const payload = {
        chef_id: Number(chef.id),
        event_date: bookingForm.event_date,
        event_time: bookingForm.event_time,
        event_type: bookingForm.event_type,
        location: bookingForm.location,
        guests_count: Number(bookingForm.guests_count),
        total_price: calculatedTotalPrice,
      };

      console.log('BOOKING PAYLOAD:', payload);

      const response = await api.post('/bookings', payload);

      console.log('BOOKING RESPONSE:', response.data);

      if (response.data?.status === 'success') {
        setShowBookingModal(false);
        setBookingForm({
          event_date: '',
          event_time: '',
          event_type: '',
          location: '',
          guests_count: 1,
          duration_hours: 1,
        });
        setBookingError('');
        alert('Booking requested successfully!');
        navigate('/dashboard');
      } else {
        setBookingError(response.data?.message || 'Failed to submit booking.');
      }
    } catch (err) {
      console.error('BOOKING ERROR:', err);

      const status = err.response?.status;

      if (status === 422) {
        const errors = err.response?.data?.errors;
        if (errors) {
          const firstError = Object.values(errors)[0];
          setBookingError(Array.isArray(firstError) ? firstError[0] : String(firstError));
        } else {
          setBookingError(err.response?.data?.message || 'Please check your booking details.');
        }
      } else if (status === 401) {
        setBookingError('Please login to make a booking.');
      } else {
        setBookingError(err.response?.data?.message || 'Failed to submit booking.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  // =========================================================
  // CHECK USER REVIEW
  // =========================================================

  const hasUserReviewed = reviews.some((review) => {
    if (!user?.id) {
      return false;
    }

    const reviewUserId = 
      review?.user_id ??
      review?.customer_id ??
      review?.user?.id ??
      review?.customer?.id ??
      null;

    if (!reviewUserId) {
      return false;
    }

    return Number(reviewUserId) === Number(user.id);
  });

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error && !chef) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 border border-red-100 rounded-xl p-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchChefDetails}
            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // CHEF NOT FOUND
  // =========================================================

  if (!chef) {
    return (
      <div className="text-center py-20 text-gray-500">
        Chef not found
      </div>
    );
  }

  // =========================================================
  // CHEF PROFILE
  // =========================================================

  const chefProfile = getChefProfile(chef);

  const chefName = chef.name || chefProfile.name || 'Chef';
  const chefCity = chefProfile.city || chef.city || 'Location not specified';
  const chefPhoto = chefProfile.photo_url || chef.photo_url || chefProfile.photo || chef.photo || null;
  const experienceYears = chefProfile.experience_years ?? chefProfile.experience ?? 0;
  const hourlyRate = chefProfile.hourly_rate ?? chefProfile.hourlyRate ?? 0;
  const bio = chefProfile.bio || 'This chef has not provided a bio yet.';

  const cuisineSpecialities = Array.isArray(chefProfile.cuisine_specialities)
    ? chefProfile.cuisine_specialities
    : Array.isArray(chefProfile.cuisine_specialties)
    ? chefProfile.cuisine_specialties
    : [];

  const roundedAverageRating = Math.round(Number(averageRating || 0) * 10) / 10;

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* CHEF HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">

        <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative"></div>

        <div className="px-8 pb-8 relative">

          <div className="flex justify-between items-end -mt-16 mb-6">

            {/* CHEF IMAGE */}
            <div className="w-32 h-32 bg-white rounded-full p-1 shadow-md border border-gray-100 relative z-10 overflow-hidden">
              {chefPhoto ? (
                <img
                  src={chefPhoto}
                  alt={chefName}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl font-bold">
                  {chefName?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>

            {/* BOOK BUTTON */}
            {(user?.role === 'customer' || user?.role === 'user') && (
              <button
                onClick={() => setShowBookingModal(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm"
              >
                Book {chefName?.split(' ')[0]}
              </button>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">{chefName}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-2">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {chefCity}
              </div>

              <div className="flex items-center gap-2 text-amber-500 font-medium">
                <Star className="h-4 w-4 fill-current" />
                <span>
                  {roundedAverageRating > 0
                    ? roundedAverageRating.toFixed(1)
                    : 'No rating'}
                </span>
                <span className="text-gray-500 font-normal">
                  ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {experienceYears} Years Experience
              </div>

              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {hourlyRate}/hr
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              {renderStars(averageRating, 20)}
              <span className="text-sm text-gray-500">
                {averageRating > 0
                  ? `${averageRating.toFixed(1)} out of 5`
                  : 'No ratings yet'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* LEFT COLUMN */}
        <div className="md:col-span-2 space-y-8">

          {/* ABOUT */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About the Chef</h2>
            <p className="text-gray-600 leading-relaxed">{bio}</p>
          </div>

          {/* PACKAGES SECTION */}
          {(chefPackages.length > 0 || adminPackages.length > 0) && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Package className="text-amber-500" size={20} />
                Service Packages
              </h2>
              <p className="text-sm text-gray-500 mb-5">Choose a package that suits your occasion.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Chef's own packages */}
                {chefPackages.map(pkg => (
                  <div
                    key={`chef-pkg-${pkg.id}`}
                    className="relative rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                        <Package size={16} />
                      </span>
                      <h3 className="font-bold text-gray-900 text-base">{pkg.name}</h3>
                    </div>
                    {pkg.description && (
                      <p className="text-gray-600 text-sm leading-5">{pkg.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs font-semibold text-gray-500 mt-1">
                      {pkg.price && <span className="text-amber-600 font-bold text-sm">{pkg.price}</span>}
                      <span className="flex items-center gap-1"><Users size={12} /> Up to {pkg.guests_count} guests</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {pkg.duration_hours}h</span>
                    </div>
                    {pkg.features && pkg.features.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {pkg.features.map((f, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                            <CheckCircle size={12} className="text-emerald-500 shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/*  BOOK PACKAGE BUTTON */}
                    {(user?.role === 'customer' || user?.role === 'user') && (
                      <button
                        onClick={() => handleOpenPackageBooking(pkg)}
                        className="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2"
                      >
                        <Calendar size={16} />
                        Book This Package
                      </button>
                    )}
                  </div>
                ))}

                {/* Admin platform packages */}
                {adminPackages.map((pkg, idx) => (
                  <div
                    key={`admin-pkg-${idx}`}
                    className="relative rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                        <Package size={16} />
                      </span>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{pkg.name}</h3>
                        <span className="text-[10px] bg-blue-100 text-blue-600 font-semibold px-1.5 py-0.5 rounded-full">Platform Package</span>
                      </div>
                    </div>
                    {pkg.description && (
                      <p className="text-gray-600 text-sm leading-5">{pkg.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs font-semibold text-gray-500 mt-1">
                      {pkg.price && <span className="text-blue-600 font-bold text-sm">{pkg.price}</span>}
                      {pkg.guests_count && <span className="flex items-center gap-1"><Users size={12} /> Up to {pkg.guests_count} guests</span>}
                      {pkg.duration_hours && <span className="flex items-center gap-1"><Clock size={12} /> {pkg.duration_hours}h</span>}
                    </div>
                    {pkg.features && pkg.features.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {pkg.features.map((f, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                            <CheckCircle size={12} className="text-emerald-500 shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REVIEWS SECTION */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
                <div className="flex items-center gap-3 mt-2">
                  {renderStars(averageRating, 18)}
                  <span className="text-sm text-gray-600">
                    {averageRating > 0
                      ? `${averageRating.toFixed(1)} / 5`
                      : 'No rating'}
                  </span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-500">
                    {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
              </div>

              {(user?.role === 'customer' || user?.role === 'user') && (
                <button
                  onClick={handleOpenReviewModal}
                  disabled={hasUserReviewed}
                  className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition ${
                    hasUserReviewed
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-amber-500 text-white hover:bg-amber-600'
                  }`}
                >
                  {hasUserReviewed ? (
                    <>
                      <CheckCircle size={17} />
                      Review Submitted
                    </>
                  ) : (
                    <>
                      <MessageSquare size={17} />
                      Add Review
                    </>
                  )}
                </button>
              )}
            </div>

            {/* REVIEW LIST - DISPLAY ALL REVIEWS */}
            {reviewsLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
                <MessageSquare className="mx-auto text-gray-300 mb-3" size={35} />
                <p className="text-gray-500">No reviews yet.</p>
                {(user?.role === 'customer' || user?.role === 'user') && (
                  <p className="text-sm text-gray-400 mt-1">
                    Be the first customer to review this chef.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                {reviews.map((review, index) => {
                  const reviewer = review?.user || review?.customer || {};
                  const reviewerName = 
                    reviewer?.name ||
                    reviewer?.full_name ||
                    review?.user_name ||
                    review?.customer_name ||
                    'Customer';
                  
                  const reviewerPhoto = 
                    reviewer?.photo_url ||
                    reviewer?.photo ||
                    reviewer?.profile_photo ||
                    reviewer?.avatar ||
                    review?.user_photo ||
                    review?.customer_photo ||
                    null;

                  // Check if this is the current user's review
                  const isCurrentUserReview = user?.id && (
                    Number(review?.user_id) === Number(user.id) ||
                    Number(review?.customer_id) === Number(user.id) ||
                    Number(reviewer?.id) === Number(user.id)
                  );

                  return (
                    <div
                      key={review?.id || `review-${index}`}
                      className={`border-b border-gray-100 last:border-b-0 pb-5 last:pb-0 ${
                        isCurrentUserReview ? 'bg-blue-50 -mx-6 px-6 py-4 rounded-lg' : ''
                      }`}
                    >
                      {isCurrentUserReview && (
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs text-blue-600 font-semibold">Your Review</div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditReview(review)}
                              className="text-blue-600 hover:text-blue-800 transition p-1"
                              title="Edit Review"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(review.id)}
                              className="text-red-500 hover:text-red-700 transition p-1"
                              title="Delete Review"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden flex-shrink-0">
                            {reviewerPhoto ? (
                              <img
                                src={reviewerPhoto}
                                alt={reviewerName}
                                className="w-full h-full rounded-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <User size={20} />
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {reviewerName}
                              {isCurrentUserReview && (
                                <span className="ml-2 text-xs text-blue-600 font-normal">(You)</span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {renderStars(review.rating, 15)}
                              <span className="text-xs text-gray-400">
                                {review.created_at
                                  ? new Date(review.created_at).toLocaleDateString()
                                  : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {review.comment ? (
                        <p className="text-gray-800 text-sm leading-relaxed mt-3 ml-12">
                          {review.comment}
                        </p>
                      ) : (
                        <p className="text-gray-400 text-sm italic mt-3 ml-12">
                          No comment provided.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">

          {/* SPECIALTIES */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {cuisineSpecialities.length > 0 ? (
                cuisineSpecialities.map((cuisine, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-100"
                  >
                    {cuisine}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">Not specified</span>
              )}
            </div>
          </div>

          {/* RATING SUMMARY */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rating Summary</h2>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
              </div>
              <div className="flex justify-center mt-2">
                {renderStars(averageRating, 20)}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEW MODAL (Add/Edit) */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <button
              onClick={handleCloseReviewModal}
              disabled={reviewLoading}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X size={22} />
            </button>

            <div className="mb-6 pr-8">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-amber-500" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Edit' : 'Review'} {chefName}
                </h2>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {isEditing 
                  ? 'Update your review for this chef.' 
                  : 'Share your experience with this chef.'}
              </p>
            </div>

            {reviewError && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm mb-4">
                {reviewError}
              </div>
            )}

            {reviewSuccess && (
              <div className="bg-green-50 border border-green-100 text-green-600 p-3 rounded-lg text-sm mb-4">
                {reviewSuccess}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Your Rating
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => handleRatingSelect(star)}
                      disabled={reviewLoading}
                      className="p-1 transition-transform hover:scale-110 disabled:opacity-50"
                    >
                      <Star
                        size={34}
                        className={
                          star <= reviewForm.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300 hover:text-amber-300'
                        }
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {reviewForm.rating === 0
                    ? 'Select a rating'
                    : `${reviewForm.rating} out of 5 stars`}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Comment
                  <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </label>
                <textarea
                  rows="5"
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm((previous) => ({
                      ...previous,
                      comment: e.target.value,
                    }))
                  }
                  placeholder="Tell us about your experience with this chef..."
                  maxLength={1000}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                  disabled={reviewLoading}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">Optional</span>
                  <span className="text-xs text-gray-400">
                    {reviewForm.comment.length}/1000
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={reviewLoading}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white font-semibold py-3 rounded-xl hover:bg-amber-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {reviewLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isEditing ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    {isEditing ? 'Update Review' : 'Submit Review'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl relative">
            <button
              onClick={handleDeleteClose}
              disabled={deleteLoading}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X size={22} />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600" size={28} />
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Delete Review
              </h2>

              <p className="text-gray-600 text-sm mb-6">
                Are you sure you want to delete your review? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteClose}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PACKAGE BOOKING MODAL
      ===================================================== */}
      {showPackageBookingModal && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleClosePackageBooking}
              disabled={packageBookingLoading}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X size={22} />
            </button>

            <div className="mb-6 pr-8">
              <div className="flex items-center gap-2">
                <Package className="text-amber-500" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">
                  Book Package
                </h2>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Book the "{selectedPackage.name}" package for your event.
              </p>
            </div>

            {/* Package Details Summary */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{selectedPackage.name}</h3>
                  {selectedPackage.description && (
                    <p className="text-sm text-gray-600 mt-1">{selectedPackage.description}</p>
                  )}
                </div>
                {selectedPackage.price && (
                  <span className="text-amber-600 font-bold text-lg">{selectedPackage.price}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                <span className="flex items-center gap-1">
                  <Users size={14} /> Up to {selectedPackage.guests_count} guests
                </span>
                {selectedPackage.duration_hours && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {selectedPackage.duration_hours} hours
                  </span>
                )}
              </div>
              {selectedPackage.features && selectedPackage.features.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedPackage.features.map((f, i) => (
                    <span key={i} className="text-xs bg-amber-200/50 text-amber-700 px-2 py-0.5 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {packageBookingError && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm mb-4">
                {packageBookingError}
              </div>
            )}

            {packageBookingSuccess && (
              <div className="bg-green-50 border border-green-100 text-green-600 p-3 rounded-lg text-sm mb-4">
                {packageBookingSuccess}
              </div>
            )}

            <form onSubmit={handlePackageBookingSubmit} className="space-y-4">
              {/* Event Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-black"
                    value={packageBookingForm.event_date}
                    onChange={(e) =>
                      setPackageBookingForm((prev) => ({
                        ...prev,
                        event_date: e.target.value,
                      }))
                    }
                    disabled={packageBookingLoading}
                  />
                </div>
              </div>

              {/* Event Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                  <input
                    type="time"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-black"
                    value={packageBookingForm.event_time}
                    onChange={(e) =>
                      setPackageBookingForm((prev) => ({
                        ...prev,
                        event_time: e.target.value,
                      }))
                    }
                    disabled={packageBookingLoading}
                  />
                </div>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <input
                  type="text"
                  placeholder="e.g., Wedding, Birthday, Party..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-black"
                  value={packageBookingForm.event_type}
                  onChange={(e) =>
                    setPackageBookingForm((prev) => ({
                      ...prev,
                      event_type: e.target.value,
                    }))
                  }
                  disabled={packageBookingLoading}
                />
              </div>

              {/* Location / Venue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location / Venue <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Where will the event take place?"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-black"
                  value={packageBookingForm.location}
                  onChange={(e) =>
                    setPackageBookingForm((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  disabled={packageBookingLoading}
                />
              </div>

              {/* Guests Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Guests <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-black"
                    value={packageBookingForm.guests_count}
                    onChange={(e) =>
                      setPackageBookingForm((prev) => ({
                        ...prev,
                        guests_count: e.target.value,
                      }))
                    }
                    disabled={packageBookingLoading}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handleClosePackageBooking}
                  disabled={packageBookingLoading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={packageBookingLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {packageBookingLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
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

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                if (!bookingLoading) {
                  setShowBookingModal(false);
                  setBookingError('');
                }
              }}
              disabled={bookingLoading}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 pr-8">
              Book {chefName}
            </h2>

            {bookingError && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm mb-4">
                {bookingError}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                    value={bookingForm.event_date}
                    onChange={(e) =>
                      setBookingForm((previous) => ({
                        ...previous,
                        event_date: e.target.value,
                      }))
                    }
                    disabled={bookingLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                  <input
                    type="time"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                    value={bookingForm.event_time}
                    onChange={(e) =>
                      setBookingForm((previous) => ({
                        ...previous,
                        event_time: e.target.value,
                      }))
                    }
                    disabled={bookingLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <input
                  type="text"
                  required
                  placeholder="Wedding, Birthday, Party..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                  value={bookingForm.event_type}
                  onChange={(e) =>
                    setBookingForm((previous) => ({
                      ...previous,
                      event_type: e.target.value,
                    }))
                  }
                  disabled={bookingLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location / Venue
                </label>
                <input
                  type="text"
                  required
                  placeholder="Event location"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                  value={bookingForm.location}
                  onChange={(e) =>
                    setBookingForm((previous) => ({
                      ...previous,
                      location: e.target.value,
                    }))
                  }
                  disabled={bookingLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Guests
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                    value={bookingForm.guests_count}
                    onChange={(e) =>
                      setBookingForm((previous) => ({
                        ...previous,
                        guests_count: e.target.value,
                      }))
                    }
                    disabled={bookingLoading}
                  />
                </div>
              </div>

              {/* Duration (Hours) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (Hours)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                    value={bookingForm.duration_hours}
                    onChange={(e) =>
                      setBookingForm((previous) => ({
                        ...previous,
                        duration_hours: e.target.value,
                      }))
                    }
                    disabled={bookingLoading}
                  />
                </div>
              </div>

              {/* Total Price Display */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-4">
                <div className="flex justify-between items-center text-sm mb-1 text-black">
                  <span className="text-gray-500">Hourly Rate:</span>
                  <span className="font-semibold text-gray-800">LKR {parseFloat(hourlyRate || 0).toLocaleString()}/hr</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-2 text-black">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-semibold text-gray-800">{bookingForm.duration_hours || 0} Hours</span>
                </div>
                <div className="border-t border-gray-150 pt-2 flex justify-between items-center text-black">
                  <span className="text-gray-900 font-bold">Total Price:</span>
                  <span className="text-emerald-600 font-bold text-lg">
                    LKR {(parseFloat(hourlyRate || 0) * parseFloat(bookingForm.duration_hours || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-6">
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