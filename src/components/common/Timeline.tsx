import React from 'react';
import { Complaint, ComplaintStatus } from '../../types';
import {
  Check,
  Clock,
  Search,
  UserCheck,
  Wrench,
  CheckCircle2,
  XCircle,
  Calendar,
  User as UserIcon,
} from 'lucide-react';

interface TimelineProps {
  complaint: Complaint;
  compact?: boolean;
}

const ORDERED_STAGES: { status: ComplaintStatus; label: string; icon: React.ElementType }[] = [
  { status: 'Submitted', label: 'Submitted', icon: Clock },
  { status: 'Under Review', label: 'Under Review', icon: Search },
  { status: 'Assigned', label: 'Assigned', icon: UserCheck },
  { status: 'In Progress', label: 'In Progress', icon: Wrench },
  { status: 'Resolved', label: 'Resolved', icon: CheckCircle2 },
];

export const Timeline: React.FC<TimelineProps> = ({ complaint, compact = false }) => {
  const currentStatus = complaint.status;
  const isRejected = currentStatus === 'Rejected';

  const getStageIndex = (status: ComplaintStatus) => {
    switch (status) {
      case 'Submitted':
        return 0;
      case 'Under Review':
        return 1;
      case 'Assigned':
        return 2;
      case 'In Progress':
        return 3;
      case 'Resolved':
        return 4;
      case 'Rejected':
        return 1; // halted at review/assigned
      default:
        return 0;
    }
  };

  const currentIdx = getStageIndex(currentStatus);

  // If rejected, customize stages
  const stagesToRender = isRejected
    ? [
        { status: 'Submitted' as ComplaintStatus, label: 'Submitted', icon: Clock },
        { status: 'Under Review' as ComplaintStatus, label: 'Under Review', icon: Search },
        { status: 'Rejected' as ComplaintStatus, label: 'Rejected', icon: XCircle },
      ]
    : ORDERED_STAGES;

  // Format date helper
  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full">
      {/* Horizontal Step Progress Bar */}
      <div className="py-4">
        <div className="relative flex items-center justify-between">
          {/* Progress bar background line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-slate-200 z-0 rounded-full" />
          
          {/* Active progress fill */}
          <div
            className={`absolute top-1/2 left-0 h-1 -translate-y-1/2 z-0 rounded-full transition-all duration-500 ${
              isRejected ? 'bg-rose-500' : 'bg-emerald-600'
            }`}
            style={{
              width: `${(Math.min(currentIdx, stagesToRender.length - 1) / (stagesToRender.length - 1)) * 100}%`,
            }}
          />

          {stagesToRender.map((stage, idx) => {
            const isCompleted = isRejected
              ? idx < stagesToRender.length - 1
              : idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            const Icon = stage.icon;

            return (
              <div key={stage.status} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${
                    stage.status === 'Rejected'
                      ? 'bg-rose-600 text-white ring-4 ring-rose-100'
                      : isCompleted
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                      : 'bg-white text-slate-400 border-2 border-slate-300'
                  }`}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium text-center whitespace-nowrap hidden sm:block ${
                    isCurrent
                      ? 'text-slate-900 font-bold'
                      : isCompleted
                      ? 'text-emerald-700'
                      : 'text-slate-500'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Chronological Updates List */}
      {!compact && complaint.updates && complaint.updates.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Official Audit Trail &amp; Updates ({complaint.updates.length})
          </h4>
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {complaint.updates
              .slice()
              .reverse()
              .map((update, index) => (
                <div key={update.id} className="relative group">
                  {/* Timeline bullet dot */}
                  <div
                    className={`absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                      index === 0
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-slate-300 group-hover:border-blue-400'
                    }`}
                  />
                  <div className="bg-slate-50 hover:bg-slate-100/80 transition-colors p-3.5 rounded-xl border border-slate-200/80">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                          {update.status}
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <UserIcon className="w-3 h-3 text-slate-400" />
                          {update.updated_by}
                          {update.updated_by_role && (
                            <span className="text-[11px] font-normal text-slate-500">
                              ({update.updated_by_role})
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-slate-600">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDate(update.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed font-normal">
                      {update.message}
                    </p>
                    {update.attachment_url && (
                      <div className="mt-2.5">
                        <a
                          href={update.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          <span>View attached on-site resolution evidence photo</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
