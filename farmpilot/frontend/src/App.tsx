import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Farms from './pages/Farms';
import FarmDetails from './pages/FarmDetails';
import Fields from './pages/Fields';
import Crops from './pages/Crops';
import Activities from './pages/Activities';
import Tasks from './pages/Tasks';
import Inputs from './pages/Inputs';
import Expenses from './pages/Expenses';
import Irrigation from './pages/Irrigation';
import Harvests from './pages/Harvests';
import AIInsights from './pages/AIInsights';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="farms" element={<Farms />} />
        <Route path="farms/:id" element={<FarmDetails />} />
        <Route path="fields" element={<Fields />} />
        <Route path="crops" element={<Crops />} />
        <Route path="activities" element={<Activities />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="inputs" element={<Inputs />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="irrigation" element={<Irrigation />} />
        <Route path="harvests" element={<Harvests />} />
        <Route path="ai-insights" element={<AIInsights />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
