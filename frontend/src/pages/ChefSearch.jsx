import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, ChefHat, Star } from 'lucide-react';
import api from '../services/api';

export default function ChefSearch() {
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', cuisine: '' });

  useEffect(() => {
    fetchChefs();
  }, []);

  const fetchChefs = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Chef</h1>
        <p className="text-gray-600">Discover top culinary talent for your next event.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="City (e.g. Colombo)" 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={filters.city}
              onChange={(e) => setFilters({...filters, city: e.target.value})}
            />
          </div>
          <div className="flex-1 relative">
            <ChefHat className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Cuisine (e.g. Italian)" 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={filters.cuisine}
              onChange={(e) => setFilters({...filters, cuisine: e.target.value})}
            />
          </div>
          <button 
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Search className="h-5 w-5" />
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : chefs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chefs.map(chef => (
            <div key={chef.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <div className="px-6 pb-6 relative">
                <div className="w-20 h-20 bg-white rounded-full p-1 absolute -top-10 shadow-sm border border-gray-100">
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-bold">
                    {chef.name.charAt(0)}
                  </div>
                </div>
                
                <div className="mt-12">
                  <h3 className="text-xl font-bold text-gray-900">{chef.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin className="h-4 w-4" />
                    {chef.chef_profile?.city || 'Location not specified'}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center text-amber-500 font-medium">
                      <Star className="h-4 w-4 fill-current mr-1" />
                      {chef.chef_profile?.rating || 'New'}
                    </div>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-600 font-medium">${chef.chef_profile?.hourly_rate || '0'}/hr</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(chef.chef_profile?.cuisine_specialities || []).slice(0, 3).map((cuisine, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                        {cuisine}
                      </span>
                    ))}
                  </div>

                  <Link 
                    to={`/chefs/${chef.id}`}
                    className="mt-6 block w-full text-center bg-gray-50 text-blue-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition border border-gray-200"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <ChefHat className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No chefs found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search filters.</p>
        </div>
      )}
    </div>
  );
}
