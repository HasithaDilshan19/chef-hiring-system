import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChefHat,
  Clock3,
  Users,
  Utensils,
  Package,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';

// Accent colours cycle for variety
const ACCENTS = [
  'from-orange-500/20 to-amber-500/5 border-orange-400/30',
  'from-amber-500/20 to-yellow-500/5 border-amber-400/40',
  'from-rose-500/15 to-orange-500/5 border-rose-400/30',
  'from-violet-500/15 to-purple-500/5 border-violet-400/30',
  'from-emerald-500/15 to-teal-500/5 border-emerald-400/30',
];

export default function FoodiePackages() {
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // -------------------------------------------------------
  // FETCH PACKAGES FROM BACKEND
  // -------------------------------------------------------
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await api.get('/packages');
        if (response.data.status === 'success') {
          setPackages(response.data.packages || []);
        }
      } catch (err) {
        console.error('Failed to fetch packages', err);
        setError('Could not load packages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  // -------------------------------------------------------
  // SELECT A PACKAGE → GO TO CHEF SEARCH WITH IT
  // -------------------------------------------------------
  const handleSelectPackage = (pkg) => {
    // Navigate to chef search passing the package details as query params
    const params = new URLSearchParams({
      package_id:    pkg.id,
      package_name:  pkg.name,
      guests_count:  pkg.guests_count || 4,
      package_price: pkg.price || '',
    });
    navigate(`/search?${params.toString()}`);
  };

  // -------------------------------------------------------
  // LOADING
  // -------------------------------------------------------
  if (loading) {
    return (
      <main className="mx-auto max-w-7xl space-y-8 text-slate-100 min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading packages...</p>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------
  // UI
  // -------------------------------------------------------
  return (
    <main className="mx-auto max-w-7xl space-y-8 text-slate-100">

      {/* HERO BANNER */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/50 px-6 py-8 sm:px-10 sm:py-10">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
            <ChefHat size={14} /> Foodie Packages
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Bring a chef-worthy table home.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Choose the experience that fits your occasion, then find the perfect chef to make it yours.
          </p>
        </div>
        <Utensils className="absolute -bottom-8 -right-4 h-44 w-44 rotate-12 text-orange-400/10" />
      </section>

      {/* SUBTITLE ROW */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Made for every occasion</p>
          <h2 className="mt-1 text-2xl font-bold text-white">Find your table style</h2>
        </div>
        <button
          type="button"
          onClick={() => navigate('/search')}
          className="inline-flex items-center gap-2 self-start text-sm font-semibold text-amber-400 transition-colors hover:text-amber-300 sm:self-auto"
        >
          Browse all chefs <ArrowRight size={16} />
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          <AlertCircle size={20} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* PACKAGES GRID */}
      {!error && packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-800 border-dashed bg-slate-900/40 py-24">
          <Package className="mb-4 h-14 w-14 text-slate-700" />
          <p className="text-lg font-semibold text-slate-400">No packages available yet.</p>
          <p className="mt-1 text-sm text-slate-500">Check back soon — the admin is building them!</p>
          <button
            type="button"
            onClick={() => navigate('/search')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
          >
            Browse Chefs <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, idx) => {
            const accent = ACCENTS[idx % ACCENTS.length];
            return (
              <article
                key={pkg.id}
                className={`relative flex flex-col overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-transform hover:-translate-y-1 ${accent} ${pkg.is_featured ? 'lg:-translate-y-2 ring-1 ring-amber-400/40' : ''}`}
              >
                {pkg.is_featured && (
                  <span className="absolute right-5 top-5 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-950">
                    Most popular
                  </span>
                )}

                {/* ICON */}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950/70 text-amber-400">
                  <ChefHat size={22} />
                </div>

                {/* EYEBROW */}
                <p className="mt-6 text-xs font-bold uppercase tracking-wider text-slate-400">
                  {pkg.eyebrow || 'Platform Package'}
                </p>

                {/* NAME */}
                <h3 className="mt-1 text-2xl font-black text-white">{pkg.name}</h3>

                {/* DESCRIPTION */}
                <p className="mt-3 min-h-12 text-sm leading-6 text-slate-300">{pkg.description}</p>

                {/* STATS */}
                <div className="mt-5 flex flex-wrap gap-3 border-y border-white/10 py-4 text-xs font-semibold text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={14} className="text-amber-400" />
                    Up to {pkg.guests_count} guests
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={14} className="text-amber-400" />
                    {pkg.duration_hours} hours
                  </span>
                </div>

                {/* FEATURES */}
                {pkg.features && pkg.features.length > 0 && (
                  <ul className="mt-5 space-y-3 text-sm text-slate-300">
                    {pkg.features.map((feature, fi) => (
                      <li key={fi} className="flex items-center gap-2">
                        <Check size={15} className="text-emerald-400 shrink-0" /> {feature}
                      </li>
                    ))}
                  </ul>
                )}

                {/* PRICE + CTA */}
                <div className="mt-auto pt-7">
                  {pkg.price && (
                    <p className="text-lg font-black text-white">{pkg.price}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSelectPackage(pkg)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-slate-950/50 px-4 py-3 text-sm font-bold text-amber-300 transition-colors hover:bg-amber-500 hover:text-slate-950"
                  >
                    Book this package <ArrowRight size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
