import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaintUpdate {
  id: string;
  status: string;
  message: string;
  updated_by: string;
  updated_by_role: string;
  created_at: string;
  attachment_url?: string;
}

export interface IComplaint extends Document {
  id?: string;
  complaint_number: string;
  user_id: string;
  citizen_name: string;
  citizen_phone: string;
  citizen_email: string;
  title: string;
  category: string;
  description: string;
  image_url: string;
  resolved_image_url?: string;
  latitude?: number;
  longitude?: number;
  address: string;
  ward: string;
  landmark?: string;
  priority: string;
  status: string;
  assigned_department: string;
  assigned_officer?: string;
  rating?: number;
  feedback?: string;
  updates: IComplaintUpdate[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

const ComplaintUpdateSchema = new Schema<IComplaintUpdate>({
  id: { type: String, required: true },
  status: { type: String, required: true },
  message: { type: String, required: true },
  updated_by: { type: String, required: true },
  updated_by_role: { type: String, default: 'staff' },
  created_at: { type: String, default: () => new Date().toISOString() },
  attachment_url: { type: String },
}, { _id: false });

const ComplaintSchema = new Schema<IComplaint>({
  id: { type: String, index: true },
  complaint_number: { type: String, required: true, unique: true, index: true },
  user_id: { type: String, required: true, index: true },
  citizen_name: { type: String, required: true },
  citizen_phone: { type: String, default: '' },
  citizen_email: { type: String, default: '' },
  title: { type: String, required: true },
  category: { type: String, required: true, index: true },
  description: { type: String, required: true },
  image_url: { type: String, required: true },
  resolved_image_url: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  address: { type: String, required: true },
  ward: { type: String, required: true },
  landmark: { type: String },
  priority: { type: String, default: 'Medium' },
  status: { type: String, default: 'Submitted', index: true },
  assigned_department: { type: String, default: 'General Municipal Administration' },
  assigned_officer: { type: String },
  rating: { type: Number },
  feedback: { type: String },
  updates: [ComplaintUpdateSchema],
  created_at: { type: String, default: () => new Date().toISOString() },
  updated_at: { type: String, default: () => new Date().toISOString() },
  resolved_at: { type: String },
});

export const ComplaintModel = mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);
