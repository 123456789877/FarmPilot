export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
}

export interface Farm {
  id: number;
  name: string;
  location: string;
  total_area: number;
  soil_type?: string;
  irrigation_type?: string;
  description?: string;
  owner_id: number;
}

export interface Field {
  id: number;
  name: string;
  area: number;
  soil_type?: string;
  irrigation_type?: string;
  location?: string;
  status?: string;
  farm_id: number;
}

export interface CropCycle {
  id: number;
  crop_name: string;
  variety?: string;
  field_id: number;
  planting_date?: string;
  expected_harvest_date?: string;
  current_growth_stage?: string;
  target_yield?: number;
  status?: string;
  notes?: string;
}

export interface Activity {
  id: number;
  activity_name: string;
  farm_id?: number;
  field_id?: number;
  crop_cycle_id?: number;
  date: string;
  cost?: number;
  quantity?: number;
  unit?: string;
  notes?: string;
  status?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  field_id?: number;
  crop_cycle_id?: number;
  due_date?: string;
  priority?: string;
  status?: string;
}

export interface InputItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  cost?: number;
  date: string;
  field_id?: number;
  crop_cycle_id?: number;
  notes?: string;
}

export interface Expense {
  id: number;
  name: string;
  category: string;
  amount: number;
  date: string;
  farm_id?: number;
  field_id?: number;
  crop_cycle_id?: number;
  notes?: string;
}

export interface IrrigationRecord {
  id: number;
  field_id: number;
  crop_cycle_id?: number;
  date: string;
  water_quantity?: number;
  duration?: number;
  irrigation_method?: string;
  cost?: number;
  notes?: string;
}

export interface Harvest {
  id: number;
  field_id: number;
  crop_cycle_id?: number;
  harvest_date: string;
  quantity: number;
  unit: string;
  selling_price?: number;
  revenue?: number;
  notes?: string;
}

export interface DashboardStats {
  total_farms: number;
  total_fields: number;
  active_crops: number;
  pending_tasks: number;
  overdue_tasks: number;
  total_expenses: number;
  total_revenue: number;
  estimated_profit: number;
  cost_per_acre: number;
  total_area: number;
  recent_activities: any[];
  expense_by_category: Record<string, number>;
  expense_by_crop: Record<string, number>;
  monthly_expenses: { month: string; amount: number }[];
  revenue_vs_expenses: { name: string; value: number }[];
}

export interface AIInsights {
  farm_summary: string;
  crop_progress: string;
  expense_insight: string;
  task_insight: string;
  irrigation_insight: string;
  risk_alerts: string[];
  recommended_actions: string[];
}
