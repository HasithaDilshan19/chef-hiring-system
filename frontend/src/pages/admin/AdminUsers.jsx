import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShieldAlert, Check, Users, Trash2, Power, Search, Filter, X } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ✅ Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      if (response.data.status === 'success') {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
      }
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Filter Users
  useEffect(() => {
    let result = users;

    // Search by name
    if (searchTerm.trim()) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(result);
  }, [searchTerm, roleFilter, users]);

  const toggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      setError('');
      setSuccessMsg('');
      await api.put(`/admin/users/${user.id}/status`, { status: newStatus });
      setSuccessMsg(`User ${user.name} is now ${newStatus}.`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}? This action is irreversible.`)) {
      return;
    }
    try {
      setError('');
      setSuccessMsg('');
      await api.delete(`/admin/users/${user.id}`);
      setSuccessMsg(`User ${user.name} was successfully deleted.`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // ✅ Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
  };

  // ✅ Get unique roles for filter dropdown
  const getUniqueRoles = () => {
    const roles = users.map(user => user.role);
    return [...new Set(roles)];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <header className="mb-8 border-b border-slate-800 pb-6">
        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20 mb-3 inline-block">
          User Management
        </span>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-amber-500" size={32} />
            All Platform Users
            <span className="text-sm font-normal text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
              {filteredUsers.length} users
            </span>
          </h1>
        </div>
      </header>

      {error && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex gap-2">
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex gap-2">
          <Check size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ✅ Search & Filter Section */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Search Box */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by user name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Role Filter Dropdown */}
        <div className="relative min-w-[180px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white appearance-none focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
          >
            <option value="all">All Roles</option>
            {getUniqueRoles().map(role => (
              <option key={role} value={role} className="capitalize">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {(searchTerm || roleFilter !== 'all') && (
          <button
            onClick={clearFilters}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition flex items-center gap-2 text-sm"
          >
            <X size={16} />
            Clear Filters
          </button>
        )}
      </div>

      {/* ✅ Filter Info */}
      {(searchTerm || roleFilter !== 'all') && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <span>Filters applied:</span>
          {searchTerm && (
            <span className="bg-slate-800 px-3 py-1 rounded-full text-xs flex items-center gap-1">
              Search: "{searchTerm}"
              <button onClick={() => setSearchTerm('')} className="hover:text-white">
                <X size={12} />
              </button>
            </span>
          )}
          {roleFilter !== 'all' && (
            <span className="bg-slate-800 px-3 py-1 rounded-full text-xs flex items-center gap-1">
              Role: {roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}
              <button onClick={() => setRoleFilter('all')} className="hover:text-white">
                <X size={12} />
              </button>
            </span>
          )}
          <span className="text-slate-500">
            ({filteredUsers.length} of {users.length} users)
          </span>
        </div>
      )}

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">User Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{u.name}</div>
                    <div className="text-xs text-slate-500">Joined {new Date(u.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      u.role === 'chef' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {u.role === 'chef' ? u.chef_profile?.city || 'N/A' : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {u.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => toggleStatus(u)}
                            className={`p-2 rounded-lg border transition-colors ${
                              u.status === 'active' 
                                ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500' 
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950'
                            }`}
                            title={u.status === 'active' ? 'Deactivate User' : 'Activate User'}
                          >
                            <Power size={16} />
                          </button>
                          <button
                            onClick={() => deleteUser(u)}
                            className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    {searchTerm || roleFilter !== 'all' 
                      ? 'No users match your search criteria.' 
                      : 'No users found in the system.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Users Count Footer */}
      <div className="mt-4 text-sm text-slate-500 text-right">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  );
}