import { useEffect, useState } from 'react';
import { getExpenses, getFarms, getFields, createExpense } from '../services/api';
import { Expense, Farm, Field } from '../types';
import { Plus } from 'lucide-react';

const CATEGORIES = ['Seeds', 'Fertilizers', 'Pesticides', 'Labor', 'Irrigation', 'Machinery', 'Transportation', 'Other'];

export default function Expenses() {
  const [items, setItems] = useState<Expense[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Fertilizers', amount: '', date: new Date().toISOString().slice(0,10), farm_id: '', field_id: '', notes: '' });

  const load = () => Promise.all([getExpenses(), getFarms(), getFields()]).then(([e, fa, f]) => {
    setItems(e.data); setFarms(fa.data); setFields(f.data);
  }).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const total = items.reduce((s, e) => s + (e.amount || 0), 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.amount || Number(form.amount) <= 0) return;
    await createExpense({
      ...form,
      amount: Number(form.amount),
      farm_id: form.farm_id ? Number(form.farm_id) : null,
      field_id: form.field_id ? Number(form.field_id) : null,
    });
    setShowForm(false);
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Expenses</h2>
          <p className="text-sm text-gray-500">Total recorded: ₹{total.toLocaleString()}</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}><Plus size={18} /> Add Expense</button>
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
            <div><label className="label">Amount (₹) *</label><input type="number" step="0.01" className="input-field" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required /></div>
            <div><label className="label">Date</label><input type="date" className="input-field" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
            <div><label className="label">Farm</label>
              <select className="input-field" value={form.farm_id} onChange={e => setForm({...form, farm_id: e.target.value})}>
                <option value="">—</option>{farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div><label className="label">Field</label>
              <select className="input-field" value={form.field_id} onChange={e => setForm({...form, field_id: e.target.value})}>
                <option value="">—</option>{fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2"><label className="label">Notes</label><input className="input-field" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            <div className="flex gap-2"><button type="submit" className="btn-primary">Save</button><button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button></div>
          </form>
        </div>
      )}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Name</th><th>Category</th><th>Amount</th><th>Date</th></tr></thead>
          <tbody>
            {items.map(e => (
              <tr key={e.id} className="border-b border-gray-50">
                <td className="py-2 font-medium">{e.name}</td>
                <td>{e.category}</td>
                <td className="font-medium">₹{e.amount.toLocaleString()}</td>
                <td>{e.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length===0 && <p className="text-gray-400 py-4">No expenses yet</p>}
      </div>
    </div>
  );
}
