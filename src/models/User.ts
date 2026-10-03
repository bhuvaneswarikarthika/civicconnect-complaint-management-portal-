import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  user_id: string; // e.g. UID-2026-89102
  name: string;
  email: string;
  password?: string;
  phone: string;
  address: string;
  ward: string;
  role: 'citizen' | 'admin' | 'staff';
  avatar?: string;
  created_at: string;
}

const UserSchema = new Schema<IUser>({
  user_id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  password: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  ward: { type: String, default: 'Ward 12 - Anna Nagar West' },
  role: { type: String, enum: ['citizen', 'admin', 'staff'], default: 'citizen' },
  avatar: { type: String },
  created_at: { type: String, default: () => new Date().toISOString() },
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
