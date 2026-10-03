import React from 'react';
import { Link } from 'react-router-dom';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/common/Sidebar';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { CATEGORIES, WARDS } from '../data/mockData';
import { getCategoryIcon } from '../utils/categoryIcons';
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Building2,
  Users,
  Shield,
  BarChart3,
  Calendar,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { complaints, stats } = useComplaints();

  // Category counts
  const categoryCounts = CATEGORIES.map((cat) => ({
    name: cat,
    count: complaints.filter((c) => c.category === cat).length,
  })).sort((a, b) => b.count - a.count);

  // Status breakdown
  const statusCounts = [
    { label: 'Submitted', count: stats.submitted, color: 'bg-blue-500' },
    { label: 'Under Review', count: stats.underReview, color: 'bg-purple-500' },
    { label: 'Assigned', count: stats.assigned, color: 'bg-orange-500' },
    { label: 'In Progress', count: stats.inProgress, color: 'bg-amber-500' },
    { label: 'Resolved', count: stats.resolved, color: 'bg-emerald-500' },
    { label: 'Rejected', count: stats.rejected, color: 'bg-rose-500' },
  ];

  const maxCategoryCount = Math.max(...categoryCounts.map((c) => c.count), 1);

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar mode="admin" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 lg:pb-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
              <Shield className="w-4 h-4" />
              <span>Municipal Commissioner Operations Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Civic Command Center
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time zonal grievances triage, departmental dispatch, and resolution SLA tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/complaints"
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Manage All Complaints</span>
            </Link>
          </div>
        </div>

        {/* 6 Core KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-8">
          {/* Total Complaints */}
          <Link
            to="/admin/complaints"
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold group-hover:text-blue-600 transition-colors">Total Complaints</span>
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.total}</div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">100% Geotagged</span>
          </Link>

          {/* New Complaints */}
          <Link
            to="/admin/complaints?status=Submitted"
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold group-hover:text-blue-600 transition-colors">New Complaints</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-600">{stats.submitted}</div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Needs officer assign</span>
          </Link>

          {/* Pending Complaints */}
          <Link
            to="/admin/complaints?status=Under+Review"
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-purple-400 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold group-hover:text-purple-600 transition-colors">Pending Review</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-600">{stats.underReview}</div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Under evaluation</span>
          </Link>

          {/* In Progress */}
          <Link
            to="/admin/complaints?status=In+Progress"
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold group-hover:text-amber-600 transition-colors">In Progress</span>
              <Wrench className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-600">
              {stats.inProgress + stats.assigned}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Crews on-site</span>
          </Link>

          {/* Resolved */}
          <Link
            to="/admin/complaints?status=Resolved"
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold group-hover:text-emerald-600 transition-colors">Resolved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{stats.resolved}</div>
            <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
              {Math.round((stats.resolved / (stats.total || 1)) * 100)}% verified rate
            </span>
          </Link>

          {/* Closed / Rejected */}
          <Link
            to="/admin/complaints?status=Rejected"
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-rose-400 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold group-hover:text-rose-600 transition-colors">Closed / Rejected</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-600">{stats.rejected}</div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Closed files</span>
          </Link>
        </div>

        {/* Visual Charts Grid: Category Distribution & Status Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Complaints by Category Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Complaints by Category</span>
              </h3>
              <span className="text-xs text-slate-400">Total volume</span>
            </div>

            <div className="space-y-3">
              {categoryCounts.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 truncate">
                      {getCategoryIcon(cat.name as any, 'w-3.5 h-3.5 text-slate-500')}
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <span className="font-bold text-slate-900 shrink-0">{cat.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(8, (cat.count / maxCategoryCount) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Complaints by Status & Priority Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Complaints by Lifecycle Status</h3>
                <span className="text-xs text-slate-400">{complaints.length} Total</span>
              </div>

              {/* Status Segmented Stack Bar */}
              <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 mb-6 shadow-inner">
                {statusCounts.map((st) => {
                  const pct = (st.count / (complaints.length || 1)) * 100;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={st.label}
                      style={{ width: `${pct}%` }}
                      className={`${st.color} transition-all duration-300`}
                      title={`${st.label}: ${st.count}`}
                    />
                  );
                })}
              </div>

              {/* Legend List */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {statusCounts.map((st) => (
                  <div
                    key={st.label}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${st.color}`} />
                      <span className="font-medium text-slate-700">{st.label}</span>
                    </div>
                    <span className="font-bold text-slate-900">{st.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Priority Callout */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Urgent Public Hazard Complaints:</span>
              <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                {complaints.filter((c) => c.priority === 'Urgent').length} Pending Fast-Track
              </span>
            </div>
          </div>
        </div>

        {/* Recent Grievance Activity Log Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Grievance Submissions</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Incoming citizen complaints awaiting verification and field deployment.
              </p>
            </div>
            <Link
              to="/admin/complaints"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Open All Complaints Table</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Complaint ID</th>
                  <th className="py-3 px-4">Citizen &amp; Ward</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.slice(0, 5).map((c) => (
                  <tr key={c.id || (c as any)._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {c.complaint_number || 'CC-2026-Pending'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block truncate max-w-[140px]">
                        {c.citizen_name || 'Citizen'}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[140px] block">
                        {(c.ward || 'Ward 12').split('-')[0]}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-900">
                      {c.title || 'Untitled Grievance'}
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={c.priority || 'Medium'} size="sm" />
                    </td>
                    <td className="py-3 px-4 truncate max-w-[160px] text-slate-600">
                      {c.assigned_department || 'General Municipal Administration'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status || 'Submitted'} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/complaints/${c.id || (c as any)._id}`}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
