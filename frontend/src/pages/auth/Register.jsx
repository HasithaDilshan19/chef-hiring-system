import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Award,
  DollarSign,
  ChefHat,
  AlertCircle,
  LocateFixed
} from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // ---------------------------------------------------------
  // ROLE
  // ---------------------------------------------------------
  const [role, setRole] = useState('user');

  // ---------------------------------------------------------
  // GENERAL USER DETAILS
  // ---------------------------------------------------------
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  // ---------------------------------------------------------
  // CHEF DETAILS
  // ---------------------------------------------------------
  const [experience, setExperience] = useState('2');
  const [specialities, setSpecialities] = useState([]);
  const [rate, setRate] = useState('2000');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');

  // ---------------------------------------------------------
  // ACTUAL GPS LOCATION
  // ---------------------------------------------------------
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  // ---------------------------------------------------------
  // ERRORS / LOADING
  // ---------------------------------------------------------
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------------------
  // AVAILABLE CUISINES
  // ---------------------------------------------------------
  const availableCuisines = [
    'Sri Lankan',
    'Indian',
    'Western',
    'Chinese',
    'Italian'
  ];

  // ---------------------------------------------------------
  // SRI LANKAN CITIES
  // ---------------------------------------------------------
  const sriLankanCities = [
    'Colombo',
    'Nugegoda',
    'Kandy',
    'Galle',
    'Jaffna',
    'Negombo',
    'Kurunegala',
    'Kuliyapitiya',
    'Anuradhapura',
    'Polonnaruwa',
    'Matara',
    'Hambantota',
    'Ratnapura',
    'Badulla',
    'Nuwara Eliya',
    'Batticaloa',
    'Trincomalee',
    'Ampara',
    'Kalutara',
    'Gampaha',
    'Kegalle',
    'Matale',
    'Puttalam',
    'Vavuniya',
    'Mannar',
    'Kilinochchi',
    'Mullaitivu',
    'Monaragala'
  ];

  // ---------------------------------------------------------
  // CITY COORDINATES MAPPING
  // ---------------------------------------------------------
  const cityCoordinatesMap = {
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
    Monaragala: { lat: 6.872421, lng: 81.350727 }
  };

  // ---------------------------------------------------------
  // HANDLE CITY CHANGE
  // ---------------------------------------------------------
  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    setCity(selectedCity);

    const coords = cityCoordinatesMap[selectedCity];
    if (coords) {
      setLat(coords.lat.toFixed(8));
      setLng(coords.lng.toFixed(8));
    } else {
      setLat('');
      setLng('');
    }
  };

  // ---------------------------------------------------------
  // CUISINE TOGGLE
  // ---------------------------------------------------------
  const handleCuisineToggle = (cuisine) => {
    if (specialities.includes(cuisine)) {
      setSpecialities(
        specialities.filter((item) => item !== cuisine)
      );
    } else {
      setSpecialities([
        ...specialities,
        cuisine
      ]);
    }
  };

  // ---------------------------------------------------------
  // PHONE NUMBER
  // EXACTLY 10 DIGITS
  // ---------------------------------------------------------
  const handlePhoneChange = (e) => {
    // Remove everything except numbers
    const value = e.target.value.replace(/\D/g, '');

    // Allow maximum 10 digits
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  // ---------------------------------------------------------
  // GET ACTUAL CURRENT GPS LOCATION
  // ---------------------------------------------------------
  const handleGetCurrentLocation = () => {
    setLocationError('');
    setError('');

    if (!navigator.geolocation) {
      setLocationError(
        'Geolocation is not supported by this browser.'
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setLat(latitude.toFixed(8));
        setLng(longitude.toFixed(8));

        setLocationLoading(false);
        setLocationError('');
      },

      (geoError) => {
        setLocationLoading(false);

        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setLocationError(
              'Location permission denied. Please allow location access in your browser and try again.'
            );
            break;

          case geoError.POSITION_UNAVAILABLE:
            setLocationError(
              'Your current location could not be determined.'
            );
            break;

          case geoError.TIMEOUT:
            setLocationError(
              'Location request timed out. Please try again.'
            );
            break;

          default:
            setLocationError(
              'Unable to get your current location.'
            );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // ---------------------------------------------------------
  // FORM SUBMIT
  // ---------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setFieldErrors({});
    setLocationError('');

    // -------------------------------------------------------
    // PHONE VALIDATION
    // EXACTLY 10 DIGITS
    // -------------------------------------------------------
    if (!/^\d{10}$/.test(phone)) {
      setError(
        'Phone number must contain exactly 10 digits.'
      );
      return;
    }

    // -------------------------------------------------------
    // PASSWORD VALIDATION
    // -------------------------------------------------------
    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    // -------------------------------------------------------
    // CITY VALIDATION (all roles)
    // -------------------------------------------------------
    if (!city) {
      setError('Please select your city.');
      return;
    }

    // -------------------------------------------------------
    // CHEF VALIDATIONS
    // -------------------------------------------------------
    if (role === 'chef') {
      if (specialities.length === 0) {
        setError(
          'Please select at least one cuisine speciality.'
        );
        return;
      }

      if (!lat || !lng) {
        setError(
          'Please select a city to determine your location coordinates.'
        );
        return;
      }
    }

    // -------------------------------------------------------
    // BASIC PAYLOAD
    // -------------------------------------------------------
    const payload = {
      name,
      email,
      phone,
      city,
      password,
      password_confirmation: passwordConfirmation,
      role
    };

    // -------------------------------------------------------
    // CHEF PAYLOAD
    // -------------------------------------------------------
    if (role === 'chef') {
      payload.experience_years = parseInt(
        experience,
        10
      );

      payload.cuisine_specialities = specialities;

      payload.hourly_rate = parseFloat(
        rate
      );

      payload.city = city;

      payload.bio = bio;

      payload.latitude = parseFloat(lat);
      payload.longitude = parseFloat(lng);
    }

    setLoading(true);

    try {
      const result = await register(payload);

      setLoading(false);

      if (result.success) {

        if (result.isPending) {
          setError('');
          setFieldErrors({});

          alert(result.message);

          navigate('/login');

        } else {

          if (result.user.role === 'admin') {
            navigate('/admin');

          } else if (result.user.role === 'chef') {
            navigate('/chef');

          } else {
            navigate('/dashboard');
          }
        }

      } else {
        setError(result.message);

        if (result.errors) {
          setFieldErrors(result.errors);
        }
      }

    } catch (err) {

      setLoading(false);

      console.error(
        'Registration error:',
        err
      );

      setError(
        err?.response?.data?.message ||
        'Registration failed. Please try again.'
      );
    }
  };

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10"></div>

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-2xl space-y-8 bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-slate-800">

        {/* HEADER */}
        <div className="text-center">

          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-4 hover:opacity-85"
          >
            <ChefHat
              size={36}
              className="text-amber-500"
            />

            <span className="text-2xl font-bold tracking-tight text-white font-sans">
              ChefHire
            </span>
          </Link>

          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Create your account
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Join the location-aware Sri Lankan Chef Platform
          </p>

        </div>

        {/* ROLE SELECTOR */}
        <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-2xl max-w-sm mx-auto">

          <button
            type="button"
            onClick={() => {
              setRole('user');
              setError('');
              setLocationError('');
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-200 ${
              role === 'user'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register as Customer
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('chef');
              setError('');
              setLocationError('');
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-200 ${
              role === 'chef'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register as Chef
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm max-w-xl mx-auto">

            <AlertCircle
              size={20}
              className="shrink-0 mt-0.5"
            />

            <span>
              {error}
            </span>

          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 max-w-xl mx-auto"
        >

          {/* GENERAL INFORMATION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* NAME */}
            <div>

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>

              <div className="relative">

                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User size={18} />
                </span>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Kamal Perera"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200"
                  required
                />

              </div>

              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-400">
                  {fieldErrors.name[0]}
                </p>
              )}

            </div>

            {/* EMAIL */}
            <div>

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>

              <div className="relative">

                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail size={18} />
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="kamal@gmail.com"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200"
                  required
                />

              </div>

              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-400">
                  {fieldErrors.email[0]}
                </p>
              )}

            </div>

            {/* PHONE */}
            <div>

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number
              </label>

              <div className="relative">

                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Phone size={18} />
                </span>

                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="0771234567"
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200"
                  required
                />

              </div>

              <div className="flex justify-between mt-1">
                <p className="text-xs text-slate-500">
                  Enter exactly 10 digits
                </p>

                <p
                  className={`text-xs ${
                    phone.length === 10
                      ? 'text-green-400'
                      : 'text-slate-500'
                  }`}
                >
                  {phone.length}/10
                </p>
              </div>

              {fieldErrors.phone && (
                <p className="mt-1 text-xs text-red-400">
                  {fieldErrors.phone[0]}
                </p>
              )}

            </div>

            {/* CITY */}
            <div>

              <label className="block text-sm font-medium text-slate-300 mb-2">
                City <span className="text-amber-400">*</span>
              </label>

              <div className="relative">

                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <MapPin size={18} />
                </span>

                <select
                  value={city}
                  onChange={handleCityChange}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200"
                  required
                >

                  <option value="">
                    Select your city
                  </option>

                  {sriLankanCities.map(
                    (cityName) => (
                      <option
                        key={cityName}
                        value={cityName}
                      >
                        {cityName}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

            {/* PASSWORD */}
            <div>

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>

              <div className="relative">

                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock size={18} />
                </span>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200"
                  required
                />

              </div>

              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {fieldErrors.password[0]}
                </p>
              )}

            </div>

            {/* CONFIRM PASSWORD */}
            <div>

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>

              <div className="relative">

                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock size={18} />
                </span>

                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) =>
                    setPasswordConfirmation(
                      e.target.value
                    )
                  }
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200"
                  required
                />

              </div>

            </div>

          </div>

          {/* CHEF DETAILS */}
          {role === 'chef' && (

            <div className="pt-6 border-t border-slate-800 space-y-6">

              <h3 className="text-lg font-semibold text-amber-400">
                Professional Chef Details
              </h3>

              {/* EXPERIENCE + RATE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                {/* EXPERIENCE */}
                <div>

                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Years of Experience
                  </label>

                  <div className="relative">

                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Award size={18} />
                    </span>

                    <input
                      type="number"
                      value={experience}
                      onChange={(e) =>
                        setExperience(e.target.value)
                      }
                      min="0"
                      className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200"
                      required
                    />

                  </div>

                </div>

                {/* RATE */}
                <div>

                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Hourly Rate / Service Fee (LKR)
                  </label>

                  <div className="relative">

                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <DollarSign size={18} />
                    </span>

                    <input
                      type="number"
                      value={rate}
                      onChange={(e) =>
                        setRate(e.target.value)
                      }
                      min="0"
                      className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200"
                      required
                    />

                  </div>

                </div>

              </div>

              {/* ACTUAL GPS LOCATION */}
              <div>

                <div className="flex justify-between items-center mb-3">

                  <label className="block text-sm font-medium text-slate-300">
                    Current Geographical Location
                  </label>

                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={locationLoading}
                    className="flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >

                    <LocateFixed size={15} />

                    {locationLoading
                      ? 'Getting Location...'
                      : 'Get My Current Location'}

                  </button>

                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">

                  <p className="text-xs text-slate-500 mb-3">
                    Your actual browser GPS location will be used for distance calculation and AI chef recommendations.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* LATITUDE */}
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">

                      <p className="text-xs text-slate-500 mb-1">
                        Latitude
                      </p>

                      <p className="text-sm font-mono text-white break-all">
                        {lat || 'Not detected'}
                      </p>

                    </div>

                    {/* LONGITUDE */}
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">

                      <p className="text-xs text-slate-500 mb-1">
                        Longitude
                      </p>

                      <p className="text-sm font-mono text-white break-all">
                        {lng || 'Not detected'}
                      </p>

                    </div>

                  </div>

                </div>

                {/* LOCATION ERROR */}
                {locationError && (

                  <div className="mt-3 flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">

                    <AlertCircle
                      size={16}
                      className="text-red-400 shrink-0 mt-0.5"
                    />

                    <p className="text-xs text-red-400">
                      {locationError}
                    </p>

                  </div>

                )}

                {/* LOCATION SUCCESS */}
                {lat && lng && !locationError && (

                  <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">

                    <p className="text-xs text-green-400">
                      ✓ Actual GPS location detected successfully.
                    </p>

                  </div>

                )}

              </div>

              {/* CUISINE SPECIALITIES */}
              <div>

                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Cuisine Specialities
                </label>

                <div className="flex flex-wrap gap-2">

                  {availableCuisines.map(
                    (cuisine) => {

                      const isSelected =
                        specialities.includes(
                          cuisine
                        );

                      return (

                        <button
                          type="button"
                          key={cuisine}
                          onClick={() =>
                            handleCuisineToggle(
                              cuisine
                            )
                          }
                          className={`px-4 py-2 text-xs font-semibold rounded-xl border cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300'
                          }`}
                        >
                          {cuisine}
                        </button>

                      );
                    }
                  )}

                </div>

              </div>

              {/* BIO */}
              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Chef Bio
                </label>

                <textarea
                  value={bio}
                  onChange={(e) =>
                    setBio(e.target.value)
                  }
                  placeholder="Tell customers about your signature dishes, catering scale, or certifications..."
                  rows="3"
                  className="block w-full px-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200 resize-none"
                />

              </div>

            </div>
          )}

          {/* REGISTER BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="flex justify-center items-center gap-2 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >

            {loading ? (

              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

            ) : (

              <>
                <ChefHat size={18} />
                <span>
                  Register Account
                </span>
              </>

            )}

          </button>

        </form>

        {/* LOGIN */}
        <p className="text-center text-sm text-slate-400">

          Already have an account?{' '}

          <Link
            to="/login"
            className="font-semibold text-amber-400 hover:underline hover:text-amber-300"
          >
            Sign in here
          </Link>

        </p>

      </div>
    </div>
  );
};

export default Register;