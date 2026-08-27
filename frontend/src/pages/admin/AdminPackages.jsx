import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Package,
  Plus,
  Trash2,
  Edit3,
  X,
  Check,
  ShieldAlert,
  ChefHat,
  Users,
  Clock,
  Star,
  Save,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';

const EMPTY_FORM = {
  name: '',
  eyebrow: '',
  description: '',
  price: '',
  guests_count: 4,
  duration_hours: 3,
  features: [],
  is_featured: false,
  image_url: '',
};

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form modal state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete confirm
  const [deletingId, setDeletingId] = useState(null);

  // -------------------------------------------------------
  // FETCH
  // -------------------------------------------------------
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/packages');
      if (res.data.status === 'success') {
        setPackages(res.data.packages || []);
      }
    } catch (err) {
      setError('Failed to load packages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // -------------------------------------------------------
  // OPEN CREATE
  // -------------------------------------------------------
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
    setFeatureInput('');
    setFormError('');
    setShowForm(true);
  };

  // -------------------------------------------------------
  // OPEN EDIT
  // -------------------------------------------------------
  const openEdit = (pkg) => {
    setEditingId(pkg.id);
    setForm({
      name:           pkg.name || '',
      eyebrow:        pkg.eyebrow || '',
      description:    pkg.description || '',
      price:          pkg.price || '',
      guests_count:   pkg.guests_count || 4,
      duration_hours: pkg.duration_hours || 3,
      features:       pkg.features || [],
      is_featured:    pkg.is_featured || false,
      image_url:      pkg.image_url || '',
    });
    setImageFile(null);
    setImagePreview(pkg.image_url || '');
    setFeatureInput('');
    setFormError('');
    setShowForm(true);
  };

  // -------------------------------------------------------
  // HANDLE FILE SELECT
  // -------------------------------------------------------
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // -------------------------------------------------------
  // ADD FEATURE TAG
  // -------------------------------------------------------
  const addFeature = () => {
    const f = featureInput.trim();
    if (f && !form.features.includes(f)) {
      setForm(prev => ({ ...prev, features: [...prev.features, f] }));
      setFeatureInput('');
    }
  };

  // -------------------------------------------------------
  // SAVE (create or update)
  // -------------------------------------------------------
  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError('Package name is required.');
      return;
    }
    setFormSaving(true);
    setFormError('');

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('eyebrow', form.eyebrow || '');
      formData.append('description', form.description || '');
      formData.append('price', form.price || '');
      formData.append('guests_count', String(form.guests_count));
      formData.append('duration_hours', String(form.duration_hours));
      formData.append('features', JSON.stringify(form.features));
      formData.append('is_featured', form.is_featured ? '1' : '0');

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (form.image_url) {
        formData.append('image_url', form.image_url);
      }

      let res;
      if (editingId) {
        formData.append('_method', 'PUT');
        res = await api.post(`/admin/packages/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/admin/packages', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.data.status === 'success') {
        setSuccess(editingId ? 'Package updated!' : 'Package created!');
        setShowForm(false);
        fetchPackages();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save package.');
    } finally {
      setFormSaving(false);
    }
  };

  // -------------------------------------------------------
  // DELETE
  // -------------------------------------------------------
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await api.delete(`/admin/packages/${id}`);
      if (res.data.status === 'success') {
        setPackages(prev => prev.filter(p => p.id !== id));
        setSuccess('Package deleted.');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to delete package.');
    } finally {
      setDeletingId(null);
    }
  };

  // -------------------------------------------------------
  // UI
  // -------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">

      {/* HEADER */}
      <header className="mb-8 border-b border-slate-800 pb-6">
        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20 mb-3 inline-block">
          Platform Content
        </span>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Package className="text-amber-500" size={32} />
              Foodie Packages
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage the platform-wide packages users see on the Foodie Packages page.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-amber-500/20"
          >
            <Plus size={18} /> Add Package
          </button>
        </div>
      </header>

      {/* ALERTS */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 text-sm mb-6">
          <ShieldAlert size={18} /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400 text-sm mb-6">
          <Check size={18} /> {success}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-800 border-dashed bg-slate-900/40 py-24">
          <Package className="mb-4 h-14 w-14 text-slate-700" />
          <p className="text-lg font-semibold text-slate-400">No packages yet</p>
          <p className="mt-1 text-sm text-slate-500">Click "Add Package" above to create the first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className={`relative flex flex-col overflow-hidden rounded-2xl border transition-all ${
                pkg.is_featured
                  ? 'bg-amber-500/5 border-amber-500/40 ring-1 ring-amber-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              } ${!pkg.is_active ? 'opacity-50' : ''}`}
            >
              {/* IMAGE HEADER IF PRESENT */}
              {pkg.image_url ? (
                <div className="h-40 w-full overflow-hidden relative">
                  <img
                    src={pkg.image_url}
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                </div>
              ) : null}

              <div className="p-6 flex flex-col flex-1 relative">
                {pkg.is_featured && (
                  <span className="absolute top-4 left-4 z-10 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950">
                    <Star size={10} /> Featured
                  </span>
                )}
                {!pkg.is_active && (
                  <span className="absolute top-4 right-16 rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                    Hidden
                  </span>
                )}

                {/* ACTION BUTTONS */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(pkg)}
                    className="p-1.5 rounded-lg bg-slate-950/70 text-slate-300 hover:text-amber-400 hover:bg-amber-500/20 transition-colors"
                    title="Edit"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(pkg.id)}
                    disabled={deletingId === pkg.id}
                    className="p-1.5 rounded-lg bg-slate-950/70 text-slate-300 hover:text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === pkg.id
                      ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      : <Trash2 size={15} />
                    }
                  </button>
                </div>

                {/* ICON ONLY IF NO IMAGE */}
                {!pkg.image_url && (
                  <div className="w-10 h-10 rounded-xl bg-slate-950/70 flex items-center justify-center text-amber-400 mb-4 mt-2">
                    <ChefHat size={20} />
                  </div>
                )}

                {pkg.eyebrow && (
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{pkg.eyebrow}</p>
                )}

                <h3 className="text-lg font-bold text-white pr-16">{pkg.name}</h3>

                {pkg.description && (
                  <p className="text-slate-400 text-sm mt-2 leading-5 flex-1">{pkg.description}</p>
                )}

                <div className="flex flex-wrap gap-3 mt-4 text-xs font-semibold text-slate-400 border-t border-slate-800 pt-4">
                  {pkg.price && <span className="text-amber-400 font-bold text-sm">{pkg.price}</span>}
                  <span className="flex items-center gap-1"><Users size={12} /> {pkg.guests_count} guests</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {pkg.duration_hours}h</span>
                </div>

                {pkg.features && pkg.features.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Check size={11} className="text-emerald-400 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">
                {editingId ? 'Edit Package' : 'New Foodie Package'}
              </h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-4">
                {formError}
              </div>
            )}

            <div className="space-y-4">

              {/* PACKAGE IMAGE UPLOAD */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Package Photo</label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(''); setForm(p => ({ ...p, image_url: '' })); }}
                        className="absolute top-1 right-1 bg-slate-950/80 text-red-400 rounded-full p-1 hover:bg-slate-900"
                        title="Remove photo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-xl border border-dashed border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-slate-500 shrink-0">
                      <ImageIcon size={24} />
                      <span className="text-[10px] mt-1">No photo</span>
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors border border-slate-700">
                      <Upload size={14} /> Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Upload an image preview for this package (JPG, PNG, WebP up to 4MB).
                    </p>
                  </div>
                </div>
              </div>

              {/* NAME */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Package Name *</label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm transition-colors"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Family Feast"
                />
              </div>

              {/* EYEBROW */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Eyebrow Tag</label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm transition-colors"
                  value={form.eyebrow}
                  onChange={e => setForm(p => ({ ...p, eyebrow: e.target.value }))}
                  placeholder="e.g. For sharing together"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm resize-none transition-colors"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="A generous, crowd-pleasing menu..."
                />
              </div>

              {/* PRICE / GUESTS / HOURS */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Price</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm transition-colors"
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="From LKR 8k"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Max Guests</label>
                  <input
                    type="number" min={1}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm transition-colors"
                    value={form.guests_count}
                    onChange={e => setForm(p => ({ ...p, guests_count: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Duration (h)</label>
                  <input
                    type="number" min={1}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm transition-colors"
                    value={form.duration_hours}
                    onChange={e => setForm(p => ({ ...p, duration_hours: Number(e.target.value) }))}
                  />
                </div>
              </div>

              {/* FEATURES */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Features / Includes</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm transition-colors"
                    value={featureInput}
                    onChange={e => setFeatureInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                    placeholder="e.g. Kitchen clean-up included"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.features.map((f, i) => (
                    <span key={i} className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg text-xs">
                      {f}
                      <button type="button" onClick={() => setForm(p => ({ ...p, features: p.features.filter((_, fi) => fi !== i) }))} className="text-amber-500 hover:text-red-400 transition-colors">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* FEATURED TOGGLE */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setForm(p => ({ ...p, is_featured: !p.is_featured }))}
                  className={`w-10 h-6 rounded-full transition-colors relative ${form.is_featured ? 'bg-amber-500' : 'bg-slate-700'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.is_featured ? 'left-5' : 'left-1'}`} />
                </div>
                <span className="text-sm text-slate-300 font-medium">Mark as Featured (Most Popular)</span>
              </label>
            </div>

            {/* MODAL ACTIONS */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={formSaving}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {formSaving
                  ? <><div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> Saving...</>
                  : <><Save size={16} /> {editingId ? 'Update Package' : 'Create Package'}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
