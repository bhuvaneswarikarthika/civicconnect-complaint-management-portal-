import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintContext';
import { useToast } from '../context/ToastContext';
import { Sidebar } from '../components/common/Sidebar';
import { StatusBadge } from '../components/common/StatusBadge';
import { getCategoryIcon } from '../utils/categoryIcons';
import { WARDS } from '../data/mockData';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Camera,
  Shield,
  CheckCircle2,
  FileText,
  Clock,
  Save,
  Calendar,
  Copy,
  Check,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
];

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, isAdmin } = useAuth();
  const { complaints } = useComplaints();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [ward, setWard] = useState(user?.ward || WARDS[0]);
  const [avatar, setAvatar] = useState(user?.avatar || AVATAR_PRESETS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  const displayUserId = user?.user_id || user?.id || 'UID-2026-10492';
  const creationDateFormatted = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'January 2026';

  // Compute user-specific complaints
  const userComplaints = complaints.filter(
    (c) =>
      c.user_id === user?.id ||
      c.user_id === displayUserId ||
      c.citizen_email === user?.email ||
      (user?.email && c.citizen_email?.toLowerCase() === user.email.toLowerCase())
  );
  const totalFiled = userComplaints.length;
  const totalResolved = userComplaints.filter((c) => c.status === 'Resolved').length;
  const inProgressCount = userComplaints.filter(
    (c) => c.status === 'In Progress' || c.status === 'Assigned'
  ).length;

  const handleCopyUid = () => {
    navigator.clipboard.writeText(displayUserId);
    setCopiedUid(true);
    addToast('Unique User ID copied to clipboard!', 'info');
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    updateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      ward,
      avatar,
    });

    setTimeout(() => {
      setIsSaving(false);
      addToast('Profile details updated successfully!', 'success');
    }, 400);
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar mode={isAdmin ? 'admin' : 'citizen'} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full pb-20 lg:pb-8">
        {/* User Identity Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-md mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={avatar}
                alt={name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/20 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black">{name || 'Citizen'}</h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30">
                    {user?.role === 'admin' ? 'Municipal Admin' : 'Resident Citizen'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{email || 'No email registered'}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Account Created: {creationDateFormatted}</span>
                </p>
              </div>
            </div>

            <div className="bg-white/10 border border-white/15 p-3.5 rounded-2xl backdrop-blur-xs flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-300 block mb-1">
                Your Unique User ID:
              </span>
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm font-bold text-white bg-black/40 px-2.5 py-1 rounded-lg">
                  {displayUserId}
                </code>
                <button
                  type="button"
                  onClick={handleCopyUid}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors cursor-pointer"
                  title="Copy User ID"
                >
                  {copiedUid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Grievances Filed
            </span>
            <span className="text-2xl font-black text-slate-900">{totalFiled}</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Active Progress
            </span>
            <span className="text-2xl font-black text-amber-600">{inProgressCount}</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Resolved &amp; Closed
            </span>
            <span className="text-2xl font-black text-emerald-600">{totalResolved}</span>
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8">
          <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Edit Account Information
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Profile Avatar
              </label>
              <div className="flex items-center gap-4">
                <img
                  src={avatar}
                  alt="Current Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-600 shadow-xs"
                />
                <div>
                  <p className="text-xs text-slate-500 mb-2">Choose an avatar preset:</p>
                  <div className="flex items-center gap-2">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(preset)}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                          avatar === preset ? 'border-blue-600 ring-2 ring-blue-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registered Municipal Ward
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-medium"
                >
                  {WARDS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Street / Residential Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* User's Submitted Complaints Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                My Submitted Complaints ({userComplaints.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All civic grievances lodged under your unique User ID {displayUserId}
              </p>
            </div>
            <Link
              to="/raise-complaint"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg transition-colors border border-blue-200"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Raise Complaint</span>
            </Link>
          </div>

          {userComplaints.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/80">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No complaints registered yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                When you report an infrastructure problem, it will be listed here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {userComplaints.map((c) => (
                <div key={c.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      {getCategoryIcon(c.category, 'w-4 h-4')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {c.complaint_number}
                        </span>
                        <StatusBadge status={c.status} size="sm" />
                      </div>
                      <h3 className="text-xs font-semibold text-slate-800 line-clamp-1 mt-0.5">
                        {c.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {c.ward} · {new Date(c.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/complaints/${c.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 shrink-0 sm:self-center"
                  >
                    <span>View Dossier &amp; Messages</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
