import React from 'react';
import { CATEGORIES, WARDS } from '../../data/mockData';
import { FilterState } from '../../types';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface ComplaintFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatches: number;
  showWardFilter?: boolean;
}

const STATUS_OPTIONS = [
  'All',
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected',
];

export const ComplaintFilters: React.FC<ComplaintFiltersProps> = ({
  filters,
  setFilters,
  totalMatches,
  showWardFilter = true,
}) => {
  const hasActiveFilters =
    filters.search ||
    filters.category !== 'All' ||
    filters.status !== 'All' ||
    filters.priority !== 'All' ||
    filters.ward !== 'All' ||
    Boolean(filters.userId) ||
    (filters.dateFilter && filters.dateFilter !== 'all');

  const resetFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      status: 'All',
      priority: 'All',
      ward: 'All',
      userId: '',
      dateFilter: 'all',
      sortBy: 'date_desc',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs mb-6">
      {/* Search and Quick Row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Complaint ID (e.g. CC-2026-...), User ID (e.g. UID-2026-...), Title, or Address..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-900 placeholder:text-slate-400"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Sort:</span>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sortBy: e.target.value as FilterState['sortBy'],
              }))
            }
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="priority_desc">Highest Priority</option>
          </select>
        </div>
      </div>

      {/* Filter Dropdowns Row */}
      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* Category */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st === 'All' ? 'All Statuses' : st}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
            className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Date
          </label>
          <select
            value={filters.dateFilter || 'all'}
            onChange={(e) => setFilters((prev) => ({ ...prev, dateFilter: e.target.value }))}
            className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">Past 7 Days</option>
            <option value="month">Past 30 Days</option>
          </select>
        </div>

        {/* User ID Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            User ID
          </label>
          <input
            type="text"
            placeholder="e.g. UID-2026..."
            value={filters.userId || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, userId: e.target.value }))}
            className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
        </div>

        {/* Ward */}
        {showWardFilter && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Ward / Zone
            </label>
            <select
              value={filters.ward}
              onChange={(e) => setFilters((prev) => ({ ...prev, ward: e.target.value }))}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="All">All Wards</option>
              {WARDS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Active filters bar and results count */}
      <div className="mt-3 pt-2.5 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Found <strong className="text-slate-900">{totalMatches}</strong> complaint
            {totalMatches === 1 ? '' : 's'}
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline cursor-pointer"
          >
            <X className="w-3 h-3" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};
