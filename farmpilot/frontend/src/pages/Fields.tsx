import { useEffect, useState } from 'react';
import { getFields, getFarms, createField, deleteField } from '../services/api';
import { Field, Farm } from '../types';
import { Plus, Trash2 } from 'lucide-react';

export default function Fields() {
  const [fields, setFields] = useState<Field[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', area: '', soil_type: '', irrigation_type: '', location: '', status: 'Active', farm_id: '' });
  const [error, setError] = useState('');

  const load = () => Promise.all([getFields(), getFarms()]).then(([f, fa]) => {
    setFields(f.data);
    setFarms(fa.data);
  }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.area || Number(form.area) <= 0 || !form.farm_id) {
      setError('Name, area (>0) and farm are required');
      return;
    }
    try {
      await createField({ ...form, area: Number(form.area), farm_id: Number(form.farm_id) });
      setShowForm(false);
      setForm({ name: '', area: '', soil_type: '', irrigation_type: '', location: '', status: 'Active', farm_id: '' });
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Fields</h2>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}><Plus size={18} /> Add Field</button>
      </div>
      {showForm && (
        <div className="card">
          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-3">
            <div><label className="label">Field Name *</label><input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
            <div>
              <label className="label">Farm *</label>
              <select className="input-field" value={form.farm_id} onChange={e => setForm({...form, farm_id: e.target.value})} required>
                <option value="">Select farm</option>
                {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div><label className="label">Area (acres) *</label><input type="number" step="0.1" className="input-field" value={form.area} onChange={e => setForm({...form, area: e.target.value})} required /></div>
            <div><label className="label">Soil Type</label><input className="input-field" value={form.soil_type} onChange={e => setForm({...form, soil_type: e.target.value})} /></div>
            <div><label className="label">Irrigation Type</label><input className="input-field" value={form.irrigation_type} onChange={e => setForm({...form, irrigation_type: e.target.value})} /></div>
            <div><label className="label">Location</label><input className="input-field" value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Name</th><th>Area</th><th>Soil</th><th>Irrigation</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {fields.map(f => (
              <tr key={f.id} className="border-b border-gray-50">
                <td className="py-2 font-medium">{f.name}</td>
                <td>{f.area} ac</td>
                <td>{f.soil_type || '—'}</td>
                <td>{f.irrigation_type || '—'}</td>
                <td><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">{f.status}</span></td>
                <td><button onClick={() => deleteField(f.id).then(load)} className="text-red-500"><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {fields.length === 0 && <p className="text-gray-400 py-4">No fields yet</p>}
      </div>
    </div>
  );
}
