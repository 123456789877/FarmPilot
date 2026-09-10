import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const register = (data: { email: string; full_name: string; password: string }) =>
  api.post('/api/auth/register', data);

export const login = (email: string, password: string) => {
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);
  return api.post('/api/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};

export const getMe = () => api.get('/api/auth/me');

// Farms
export const getFarms = () => api.get('/api/farms');
export const getFarm = (id: number) => api.get(`/api/farms/${id}`);
export const createFarm = (data: any) => api.post('/api/farms', data);
export const updateFarm = (id: number, data: any) => api.put(`/api/farms/${id}`, data);
export const deleteFarm = (id: number) => api.delete(`/api/farms/${id}`);

// Fields
export const getFields = (farmId?: number) =>
  api.get('/api/fields', { params: farmId ? { farm_id: farmId } : {} });
export const getField = (id: number) => api.get(`/api/fields/${id}`);
export const createField = (data: any) => api.post('/api/fields', data);
export const updateField = (id: number, data: any) => api.put(`/api/fields/${id}`, data);
export const deleteField = (id: number) => api.delete(`/api/fields/${id}`);

// Crops
export const getCrops = (fieldId?: number) =>
  api.get('/api/crops', { params: fieldId ? { field_id: fieldId } : {} });
export const getCrop = (id: number) => api.get(`/api/crops/${id}`);
export const createCrop = (data: any) => api.post('/api/crops', data);
export const updateCrop = (id: number, data: any) => api.put(`/api/crops/${id}`, data);

// Activities
export const getActivities = () => api.get('/api/activities');
export const createActivity = (data: any) => api.post('/api/activities', data);
export const updateActivity = (id: number, data: any) => api.put(`/api/activities/${id}`, data);

// Tasks
export const getTasks = () => api.get('/api/tasks');
export const createTask = (data: any) => api.post('/api/tasks', data);
export const updateTask = (id: number, data: any) => api.put(`/api/tasks/${id}`, data);

// Inputs
export const getInputs = () => api.get('/api/inputs');
export const createInput = (data: any) => api.post('/api/inputs', data);
export const updateInput = (id: number, data: any) => api.put(`/api/inputs/${id}`, data);

// Expenses
export const getExpenses = () => api.get('/api/expenses');
export const createExpense = (data: any) => api.post('/api/expenses', data);
export const updateExpense = (id: number, data: any) => api.put(`/api/expenses/${id}`, data);

// Irrigation
export const getIrrigation = () => api.get('/api/irrigation');
export const createIrrigation = (data: any) => api.post('/api/irrigation', data);

// Harvests
export const getHarvests = () => api.get('/api/harvests');
export const createHarvest = (data: any) => api.post('/api/harvests', data);

// Dashboard
export const getDashboard = () => api.get('/api/dashboard');

// AI
export const getAIInsights = (farmId?: number) =>
  api.post('/api/ai/farm-insights', { farm_id: farmId || null });
