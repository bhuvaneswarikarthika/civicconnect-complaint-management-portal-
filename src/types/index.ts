export type UserRole = 'citizen' | 'admin' | 'staff';

export interface User {
  id: string;
  user_id?: string; // Formatted user ID, e.g. UID-2026-89102 or ADM-2026-001
  name: string;
  email: string;
  phone: string;
  address: string;
  ward?: string;
  role: UserRole;
  avatar?: string;
  created_at: string;
}

export type ComplaintCategory =
  | 'Roads & Potholes'
  | 'Garbage & Waste'
  | 'Street Lights'
  | 'Water Supply'
  | 'Drainage'
  | 'Public Toilets'
  | 'Traffic & Signs'
  | 'Parks & Public Spaces'
  | 'Other';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface ComplaintUpdate {
  id: string;
  complaint_id: string;
  status: ComplaintStatus;
  message: string;
  updated_by: string;
  updated_by_role: string;
  created_at: string;
  attachment_url?: string;
}

export interface Complaint {
  id: string;
  complaint_number: string; // e.g. CC-2026-89102
  user_id: string;
  citizen_name: string;
  citizen_phone: string;
  citizen_email: string;
  title: string;
  category: ComplaintCategory;
  description: string;
  image_url: string;
  resolved_image_url?: string;
  latitude?: number;
  longitude?: number;
  address: string;
  ward: string;
  landmark?: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assigned_department: string;
  assigned_officer?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  rating?: number;
  feedback?: string;
  updates: ComplaintUpdate[];
}

export interface FilterState {
  search: string;
  category: string;
  status: string;
  priority: string;
  ward: string;
  userId?: string;
  dateFilter?: string;
  sortBy: 'date_desc' | 'date_asc' | 'priority_desc';
}

export interface CivicStats {
  total: number;
  submitted: number;
  underReview: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  avgResolutionHours: number;
}
