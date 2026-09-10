import { useEffect, useState } from 'react';
import { getIrrigation, getFields, createIrrigation } from '../services/api';
import { IrrigationRecord, Field } from '../types';
import { Plus } from 'lucide-react';

export default function Irrigation() {
  const [items, setItems] = useState<IrrigationRecord[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ field_id: '', date: new Date().toISOString().slice(0,10), water_quantity: '', duration: '', irrigation_method: 'Drip', cost: '', notes: '' });

  const load = () => Promise.all([getIrrigation(), getFields()]).then(([i, f]) => {
    setItems(i.data); setFields(f.data);
  }).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.field_id) return;
    await createIrrigation({
      field_id: Number(form.field_id),
      date: form.date,
      water_quantity: form.water_quantity ? Number(form.water_quantity) : null,
      duration: form.duration ? Number(form.duration) : null,
      irrigation_method: form.irrigation_method,
      cost: form.cost ? Number(form.cost) : 0,
      notes: form.notes || null,
    });
    setShowForm(false);
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Irrigation Records</h2>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}><Plus size={18} /> Add Record</button>
      </div>
      {showForm && (
        <div className="card">
          <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-3">
            <div><label className="label">Field *</label>
              <select className="input-field" value={form.field_id} onChange={e => setForm({...form, field_id: e.target.value})} required>
                <option value="">Select field</option>
                {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div><label className="label">Date *</label><input type="date" className="input-field" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
            <div><label className="label">Water Quantity</label><input type="number" className="input-field" value={form.water_quantity} onChange={e => setForm({...form, water_quantity: e.target.value})} placeholder="liters / mm" /></div>
            <div><label className="label">Duration (hours)</label><input type="number" step="0.1" className="input-field" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} /></div>
            <div><label className="label">Method</label>
              <select className="input-field" value={form.irrigation_method} onChange={e => setForm({...form, irrigation_method: e.target.value})}>
                <option>Drip</option><option>Flood</option><option>Sprinkler</option><option>Canal</option><option>Other</option>
              </select>
            </div>
            <div><label className="label">Cost (₹)</label><input type="number" className="input-field" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} /></div>
            <div className="flex gap-2"><button type="submit" className="btn-primary">Save</button><button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button></div>
          </form>
        </div>
      )}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Date</th><th>Method</th><th>Quantity</th><th>Duration</th><th>Cost</th></tr></thead>
          <tbody>
            {items.map(r => (
              <tr key={r.id} className="border-b border-gray-50">
                <td className="py-2 font-medium">{r.date}</td>
                <td>{r.irrigation_method || '—'}</td>
                <td>{r.water_quantity || '—'}</td>
                <td>{r.duration ? `${r.duration}h` : '—'}</td>
                <td>₹{r.cost?.toLocaleString()||0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length===0 && <p className="text-gray-400 py-4">No irrigation records</p>}
      </div>
    </div>
  );
}
