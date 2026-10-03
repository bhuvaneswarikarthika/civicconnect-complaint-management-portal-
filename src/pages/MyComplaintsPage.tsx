import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintContext';
import { Sidebar } from '../components/common/Sidebar';
import { ComplaintCard } from '../components/complaints/ComplaintCard';
import { ComplaintFilters } from '../components/complaints/ComplaintFilters';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { getCategoryIcon } from '../utils/categoryIcons';
import { FilterState, Complaint } from '../types';
import {
  FileText,
  PlusCircle,
  LayoutGrid,
  List,
  Calendar,
  Building2,
  ChevronRight,
  Inbox,
} from 'lucide-react';

export const MyComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const { complaints } = useComplaints();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'All',
    status: 'All',
    priority: 'All',
    ward: 'All',
    sortBy: 'date_desc',
  });

  // Base list of complaints: only those filed by this specific user
  const userComplaints = useMemo(() => {
    const uid = user?.user_id || user?.id;
    const email = user?.email?.toLowerCase();
    return complaints.filter((c) => {
      if (c.user_id && uid && (c.user_id === uid || c.user_id === user?.id)) return true;
      if (c.citizen_email && email && c.citizen_email.toLowerCase() === email) return true;
      return false;
    });
  }, [complaints, user]);

  // Apply filters and sorting
  const filteredComplaints = useMemo(() => {
    return userComplaints.filter((c) => {
      // Search match
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const matchesTitle = (c.title || '').toLowerCase().includes(query);
        const matchesNumber = (c.complaint_number || '').toLowerCase().includes(query);
        const matchesAddress = (c.address || '').toLowerCase().includes(query);
        const matchesDesc = (c.description || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesNumber && !matchesAddress && !matchesDesc) {
          return false;
        }
      }

      // Category match
      if (filters.category !== 'All' && c.category !== filters.category) {
        return false;
      }

      // Status match
      if (filters.status !== 'All' && c.status !== filters.status) {
        return false;
      }

      // Priority match
      if (filters.priority !== 'All' && c.priority !== filters.priority) {
        return false;
      }

      // Ward match
      if (filters.ward !== 'All' && c.ward !== filters.ward) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'date_desc') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (filters.sortBy === 'date_asc') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (filters.sortBy === 'priority_desc') {
        const priorityScore = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
        return priorityScore[b.priority] - priorityScore[a.priority];
      }
      return 0;
    });
  }, [userComplaints, filters]);

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar mode="citizen" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 lg:pb-8">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
              <FileText className="w-4 h-4" />
              <span>Grievance Dossier</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Civic Complaints
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and track all infrastructure and civic issues registered under your account.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="List / Table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Link
              to="/raise-complaint"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Complaint</span>
            </Link>
          </div>
        </div>

        {/* Filters Bar */}
        <ComplaintFilters
          filters={filters}
          setFilters={setFilters}
          totalMatches={filteredComplaints.length}
        />

        {/* Content Area */}
        {userComplaints.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Complaints Lodged Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
              You haven't submitted any complaints under your User ID (<strong className="font-mono text-slate-700">{user?.user_id || user?.id || 'Citizen'}</strong>).
              When you report civic issues like potholes, streetlights, or waste, they will be securely tracked here with direct municipal updates.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/raise-complaint"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Raise Your First Complaint</span>
              </Link>
              <Link
                to="/public-complaints"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors"
              >
                <span>Browse Public Complaints Feed</span>
              </Link>
            </div>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Complaints Match Filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              No civic issues match your current filter settings. Try adjusting your search query or reset the filters.
            </p>
            <button
              onClick={() =>
                setFilters({
                  search: '',
                  category: 'All',
                  status: 'All',
                  priority: 'All',
                  ward: 'All',
                  userId: '',
                  dateFilter: 'all',
                  sortBy: 'date_desc',
                })
              }
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredComplaints.map((item) => (
              <ComplaintCard key={item.id} complaint={item} />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Complaint ID</th>
                    <th className="py-3 px-4">Title &amp; Category</th>
                    <th className="py-3 px-4">Ward / Location</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredComplaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {c.complaint_number}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <Link
                          to={`/complaints/${c.id}`}
                          className="font-semibold text-slate-900 hover:text-blue-600 block line-clamp-1"
                        >
                          {c.title}
                        </Link>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          {getCategoryIcon(c.category, 'w-3 h-3')}
                          <span>{c.category}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 truncate max-w-[180px]" title={c.address}>
                        {c.address}
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={c.priority} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/complaints/${c.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
