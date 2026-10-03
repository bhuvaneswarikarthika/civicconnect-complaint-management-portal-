import { Complaint, ComplaintPriority, ComplaintStatus } from '../types';

export function normalizeComplaint(raw: any): Complaint {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `cmp-${Date.now()}`,
      complaint_number: `CC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      user_id: 'user-citizen-1',
      citizen_name: 'Citizen',
      citizen_phone: '+91 98401 23456',
      citizen_email: 'citizen@example.com',
      title: 'Civic Grievance',
      category: 'Other',
      description: 'Reported municipal issue.',
      image_url: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800&auto=format&fit=crop&q=80',
      address: 'Municipal Area',
      ward: 'Ward 12 - Anna Nagar West',
      priority: 'Medium',
      status: 'Submitted',
      assigned_department: 'General Municipal Administration',
      updates: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const id = String(raw.id || raw._id || `cmp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
  const complaintNumber = String(
    raw.complaint_number || `CC-2026-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const ward = String(raw.ward || 'Ward 12 - Anna Nagar West');
  const address = String(raw.address || 'Municipal Ward Area');
  const priority: ComplaintPriority = (raw.priority as ComplaintPriority) || 'Medium';
  const status: ComplaintStatus = (raw.status as ComplaintStatus) || 'Submitted';
  const category = String(raw.category || 'Other');
  const title = String(raw.title || 'Untitled Grievance');
  const description = String(raw.description || title);
  const citizenName = String(raw.citizen_name || 'Citizen');
  const citizenPhone = String(raw.citizen_phone || '+91 98401 23456');
  const citizenEmail = String(raw.citizen_email || 'citizen@example.com');
  const imageUrl = String(
    raw.image_url ||
      'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800&auto=format&fit=crop&q=80'
  );
  const assignedDepartment = String(
    raw.assigned_department || 'General Municipal Administration'
  );
  const assignedOfficer = raw.assigned_officer ? String(raw.assigned_officer) : undefined;

  const updates = Array.isArray(raw.updates) && raw.updates.length > 0
    ? raw.updates.map((u: any, idx: number) => ({
        id: String(u.id || `upd-${Date.now()}-${idx}`),
        complaint_id: String(u.complaint_id || id),
        status: (u.status as ComplaintStatus) || status,
        message: String(u.message || 'Status log updated.'),
        updated_by: String(u.updated_by || citizenName),
        updated_by_role: (u.updated_by_role as any) || 'staff',
        created_at: String(u.created_at || new Date().toISOString()),
        attachment_url: u.attachment_url ? String(u.attachment_url) : undefined,
      }))
    : [
        {
          id: `upd-${Date.now()}-init`,
          complaint_id: id,
          status,
          message: 'Grievance lodged in CivicConnect portal. Awaiting municipal triage.',
          updated_by: citizenName,
          updated_by_role: 'citizen' as const,
          created_at: String(raw.created_at || new Date().toISOString()),
        },
      ];

  return {
    id,
    complaint_number: complaintNumber,
    user_id: String(raw.user_id || 'user-citizen-1'),
    citizen_name: citizenName,
    citizen_phone: citizenPhone,
    citizen_email: citizenEmail,
    title,
    category: category as any,
    description,
    image_url: imageUrl,
    resolved_image_url: raw.resolved_image_url ? String(raw.resolved_image_url) : undefined,
    latitude: typeof raw.latitude === 'number' ? raw.latitude : 13.0827,
    longitude: typeof raw.longitude === 'number' ? raw.longitude : 80.2707,
    address,
    ward,
    landmark: raw.landmark ? String(raw.landmark) : undefined,
    priority,
    status,
    assigned_department: assignedDepartment,
    assigned_officer: assignedOfficer,
    rating: typeof raw.rating === 'number' ? raw.rating : undefined,
    feedback: raw.feedback ? String(raw.feedback) : undefined,
    updates,
    created_at: String(raw.created_at || new Date().toISOString()),
    updated_at: String(raw.updated_at || new Date().toISOString()),
    resolved_at: raw.resolved_at ? String(raw.resolved_at) : undefined,
  };
}
