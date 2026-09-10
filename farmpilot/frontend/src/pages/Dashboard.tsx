import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../services/api';
import { DashboardStats } from '../types';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Map, Layers, Sprout, CheckSquare, AlertTriangle, Wallet, TrendingUp, IndianRupee } from 'lucide-react';

const COLORS = ['#16a34a', '#2563eb', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-b-2 border-primary-600 rounded-full" /></div>;
  if (error || !stats) return <div className="text-red-600">{error || 'No data'}</div>;

  const categoryData = Object.entries(stats.expense_by_category).map(([name, value]) => ({ name, value }));
  const cropData = Object.entries(stats.expense_by_crop).map(([name, value]) => ({ name, value }));

  const metricCards = [
    { label: 'Total Farms', value: stats.total_farms, icon: Map, color: 'bg-green-100 text-green-700' },
    { label: 'Total Fields', value: stats.total_fields, icon: Layers, color: 'bg-blue-100 text-blue-700' },
    { label: 'Active Crops', value: stats.active_crops, icon: Sprout, color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Pending Tasks', value: stats.pending_tasks, icon: CheckSquare, color: 'bg-amber-100 text-amber-700' },
    { label: 'Overdue Tasks', value: stats.overdue_tasks, icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
    { label: 'Total Expenses', value: `₹${stats.total_expenses.toLocaleString()}`, icon: Wallet, color: 'bg-orange-100 text-orange-700' },
    { label: 'Total Revenue', value: `₹${stats.total_revenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-teal-100 text-teal-700' },
    { label: 'Est. Profit', value: `₹${stats.estimated_profit.toLocaleString()}`, icon: IndianRupee, color: stats.estimated_profit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Farm Overview</h2>
          <p className="text-sm text-gray-500">Real-time metrics from your recorded data</p>
        </div>
        <Link to="/ai-insights" className="btn-primary text-sm">Get AI Insights</Link>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="card flex items-start gap-3">
              <div className={`p-2 rounded-lg ${m.color}`}><Icon size={20} /></div>
              <div>
                <p className="text-xs text-gray-500">{m.label}</p>
                <p className="text-lg font-bold text-gray-900">{m.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Profitability strip */}
      <div className="card bg-gradient-to-r from-primary-50 to-green-50 border-primary-100">
        <h3 className="font-semibold text-gray-800 mb-2">Profitability (Actual Recorded Data)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-gray-500">Total Cost</span><p className="font-bold text-lg">₹{stats.total_expenses.toLocaleString()}</p></div>
          <div><span className="text-gray-500">Revenue</span><p className="font-bold text-lg">₹{stats.total_revenue.toLocaleString()}</p></div>
          <div><span className="text-gray-500">Profit</span><p className={`font-bold text-lg ${stats.estimated_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{stats.estimated_profit.toLocaleString()}</p></div>
          <div><span className="text-gray-500">Cost / Acre</span><p className="font-bold text-lg">₹{stats.cost_per_acre.toLocaleString()}</p></div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Expense Breakdown by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm">No expense data yet</p>}
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.revenue_vs_expenses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
              <Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Monthly Expenses</h3>
          {stats.monthly_expenses.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.monthly_expenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm">No monthly data</p>}
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Crop-wise Expenses</h3>
          {cropData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={cropData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                <Bar dataKey="value" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm">No crop expense data</p>}
        </div>
      </div>

      {/* Recent activities */}
      <div className="card">
        <h3 className="font-semibold mb-3">Recent Activities</h3>
        {stats.recent_activities.length === 0 ? (
          <p className="text-gray-400 text-sm">No activities recorded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Activity</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Cost</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_activities.map((a: any) => (
                  <tr key={a.id} className="border-b border-gray-50">
                    <td className="py-2 font-medium">{a.activity_name}</td>
                    <td className="py-2">{a.date}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        a.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        a.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>{a.status}</span>
                    </td>
                    <td className="py-2">₹{a.cost?.toLocaleString() || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
