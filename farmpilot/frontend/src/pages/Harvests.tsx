import { useEffect, useState } from 'react';
import { getHarvests, getFields, createHarvest } from '../services/api';
import { Harvest, Field } from '../types';
import { Plus } from 'lucide-react';

export default function Harvests() {
  const [items, setItems] = useState<Harvest[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ field_id: '', harvest_date: new Date().toISOString().slice(0,10), quantity: '', unit: 'kg', selling_price: '', notes: '' });

  const load = () => Promise.all([getHarvests(), getFields()]).then(([h, f]) => {
    setItems(h.data); setFields(f.data);
  }).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const totalRevenue = items.reduce((s, h) => s + (h.revenue || (h.quantity * (h.selling_price || 0))), 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.field_id || !form.quantity || Number(form.quantity) <= 0) return;
    await createHarvest({
      field_id: Number(form.field_id),
      harvest_date: form.harvest_date,
      quantity: Number(form.quantity),
      unit: form.unit,
      selling_price: form.selling_price ? Number(form.selling_price) : 0,
      notes: form.notes || null,
    });
    setShowForm(false);
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Harvest Records</h2>
          <p className="text-sm text-gray-500">Total Revenue: ₹{totalRevenue.toLocaleString()}</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}><Plus size={18} /> Record Harvest</button>
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
            <div><label className="label">Harvest Date *</label><input type="date" className="input-field" value={form.harvest_date} onChange={e => setForm({...form, harvest_date: e.target.value})} required /></div>
            <div><label className="label">Quantity *</label><input type="number" step="0.01" className="input-field" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required /></div>
            <div><label className="label">Unit</label><input className="input-field" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} /></div>
            <div><label className="label">Selling Price (₹/unit)</label><input type="number" step="0.01" className="input-field" value={form.selling_price} onChange={e => setForm({...form, selling_price: e.target.value})} /></div>
            <div><label className="label">Notes</label><input className="input-field" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            <div className="flex gap-2"><button type="submit" className="btn-primary">Save</button><button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button></div>
          </form>
        </div>
      )}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Date</th><th>Quantity</th><th>Price/unit</th><th>Revenue</th></tr></thead>
          <tbody>
            {items.map(h => (
              <tr key={h.id} className="border-b border-gray-50">
                <td className="py-2 font-medium">{h.harvest_date}</td>
                <td>{h.quantity} {h.unit}</td>
                <td>₹{h.selling_price?.toLocaleString()||0}</td>
                <td className="font-semibold text-green-700">₹{(h.revenue || h.quantity * (h.selling_price || 0)).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length===0 && <p className="text-gray-400 py-4">No harvests recorded</p>}
      </div>
    </div>
  );
}
