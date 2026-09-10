import { useEffect, useState } from 'react';
import { getTasks, getFields, createTask, updateTask } from '../services/api';
import { Task, Field } from '../types';
import { Plus } from 'lucide-react';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', field_id: '', due_date: '', priority: 'Medium', status: 'Pending' });

  const load = () => Promise.all([getTasks(), getFields()]).then(([t, f]) => {
    setTasks(t.data); setFields(f.data);
  }).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTask({ ...form, field_id: form.field_id ? Number(form.field_id) : null, due_date: form.due_date || null });
    setShowForm(false);
    load();
  };

  const setStatus = async (id: number, status: string) => {
    await updateTask(id, { status });
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full" /></div>;

  const pending = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress');
  const overdue = tasks.filter(t => t.status === 'Overdue');
  const completed = tasks.filter(t => t.status === 'Completed');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Tasks</h2>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}><Plus size={18} /> New Task</button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center"><p className="text-2xl font-bold text-amber-600">{pending.length}</p><p className="text-xs text-gray-500">Pending</p></div>
        <div className="card text-center"><p className="text-2xl font-bold text-red-600">{overdue.length}</p><p className="text-xs text-gray-500">Overdue</p></div>
        <div className="card text-center"><p className="text-2xl font-bold text-green-600">{completed.length}</p><p className="text-xs text-gray-500">Completed</p></div>
      </div>
      {showForm && (
        <div className="card">
          <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2"><label className="label">Title *</label><input className="input-field" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
            <div className="md:col-span-2"><label className="label">Description</label><textarea className="input-field" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
            <div><label className="label">Field</label>
              <select className="input-field" value={form.field_id} onChange={e => setForm({...form, field_id: e.target.value})}>
                <option value="">—</option>{fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div><label className="label">Due Date</label><input type="date" className="input-field" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} /></div>
            <div><label className="label">Priority</label>
              <select className="input-field" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
            <div className="flex gap-2 items-end"><button type="submit" className="btn-primary">Save</button><button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button></div>
          </form>
        </div>
      )}
      <div className="space-y-2">
        {tasks.map(t => (
          <div key={t.id} className={`card flex items-center justify-between gap-3 ${t.status==='Overdue'?'border-red-200 bg-red-50':''}`}>
            <div>
              <p className="font-medium">{t.title}</p>
              <p className="text-xs text-gray-500">Due: {t.due_date || '—'} · Priority: {t.priority}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                t.status==='Completed'?'bg-green-100 text-green-700':
                t.status==='Overdue'?'bg-red-100 text-red-700':
                t.status==='In Progress'?'bg-blue-100 text-blue-700':'bg-gray-100'
              }`}>{t.status}</span>
              {t.status !== 'Completed' && (
                <button className="text-xs btn-secondary py-1" onClick={() => setStatus(t.id, 'Completed')}>Mark Done</button>
              )}
            </div>
          </div>
        ))}
        {tasks.length===0 && <p className="text-gray-400">No tasks</p>}
      </div>
    </div>
  );
}
