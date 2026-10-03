import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintContext';
import { Sidebar } from '../components/common/Sidebar';
import { ComplaintCard } from '../components/complaints/ComplaintCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { CATEGORIES } from '../data/mockData';
import { getCategoryIcon } from '../utils/categoryIcons';
import {
  PlusCircle,
  Search,
  Clock,
  Wrench,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  Building,
  User as UserIcon,
  ShieldCheck,
  Bell,
  MessageSquare,
  Globe2,
  Copy,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const navigate = useNavigate();
  const [trackSearchId, setTrackSearchId] = useState('');
  const [copiedUid, setCopiedUid] = useState(false);

  const displayUserId = user?.user_id || user?.id || 'UID-2026-10492';

  // Filter complaints filed strictly by this citizen
  const citizenComplaints = complaints.filter(
    (c) =>
      c.user_id === user?.id ||
      c.user_id === displayUserId ||
      c.citizen_email === user?.email ||
      (user?.email && c.citizen_email.toLowerCase() === user.email.toLowerCase())
  );

  const total = citizenComplaints.length;
  const pending = citizenComplaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Review'
  ).length;
  const inProgress = citizenComplaints.filter(
    (c) => c.status === 'In Progress' || c.status === 'Assigned'
  ).length;
  const resolved = citizenComplaints.filter((c) => c.status === 'Resolved').length;

  // Find all responses/updates from admin for this user's complaints
  const adminNotifications = citizenComplaints
    .flatMap((c) =>
      (c.updates || [])
        .filter(
          (u) =>
            u.updated_by_role === 'admin' ||
            u.updated_by_role === 'staff' ||
            (u.updated_by || '').toLowerCase().includes('desk') ||
            (u.updated_by || '').toLowerCase().includes('officer')
        )
        .map((u) => ({
          ...u,
          complaint_number: c.complaint_number,
          complaint_title: c.title,
          complaint_id: c.id,
        }))
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  const handleCopyUid = () => {
    navigator.clipboard.writeText(displayUserId);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackSearchId.trim()) {
      navigate(`/track?id=${encodeURIComponent(trackSearchId.trim())}`);
    } else {
      navigate('/track');
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar mode="citizen" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 lg:pb-8">
        {/* Welcome Greeting Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden mb-8">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-blue-100">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{user?.ward || 'Ward 12 - Anna Nagar West'}</span>
                </span>

                <button
                  onClick={handleCopyUid}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-400/30 text-xs font-mono font-bold text-blue-100 hover:bg-blue-900/80 transition-colors cursor-pointer"
                  title="Click to copy Unique User ID"
                >
                  <UserIcon className="w-3.5 h-3.5 text-blue-300" />
                  <span>User ID: {displayUserId}</span>
                  <Copy className="w-3 h-3 text-blue-300 ml-0.5" />
                  {copiedUid && <span className="text-[10px] text-emerald-300 font-sans">Copied!</span>}
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome, {user?.name || 'Citizen'}!
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-blue-100 max-w-xl font-normal leading-relaxed">
                Your personalized civic grievance portal. Track live resolution timelines, receive municipal responses, and lodge new complaints.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/raise-complaint"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Raise New Complaint</span>
              </Link>

              <Link
                to="/public-complaints"
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all"
              >
                <Globe2 className="w-4 h-4" />
                <span>Public Feed</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">My Complaints</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{total}</h3>
              <p className="text-[11px] text-slate-400">Total submitted</p>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Pending Review</p>
              <h3 className="text-2xl font-black text-purple-700 mt-0.5">{pending}</h3>
              <p className="text-[11px] text-slate-400">Awaiting officer</p>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">In Progress</p>
              <h3 className="text-2xl font-black text-amber-700 mt-0.5">{inProgress}</h3>
              <p className="text-[11px] text-slate-400">Field work active</p>
            </div>
          </div>

          {/* Resolved */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Resolved</p>
              <h3 className="text-2xl font-black text-emerald-700 mt-0.5">{resolved}</h3>
              <p className="text-[11px] text-slate-400">Completed &amp; closed</p>
            </div>
          </div>
        </div>

        {/* Official Admin Responses & Notifications Section */}
        {adminNotifications.length > 0 && (
          <div className="bg-white rounded-2xl border border-purple-200/80 p-5 mb-8 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                <Bell className="w-4 h-4 text-purple-600" />
                <span>Recent Municipal Admin Responses &amp; Updates</span>
              </div>
              <span className="text-xs text-purple-600 font-medium">
                {adminNotifications.length} recent notices
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {adminNotifications.map((notif, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-100 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono font-bold text-purple-900">
                        {notif.complaint_number}
                      </span>
                      <span className="text-slate-400">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">
                      {notif.complaint_title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      "{notif.message}"
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-purple-200/50 flex items-center justify-between">
                    <span className="text-[10px] text-purple-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{notif.updated_by}</span>
                    </span>
                    <Link
                      to={`/complaints/${notif.complaint_id}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>View &amp; Reply</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Search Tracker Widget & Civic Advisory */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Quick Track Search Card */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span>Track Complaint Status Instantly</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Enter your complaint number below to view instant real-time timeline, assigned officer, and field notes.
            </p>
            <form onSubmit={handleTrackSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter complaint number (e.g. CC-2026-89412)..."
                value={trackSearchId}
                onChange={(e) => setTrackSearchId(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Track Now
              </button>
            </form>
          </div>

          {/* Municipal Advisory Bulletin */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-900 text-xs font-bold mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Monsoon Desilting Notice</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Special storm-water drain clearance is scheduled across Ward 12 &amp; Ward 14 this week. Report any water accumulation hotspots immediately.
              </p>
            </div>
            <Link
              to="/raise-complaint?category=Drainage"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900"
            >
              <span>Report Drainage Blockage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Report Category Shortcuts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Quick Report by Category</h3>
            <span className="text-xs text-slate-500">1-click direct filing</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/raise-complaint?category=${encodeURIComponent(cat)}`}
                className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all text-center group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center mb-1.5 transition-colors">
                  {getCategoryIcon(cat, 'w-4 h-4')}
                </div>
                <span className="text-[10px] font-semibold text-slate-700 group-hover:text-blue-600 line-clamp-1">
                  {cat.split('&')[0].trim()}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* My Submitted Complaints Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Registered Complaints</h2>
              <p className="text-xs text-slate-500">
                Private complaint records associated with your account ({displayUserId}).
              </p>
            </div>
            {citizenComplaints.length > 0 && (
              <Link
                to="/my-complaints"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>View All ({citizenComplaints.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {citizenComplaints.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No Complaints Submitted Yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4 max-w-md mx-auto">
                You haven't filed any complaints yet under User ID <strong className="font-mono">{displayUserId}</strong>. If you notice any pothole, streetlight malfunction, or garbage issue, lodge a grievance now.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/raise-complaint"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
                >
                  Raise Your First Complaint
                </Link>
                <Link
                  to="/public-complaints"
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Explore Public Complaints Feed
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {citizenComplaints.slice(0, 6).map((item) => (
                <ComplaintCard key={item.id} complaint={item} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

