import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFarms, createFarm, deleteFarm } from '../services/api';
import { Farm } from '../types';
import { Plus, MapPin, Trash2 } from 'lucide-react';

export default function Farms() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', total_area: '', soil_type: '', irrigation_type: '', description: '' });
  const [error, setError] = useState('');

  const load = () => getFarms().then(r => setFarms(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.location || !form.total_area || Number(form.total_area) <= 0) {
      setError('Name, location and area (>0) are required');
      return;
    }
    try {
      await createFarm({ ...form, total_area: Number(form.total_area) });
      setShowForm(false);
      setForm({ name: '', location: '', total_area: '', soil_type: '', irrigation_type: '', description: '' });
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create farm');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this farm and all related data?')) return;
    await deleteFarm(id);
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">My Farms</h2>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> Add Farm
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3 className="font-semibold mb-3">New Farm</h3>
          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-3">
            <div><label className="label">Farm Name *</label><input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
            <div><label className="label">Location *</label><input className="input-field" value={form.location} onChange={e => setForm({...form, location: e.target.value})} required /></div>
            <div><label className="label">Total Area (acres) *</label><input type="number" step="0.1" className="input-field" value={form.total_area} onChange={e => setForm({...form, total_area: e.target.value})} required /></div>
            <div><label className="label">Soil Type</label><input className="input-field" value={form.soil_type} onChange={e => setForm({...form, soil_type: e.target.value})} /></div>
            <div><label className="label">Irrigation Type</label><input className="input-field" value={form.irrigation_type} onChange={e => setForm({...form, irrigation_type: e.target.value})} /></div>
            <div className="md:col-span-2"><label className="label">Description</label><textarea className="input-field" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">Save Farm</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {farms.map(f => (
          <div key={f.id} className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <Link to={`/farms/${f.id}`} className="font-semibold text-lg text-primary-700 hover:underline">{f.name}</Link>
              <button onClick={() => handleDelete(f.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={14} /> {f.location}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-400">Area</span><p className="font-medium">{f.total_area} acres</p></div>
              <div><span className="text-gray-400">Soil</span><p className="font-medium">{f.soil_type || '—'}</p></div>
              <div><span className="text-gray-400">Irrigation</span><p className="font-medium">{f.irrigation_type || '—'}</p></div>
            </div>
          </div>
        ))}
        {farms.length === 0 && <p className="text-gray-400 col-span-full">No farms yet. Create your first farm.</p>}
      </div>
    </div>
  );
}
