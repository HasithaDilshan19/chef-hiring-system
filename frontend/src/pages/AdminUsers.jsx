import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldAlert, Check, Users, Trash2, Power } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      if (response.data.status === 'success') {
        setUsers(response.data.users);
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
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Users className="text-amber-500" size={32} />
          All Platform Users
        </h1>
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
              {users.map((u) => (
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
              
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No users found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
