import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center">
        {/* Mobile menu button could go here */}
        <button className="md:hidden text-slate-400 hover:text-white mr-4">
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-medium text-slate-200 capitalize hidden sm:block">
          Welcome back, {user?.name?.split(' ')[0]}
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-slate-900"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-700 mx-2"></div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
    </header>
  );
}
