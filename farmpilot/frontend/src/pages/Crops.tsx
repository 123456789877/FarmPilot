import { useEffect, useState } from 'react';
import { getCrops, getFields, createCrop, updateCrop } from '../services/api';
import { CropCycle, Field } from '../types';
import { Plus } from 'lucide-react';

const STAGES = ['Planned', 'Sowing', 'Vegetative', 'Flowering', 'Fruiting', 'Harvest Ready', 'Harvested'];

export default function Crops() {
  const [crops, setCrops] = useState<CropCycle[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ crop_name: '', variety: '', field_id: '', planting_date: '', expected_harvest_date: '', current_growth_stage: 'Planned', target_yield: '', status: 'Active' });
  const [error, setError] = useState('');

  const load = () => Promise.all([getCrops(), getFields()]).then(([c, f]) => {
    setCrops(c.data);
    setFields(f.data);
  }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.crop_name || !form.field_id) { setError('Crop name and field required'); return; }
    try {
      await createCrop({
        ...form,
        field_id: Number(form.field_id),
        target_yield: form.target_yield ? Number(form.target_yield) : null,
        planting_date: form.planting_date || null,
        expected_harvest_date: form.expected_harvest_date || null,
      });
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed');
    }
  };

  const updateStage = async (id: number, stage: string) => {
    await updateCrop(id, { current_growth_stage: stage });
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Crop Cycles</h2>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}><Plus size={18} /> New Cycle</button>
      </div>
      {showForm && (
        <div className="card">
          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-3">
            <div><label className="label">Crop Name *</label><input className="input-field" value={form.crop_name} onChange={e => setForm({...form, crop_name: e.target.value})} required /></div>
            <div><label className="label">Variety</label><input className="input-field" value={form.variety} onChange={e => setForm({...form, variety: e.target.value})} /></div>
            <div>
              <label className="label">Field *</label>
              <select className="input-field" value={form.field_id} onChange={e => setForm({...form, field_id: e.target.value})} required>
                <option value="">Select field</option>
                {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div><label className="label">Growth Stage</label>
              <select className="input-field" value={form.current_growth_stage} onChange={e => setForm({...form, current_growth_stage: e.target.value})}>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label className="label">Planting Date</label><input type="date" className="input-field" value={form.planting_date} onChange={e => setForm({...form, planting_date: e.target.value})} /></div>
            <div><label className="label">Expected Harvest</label><input type="date" className="input-field" value={form.expected_harvest_date} onChange={e => setForm({...form, expected_harvest_date: e.target.value})} /></div>
            <div><label className="label">Target Yield</label><input type="number" className="input-field" value={form.target_yield} onChange={e => setForm({...form, target_yield: e.target.value})} /></div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {crops.map(c => (
          <div key={c.id} className="card">
            <p className="font-semibold text-lg">{c.crop_name}</p>
            {c.variety && <p className="text-sm text-gray-500">{c.variety}</p>}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-400">Stage:</span>
              <select className="text-sm border rounded px-2 py-1" value={c.current_growth_stage} onChange={e => updateStage(c.id, e.target.value)}>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="mt-2 text-xs text-gray-500 space-y-0.5">
              <p>Planted: {c.planting_date || '—'}</p>
              <p>Harvest: {c.expected_harvest_date || '—'}</p>
              <p>Target: {c.target_yield || '—'} · Status: {c.status}</p>
            </div>
          </div>
        ))}
        {crops.length === 0 && <p className="text-gray-400">No crop cycles yet</p>}
      </div>
    </div>
  );
}
