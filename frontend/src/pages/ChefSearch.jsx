import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, ChefHat, Star, User, X } from 'lucide-react';
import api from '../services/api';

export default function ChefSearch() {
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', city: '', cuisine: '' });

  useEffect(() => {
    fetchChefs();
  }, []);

  const fetchChefs = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.city) params.append('city', filters.city);
      if (filters.cuisine) params.append('cuisine', filters.cuisine);
      
      const response = await api.get(`/chefs?${params.toString()}`);
      if (response.data.status === 'success') {
        setChefs(response.data.chefs);
      }
    } catch (error) {
      console.error('Error fetching chefs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchChefs();
  };

  const handleClear = async () => {
    setFilters({ name: '', city: '', cuisine: '' });
    setLoading(true);
    try {
      const response = await api.get('/chefs');
      if (response.data.status === 'success') {
        setChefs(response.data.chefs);
      }
    } catch (error) {
      console.error('Error fetching chefs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 border-b border-slate-800 pb-6">
        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20 mb-3 inline-block">
          Explore Chefs
        </span>
        <h1 className="text-3xl font-bold text-white mb-2">Find a Chef</h1>
        <p className="text-slate-400">Discover top culinary talent for your next event.</p>
      </div>

      <div className="bg-slate-900/40 p-6 rounded-2xl shadow-sm border border-slate-800 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <User className="absolute left-3 top-3 text-slate-500 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Chef Name (e.g. John)" 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-amber-500 text-white transition-colors"
              value={filters.name}
              onChange={(e) => setFilters({...filters, name: e.target.value})}
            />
          </div>
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-3 text-slate-500 h-5 w-5" />
            <input 
              type="text" 
              placeholder="City (e.g. Colombo)" 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-amber-500 text-white transition-colors"
              value={filters.city}
              onChange={(e) => setFilters({...filters, city: e.target.value})}
            />
          </div>
          <div className="flex-1 relative">
            <ChefHat className="absolute left-3 top-3 text-slate-500 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Cuisine (e.g. Italian)" 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-amber-500 text-white transition-colors"
              value={filters.cuisine}
              onChange={(e) => setFilters({...filters, cuisine: e.target.value})}
            />
          </div>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={handleClear}
              className="bg-slate-800 text-slate-300 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-700 transition flex items-center justify-center border border-slate-700"
              title="Clear Filters"
            >
              <X className="h-5 w-5" />
            </button>
            <button 
              type="submit"
              className="bg-amber-500 text-slate-950 px-8 py-2.5 rounded-xl font-bold hover:bg-amber-600 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Search className="h-5 w-5" />
              Search
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : chefs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chefs.map(chef => (
            <div key={chef.id} className="bg-slate-900/60 rounded-2xl shadow-sm border border-slate-800 overflow-hidden hover:border-amber-500/30 transition group">
              <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-800"></div>
              <div className="px-6 pb-6 pt-6">
                <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">{chef.name}</h3>
                <div className="flex items-center gap-1.5 text-sm text-slate-400 mt-2">
                  <MapPin className="h-4 w-4 text-amber-500" />
                  {chef.chef_profile?.city || 'Location not specified'}
                </div>
                
                <div className="flex items-center gap-2 mt-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                  <div className="flex items-center text-amber-500 font-medium">
                    <Star className="h-4 w-4 fill-current mr-1" />
                    {chef.chef_profile?.rating || 'New'}
                  </div>
                  <span className="text-slate-700">•</span>
                  <span className="text-slate-300 font-medium">LKR {parseFloat(chef.chef_profile?.hourly_rate || 0).toLocaleString()}/hr</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(chef.chef_profile?.cuisine_specialities || []).slice(0, 3).map((cuisine, idx) => (
                    <span key={idx} className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-lg font-medium border border-slate-700">
                      {cuisine}
                    </span>
                  ))}
                </div>

                <Link 
                  to={`/chefs/${chef.id}`}
                  className="mt-6 block w-full text-center bg-slate-800 text-white py-2.5 rounded-xl font-medium hover:bg-slate-700 transition border border-slate-700 hover:border-slate-600"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800 border-dashed">
          <ChefHat className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">No chefs found</h3>
          <p className="text-slate-400 mt-2">Try adjusting your search filters or trying a different cuisine.</p>
        </div>
      )}
    </div>
  );
}
