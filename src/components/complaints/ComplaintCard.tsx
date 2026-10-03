import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Complaint } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { ImageLightboxModal } from '../common/ImageLightboxModal';
import {
  MapPin,
  Calendar,
  Building2,
  ChevronRight,
  Maximize2,
  CheckCircle,
} from 'lucide-react';

interface ComplaintCardProps {
  complaint: Complaint;
  showAdminActions?: boolean;
  onQuickStatusChange?: (status: Complaint['status']) => void;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
}) => {
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);

  const formattedDate = new Date(complaint.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
        <div>
          {/* Card Top Banner / Image & Badges */}
          <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
            <img
              src={complaint.image_url}
              alt={complaint.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              loading="lazy"
            />
            
            {/* Resolution indicator if resolved */}
            {complaint.status === 'Resolved' && (
              <div className="absolute top-3 left-3 bg-emerald-600/95 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs backdrop-blur-xs flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Resolved &amp; Closed</span>
              </div>
            )}

            {/* Quick lightbox zoom button */}
            <button
              onClick={() => setIsPhotoOpen(true)}
              className="absolute bottom-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-md backdrop-blur-xs transition-colors"
              title="Click to zoom photo"
              aria-label="Enlarge complaint photo"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Complaint Number Chip */}
            <div className="absolute bottom-3 left-3 bg-slate-900/80 text-white text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
              {complaint.complaint_number}
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 sm:p-5">
            {/* Meta Row: Category & Status */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <span className="text-slate-500">{getCategoryIcon(complaint.category, 'w-3.5 h-3.5')}</span>
                <span>{complaint.category}</span>
              </div>
              <StatusBadge status={complaint.status} size="sm" />
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
              <Link to={`/complaints/${complaint.id}`}>{complaint.title}</Link>
            </h3>

            {/* Description Snippet */}
            <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {complaint.description}
            </p>

            {/* Location & Metadata Details (Clean unboxed style per anti-slop guidelines) */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="truncate" title={complaint.address}>
                  {complaint.address}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {formattedDate}
                </span>
                <span aria-hidden="true">·</span>
                <span className="truncate max-w-[130px]" title={complaint.ward}>
                  {complaint.ward.split('-')[0].trim()}
                </span>
                <span aria-hidden="true">·</span>
                <PriorityBadge priority={complaint.priority} size="sm" />
              </div>

              {complaint.assigned_department && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                  <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{complaint.assigned_department}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Footer Action */}
        <div className="p-4 sm:p-5 pt-0">
          <Link
            to={`/complaints/${complaint.id}`}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-blue-700 bg-blue-50/70 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
          >
            <span>View Timeline &amp; Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <ImageLightboxModal
        isOpen={isPhotoOpen}
        onClose={() => setIsPhotoOpen(false)}
        imageUrl={complaint.image_url}
        title={complaint.title}
        subtitle={`${complaint.complaint_number} · ${complaint.address}`}
      />
    </>
  );
};
