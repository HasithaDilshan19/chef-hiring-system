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
  Navigation
} from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // =====================================================
  // ROLE
  // =====================================================
  const [role, setRole] = useState('user');

  // =====================================================
  // GENERAL USER DETAILS
  // =====================================================
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  // =====================================================
  // CHEF DETAILS
  // =====================================================
  const [experience, setExperience] = useState('2');
  const [specialities, setSpecialities] = useState([]);
  const [rate, setRate] = useState('2000');
  const [city, setCity] = useState('Colombo');
  const [bio, setBio] = useState('');

  // Default Colombo coordinates
  const [lat, setLat] = useState('6.927179');
  const [lng, setLng] = useState('79.861244');

  // =====================================================
  // STATES
  // =====================================================
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // =====================================================
  // SRI LANKA CITY COORDINATES
  // =====================================================
  const cityCoordinates = {
    Colombo: {
      lat: 6.927179,
      lng: 79.861244
    },

    Kandy: {
      lat: 7.290572,
      lng: 80.633728
    },

    Galle: {
      lat: 6.053519,
      lng: 80.220978
    },

    Jaffna: {
      lat: 9.661498,
      lng: 80.025547
    },

    Negombo: {
      lat: 7.208300,
      lng: 79.835800
    },

    'Nuwara Eliya': {
      lat: 6.949716,
      lng: 80.789106
    },

    Anuradhapura: {
      lat: 8.311400,
      lng: 80.403700
    },

    Trincomalee: {
      lat: 8.587400,
      lng: 81.215200
    },

    Batticaloa: {
      lat: 7.717000,
      lng: 81.700000
    },

    Matara: {
      lat: 5.954900,
      lng: 80.555000
    },

    Kurunegala: {
      lat: 7.486300,
      lng: 80.362300
    },

    Ratnapura: {
      lat: 6.682800,
      lng: 80.399200
    },

    Badulla: {
      lat: 6.993400,
      lng: 81.055000
    },

    Bandarawela: {
      lat: 6.825900,
      lng: 80.998200
    },

    Kegalle: {
      lat: 7.251300,
      lng: 80.346400
    },

    Kalutara: {
      lat: 6.585400,
      lng: 79.960700
    },

    Panadura: {
      lat: 6.713200,
      lng: 79.907400
    },

    Moratuwa: {
      lat: 6.773000,
      lng: 79.881600
    },

    Dehiwala: {
      lat: 6.856100,
      lng: 79.865600
    },

    Maharagama: {
      lat: 6.849400,
      lng: 79.926500
    },

    'Sri Jayawardenepura Kotte': {
      lat: 6.894100,
      lng: 79.902500
    },

    Dambulla: {
      lat: 7.873100,
      lng: 80.771800
    },

    Polonnaruwa: {
      lat: 7.940300,
      lng: 81.018800
    },

    Chilaw: {
      lat: 7.575800,
      lng: 79.795300
    },

    Hambantota: {
      lat: 6.124100,
      lng: 81.118500
    },

    Ampara: {
      lat: 7.291700,
      lng: 81.672100
    },

    Vavuniya: {
      lat: 8.751400,
      lng: 80.497100
    },

    Mannar: {
      lat: 8.981000,
      lng: 79.904400
    },

    Kilinochchi: {
      lat: 9.380300,
      lng: 80.377000
    },

    Mullaitivu: {
      lat: 9.267100,
      lng: 80.814200
    },

    Puttalam: {
      lat: 8.036200,
      lng: 79.828300
    },

    Matale: {
      lat: 7.467500,
      lng: 80.623400
    },

    Monaragala: {
      lat: 6.872800,
      lng: 81.350700
    }
  };

  // =====================================================
  // CUISINES
  // =====================================================
  const availableCuisines = [
    'Sri Lankan',
    'Indian',
    'Western',
    'Chinese',
    'Italian'
  ];

  // =====================================================
  // CITY CHANGE
  // =====================================================
  const handleCityChange = (e) => {
    const selectedCity = e.target.value;

    setCity(selectedCity);

    const coordinates = cityCoordinates[selectedCity];

    if (coordinates) {
      setLat(coordinates.lat.toFixed(6));
      setLng(coordinates.lng.toFixed(6));
    }
  };

  // =====================================================
  // CUISINE TOGGLE
  // =====================================================
  const handleCuisineToggle = (cuisine) => {
    if (specialities.includes(cuisine)) {
      setSpecialities(
        specialities.filter(
          (item) => item !== cuisine
        )
      );
    } else {
      setSpecialities([
        ...specialities,
        cuisine
      ]);
    }
  };

  // =====================================================
  // GENERATE LOCATION
  // =====================================================
  const handleMockLocation = () => {
    const selectedCityCoordinates =
      cityCoordinates[city];

    if (!selectedCityCoordinates) {
      return;
    }

    /*
     * Generate a small random offset around
     * the selected city.
     *
     * This prevents every chef in the same
     * city from having exactly the same
     * coordinates.
     */
    const randomOffset = () => {
      return (Math.random() - 0.5) * 0.02;
    };

    const newLat =
      selectedCityCoordinates.lat +
      randomOffset();

    const newLng =
      selectedCityCoordinates.lng +
      randomOffset();

    setLat(newLat.toFixed(6));
    setLng(newLng.toFixed(6));
  };

  // =====================================================
  // SUBMIT
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setFieldErrors({});

    // Password validation
    if (
      password !== passwordConfirmation
    ) {
      setError(
        'Passwords do not match.'
      );
      return;
    }

    // Chef cuisine validation
    if (
      role === 'chef' &&
      specialities.length === 0
    ) {
      setError(
        'Please select at least one cuisine speciality.'
      );
      return;
    }

    // =================================================
    // BASIC PAYLOAD
    // =================================================
    const payload = {
      name,
      email,
      phone,
      city,
      password,
      password_confirmation:
        passwordConfirmation,
      role
    };

    // =================================================
    // CHEF PAYLOAD
    // =================================================
    if (role === 'chef') {
      payload.experience_years =
        parseInt(experience, 10);

      payload.cuisine_specialities =
        specialities;

      payload.hourly_rate =
        parseFloat(rate);

      payload.city = city;

      payload.bio = bio;

      // IMPORTANT:
      // Send selected city's coordinates
      payload.latitude =
        parseFloat(lat);

      payload.longitude =
        parseFloat(lng);
    }

    // Check data before sending
    console.log(
      'REGISTER PAYLOAD:',
      payload
    );

    setLoading(true);

    try {
      const result =
        await register(payload);

      setLoading(false);

      if (result.success) {

        if (result.isPending) {
          setError('');
          setFieldErrors({});

          alert(result.message);

          navigate('/login');

        } else {

          if (
            result.user.role === 'admin'
          ) {
            navigate('/admin');

          } else if (
            result.user.role === 'chef'
          ) {
            navigate('/chef');

          } else {
            navigate('/dashboard');
          }
        }

      } else {

        setError(result.message);

        if (result.errors) {
          setFieldErrors(
            result.errors
          );
        }
      }

    } catch (err) {

      setLoading(false);

      console.error(
        'Registration error:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Registration failed. Please try again.'
      );

      if (
        err.response?.data?.errors
      ) {
        setFieldErrors(
          err.response.data.errors
        );
      }
    }
  };

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

      {/* Background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10" />

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-2xl space-y-8 bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-slate-800">

        {/* =================================================
            HEADER
        ================================================= */}
        <div className="text-center">

          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-4 hover:opacity-85"
          >
            <ChefHat
              size={36}
              className="text-amber-500"
            />

            <span className="text-2xl font-bold tracking-tight text-white">
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

        {/* =================================================
            ROLE SELECTOR
        ================================================= */}
        <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-2xl max-w-sm mx-auto">

          <button
            type="button"
            onClick={() => {
              setRole('user');
              setError('');
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl cursor-pointer transition-all ${
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
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl cursor-pointer transition-all ${
              role === 'chef'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register as Chef
          </button>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm max-w-xl mx-auto">

            <AlertCircle
              size={20}
              className="shrink-0 mt-0.5"
            />

            <span>{error}</span>

          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 max-w-xl mx-auto"
        >

          {/* =================================================
              GENERAL INFORMATION
          ================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* NAME */}
            <div>

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>

              <div className="relative">

                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Kamal Perera"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
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

                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="kamal@gmail.com"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
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

                <Phone
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="0771234567"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  required
                />

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
                City
              </label>

              <div className="relative">

                <MapPin
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <select
                  value={city}
                  onChange={handleCityChange}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                >

                  {Object.keys(
                    cityCoordinates
                  ).map((cityName) => (
                    <option
                      key={cityName}
                      value={cityName}
                    >
                      {cityName}
                    </option>
                  ))}

                </select>

              </div>

            </div>

            {/* PASSWORD */}
            <div>

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
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

                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) =>
                    setPasswordConfirmation(
                      e.target.value
                    )
                  }
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  required
                />

              </div>

            </div>

          </div>

          {/* =================================================
              CHEF DETAILS
          ================================================= */}
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

                    <Award
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      type="number"
                      value={experience}
                      onChange={(e) =>
                        setExperience(
                          e.target.value
                        )
                      }
                      min="0"
                      className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
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

                    <DollarSign
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      type="number"
                      value={rate}
                      onChange={(e) =>
                        setRate(
                          e.target.value
                        )
                      }
                      min="0"
                      className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                      required
                    />

                  </div>

                </div>

              </div>

              {/* =================================================
                  LOCATION
              ================================================= */}
              <div>

                <div className="flex justify-between items-center mb-2">

                  <label className="block text-sm font-medium text-slate-300">
                    Geographical Location
                  </label>

                  <button
                    type="button"
                    onClick={handleMockLocation}
                    className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
                  >
                    <Navigation size={14} />
                    Generate Location
                  </button>

                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">

                  <div className="flex justify-between items-center mb-4">

                    <span className="text-sm text-slate-400">
                      Selected City
                    </span>

                    <span className="text-sm font-semibold text-amber-400">
                      {city}
                    </span>

                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    <div className="bg-slate-900 rounded-lg p-3">

                      <p className="text-xs text-slate-500 mb-1">
                        Latitude
                      </p>

                      <p className="text-sm font-mono text-white">
                        {lat}
                      </p>

                    </div>

                    <div className="bg-slate-900 rounded-lg p-3">

                      <p className="text-xs text-slate-500 mb-1">
                        Longitude
                      </p>

                      <p className="text-sm font-mono text-white">
                        {lng}
                      </p>

                    </div>

                  </div>

                </div>

                <p className="text-xs text-slate-500 mt-2">
                  Selecting a city automatically sets its
                  geographical coordinates. Generate Location
                  creates a slightly different location within
                  the selected city area.
                </p>

              </div>

              {/* =================================================
                  CUISINE
              ================================================= */}
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
                          className={`px-4 py-2 text-xs font-semibold rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                          }`}
                        >
                          {cuisine}
                        </button>
                      );
                    }
                  )}

                </div>

                {specialities.length === 0 && (
                  <p className="text-xs text-red-400 mt-2">
                    Select at least one cuisine.
                  </p>
                )}

              </div>

              {/* =================================================
                  BIO
              ================================================= */}
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
                  className="block w-full px-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
                />

              </div>

            </div>
          )}

          {/* =================================================
              SUBMIT
          ================================================= */}
          <button
            type="submit"
            disabled={loading}
            className="flex justify-center items-center gap-2 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all disabled:opacity-50"
          >

            {loading ? (

              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />

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