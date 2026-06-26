import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Camera, Save, Key, ShieldAlert, Check, User as UserIcon } from 'lucide-react';

export default function UserProfile() {
  const { user } = useAuth();
  
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.photo_url || null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Handle Photo Change Preview
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setPhotoError('');
      setPhotoSuccess('');
    }
  };

  // Upload Photo
  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!photoFile) return;

    setPhotoUploading(true);
    setPhotoError('');
    setPhotoSuccess('');
    
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      const response = await api.post('/user/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'success') {
        setPhotoSuccess('Profile photo updated successfully!');
        // Reload after a short delay to update context everywhere
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      console.error(err);
      setPhotoError(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setPhotoUploading(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.password_confirmation) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const response = await api.put('/user/password', passwordForm);
      if (response.data.status === 'success') {
        setPasswordSuccess('Password updated successfully!');
        setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
      }
    } catch (err) {
      console.error(err);
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-slate-400">Manage your personal settings and account security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Photo Section */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <UserIcon className="text-amber-500 h-6 w-6" />
            <h2 className="text-xl font-bold text-white">Profile Photo</h2>
          </div>

          {photoError && (
            <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <ShieldAlert size={16} />
              <span>{photoError}</span>
            </div>
          )}

          {photoSuccess && (
            <div className="p-3 mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
              <Check size={16} />
              <span>{photoSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePhotoUpload} className="flex flex-col items-center">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-950 flex items-center justify-center shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-12 h-12 text-slate-500" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-amber-500 text-slate-900 p-2 rounded-full cursor-pointer hover:bg-amber-400 transition-colors shadow-lg border-2 border-slate-900 group-hover:scale-110">
                <Camera size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
              </label>
            </div>

            <p className="text-sm text-slate-400 text-center mb-6">
              Upload a recognizable photo of yourself. Max size: 2MB.
            </p>

            <button 
              type="submit" 
              disabled={photoUploading || !photoFile}
              className="w-full flex justify-center items-center gap-2 bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {photoUploading ? 'Uploading...' : 'Save Photo'}
            </button>
          </form>
        </div>

        {/* Security Section */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Key className="text-amber-500 h-6 w-6" />
            <h2 className="text-xl font-bold text-white">Change Password</h2>
          </div>

          {passwordError && (
            <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <ShieldAlert size={16} />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
              <Check size={16} />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Current Password</label>
              <input 
                type="password"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">New Password</label>
              <input 
                type="password"
                required
                minLength={8}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
                value={passwordForm.password}
                onChange={(e) => setPasswordForm({...passwordForm, password: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Confirm New Password</label>
              <input 
                type="password"
                required
                minLength={8}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
                value={passwordForm.password_confirmation}
                onChange={(e) => setPasswordForm({...passwordForm, password_confirmation: e.target.value})}
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={passwordLoading}
                className="w-full flex justify-center items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
