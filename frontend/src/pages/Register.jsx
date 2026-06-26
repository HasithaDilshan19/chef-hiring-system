import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, MapPin, Award, DollarSign, ChefHat, CheckSquare, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  // Tab control: 'user' or 'chef'
  const [role, setRole] = useState('user');
  
  // Standard fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  // Chef specific fields
  const [experience, setExperience] = useState('2');
  const [specialities, setSpecialities] = useState([]);
  const [rate, setRate] = useState('2000');
  const [city, setCity] = useState('Colombo');
  const [bio, setBio] = useState('');
  const [lat, setLat] = useState('6.927179');
  const [lng, setLng] = useState('79.861244');
  
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const availableCuisines = ['Sri Lankan', 'Indian', 'Western', 'Chinese', 'Italian'];

  const handleCuisineToggle = (cuisine) => {
    if (specialities.includes(cuisine)) {
      setSpecialities(specialities.filter((c) => c !== cuisine));
    } else {
      setSpecialities([...specialities, cuisine]);
    }
  };

  const handleMockLocation = () => {
    // Generate some mock Sri Lankan coordinates around Colombo/Kandy/Galle
    const cities = {
      Colombo: { lat: 6.927179, lng: 79.861244 },
      Kandy: { lat: 7.290572, lng: 80.633728 },
      Galle: { lat: 6.053519, lng: 80.220978 },
      Nugegoda: { lat: 6.901500, lng: 79.880000 },
    };
    
    const selectedCityCoords = cities[city] || cities.Colombo;
    // Add minor offset
    const randomOffset = () => (Math.random() - 0.5) * 0.02;
    setLat((selectedCityCoords.lat + randomOffset()).toFixed(6));
    setLng((selectedCityCoords.lng + randomOffset()).toFixed(6));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    if (role === 'chef' && specialities.length === 0) {
      setError('Please select at least one cuisine speciality.');
      return;
    }

    const payload = {
      name,
      email,
      phone,
      password,
      password_confirmation: passwordConfirmation,
      role,
    };

    if (role === 'chef') {
      payload.experience_years = parseInt(experience);
      payload.cuisine_specialities = specialities;
      payload.hourly_rate = parseFloat(rate);
      payload.city = city;
      payload.bio = bio;
      payload.latitude = parseFloat(lat);
      payload.longitude = parseFloat(lng);
    }

    setLoading(true);
    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      if (result.isPending) {
        // Show success message but don't redirect to dashboard since they can't login
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
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-2xl space-y-8 bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-slate-800">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-85">
            <ChefHat size={36} className="text-amber-500" />
            <span className="text-2xl font-bold tracking-tight text-white font-sans">Rasawathee</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Create your account</h2>
          <p className="mt-2 text-sm text-slate-400">Join the location-aware Sri Lankan Chef Platform</p>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-2xl max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => { setRole('user'); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-200 ${
              role === 'user' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register as Customer
          </button>
          <button
            type="button"
            onClick={() => { setRole('chef'); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-200 ${
              role === 'chef' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register as Chef
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm max-w-xl mx-auto">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
          {/* General Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kamal Perera"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200"
                  required
                />
              </div>
              {fieldErrors.name && <p className="mt-1 text-xs text-red-400">{fieldErrors.name[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kamal@gmail.com"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200"
                  required
                />
              </div>
              {fieldErrors.email && <p className="mt-1 text-xs text-red-400">{fieldErrors.email[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Phone size={18} />
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0771234567"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200"
                  required
                />
              </div>
              {fieldErrors.phone && <p className="mt-1 text-xs text-red-400">{fieldErrors.phone[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <MapPin size={18} />
                </span>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200"
                >
                  <option value="Colombo">Colombo</option>
                  <option value="Nugegoda">Nugegoda</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Galle">Galle</option>
                  <option value="Negombo">Negombo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200"
                  required
                />
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-400">{fieldErrors.password[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200"
                  required
                />
              </div>
            </div>
          </div>

          {/* Chef-Specific Fields (Conditionally Rendered) */}
          {role === 'chef' && (
            <div className="pt-6 border-t border-slate-800 space-y-6">
              <h3 className="text-lg font-semibold text-amber-400">Professional Chef Details</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Years of Experience</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Award size={18} />
                    </span>
                    <input
                      type="number"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      min="0"
                      className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Hourly Rate / Service Fee (LKR)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <DollarSign size={18} />
                    </span>
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      min="0"
                      className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location Coordinates Simulation */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-300">Geographical Location Coordinates</label>
                  <button
                    type="button"
                    onClick={handleMockLocation}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
                  >
                    Simulate GPS Location
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-400">
                    Latitude: <span className="text-white">{lat}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-400">
                    Longitude: <span className="text-white">{lng}</span>
                  </div>
                </div>
              </div>

              {/* Cuisine Specialities Multi-select */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Cuisine Specialities</label>
                <div className="flex flex-wrap gap-2">
                  {availableCuisines.map((cuisine) => {
                    const isSelected = specialities.includes(cuisine);
                    return (
                      <button
                        type="button"
                        key={cuisine}
                        onClick={() => handleCuisineToggle(cuisine)}
                        className={`px-4 py-2 text-xs font-semibold rounded-xl border cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-500/5'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        {cuisine}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Chef Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell customers about your signature dishes, catering scale, or certifications..."
                  rows="3"
                  className="block w-full px-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200 resize-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex justify-center items-center gap-2 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <ChefHat size={18} />
                <span>Register Account</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-amber-400 hover:underline hover:text-amber-300">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
