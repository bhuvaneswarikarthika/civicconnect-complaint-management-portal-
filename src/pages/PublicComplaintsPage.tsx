import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { getCategoryIcon } from '../utils/categoryIcons';
import { ImageLightboxModal } from '../components/common/ImageLightboxModal';
import { CATEGORIES, WARDS } from '../data/mockData';
import {
  Globe2,
  Search,
  Filter,
  MapPin,
  Calendar,
  ShieldCheck,
  ThumbsUp,
  ExternalLink,
  Lock,
  Building2,
  CheckCircle2,
  Maximize2,
  Eye,
  ArrowRight,
} from 'lucide-react';

export const PublicComplaintsPage: React.FC = () => {
  const { complaints } = useComplaints();
  const { isAuthenticated, isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedWard, setSelectedWard] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Interactive community upvotes stored in local state
  const [upvotes, setUpvotes] = useState<Record<string, number>>({});
  const [userUpvoted, setUserUpvoted] = useState<Record<string, boolean>>({});
  const [lightboxImg, setLightboxImg] = useState<{ url: string; title: string } | null>(null);

  const handleToggleUpvote = (id: string) => {
    setUserUpvoted((prev) => {
      const isAlready = !!prev[id];
      setUpvotes((cur) => ({
        ...cur,
        [id]: Math.max(0, (cur[id] || 0) + (isAlready ? -1 : 1)),
      }));
      return { ...prev, [id]: !isAlready };
    });
  };

  // Mask sensitive citizen name for public privacy
  const maskCitizenName = (name: string) => {
    if (!name || name.trim().length === 0) return 'Verified Resident';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return `${parts[0].charAt(0)}*** (Resident)`;
    }
    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
  };

  // Filter complaints
  const publicList = useMemo(() => {
    return complaints.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = (c.title || '').toLowerCase().includes(q);
        const matchesNumber = (c.complaint_number || '').toLowerCase().includes(q);
        const matchesWard = (c.ward || '').toLowerCase().includes(q);
        const matchesCategory = (c.category || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesNumber && !matchesWard && !matchesCategory) {
          return false;
        }
      }

      if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
      if (selectedStatus !== 'All' && c.status !== selectedStatus) return false;
      if (selectedWard !== 'All' && c.ward !== selectedWard) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [complaints, searchQuery, selectedCategory, selectedStatus, selectedWard, sortBy]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 mb-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-3">
            <Globe2 className="w-3.5 h-3.5" />
            <span>Public Civic Transparency Feed</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Citywide Grievance Explorer
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Browse public complaints submitted by fellow citizens across all municipal wards.
            Monitor departmental accountability, verify resolution proofs, and voice community support.
          </p>

          {/* Privacy Guarantee Ribbon */}
          <div className="mt-5 inline-flex items-center gap-2 text-xs bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1.5 rounded-xl text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>
              <strong>Privacy Protection Shield Active:</strong> Personal mobile numbers, emails, and sensitive account details are strictly redacted.
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 mb-8 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Complaint ID, Keyword, or Ward..."
              className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-700 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-700 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span>Filter by Ward:</span>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-700 cursor-pointer"
            >
              <option value="All">All Wards</option>
              {WARDS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span>Showing <strong>{publicList.length}</strong> public records</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-700 cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Grid */}
      {publicList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <Globe2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No public complaints match your filter</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try adjusting your search criteria or clear category and status filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedStatus('All');
              setSelectedWard('All');
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicList.map((complaint) => {
            const upvoteCount = (upvotes[complaint.id] || 0) + 3; // base civic community score
            const isUpvoted = !!userUpvoted[complaint.id];

            return (
              <div
                key={complaint.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Photo Banner */}
                  <div className="relative h-48 bg-slate-100 group">
                    <img
                      src={complaint.resolved_image_url || complaint.image_url}
                      alt={complaint.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                    {/* Top badging */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                        {complaint.complaint_number}
                      </span>
                      <StatusBadge status={complaint.status} size="sm" />
                    </div>

                    {/* Bottom badging */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-200">
                        {getCategoryIcon(complaint.category, 'w-3.5 h-3.5 text-blue-300')}
                        <span>{complaint.category}</span>
                      </span>

                      {complaint.status === 'Resolved' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-600/90 text-white text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Resolved Proof
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1 leading-snug hover:text-blue-600 transition-colors">
                      <Link to={`/complaints/${complaint.id}`}>{complaint.title}</Link>
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {complaint.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{complaint.ward}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{complaint.assigned_department}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Masked Citizen & Community Upvote */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] font-medium">
                      Reported by: <strong>{maskCitizenName(complaint.citizen_name)}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleUpvote(complaint.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isUpvoted
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Support this civic grievance (+1 citizen voice)"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{upvoteCount}</span>
                    </button>

                    <Link
                      to={`/complaints/${complaint.id}`}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                      title="View Details & Official Responses"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImg && (
        <ImageLightboxModal
          isOpen={true}
          onClose={() => setLightboxImg(null)}
          imageUrl={lightboxImg.url}
          title={lightboxImg.title}
          subtitle="Public photographic verification"
        />
      )}
    </div>
  );
};
