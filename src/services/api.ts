import { Complaint, ComplaintStatus, UserRole } from '../types';

export const civicApi = {
  // Check backend & database connection status
  async checkHealth(): Promise<{ status: string; database: string; mongoConfigured: boolean }> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch {
      return {
        status: 'offline',
        database: 'Local Browser Storage Fallback',
        mongoConfigured: false,
      };
    }
  },

  // Fetch all complaints from DB
  async getComplaints(filter?: { category?: string; status?: string; search?: string }): Promise<Complaint[]> {
    const params = new URLSearchParams();
    if (filter?.category && filter.category !== 'All') params.set('category', filter.category);
    if (filter?.status && filter.status !== 'All') params.set('status', filter.status);
    if (filter?.search) params.set('search', filter.search);

    const res = await fetch(`/api/complaints?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch complaints');
    return await res.json();
  },

  // Fetch single complaint by ID or Number
  async getComplaint(idOrNumber: string): Promise<Complaint> {
    const res = await fetch(`/api/complaints/${encodeURIComponent(idOrNumber)}`);
    if (!res.ok) throw new Error('Complaint not found');
    return await res.json();
  },

  // Create new complaint in DB
  async createComplaint(data: Partial<Complaint>): Promise<Complaint> {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create complaint in database');
    return await res.json();
  },

  // Update status in DB
  async updateStatus(
    id: string,
    status: ComplaintStatus,
    message?: string,
    updated_by?: string
  ): Promise<Complaint> {
    const res = await fetch(`/api/complaints/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, message, updated_by }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return await res.json();
  },

  // Assign department in DB
  async assignDepartment(
    id: string,
    assigned_department: string,
    assigned_officer?: string,
    note?: string,
    updated_by?: string
  ): Promise<Complaint> {
    const res = await fetch(`/api/complaints/${encodeURIComponent(id)}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assigned_department, assigned_officer, note, updated_by }),
    });
    if (!res.ok) throw new Error('Failed to assign department');
    return await res.json();
  },

  // Mark resolved in DB
  async resolveComplaint(
    id: string,
    resolved_image_url?: string,
    resolution_notes?: string,
    updated_by?: string
  ): Promise<Complaint> {
    const res = await fetch(`/api/complaints/${encodeURIComponent(id)}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved_image_url, resolution_notes, updated_by }),
    });
    if (!res.ok) throw new Error('Failed to resolve complaint');
    return await res.json();
  },

  // Add message / comment to complaint
  async addMessage(
    id: string,
    message: string,
    updated_by?: string,
    updated_by_role: 'admin' | 'citizen' = 'citizen',
    attachment_url?: string
  ): Promise<Complaint> {
    const res = await fetch(`/api/complaints/${encodeURIComponent(id)}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, updated_by, updated_by_role, attachment_url }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to send message');
    }
    return await res.json();
  },

  // Auth: Login
  async authLogin(
    usernameOrEmail: string,
    password?: string,
    role?: UserRole
  ): Promise<{ success: boolean; user: any; redirect?: string; error?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed. Please check your credentials.');
    }
    return data;
  },

  // Auth: Register
  async authRegister(
    userData: any
  ): Promise<{ success: boolean; user: any; redirect?: string; error?: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed.');
    }
    return data;
  },

  // Delete complaint from DB
  async deleteComplaint(id: string): Promise<boolean> {
    const res = await fetch(`/api/complaints/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  },
};
