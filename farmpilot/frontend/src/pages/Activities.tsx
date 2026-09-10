import { useEffect, useState } from 'react';
import { getActivities, getFields, getCrops, createActivity } from '../services/api';
import { Activity, Field, CropCycle } from '../types';
import { Plus } from 'lucide-react';

const ACTIVITY_TYPES = ['Ploughing', 'Sowing', 'Fertilization', 'Pesticide application', 'Irrigation', 'Weeding', 'Harvesting', 'Other'];
const STATUSES = ['Planned', 'In Progress', 'Completed'];

export default function Activities() {
  const [items, setItems] = useState<Activity[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [crops, setCrops] = useState<CropCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ activity_name: 'Fertilization', field_id: '', crop_cycle_id: '', date: new Date().toISOString().slice(0,10), cost: '', quantity: '', unit: '', notes: '', status: 'Planned' });

  const load = () => Promise.all([getActivities(), getFields(), getCrops()]).then(([a, f, c]) => {
    setItems(a.data); setFields(f.data); setCrops(c.data);
  }).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createActivity({
      ...form,
      field_id: form.field_id ? Number(form.field_id) : null,
      crop_cycle_id: form.crop_cycle_id ? Number(form.crop_cycle_id) : null,
      cost: form.cost ? Number(form.cost) : 0,
      quantity: form.quantity ? Number(form.quantity) : null,
    });
    setShowForm(false);
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Agricultural Activities</h2>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}><Plus size={18} /> Record Activity</button>
      </div>
      {showForm && (
        <div className="card">
          <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-3">
            <div><label className="label">Activity *</label>
              <select className="input-field" value={form.activity_name} onChange={e => setForm({...form, activity_name: e.target.value})}>
                {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="label">Date *</label><input type="date" className="input-field" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
            <div><label className="label">Field</label>
              <select className="input-field" value={form.field_id} onChange={e => setForm({...form, field_id: e.target.value})}>
                <option value="">—</option>
                {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div><label className="label">Crop Cycle</label>
              <select className="input-field" value={form.crop_cycle_id} onChange={e => setForm({...form, crop_cycle_id: e.target.value})}>
                <option value="">—</option>
                {crops.map(c => <option key={c.id} value={c.id}>{c.crop_name}</option>)}
              </select>
            </div>
            <div><label className="label">Cost (₹)</label><input type="number" className="input-field" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} /></div>
            <div><label className="label">Status</label>
              <select className="input-field" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-2"><label className="label">Notes</label><input className="input-field" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            <div className="flex gap-2"><button type="submit" className="btn-primary">Save</button><button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button></div>
          </form>
        </div>
      )}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Activity</th><th>Date</th><th>Status</th><th>Cost</th><th>Notes</th></tr></thead>
          <tbody>
            {items.map(a => (
              <tr key={a.id} className="border-b border-gray-50">
                <td className="py-2 font-medium">{a.activity_name}</td>
                <td>{a.date}</td>
                <td><span className={`px-2 py-0.5 rounded-full text-xs ${a.status==='Completed'?'bg-green-100 text-green-700':a.status==='In Progress'?'bg-blue-100 text-blue-700':'bg-gray-100'}`}>{a.status}</span></td>
                <td>₹{a.cost?.toLocaleString()||0}</td>
                <td className="text-gray-500 max-w-xs truncate">{a.notes||'—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length===0 && <p className="text-gray-400 py-4">No activities recorded</p>}
      </div>
    </div>
  );
}
