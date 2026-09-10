import { useState } from 'react';
import { getAIInsights } from '../services/api';
import { AIInsights as AIInsightsType } from '../types';
import { Brain, AlertTriangle, CheckCircle, Droplets, Wallet, Sprout, ListTodo } from 'lucide-react';

export default function AIInsights() {
  const [insights, setInsights] = useState<AIInsightsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAIInsights();
      setInsights(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'AI insights are temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Brain className="text-primary-600" /> AI Farm Insights</h2>
          <p className="text-sm text-gray-500">Analysis based on your real farm data — not a generic chatbot</p>
        </div>
        <button className="btn-primary" onClick={fetchInsights} disabled={loading}>
          {loading ? 'Analyzing...' : insights ? 'Refresh Insights' : 'Generate Insights'}
        </button>
      </div>

      {error && (
        <div className="card bg-amber-50 border-amber-200 text-amber-800">
          {error}
        </div>
      )}

      {!insights && !loading && !error && (
        <div className="card text-center py-12">
          <Brain size={48} className="mx-auto text-primary-300 mb-4" />
          <p className="text-gray-600 mb-2">Click the button above to analyze your farm data</p>
          <p className="text-sm text-gray-400">AI will review farms, crops, activities, expenses, tasks, irrigation & harvests</p>
        </div>
      )}

      {loading && (
        <div className="card text-center py-12">
          <div className="animate-spin h-10 w-10 border-b-2 border-primary-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Analyzing your farm data...</p>
        </div>
      )}

      {insights && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card md:col-span-2 bg-gradient-to-r from-primary-50 to-green-50 border-primary-100">
            <h3 className="font-semibold text-primary-800 mb-2 flex items-center gap-2"><Brain size={18} /> Farm Summary</h3>
            <p className="text-gray-700">{insights.farm_summary}</p>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-emerald-700"><Sprout size={18} /> Crop Progress</h3>
            <p className="text-sm text-gray-700">{insights.crop_progress}</p>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-orange-700"><Wallet size={18} /> Expense Insight</h3>
            <p className="text-sm text-gray-700">{insights.expense_insight}</p>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-blue-700"><ListTodo size={18} /> Task Recommendations</h3>
            <p className="text-sm text-gray-700">{insights.task_insight}</p>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-cyan-700"><Droplets size={18} /> Irrigation Insight</h3>
            <p className="text-sm text-gray-700">{insights.irrigation_insight}</p>
          </div>

          {insights.risk_alerts && insights.risk_alerts.length > 0 && (
            <div className="card md:col-span-2 border-red-100 bg-red-50">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-red-700"><AlertTriangle size={18} /> Risk / Attention Alerts</h3>
              <ul className="space-y-1">
                {insights.risk_alerts.map((a, i) => (
                  <li key={i} className="text-sm text-red-800 flex gap-2"><span>•</span> {a}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="card md:col-span-2 border-primary-100 bg-primary-50">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary-800"><CheckCircle size={18} /> Recommended Actions</h3>
            <ol className="space-y-2">
              {(insights.recommended_actions || []).map((a, i) => (
                <li key={i} className="text-sm text-gray-800 flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">{i + 1}</span>
                  {a}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
