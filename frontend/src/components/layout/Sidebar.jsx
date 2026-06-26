import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, CalendarDays, UserCircle, ChefHat, Settings } from 'lucide-react';

export default function Sidebar() {
  const { user, isUser, isChef, isAdmin, systemName, systemLogo } = useAuth();

  let links = [];

  if (isUser()) {
    links = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'My Profile', path: '/profile', icon: UserCircle },
      { name: 'Find Chefs', path: '/search', icon: Users },
      { name: 'My Bookings', path: '/bookings', icon: CalendarDays },
    ];
  } else if (isChef()) {
    links = [
      { name: 'Dashboard', path: '/chef', icon: LayoutDashboard },
      { name: 'My Profile', path: '/chef/profile/edit', icon: UserCircle },
      { name: 'Bookings', path: '/chef/bookings', icon: CalendarDays },
    ];
  } else if (isAdmin()) {
    links = [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Users', path: '/admin/users', icon: Users },
      { name: 'All Bookings', path: '/admin/bookings', icon: CalendarDays },
      { name: 'Settings', path: '/admin/settings', icon: Settings },
    ];
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col h-screen fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        {systemLogo ? (
          <img src={systemLogo} alt={systemName} className="w-8 h-8 mr-3 object-contain" />
        ) : (
          <ChefHat className="text-orange-500 w-8 h-8 mr-3 shrink-0" />
        )}
        <span className="text-xl font-bold text-white tracking-wide truncate">{systemName}</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-500/10 text-orange-400 font-medium'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5 mr-3" />
              {link.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center px-4 py-3 bg-slate-800/50 rounded-xl">
          {user?.photo_url ? (
            <img src={user.photo_url} alt={user.name} className="w-8 h-8 rounded-full object-cover mr-3 border border-slate-700" />
          ) : (
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-3 shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
