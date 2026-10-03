import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Sidebar } from '../components/common/Sidebar';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { ComplaintFilters } from '../components/complaints/ComplaintFilters';
import { ImageLightboxModal } from '../components/common/ImageLightboxModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { DEPARTMENTS, WARDS, CATEGORIES } from '../data/mockData';
import { Complaint, ComplaintStatus, FilterState } from '../types';
import {
  FileText,
  Search,
  Filter,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Wrench,
  Building2,
  ChevronRight,
  Maximize2,
  Edit,
  Trash2,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react';

export const AdminComplaintsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const {
    complaints,
    updateStatus,
    assignDepartment,
    resolveComplaint,
    deleteComplaint,
    resetToDefaultComplaints,
  } = useComplaints();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [filters, setFilters] = useState<FilterState>({
    search: initialSearch,
    category: 'All',
    status: initialStatus,
    priority: 'All',
    ward: 'All',
    sortBy: 'date_desc',
  });

  // Modal State for Action Dialog
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [actionType, setActionType] = useState<
    'assign' | 'status' | 'resolve' | 'delete' | null
  >(null);

  // Assign modal state
  const [assignDept, setAssignDept] = useState<string>(DEPARTMENTS[0]);
  const [assignOfficer, setAssignOfficer] = useState('');
  const [assignNote, setAssignNote] = useState('');

  // Status modal state
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('In Progress');
  const [statusNote, setStatusNote] = useState('');

  // Resolve modal state
  const [resolveProofUrl, setResolveProofUrl] = useState(
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80'
  );
  const [resolveNotes, setResolveNotes] = useState(
    'Field squad cleared site, performed bitumen patch-fill, and conducted final safety inspection.'
  );

  // Photo Lightbox modal
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesTitle = (c.title || '').toLowerCase().includes(q);
        const matchesNumber = (c.complaint_number || '').toLowerCase().includes(q);
        const matchesAddress = (c.address || '').toLowerCase().includes(q);
        const matchesCitizen = (c.citizen_name || '').toLowerCase().includes(q);
        const matchesUserId = (c.user_id || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesNumber && !matchesAddress && !matchesCitizen && !matchesUserId) {
          return false;
        }
      }

      if (filters.userId && filters.userId.trim()) {
        const uid = filters.userId.toLowerCase().trim();
        if (!(c.user_id || '').toLowerCase().includes(uid)) {
          return false;
        }
      }

      if (filters.dateFilter && filters.dateFilter !== 'all') {
        const complaintTime = new Date(c.created_at).getTime();
        const now = Date.now();
        if (filters.dateFilter === 'today') {
          const oneDayAgo = now - 24 * 60 * 60 * 1000;
          if (complaintTime < oneDayAgo) return false;
        } else if (filters.dateFilter === 'week') {
          const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
          if (complaintTime < oneWeekAgo) return false;
        } else if (filters.dateFilter === 'month') {
          const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
          if (complaintTime < oneMonthAgo) return false;
        }
      }

      if (filters.category !== 'All' && c.category !== filters.category) return false;
      if (filters.status !== 'All' && c.status !== filters.status) return false;
      if (filters.priority !== 'All' && c.priority !== filters.priority) return false;
      if (filters.ward !== 'All' && c.ward !== filters.ward) return false;

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
  }, [complaints, filters]);

  // Open modals
  const openAssignModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setAssignDept(complaint.assigned_department || DEPARTMENTS[0]);
    setAssignOfficer(complaint.assigned_officer || '');
    setAssignNote('');
    setActionType('assign');
  };

  const openStatusModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setStatusNote('');
    setActionType('status');
  };

  const openResolveModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setActionType('resolve');
  };

  const openDeleteModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setActionType('delete');
  };

  // Submissions
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    assignDepartment(
      selectedComplaint.id,
      assignDept,
      assignOfficer.trim() || undefined,
      assignNote.trim() || undefined,
      user?.name || 'Commissioner Desk'
    );
    addToast(`Complaint dispatched to ${assignDept}.`, 'success');
    setActionType(null);
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    updateStatus(
      selectedComplaint.id,
      newStatus,
      statusNote.trim() || `Status updated to ${newStatus}.`,
      user?.name || 'Commissioner Desk',
      'admin'
    );
    addToast(`Status updated to ${newStatus}.`, 'success');
    setActionType(null);
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    resolveComplaint(
      selectedComplaint.id,
      resolveProofUrl.trim(),
      resolveNotes.trim(),
      user?.name || 'Municipal Field Engineer'
    );
    addToast(`Complaint marked as Resolved with on-site photographic proof!`, 'success');
    setActionType(null);
  };

  const handleDeleteConfirm = () => {
    if (selectedComplaint) {
      deleteComplaint(selectedComplaint.id);
      addToast(`Complaint ${selectedComplaint.complaint_number} removed.`, 'info');
      setActionType(null);
    }
  };

  const handleResetData = () => {
    resetToDefaultComplaints();
    addToast('Grievance database reset to sample initial records.', 'info');
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar mode="admin" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 lg:pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Grievance Administration Desk
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Assign departments, update status, dispatch field staff, and record resolution proof.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetData}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-xs transition-colors"
              title="Reset data to initial state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Data</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <ComplaintFilters
          filters={filters}
          setFilters={setFilters}
          totalMatches={filteredComplaints.length}
        />

        {/* Complaints Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Photo</th>
                  <th className="py-3.5 px-4">ID &amp; Priority</th>
                  <th className="py-3.5 px-4">Citizen &amp; Ward</th>
                  <th className="py-3.5 px-4">Title &amp; Category</th>
                  <th className="py-3.5 px-4">Department &amp; Officer</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredComplaints.map((c) => (
                  <tr key={c.id || (c as any)._id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <div
                        onClick={() => setActivePhoto(c.image_url)}
                        className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden relative cursor-pointer border border-slate-200 group shrink-0"
                      >
                        <img
                          src={c.image_url || 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800&auto=format&fit=crop&q=80'}
                          alt="Thumbnail"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white">
                          <Maximize2 className="w-3 h-3" />
                        </div>
                      </div>
                    </td>

                    {/* ID & Priority */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 block">
                        {c.complaint_number || 'CC-2026-Pending'}
                      </span>
                      <div className="mt-1">
                        <PriorityBadge priority={c.priority || 'Medium'} size="sm" />
                      </div>
                    </td>

                    {/* Citizen & Location */}
                    <td className="py-3 px-4 max-w-[170px]">
                      <span className="font-semibold text-slate-900 block truncate">
                        {c.citizen_name || 'Citizen'}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-0.5" title="Unique User ID">
                        {c.user_id || 'UID-2026-10492'}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate mt-0.5" title={c.address}>
                        {(c.ward || 'Ward 12').split('-')[0]}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {c.citizen_phone || '-'}
                      </span>
                    </td>

                    {/* Title & Category */}
                    <td className="py-3 px-4 max-w-xs">
                      <Link
                        to={`/complaints/${c.id || (c as any)._id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 line-clamp-1"
                        title={c.title}
                      >
                        {c.title || 'Untitled Grievance'}
                      </Link>
                      <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {c.category || 'Other'}
                      </span>
                    </td>

                    {/* Assigned Dept */}
                    <td className="py-3 px-4 max-w-[170px]">
                      <span className="font-medium text-slate-800 block truncate">
                        {c.assigned_department}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {c.assigned_officer || 'Unassigned Officer'}
                      </span>
                    </td>

                    {/* Status with Quick Interactive Control */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={c.status}
                        onChange={(e) => {
                          const nextStatus = e.target.value as ComplaintStatus;
                          updateStatus(
                            c.id,
                            nextStatus,
                            `Status transitioned to ${nextStatus} via Admin Desk.`,
                            user?.name || 'Commissioner Desk',
                            'admin'
                          );
                          addToast(`${c.complaint_number} status updated to ${nextStatus}`, 'success');
                        }}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : c.status === 'In Progress'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : c.status === 'Under Review'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : c.status === 'Assigned'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : c.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>

                    {/* Admin Action Buttons */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View & Chat Link */}
                        <Link
                          to={`/complaints/${c.id || (c as any)._id}`}
                          className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                          title="View Details & Official Discussion"
                        >
                          View &amp; Chat
                        </Link>

                        {/* Assign Dept */}
                        <button
                          onClick={() => openAssignModal(c)}
                          className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors"
                          title="Assign Department or Officer"
                        >
                          Assign
                        </button>

                        {/* Status Change */}
                        <button
                          onClick={() => openStatusModal(c)}
                          className="px-2 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-md border border-purple-200 transition-colors"
                          title="Update Status & Remarks"
                        >
                          Status
                        </button>

                        {/* Resolve */}
                        {c.status !== 'Resolved' && (
                          <button
                            onClick={() => openResolveModal(c)}
                            className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                            title="Mark as Resolved"
                          >
                            Resolve
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => openDeleteModal(c)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete complaint"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal 1: Assign Department */}
        {actionType === 'assign' && selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Assign Municipal Department
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedComplaint.complaint_number} · {selectedComplaint.title}
                  </p>
                </div>
                <button
                  onClick={() => setActionType(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department Wing
                  </label>
                  <select
                    value={assignDept}
                    onChange={(e) => setAssignDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-medium"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Designated Field Officer / Engineer
                  </label>
                  <input
                    type="text"
                    value={assignOfficer}
                    onChange={(e) => setAssignOfficer(e.target.value)}
                    placeholder="e.g. Engr. M. Balamurugan (Executive Engineer)"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dispatch Instructions / Field Note
                  </label>
                  <textarea
                    rows={3}
                    value={assignNote}
                    onChange={(e) => setAssignNote(e.target.value)}
                    placeholder="Specify machinery to deploy, estimated inspection hour, and contractor guidelines..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActionType(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
                  >
                    Dispatch Case
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Change Status & Add Updates */}
        {actionType === 'status' && selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Update Workflow Status
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedComplaint.complaint_number} · Current: {selectedComplaint.status}
                  </p>
                </div>
                <button
                  onClick={() => setActionType(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleStatusSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/20 font-medium"
                  >
                    <option value="Submitted">Submitted (Initial)</option>
                    <option value="Under Review">Under Review (Triaged)</option>
                    <option value="Assigned">Assigned (To Department)</option>
                    <option value="In Progress">In Progress (Field Work Active)</option>
                    <option value="Resolved">Resolved (Completed)</option>
                    <option value="Rejected">Rejected (Out of Scope / Duplicate)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Update Remark / Citizen Notification Note (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Optional note: Provide details on action taken or reason for update (visible on citizen audit trail)..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActionType(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs cursor-pointer"
                  >
                    Save Status Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 3: Mark as Resolved & Upload Resolution Proof */}
        {actionType === 'resolve' && selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Complete &amp; Resolve Complaint</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedComplaint.complaint_number}
                  </p>
                </div>
                <button
                  onClick={() => setActionType(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleResolveSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    On-Site Resolution Proof Photo URL
                  </label>
                  <input
                    type="text"
                    required
                    value={resolveProofUrl}
                    onChange={(e) => setResolveProofUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 font-mono"
                  />
                  {resolveProofUrl && (
                    <div className="mt-2 h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={resolveProofUrl}
                        alt="Resolution preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Completion Report Notes
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={resolveNotes}
                    onChange={(e) => setResolveNotes(e.target.value)}
                    placeholder="Describe how the problem was rectified, contractor verification, and final handover notes..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActionType(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
                  >
                    Confirm Resolution
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 4: Delete Confirmation */}
        <ConfirmationModal
          isOpen={actionType === 'delete'}
          onClose={() => setActionType(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Grievance Record"
          message={`Are you sure you want to permanently delete complaint ${selectedComplaint?.complaint_number}? This cannot be undone.`}
          confirmLabel="Delete"
          isDestructive={true}
        />

        {/* Photo Lightbox */}
        {activePhoto && (
          <ImageLightboxModal
            isOpen={true}
            onClose={() => setActivePhoto(null)}
            imageUrl={activePhoto}
          />
        )}
      </main>
    </div>
  );
};
