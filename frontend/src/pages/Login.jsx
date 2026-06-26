import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, ChefHat } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Redirect based on role
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else if (result.user.role === 'chef') {
        navigate('/chef');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message);
    }
  };

  const handleQuickLogin = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 flex-col md:flex-row">
      {/* Left Panel: Hero Graphics & Theme */}
      <div className="flex flex-col justify-center items-start p-8 md:p-16 md:w-1/2 bg-gradient-to-br from-amber-950 via-slate-950 to-slate-950 relative overflow-hidden border-r border-slate-900">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <ChefHat size={32} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-amber-500 font-sans">රසවතී / Rasawathee</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white mb-4">
          Location-Aware <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            Chef Recommendation
          </span> <br />
          System Sri Lanka
        </h1>

        <p className="text-lg text-slate-400 max-w-md mb-8">
          Find available, professional chefs in your local area on short notice for family gatherings, weddings, and emergency cultural events.
        </p>

        {/* Quick Autofill Buttons for Testing */}
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 w-full max-w-md">
          <h3 className="text-sm font-semibold tracking-wider text-amber-400 uppercase mb-3">
            Prototype Quick Access
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleQuickLogin('admin@chefhiring.lk')}
              className="flex justify-between items-center px-4 py-2 bg-slate-800/80 hover:bg-slate-800 text-left text-xs font-medium rounded-lg text-slate-300 border border-slate-700/50 hover:border-amber-500/50 transition-all duration-200"
            >
              <span>Login as Admin</span>
              <span className="text-amber-500 font-mono">admin@chefhiring.lk</span>
            </button>
            <button
              onClick={() => handleQuickLogin('chef@chefhiring.lk')}
              className="flex justify-between items-center px-4 py-2 bg-slate-800/80 hover:bg-slate-800 text-left text-xs font-medium rounded-lg text-slate-300 border border-slate-700/50 hover:border-amber-500/50 transition-all duration-200"
            >
              <span>Login as Chef (Kamal)</span>
              <span className="text-amber-500 font-mono">chef@chefhiring.lk</span>
            </button>
            <button
              onClick={() => handleQuickLogin('user@chefhiring.lk')}
              className="flex justify-between items-center px-4 py-2 bg-slate-800/80 hover:bg-slate-800 text-left text-xs font-medium rounded-lg text-slate-300 border border-slate-700/50 hover:border-amber-500/50 transition-all duration-200"
            >
              <span>Login as Customer (Hasitha)</span>
              <span className="text-amber-500 font-mono">user@chefhiring.lk</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex flex-col justify-center items-center p-8 md:p-16 md:w-1/2 bg-slate-950">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-400">Please enter your credentials to log in.</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200"
                  required
                />
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
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex justify-center items-center gap-2 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-amber-400 hover:underline hover:text-amber-300">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
