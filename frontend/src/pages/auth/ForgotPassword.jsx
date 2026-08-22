import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  ShieldCheck,
  KeyRound,
  ChefHat,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();

  // 1 = Email
  // 2 = OTP
  // 3 = New Password
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ---------------------------------------------------------
  // STEP 1 - SEND OTP
  // ---------------------------------------------------------
  const handleSendOtp = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/forgotPassword/send-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            email
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Unable to send OTP.');
        setLoading(false);
        return;
      }

      setSuccess(
        data.message || 'OTP has been sent to your email.'
      );

      setStep(2);

    } catch (err) {
      console.error(err);

      setError(
        'Unable to connect to the server. Please try again.'
      );
    }

    setLoading(false);
  };

  // ---------------------------------------------------------
  // STEP 2 - VERIFY OTP
  // ---------------------------------------------------------
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must contain 6 digits.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/forgotPassword/verify-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            email,
            otp
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid OTP.');
        setLoading(false);
        return;
      }

      setSuccess(
        data.message || 'OTP verified successfully.'
      );

      setStep(3);

    } catch (err) {
      console.error(err);

      setError(
        'Unable to connect to the server. Please try again.'
      );
    }

    setLoading(false);
  };

  // ---------------------------------------------------------
  // STEP 3 - RESET PASSWORD
  // ---------------------------------------------------------
  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!password || !passwordConfirmation) {
      setError('Please fill in both password fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/forgotPassword/reset',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            email,
            otp,
            password,
            password_confirmation: passwordConfirmation
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || 'Unable to reset password.'
        );

        setLoading(false);
        return;
      }

      setSuccess(
        data.message ||
        'Password reset successfully. Redirecting to login...'
      );

      // Navigate to login after successful password reset
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      console.error(err);

      setError(
        'Unable to connect to the server. Please try again.'
      );
    }

    setLoading(false);
  };

  // ---------------------------------------------------------
  // BACK BUTTON
  // ---------------------------------------------------------
  const handleBack = () => {
    setError('');
    setSuccess('');

    if (step === 2) {
      setStep(1);
      setOtp('');
    } else if (step === 3) {
      setStep(2);
      setPassword('');
      setPasswordConfirmation('');
    }
  };

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10"></div>

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-3xl border border-slate-800 shadow-2xl">

          {/* Logo */}
          <div className="text-center mb-8">

            <Link
              to="/"
              className="inline-flex items-center gap-2 mb-5 hover:opacity-85"
            >
              <ChefHat
                size={36}
                className="text-amber-500"
              />

              <span className="text-2xl font-bold tracking-tight text-white">
                ChefHub
              </span>
            </Link>

            <h1 className="text-3xl font-extrabold text-white">
              Forgot Password?
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Reset your account password securely.
            </p>

          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">

            {/* STEP 1 */}
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold ${
                step >= 1
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              1
            </div>

            <div
              className={`w-16 h-1 ${
                step >= 2
                  ? 'bg-amber-500'
                  : 'bg-slate-800'
              }`}
            ></div>

            {/* STEP 2 */}
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold ${
                step >= 2
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              2
            </div>

            <div
              className={`w-16 h-1 ${
                step >= 3
                  ? 'bg-amber-500'
                  : 'bg-slate-800'
              }`}
            ></div>

            {/* STEP 3 */}
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold ${
                step >= 3
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              3
            </div>

          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">

              <AlertCircle
                size={20}
                className="shrink-0 mt-0.5"
              />

              <span>{error}</span>

            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-start gap-3 p-4 mb-6 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">

              <CheckCircle
                size={20}
                className="shrink-0 mt-0.5"
              />

              <span>{success}</span>

            </div>
          )}

          {/* ================================================= */}
          {/* STEP 1 - EMAIL */}
          {/* ================================================= */}

          {step === 1 && (

            <form
              onSubmit={handleSendOtp}
              className="space-y-6"
            >

              <div className="text-center mb-4">

                <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-3">
                  <Mail
                    size={28}
                    className="text-amber-400"
                  />
                </div>

                <h2 className="text-lg font-semibold text-white">
                  Enter your email
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  We will send a 6-digit OTP to your registered email.
                </p>

              </div>

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
                    placeholder="name@example.com"
                    className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    required
                  />

                </div>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex justify-center items-center gap-2 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              >

                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Mail size={18} />
                    Send OTP
                  </>
                )}

              </button>

            </form>

          )}

          {/* ================================================= */}
          {/* STEP 2 - OTP */}
          {/* ================================================= */}

          {step === 2 && (

            <form
              onSubmit={handleVerifyOtp}
              className="space-y-6"
            >

              <div className="text-center mb-4">

                <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-3">
                  <ShieldCheck
                    size={28}
                    className="text-amber-400"
                  />
                </div>

                <h2 className="text-lg font-semibold text-white">
                  Verify OTP
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  Enter the 6-digit OTP sent to
                </p>

                <p className="text-sm text-amber-400 mt-1">
                  {email}
                </p>

              </div>

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Verification Code
                </label>

                <div className="relative">

                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <KeyRound size={18} />
                  </span>

                  <input
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 6)
                      )
                    }
                    placeholder="123456"
                    maxLength={6}
                    inputMode="numeric"
                    className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 tracking-[0.5em] font-mono text-center focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    required
                  />

                </div>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex justify-center items-center gap-2 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              >

                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Verify OTP
                  </>
                )}

              </button>

              <button
                type="button"
                onClick={handleBack}
                className="flex items-center justify-center gap-2 w-full text-sm text-slate-400 hover:text-white"
              >
                <ArrowLeft size={16} />
                Change email
              </button>

            </form>

          )}

          {/* ================================================= */}
          {/* STEP 3 - NEW PASSWORD */}
          {/* ================================================= */}

          {step === 3 && (

            <form
              onSubmit={handleResetPassword}
              className="space-y-6"
            >

              <div className="text-center mb-4">

                <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-3">
                  <Lock
                    size={28}
                    className="text-amber-400"
                  />
                </div>

                <h2 className="text-lg font-semibold text-white">
                  Create New Password
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  Enter your new password below.
                </p>

              </div>

              {/* NEW PASSWORD */}
              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
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
                    placeholder="Minimum 8 characters"
                    className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    required
                  />

                </div>

              </div>

              {/* CONFIRM PASSWORD */}
              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm New Password
                </label>

                <div className="relative">

                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock size={18} />
                  </span>

                  <input
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) =>
                      setPasswordConfirmation(e.target.value)
                    }
                    placeholder="Re-enter your password"
                    className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    required
                  />

                </div>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex justify-center items-center gap-2 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              >

                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Lock size={18} />
                    Reset Password
                  </>
                )}

              </button>

              <button
                type="button"
                onClick={handleBack}
                className="flex items-center justify-center gap-2 w-full text-sm text-slate-400 hover:text-white"
              >
                <ArrowLeft size={16} />
                Back to OTP
              </button>

            </form>

          )}

          {/* LOGIN LINK */}
          <div className="mt-8 text-center">

            <Link
              to="/login"
              className="text-sm font-semibold text-amber-400 hover:text-amber-300 hover:underline"
            >
              ← Back to Login
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ForgotPassword;