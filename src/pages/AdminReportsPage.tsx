import React from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { useComplaints } from '../context/ComplaintContext';
import { WARDS, CATEGORIES, DEPARTMENTS } from '../data/mockData';
import {
  BarChart3,
  TrendingUp,
  Download,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
} from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const { complaints, stats } = useComplaints();

  // Compute ward performance
  const wardPerformance = WARDS.map((ward) => {
    const wardComplaints = complaints.filter((c) => c.ward === ward);
    const resolved = wardComplaints.filter((c) => c.status === 'Resolved').length;
    const rate = wardComplaints.length > 0 ? Math.round((resolved / wardComplaints.length) * 100) : 100;
    return {
      ward,
      total: wardComplaints.length,
      resolved,
      rate,
    };
  });

  const handleExportCSV = () => {
    const headers = 'ComplaintID,Citizen,Category,Priority,Status,Ward,Address,CreatedAt\n';
    const rows = complaints.map(
      (c) =>
        `"${c.complaint_number || ''}","${c.citizen_name || ''}","${c.category || ''}","${c.priority || ''}","${c.status || ''}","${c.ward || ''}","${(c.address || '').replace(/"/g, '""')}","${c.created_at || ''}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CivicConnect_Grievances_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar mode="admin" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 lg:pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>Municipal Performance Intelligence</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Reports &amp; Operational Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Ward-wise redressal efficiency metrics, resolution times, and exportable civic logs.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Audit Log</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold block mb-1">
              Overall Redressal Rate
            </span>
            <div className="text-3xl font-extrabold text-emerald-600">
              {Math.round((stats.resolved / (stats.total || 1)) * 100)}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {stats.resolved} of {stats.total} total cases closed
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold block mb-1">
              Average Resolution Speed
            </span>
            <div className="text-3xl font-extrabold text-slate-900">
              {stats.avgResolutionHours} Hours
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Average time from triage to fix</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold block mb-1">
              Active Municipal Wings
            </span>
            <div className="text-3xl font-extrabold text-indigo-700">
              {DEPARTMENTS.length} Depts
            </div>
            <p className="text-[11px] text-slate-400 mt-1">All engineering branches mobilized</p>
          </div>
        </div>

        {/* Ward Breakdown Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-8">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Zonal Ward Redressal Performance Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison across jurisdictional boundaries.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Ward Zone</th>
                  <th className="py-3 px-4">Total Cases</th>
                  <th className="py-3 px-4">Resolved Cases</th>
                  <th className="py-3 px-4">Efficiency Rate</th>
                  <th className="py-3 px-4">Performance Bar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wardPerformance.map((w) => (
                  <tr key={w.ward} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{w.ward}</td>
                    <td className="py-3 px-4">{w.total}</td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold">{w.resolved}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{w.rate}%</td>
                    <td className="py-3 px-4 w-44">
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{ width: `${w.rate}%` }}
                        />
                      </div>
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
