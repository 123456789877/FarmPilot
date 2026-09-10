import { useEffect, useState } from 'react';
import { getInputs, getFields, createInput } from '../services/api';
import { InputItem, Field } from '../types';
import { Plus } from 'lucide-react';

const CATEGORIES = ['Seeds', 'Fertilizers', 'Pesticides', 'Organic manure', 'Other'];

export default function Inputs() {
  const [items, setItems] = useState<InputItem[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Fertilizers', quantity: '', unit: 'kg', cost: '', date: new Date().toISOString().slice(0,10), field_id: '' });

  const load = () => Promise.all([getInputs(), getFields()]).then(([i, f]) => {
    setItems(i.data); setFields(f.data);
  }).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.quantity || Number(form.quantity) <= 0) return;
    await createInput({
      ...form,
      quantity: Number(form.quantity),
      cost: form.cost ? Number(form.cost) : 0,
      field_id: form.field_id ? Number(form.field_id) : null,
    });
    setShowForm(false);
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Input Management</h2>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}><Plus size={18} /> Add Input</button>
      </div>
      {showForm && (
        <div className="card">
          <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-3">
            <div><label className="label">Name *</label><input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
            <div><label className="label">Category</label>
              <select className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="label">Quantity *</label><input type="number" step="0.01" className="input-field" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required /></div>
            <div><label className="label">Unit</label><input className="input-field" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} /></div>
            <div><label className="label">Cost (₹)</label><input type="number" className="input-field" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} /></div>
            <div><label className="label">Date</label><input type="date" className="input-field" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
            <div><label className="label">Field</label>
              <select className="input-field" value={form.field_id} onChange={e => setForm({...form, field_id: e.target.value})}>
                <option value="">—</option>{fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2 items-end"><button type="submit" className="btn-primary">Save</button><button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button></div>
          </form>
        </div>
      )}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Name</th><th>Category</th><th>Qty</th><th>Cost</th><th>Date</th></tr></thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id} className="border-b border-gray-50">
                <td className="py-2 font-medium">{i.name}</td>
                <td>{i.category}</td>
                <td>{i.quantity} {i.unit}</td>
                <td>₹{i.cost?.toLocaleString()||0}</td>
                <td>{i.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length===0 && <p className="text-gray-400 py-4">No inputs recorded</p>}
      </div>
    </div>
  );
}
