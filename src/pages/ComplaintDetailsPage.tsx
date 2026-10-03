import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ComplaintStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { Timeline } from '../components/common/Timeline';
import { getCategoryIcon } from '../utils/categoryIcons';
import { ImageLightboxModal } from '../components/common/ImageLightboxModal';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  User as UserIcon,
  Maximize2,
  Printer,
  Share2,
  Clock,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';

export const ComplaintDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getComplaintById, updateStatus, addComplaintMessage } = useComplaints();
  const { user, isAdmin } = useAuth();
  const { addToast } = useToast();

  const complaint = getComplaintById(id || '');

  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);

  if (!complaint) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md w-full shadow-xs">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Complaint Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            The requested grievance record cannot be located in the civic database.
          </p>
          <Link
            to="/my-complaints"
            className="px-5 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl"
          >
            Back to Complaints
          </Link>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Complaint record URL copied to clipboard!', 'info');
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSendingComment(true);
    try {
      const senderRole = isAdmin ? 'admin' : 'citizen';
      const senderName = user?.name || (isAdmin ? 'Municipal Officer' : 'Resident Citizen');
      await addComplaintMessage(
        complaint.id,
        commentText.trim(),
        senderName,
        senderRole
      );
      setCommentText('');
      addToast(
        isAdmin
          ? 'Official response sent to citizen & attached to complaint dossier!'
          : 'Follow-up message sent to municipal engineering team!',
        'success'
      );
    } catch {
      addToast('Failed to send message. Please try again.', 'error');
    } finally {
      setIsSendingComment(false);
    }
  };

  const isOwnerOrAdmin =
    isAdmin ||
    Boolean(
      user &&
        (user.user_id === complaint.user_id ||
          user.id === complaint.user_id ||
          (user.email && user.email.toLowerCase() === complaint.citizen_email?.toLowerCase()))
    );

  const maskCitizenName = (raw: string) => {
    if (!raw || raw.trim().length === 0) return 'Verified Resident';
    const parts = raw.trim().split(' ');
    if (parts.length === 1) return `${parts[0].charAt(0)}*** (Resident)`;
    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}. (Resident)`;
  };

  const displayedCitizenName = isOwnerOrAdmin
    ? complaint.citizen_name
    : maskCitizenName(complaint.citizen_name);

  const formattedDate = new Date(complaint.created_at).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-xs transition-colors"
            title="Share or Copy Link"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Dossier</span>
          </button>
          {isAdmin && (
            <Link
              to={`/admin/complaints?search=${encodeURIComponent(complaint.complaint_number)}`}
              className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              Manage in Admin Portal
            </Link>
          )}
        </div>
      </div>

      {/* Municipal Admin Action Console */}
      {isAdmin && (
        <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl shadow-sm border border-blue-900/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30 rounded">
                  Admin Status Console
                </span>
                <span className="text-xs text-blue-200">
                  Current: <strong className="text-white font-bold">{complaint.status}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Directly change lifecycle status below. This immediately updates MongoDB Atlas and notifies the citizen timeline.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'] as ComplaintStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    if (complaint.status === st) return;
                    updateStatus(
                      complaint.id,
                      st,
                      `Status updated to ${st} by Administrator.`,
                      user?.name || 'Commissioner Desk',
                      'admin'
                    );
                    addToast(`Status updated to ${st}`, 'success');
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    complaint.status === st
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-md scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 hover:text-white'
                  }`}
                >
                  {complaint.status === st ? `✓ ${st}` : st}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Dossier Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Header Ribbon */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-white text-slate-800 border border-slate-200 shadow-2xs">
              Complaint ID: {complaint.complaint_number}
            </span>
            {isOwnerOrAdmin ? (
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs">
                User ID: {complaint.user_id || 'UID-2026-10492'}
              </span>
            ) : (
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                Verified Public Record
              </span>
            )}
            <StatusBadge status={complaint.status} size="md" />
            <PriorityBadge priority={complaint.priority} size="md" />
            <span className="text-xs text-slate-500 ml-auto flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formattedDate}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {complaint.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              {getCategoryIcon(complaint.category, 'w-3.5 h-3.5 text-blue-600')}
              <span>{complaint.category}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{complaint.ward}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{complaint.assigned_department}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Reported by: <strong>{displayedCitizenName}</strong></span>
            </span>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Section 1: Photographic Evidence */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Photo Documentation
            </h3>
            <div
              className={`grid gap-4 ${
                complaint.resolved_image_url ? 'sm:grid-cols-2' : 'grid-cols-1 max-w-lg'
              }`}
            >
              {/* Before Photo */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700">Initial Issue:</span>
                <div
                  onClick={() => setActiveLightboxImg(complaint.image_url)}
                  className="relative h-64 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group cursor-pointer"
                >
                  <img
                    src={complaint.image_url}
                    alt={complaint.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 className="w-6 h-6" />
                  </div>
                  <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    Reported on {new Date(complaint.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Resolved Photo */}
              {complaint.resolved_image_url && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Verified Municipal Resolution:
                  </span>
                  <div
                    onClick={() => setActiveLightboxImg(complaint.resolved_image_url!)}
                    className="relative h-64 bg-slate-100 rounded-xl overflow-hidden border-2 border-emerald-400 ring-2 ring-emerald-100 group cursor-pointer"
                  >
                    <img
                      src={complaint.resolved_image_url}
                      alt="Resolved state"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Maximize2 className="w-6 h-6" />
                    </div>
                    <span className="absolute bottom-2 left-2 bg-emerald-700 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                      Completed &amp; Closed
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Full Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Citizen Grievance Description
            </h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
              {complaint.description}
            </div>
          </div>

          {/* Section 3: Location & Geotag Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Site &amp; Geolocation Verification
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">
                    Street Address
                  </span>
                  <p className="font-semibold text-slate-900 mt-0.5">{complaint.address}</p>
                </div>
                {complaint.landmark && (
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">
                      Landmark
                    </span>
                    <p className="font-semibold text-slate-900 mt-0.5">{complaint.landmark}</p>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">
                    Municipal Ward
                  </span>
                  <p className="font-semibold text-slate-900 mt-0.5">{complaint.ward}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">
                    GPS Coordinates
                  </span>
                  <code className="font-mono text-sm text-blue-700 font-bold block mt-1">
                    {complaint.latitude?.toFixed(4)}° N, {complaint.longitude?.toFixed(4)}° E
                  </code>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Verified via device hardware sensor and civic GIS grid mapping.
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  <span>Open in Google Maps Directions</span>
                  <MapPin className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Section 4: Assigned Department & Field Officer */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Assigned Municipal Department
            </h3>
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-[11px] font-bold text-blue-900 block">
                  {complaint.assigned_department}
                </span>
                <p className="text-slate-600 mt-0.5">
                  Designated Officer:{' '}
                  <strong>{complaint.assigned_officer || 'Zonal Engineering Team'}</strong>
                </p>
              </div>

              <div className="flex items-center gap-4 text-slate-600 text-xs">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>1800-425-1913</span>
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>ward12@civicconnect.gov.in</span>
                </span>
              </div>
            </div>
          </div>

          {/* Section 5: Interactive Lifecycle Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Progress &amp; Audit Trail
            </h3>
            <Timeline complaint={complaint} />
          </div>

          {/* Section 6: User ↔ Admin Communication & Conversation Feed */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  User ↔ Municipal Officer Discussion
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Connected to <strong className="text-slate-700">{complaint.complaint_number}</strong>
              </span>
            </div>

            {/* Conversation Messages Thread */}
            <div className="space-y-3 mb-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 max-h-96 overflow-y-auto">
              {(!complaint.updates || complaint.updates.length === 0) ? (
                <p className="text-xs text-slate-400 text-center py-4 italic">
                  No conversation notes attached yet. Use the message box below to communicate.
                </p>
              ) : (
                complaint.updates.map((item, idx) => {
                  const isOfficer =
                    item.updated_by_role === 'admin' ||
                    item.updated_by_role === 'staff' ||
                    (item.updated_by || '').toLowerCase().includes('desk') ||
                    (item.updated_by || '').toLowerCase().includes('officer') ||
                    (item.updated_by || '').toLowerCase().includes('commissioner');

                  return (
                    <div
                      key={item.id || idx}
                      className={`flex flex-col p-3.5 rounded-xl border text-xs leading-relaxed transition-all ${
                        isOfficer
                          ? 'bg-purple-50/80 border-purple-200 text-purple-950 sm:ml-6'
                          : 'bg-white border-slate-200 text-slate-800 sm:mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {isOfficer ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                          ) : (
                            <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          <span className="font-bold">
                            {item.updated_by || (isOfficer ? 'Municipal Officer' : 'Resident Citizen')}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                              isOfficer
                                ? 'bg-purple-200 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isOfficer ? 'Admin / Officer' : 'Citizen'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(item.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-800 whitespace-pre-wrap">{item.message}</p>
                      {item.attachment_url && (
                        <div className="mt-2">
                          <img
                            src={item.attachment_url}
                            alt="Attachment"
                            onClick={() => setActiveLightboxImg(item.attachment_url!)}
                            className="h-20 w-32 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-90"
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Post Message Form */}
            <form onSubmit={handleAddComment} className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>
                  Posting as:{' '}
                  <strong className={isAdmin ? 'text-purple-700 font-bold' : 'text-blue-700 font-bold'}>
                    {user?.name || (isAdmin ? 'Municipal Officer' : 'Resident Citizen')} (
                    {isAdmin ? 'Admin' : `User ID: ${user?.user_id || user?.id || 'Citizen'}`})
                  </strong>
                </span>
                <span>Press Send Message to attach note</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    isAdmin
                      ? 'Type official update, instruction, or notice for the citizen...'
                      : 'Type inquiry, reply, or site detail for the municipal crew...'
                  }
                  className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
                <button
                  type="submit"
                  disabled={isSendingComment || !commentText.trim()}
                  className={`px-4 py-2.5 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shrink-0 ${
                    isAdmin
                      ? 'bg-purple-700 hover:bg-purple-800'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingComment ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeLightboxImg && (
        <ImageLightboxModal
          isOpen={true}
          onClose={() => setActiveLightboxImg(null)}
          imageUrl={activeLightboxImg}
          title={complaint.title}
          subtitle={`${complaint.complaint_number} · ${complaint.address}`}
        />
      )}
    </div>
  );
};
