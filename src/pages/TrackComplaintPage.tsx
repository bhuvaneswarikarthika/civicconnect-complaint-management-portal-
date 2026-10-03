import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useComplaints } from '../context/ComplaintContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { Timeline } from '../components/common/Timeline';
import { getCategoryIcon } from '../utils/categoryIcons';
import { ImageLightboxModal } from '../components/common/ImageLightboxModal';
import {
  Search,
  MapPin,
  Calendar,
  Building2,
  User as UserIcon,
  CheckCircle2,
  Clock,
  ExternalLink,
  Star,
  Maximize2,
  AlertCircle,
  Share2,
} from 'lucide-react';

export const TrackComplaintPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const { complaints, getComplaintByNumber, addCitizenFeedback } = useComplaints();
  const { addToast } = useToast();

  const [searchInput, setSearchInput] = useState(initialId);
  const [activeComplaint, setActiveComplaint] = useState(() => {
    if (initialId) {
      return getComplaintByNumber(initialId);
    }
    // Default to the first complaint so the page is immediately informative
    return complaints[0];
  });

  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);

  // Rating & Feedback State for resolved complaints
  const [userRating, setUserRating] = useState<number>(5);
  const [userFeedbackText, setUserFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    if (initialId) {
      setSearchInput(initialId);
      const found = getComplaintByNumber(initialId);
      if (found) {
        setActiveComplaint(found);
      }
    }
  }, [initialId, complaints]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      addToast('Please enter a Complaint Number.', 'warning');
      return;
    }

    const found = getComplaintByNumber(searchInput.trim());
    if (found) {
      setActiveComplaint(found);
      setSearchParams({ id: found.complaint_number });
      addToast(`Found complaint ${found.complaint_number}`, 'success');
    } else {
      addToast(`No complaint found matching "${searchInput}". Please check ID.`, 'error');
    }
  };

  const handleQuickSelect = (cmpNumber: string) => {
    setSearchInput(cmpNumber);
    const found = getComplaintByNumber(cmpNumber);
    if (found) {
      setActiveComplaint(found);
      setSearchParams({ id: found.complaint_number });
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeComplaint) {
      addCitizenFeedback(activeComplaint.id, userRating, userFeedbackText.trim());
      setFeedbackSubmitted(true);
      addToast('Thank you for rating municipal grievance redressal!', 'success');
    }
  };

  const handleShare = () => {
    if (activeComplaint) {
      const shareUrl = `${window.location.origin}/track?id=${encodeURIComponent(activeComplaint.complaint_number)}`;
      navigator.clipboard.writeText(shareUrl);
      addToast('Tracking link copied to clipboard!', 'info');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Track Grievance Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
          Enter your unique complaint ID (e.g. <code>CC-2026-89412</code>) to view the live department workflow and on-site updates.
        </p>

        {/* Search Input Bar */}
        <div className="mt-6 max-w-xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Enter complaint number (e.g. CC-2026-89412)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              Track Status
            </button>
          </form>

          {/* Quick Clickable Sample Chips */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500">
            <span>Quick test:</span>
            {complaints.slice(0, 4).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleQuickSelect(c.complaint_number)}
                className={`px-2 py-0.5 rounded font-mono text-[11px] border transition-colors cursor-pointer ${
                  activeComplaint?.id === c.id
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {c.complaint_number}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Complaint Tracking View */}
      {activeComplaint ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main Card: Header & Quick Attributes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                    {activeComplaint.complaint_number}
                  </span>
                  <StatusBadge status={activeComplaint.status} size="md" />
                  <PriorityBadge priority={activeComplaint.priority} size="md" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {activeComplaint.title}
                </h2>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                  title="Copy tracking link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <Link
                  to={`/complaints/${activeComplaint.id}`}
                  className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                >
                  Full File Details
                </Link>
              </div>
            </div>

            {/* Visual Step Progress Timeline */}
            <div className="pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Live Resolution Stage
              </h3>
              <Timeline complaint={activeComplaint} />
            </div>

            {/* Key Information Grid */}
            <div className="mt-8 pt-6 border-t border-slate-100 grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Category
                </span>
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  {getCategoryIcon(activeComplaint.category, 'w-4 h-4 text-blue-600')}
                  <span>{activeComplaint.category}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Assigned Department
                </span>
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 truncate">
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">{activeComplaint.assigned_department}</span>
                </div>
                {activeComplaint.assigned_officer && (
                  <p className="text-[11px] text-slate-500 mt-1 truncate">
                    Officer: {activeComplaint.assigned_officer}
                  </p>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Location &amp; Ward
                </span>
                <div className="flex items-start gap-1.5 font-semibold text-slate-800">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{activeComplaint.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Evidence Card (Before & After if resolved) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>Photographic Evidence</span>
              <span className="text-xs text-slate-500 font-normal">
                Click any image to enlarge
              </span>
            </h3>

            <div
              className={`grid gap-4 ${
                activeComplaint.resolved_image_url ? 'sm:grid-cols-2' : 'grid-cols-1 max-w-md'
              }`}
            >
              {/* Reported Issue Photo */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-700">
                  Initial Reported Issue:
                </span>
                <div
                  onClick={() => setActiveLightboxImg(activeComplaint.image_url)}
                  className="relative h-56 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group cursor-pointer"
                >
                  <img
                    src={activeComplaint.image_url}
                    alt="Reported problem"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Resolved Photo if Available */}
              {activeComplaint.resolved_image_url && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Municipal Resolution:
                  </span>
                  <div
                    onClick={() => setActiveLightboxImg(activeComplaint.resolved_image_url!)}
                    className="relative h-56 bg-slate-100 rounded-xl overflow-hidden border border-emerald-300 ring-2 ring-emerald-100 group cursor-pointer"
                  >
                    <img
                      src={activeComplaint.resolved_image_url}
                      alt="Resolved state"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Maximize2 className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Citizen Feedback Rating (When Resolved) */}
          {activeComplaint.status === 'Resolved' && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-emerald-950 mb-1 flex items-center gap-2">
                <Star className="w-4 h-4 text-emerald-600 fill-emerald-500" />
                <span>Rate Municipal Redressal Quality</span>
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                How satisfied are you with the timeliness and workmanship of this resolution?
              </p>

              {activeComplaint.rating || feedbackSubmitted ? (
                <div className="bg-white p-4 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-1 text-amber-500 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= (activeComplaint.rating || userRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-800 ml-2">
                      {activeComplaint.rating || userRating} out of 5 Stars
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 italic">
                    &ldquo;{activeComplaint.feedback || userFeedbackText || 'Satisfactory work completed.'}&rdquo;
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setUserRating(num)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          num <= userRating ? 'text-amber-500' : 'text-slate-300'
                        }`}
                      >
                        <Star className={`w-6 h-6 ${num <= userRating ? 'fill-amber-400' : ''}`} />
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={userFeedbackText}
                    onChange={(e) => setUserFeedbackText(e.target.value)}
                    placeholder="Share any comments regarding the work done..."
                    className="w-full px-3.5 py-2 text-xs bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />

                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Submit Citizen Rating
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Complaint Selected</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Please enter a complaint reference number above or select from your filed grievances.
          </p>
          <Link
            to="/my-complaints"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
          >
            <span>View My Complaints</span>
          </Link>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightboxImg && (
        <ImageLightboxModal
          isOpen={true}
          onClose={() => setActiveLightboxImg(null)}
          imageUrl={activeLightboxImg}
          title={activeComplaint?.title}
          subtitle={activeComplaint?.complaint_number}
        />
      )}
    </div>
  );
};
