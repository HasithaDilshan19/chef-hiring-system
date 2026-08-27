import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

import {
  MapPin,
  ChefHat,
  Star,
  Award,
  DollarSign,
  Compass,
  ShieldAlert,
  Check,
  X,
  Camera,
  User as UserIcon,
  Sparkles
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [recommendedChefs, setRecommendedChefs] = useState([]);
  const [cuisines, setCuisines] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);

  const [city, setCity] = useState(user?.city || 'Colombo');
  const [selectedCuisine, setSelectedCuisine] = useState('');

  const cityCoords = {
    Colombo: { lat: 6.927179, lng: 79.861244 },
    Nugegoda: { lat: 6.901500, lng: 79.880000 },
    Kandy: { lat: 7.290572, lng: 80.633728 },
    Galle: { lat: 6.053519, lng: 80.220978 },
    Jaffna: { lat: 9.661498, lng: 80.012229 },
    Negombo: { lat: 7.208300, lng: 79.835800 },
    Kurunegala: { lat: 7.481775, lng: 80.360886 },
    Kuliyapitiya: { lat: 7.469085, lng: 80.040125 },
    Anuradhapura: { lat: 8.311351, lng: 80.403730 },
    Polonnaruwa: { lat: 7.939634, lng: 81.000305 },
    Matara: { lat: 5.954920, lng: 80.554956 },
    Hambantota: { lat: 6.124592, lng: 81.118525 },
    Ratnapura: { lat: 6.682776, lng: 80.399222 },
    Badulla: { lat: 6.993402, lng: 81.055000 },
    'Nuwara Eliya': { lat: 6.949717, lng: 80.789107 },
    Batticaloa: { lat: 7.717013, lng: 81.692415 },
    Trincomalee: { lat: 8.587320, lng: 81.215212 },
    Ampara: { lat: 7.291244, lng: 81.672439 },
    Kalutara: { lat: 6.585390, lng: 79.960739 },
    Gampaha: { lat: 7.087310, lng: 79.992686 },
    Kegalle: { lat: 7.251329, lng: 80.346429 },
    Matale: { lat: 7.467469, lng: 80.623416 },
    Puttalam: { lat: 8.036186, lng: 79.828292 },
    Vavuniya: { lat: 8.754228, lng: 80.498188 },
    Mannar: { lat: 8.981033, lng: 79.904412 },
    Kilinochchi: { lat: 9.380289, lng: 80.398642 },
    Mullaitivu: { lat: 9.267324, lng: 80.814324 },
    Monaragala: { lat: 6.872421, lng: 81.350727 },
  };

  // --------------------------------------------------
  // BOOKING STATES
  // --------------------------------------------------

  const [bookingChef, setBookingChef] = useState(null);

  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState(
    'Lunch (12:00 PM)'
  );

  const [eventType, setEventType] = useState(
    'Family Gathering'
  );

  const [venueLocation, setVenueLocation] = useState('');

  const [guestsCount, setGuestsCount] = useState('20');

  const [hoursCount, setHoursCount] = useState('4');

  const [bookingLoading, setBookingLoading] = useState(false);

  // --------------------------------------------------
  // FETCH DASHBOARD
  // --------------------------------------------------

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError('');

      const coords =
        cityCoords[city] || cityCoords.Colombo;

      let url =
        `/user/stats?city=${encodeURIComponent(city)}` +
        `&latitude=${coords.lat}` +
        `&longitude=${coords.lng}`;

      if (selectedCuisine) {
        url +=
          `&cuisine=${encodeURIComponent(selectedCuisine)}`;
      }

      console.log(
        'Fetching dashboard:',
        url
      );

      const response = await api.get(url);

      console.log(
        'FULL DASHBOARD RESPONSE:',
        response.data
      );

      const data = response?.data?.data;

      if (!data) {
        throw new Error(
          'Dashboard response data not found'
        );
      }

      // --------------------------------------------------
      // BOOKINGS
      // --------------------------------------------------

      setBookings(
        Array.isArray(data.bookings)
          ? data.bookings
          : []
      );

      // --------------------------------------------------
      // CUISINES
      // --------------------------------------------------

      setCuisines(
        Array.isArray(data.cuisine_list)
          ? data.cuisine_list
          : []
      );

      // --------------------------------------------------
      // GET NEARBY CHEFS
      // --------------------------------------------------

      const nearbyChefs =
        Array.isArray(data.nearby_chefs)
          ? data.nearby_chefs
          : [];

      // --------------------------------------------------
      // GET AI RECOMMENDATIONS
      // --------------------------------------------------

      const aiChefs =
        Array.isArray(data.ai_recommended_chefs)
          ? data.ai_recommended_chefs
          : [];

      console.log(
        'Nearby chefs:',
        nearbyChefs
      );

      console.log(
        'AI recommended chefs:',
        aiChefs
      );

      // --------------------------------------------------
      // CREATE CHEF MAP
      // --------------------------------------------------

      const chefMap = {};

      nearbyChefs.forEach((chef) => {
        chefMap[String(chef.id)] = chef;
      });

      // --------------------------------------------------
      // COMBINE AI RESULT + FULL CHEF DATA
      // --------------------------------------------------

      const finalRecommendations =
        aiChefs
          .map((aiChef) => {

            const fullChef =
              chefMap[String(aiChef.chef_id)];

            if (!fullChef) {
              console.warn(
                'Chef not found in nearby_chefs:',
                aiChef.chef_id
              );

              return null;
            }

            return {
              ...fullChef,

              // AI information
              ai_score: aiChef.score,
              ai_distance_km:
                aiChef.distance_km,

              ai_experience:
                aiChef.experience,

              ai_rating:
                aiChef.rating,

              ai_cuisines:
                aiChef.cuisines
            };
          })
          .filter(Boolean);

      // --------------------------------------------------
      // FALLBACK
      // --------------------------------------------------

      if (finalRecommendations.length > 0) {

        console.log(
          'FINAL AI CHEF LIST:',
          finalRecommendations
        );

        setRecommendedChefs(
          finalRecommendations
        );

      } else {

        console.log(
          'AI list empty. Using nearby chefs.'
        );

        setRecommendedChefs(
          nearbyChefs
        );
      }

    } catch (err) {

      console.error(
        'Dashboard error:',
        err
      );

      console.error(
        'Response:',
        err?.response?.data
      );

      setError(
        err?.response?.data?.message ||
        'Failed to fetch dashboard data.'
      );

      setRecommendedChefs([]);

    } finally {

      setLoading(false);
    }
  };

  // --------------------------------------------------
  // LOAD DASHBOARD
  // --------------------------------------------------

  useEffect(() => {

    fetchUserData();

  }, [city, selectedCuisine]);

  // --------------------------------------------------
  // PHOTO UPLOAD
  // --------------------------------------------------

  const handlePhotoUpload = async (e) => {

    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setPhotoUploading(true);
    setError('');

    try {

      const formData = new FormData();

      formData.append(
        'photo',
        file
      );

      const response =
        await api.post(
          '/user/profile-photo',
          formData,
          {
            headers: {
              'Content-Type':
                'multipart/form-data'
            }
          }
        );

      if (
        response.data.status ===
        'success'
      ) {

        setSuccessMsg(
          'Profile photo updated successfully!'
        );

        window.location.reload();
      }

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        'Failed to upload photo.'
      );

    } finally {

      setPhotoUploading(false);
    }
  };

  // --------------------------------------------------
  // BOOK CHEF
  // --------------------------------------------------

  const handleBookSubmit = async (e) => {

    e.preventDefault();

    if (!bookingChef) {
      return;
    }

    setBookingLoading(true);
    setError('');
    setSuccessMsg('');

    const hours =
      parseInt(hoursCount) || 1;

    const rate =
      parseFloat(
        bookingChef?.chef_profile?.hourly_rate
      ) || 0;

    const totalPrice =
      rate * hours;

    try {

      await api.post(
        '/bookings',
        {
          chef_id:
            bookingChef.id,

          event_date:
            eventDate,

          event_time:
            eventTime,

          event_type:
            eventType,

          location:
            venueLocation,

          guests_count:
            parseInt(guestsCount),

          total_price:
            totalPrice
        }
      );

      setSuccessMsg(
        `Booking request for ${bookingChef.name} sent successfully!`
      );

      setBookingChef(null);

      fetchUserData();

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        'Failed to submit booking request.'
      );

    } finally {

      setBookingLoading(false);
    }
  };

  // --------------------------------------------------
  // LOADING SCREEN
  // --------------------------------------------------

  if (loading) {

    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950 text-white">

        <div className="flex flex-col items-center gap-4">

          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>

          <p className="text-sm text-slate-400">
            Finding the best chefs for you...
          </p>

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  return (

    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">

        <div className="flex items-center gap-4">

          {/* PROFILE PHOTO */}

          <div className="relative group">

            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-800 bg-slate-900 shrink-0 flex items-center justify-center relative">

              {photoUploading && (

                <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-10">

                  <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>

                </div>

              )}

              {user?.photo_url ? (

                <img
                  src={user.photo_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />

              ) : (

                <UserIcon className="w-7 h-7 text-slate-500" />

              )}

            </div>

            <label className="absolute bottom-0 right-0 bg-amber-500 text-slate-900 p-1 rounded-full cursor-pointer hover:bg-amber-400 transition-colors shadow-lg border border-slate-900 group-hover:scale-110">

              <Camera size={12} />

              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={photoUploading}
              />

            </label>

          </div>

          {/* USER INFO */}

          <div>

            <div className="flex items-center gap-2">

              <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20">

                Customer Dashboard

              </span>

              {user?.city && (

                <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-full border border-slate-700 flex items-center gap-1">

                  <MapPin
                    size={12}
                    className="text-amber-400"
                  />

                  {user.city}

                </span>

              )}

            </div>

            <h1 className="text-2xl font-bold text-white mt-1">

              Welcome, {user?.name}

            </h1>

          </div>

        </div>

      </div>

      {/* ERROR */}

      {error && (

        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex gap-2">

          <ShieldAlert size={20} />

          <span>
            {error}
          </span>

        </div>

      )}

      {/* SUCCESS */}

      {successMsg && (

        <div className="p-4 mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex gap-2">

          <Check size={20} />

          <span>
            {successMsg}
          </span>

        </div>

      )}

      {/* ================================================= */}
      {/* SUGGESTED CHEFS */}
      {/* ================================================= */}

      <div className="space-y-6">

        {/* BANNER */}

        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-slate-900 border border-amber-500/30 p-6 rounded-3xl relative overflow-hidden">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">

            <div>

              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full mb-2 border border-amber-500/30">

                <Sparkles size={14} />

                <span>
                  AI Chef Recommendation
                </span>

              </div>

              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">

                Best Available Chefs Near

                <span className="text-amber-400">
                  {city}
                </span>

              </h2>

              <p className="text-xs text-slate-300 mt-1 max-w-xl">

                AI recommends available chefs based on location, cuisine, experience and rating.

              </p>

            </div>

            <button
              type="button"
              onClick={() => navigate('/packages')}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 shrink-0"
            >
              <ChefHat size={17} />
              Explore foodie packages
            </button>

            {/* CITY */}

            <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800 shrink-0">

              <MapPin
                size={16}
                className="text-amber-400 ml-2"
              />

              <select
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
                className="bg-transparent text-white font-bold focus:outline-none pr-3 py-1 text-sm cursor-pointer"
              >

                {Object.keys(cityCoords).map((cityName) => (
                  <option
                    key={cityName}
                    value={cityName}
                    className="bg-slate-900 text-white"
                  >
                    {cityName}
                  </option>
                ))}

              </select>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* CUISINE FILTER */}
        {/* ================================================= */}

        <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-wrap gap-2 items-center">

          <span className="text-xs font-semibold text-slate-400 mr-2">

            Filter Speciality:

          </span>

          <button
            onClick={() =>
              setSelectedCuisine('')
            }
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
              onClick={() =>
                setSelectedCuisine(cuisine)
              }
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

        {/* ================================================= */}
        {/* CHEF CARDS */}
        {/* ================================================= */}

        <div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {recommendedChefs.map((chef) => {

              const profile =
                chef?.chef_profile;

              const rating =
                parseFloat(
                  profile?.rating ?? 0
                );

              const hourlyRate =
                parseFloat(
                  profile?.hourly_rate ?? 0
                );

              const distance =
                chef?.ai_distance_km ??
                chef?.distance ??
                0;

              const aiScore =
                chef?.ai_score;

              return (

                <div
                  key={chef.id}
                  className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-amber-500/30 hover:bg-slate-900/50 transition-all duration-300"
                >

                  <div className="flex flex-col h-full">

                    {/* TOP */}

                    <div className="flex justify-between items-start">

                      <div className="flex items-start gap-4">

                        {/* PHOTO */}

                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-800 bg-slate-900 shrink-0">

                          {(
                            profile?.photo_url ||
                            chef?.photo_url
                          ) ? (

                            <img
                              src={
                                profile?.photo_url ||
                                chef?.photo_url
                              }
                              alt={chef.name}
                              className="w-full h-full object-cover"
                            />

                          ) : (

                            <div className="w-full h-full flex items-center justify-center text-slate-500">

                              <UserIcon className="w-8 h-8" />

                            </div>

                          )}

                        </div>

                        {/* NAME */}

                        <div>

                          <h3 className="font-bold text-lg text-white">

                            {chef.name}

                          </h3>

                          <p className="text-xs text-slate-300 flex items-center gap-1 mt-1 font-medium">

                            <MapPin
                              size={13}
                              className="text-amber-400 shrink-0"
                            />

                            <span>
                              {profile?.city ||
                                chef?.city ||
                                city}
                            </span>

                            <span className="text-slate-600">
                              •
                            </span>

                            <span className="text-amber-400/90 font-semibold">

                              {Number(distance) === 0
                                ? 'In Your City'
                                : `${Number(distance).toFixed(2)} km away`}

                            </span>

                          </p>

                        </div>

                      </div>

                      {/* RIGHT SIDE */}

                      <div className="flex flex-col items-end gap-1.5 shrink-0">

                        {/* AVAILABLE */}

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-[11px] font-bold">

                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>

                          Available Now

                        </span>

                        {/* RATING */}

                        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs font-bold font-mono">

                          <Star
                            size={12}
                            fill="currentColor"
                          />

                          <span>
                            {rating.toFixed(1)}
                          </span>

                        </span>

                      </div>

                    </div>

                    {/* AI SCORE */}

                    {aiScore !== undefined && (

                      <div className="mt-4 flex items-center justify-between px-3 py-2 bg-amber-500/5 border border-amber-500/10 rounded-xl">

                        <div className="flex items-center gap-2">

                          <Sparkles
                            size={14}
                            className="text-amber-400"
                          />

                          <span className="text-xs text-slate-300 font-semibold">

                            AI Match Score

                          </span>

                        </div>

                        <span className="text-sm font-black text-amber-400">

                          {aiScore}%

                        </span>

                      </div>

                    )}

                    {/* CUISINES */}

                    <div className="flex flex-wrap gap-1 mt-4">

                      {Array.isArray(
                        profile?.cuisine_specialities
                      ) &&

                        profile.cuisine_specialities.map(
                          (cuisine, idx) => (

                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-slate-950 text-slate-300 text-[10px] rounded border border-slate-800 font-semibold"
                            >

                              {cuisine}

                            </span>

                          )
                        )}

                    </div>

                    {/* BIO */}

                    <p className="text-xs text-slate-400 mt-4 line-clamp-2 italic">

                      "{profile?.bio ||
                        'Professional chef registered on Rasawathee system.'}"

                    </p>

                    {/* DETAILS */}

                    <div className="mt-4 pt-4 border-t border-slate-900 flex items-center gap-4 text-xs text-slate-400">

                      <div className="flex items-center gap-1">

                        <Award
                          size={14}
                          className="text-slate-500"
                        />

                        <span>
                          {profile?.experience_years ?? 0}
                          {' '}
                          Years Exp
                        </span>

                      </div>

                      <div className="flex items-center gap-1 font-mono text-amber-400">

                        {/* <DollarSign
                          size={14}
                          className="text-amber-500"
                        /> */}

                        <span>
                          LKR {hourlyRate.toLocaleString()}/hr
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* BOOK */}

                  <button
                    onClick={() => {

                      setBookingChef(chef);

                      const tomorrow =
                        new Date();

                      tomorrow.setDate(
                        tomorrow.getDate() + 1
                      );

                      setEventDate(
                        tomorrow
                          .toISOString()
                          .split('T')[0]
                      );

                    }}
                    className="mt-6 w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                  >

                    Instantly Hire / Book

                  </button>

                </div>

              );

            })}

            {/* EMPTY */}

            {recommendedChefs.length === 0 && (

              <div className="col-span-2 text-center p-12 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl text-slate-500">

                <ChefHat
                  size={40}
                  className="mx-auto mb-4 opacity-40"
                />

                <p className="text-sm font-semibold">

                  No active available chefs found.

                </p>

                <p className="text-xs mt-2">

                  Try changing the city or cuisine filter.

                </p>

              </div>

            )}

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* BOOKING MODAL */}
      {/* ================================================= */}

      {bookingChef && (

        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">

          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 relative">

            {/* CLOSE */}

            <button
              onClick={() =>
                setBookingChef(null)
              }
              className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer"
            >

              <X size={20} />

            </button>

            {/* TITLE */}

            <div className="flex items-center gap-3 mb-4">

              <ChefHat
                className="text-amber-500"
                size={28}
              />

              <div>

                <h3 className="font-bold text-white text-lg">

                  Hire {bookingChef.name}

                </h3>

                <p className="text-xs text-amber-400">

                  Rate: LKR{' '}
                  {parseFloat(
                    bookingChef?.chef_profile?.hourly_rate || 0
                  ).toLocaleString()}
                  /hr

                </p>

              </div>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleBookSubmit}
              className="space-y-4"
            >

              {/* DATE */}

              <div>

                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">

                  Event Date

                </label>

                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) =>
                    setEventDate(e.target.value)
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  required
                />

              </div>

              {/* TIME + EVENT */}

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">

                    Time Slot

                  </label>

                  <select
                    value={eventTime}
                    onChange={(e) =>
                      setEventTime(e.target.value)
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  >

                    <option>
                      Morning (08:00 AM)
                    </option>

                    <option>
                      Lunch (12:00 PM)
                    </option>

                    <option>
                      Afternoon (04:00 PM)
                    </option>

                    <option>
                      Dinner (07:00 PM)
                    </option>

                  </select>

                </div>

                <div>

                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">

                    Event Type

                  </label>

                  <select
                    value={eventType}
                    onChange={(e) =>
                      setEventType(e.target.value)
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  >

                    <option>
                      Family Gathering
                    </option>

                    <option>
                      Wedding Function
                    </option>

                    <option>
                      Funeral / Alms Giving
                    </option>

                    <option>
                      Birthday Party
                    </option>

                    <option>
                      Religious Event
                    </option>

                  </select>

                </div>

              </div>

              {/* GUEST + HOURS */}

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">

                    Guests Count

                  </label>

                  <input
                    type="number"
                    value={guestsCount}
                    onChange={(e) =>
                      setGuestsCount(e.target.value)
                    }
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
                    onChange={(e) =>
                      setHoursCount(e.target.value)
                    }
                    min="1"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    required
                  />

                </div>

              </div>

              {/* LOCATION */}

              <div>

                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">

                  Venue Location Address

                </label>

                <input
                  type="text"
                  value={venueLocation}
                  onChange={(e) =>
                    setVenueLocation(e.target.value)
                  }
                  placeholder="Street address, City"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  required
                />

              </div>

              {/* TOTAL */}

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center text-sm font-semibold">

                <span className="text-slate-400">

                  Total Bill Estimate

                </span>

                <span className="text-amber-400 font-mono text-base">

                  LKR{' '}

                  {(
                    (
                      parseFloat(
                        bookingChef?.chef_profile?.hourly_rate || 0
                      )
                    ) *
                    (
                      parseInt(hoursCount) || 1
                    )
                  ).toLocaleString()}

                </span>

              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setBookingChef(null)
                  }
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-950/70 border border-slate-800 text-slate-400 text-sm font-semibold rounded-xl cursor-pointer text-center"
                >

                  Cancel

                </button>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 text-sm font-bold rounded-xl cursor-pointer transition-all disabled:opacity-50"
                >

                  {bookingLoading
                    ? 'Submitting...'
                    : 'Confirm Book Request'}

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