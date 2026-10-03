import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../data/mockData';
import { getCategoryIcon } from '../utils/categoryIcons';
import {
  ShieldCheck,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Camera,
  MapPin,
  Building2,
  Phone,
  Mail,
  HeartHandshake,
  Check,
  TrendingUp,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { stats, complaints } = useComplaints();
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [quickTrackId, setQuickTrackId] = useState('');

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackId.trim()) {
      navigate(`/track?id=${encodeURIComponent(quickTrackId.trim())}`);
    } else {
      navigate('/track');
    }
  };

  const resolvedShowcases = complaints.filter(
    (c) => c.status === 'Resolved' && c.resolved_image_url
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Civic Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200 mb-8">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official Citizen Grievance &amp; Civic Redressal Portal</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Report. Track.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
              Improve Your Community.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Raise civic complaints and track their progress in real-time. Direct collaboration
            between citizens and municipal corporations for cleaner, safer neighborhoods.
          </p>

          {/* Hero Action CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-lg mx-auto">
            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-102"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Go to {isAdmin ? 'Admin Console' : 'Citizen Dashboard'}</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login?role=citizen"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-102"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Citizen Login / புகார் பதிவு</span>
                </Link>

                <Link
                  to="/login?role=admin"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-102"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Login / மாநகராட்சி</span>
                </Link>
              </>
            )}

            <Link
              to="/track"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Track Status</span>
            </Link>
          </div>

          {/* Quick Track Input Bar directly in hero */}
          <div className="mt-12 max-w-lg mx-auto bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20">
            <form onSubmit={handleQuickTrack} className="flex gap-2">
              <input
                type="text"
                value={quickTrackId}
                onChange={(e) => setQuickTrackId(e.target.value)}
                placeholder="Enter Complaint ID (e.g. CC-2026-89412)..."
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-white text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shrink-0"
              >
                Track Now
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Live Civic Performance Metrics Bar */}
      <section className="relative -mt-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xl">
          <div className="p-3 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-500 text-xs font-semibold mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Total Grievances</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats.total + 1284}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Across all 15 Municipal Wards</p>
          </div>

          <div className="p-3 text-center sm:text-left border-l border-slate-100">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-500 text-xs font-semibold mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Resolved Issues</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {stats.resolved + 1190}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">92.4% On-time redressal rate</p>
          </div>

          <div className="p-3 text-center sm:text-left border-l border-slate-100">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-500 text-xs font-semibold mb-1">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Avg. Resolution Time</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats.avgResolutionHours} hrs
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">From triage to field verification</p>
          </div>

          <div className="p-3 text-center sm:text-left border-l border-slate-100">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-500 text-xs font-semibold mb-1">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Active Departments</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-700">9 Units</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Sanitation, Roads, Power, Water</p>
          </div>
        </div>
      </section>

      {/* Categories We Handle */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            What Civic Issues Can You Report?
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Select a category to lodge your complaint with automated routing to the designated municipal engineering wing.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              to={`/raise-complaint?category=${encodeURIComponent(category)}`}
              className="bg-white p-5 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all group flex items-start gap-3.5"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {getCategoryIcon(category, 'w-5 h-5')}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {category}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Fast dispatch to dedicated zonal maintenance squads.
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              How CivicConnect Works
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Three streamlined steps from citizen complaint to verified on-ground municipal fix.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold mb-4 shadow-sm">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                1. Capture &amp; Submit Issue
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Take a quick photo of the pothole, trash overflow, or broken light. Our system auto-tags GPS coordinates and issues an instant tracking ID.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-blue-600">
                <Camera className="w-4 h-4" />
                <span>Geotagged Photo Evidence</span>
              </div>
            </div>

            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold mb-4 shadow-sm">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                2. Municipal Triaging &amp; Dispatch
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Civic triage engineers review the report, assign the appropriate executive officer, and schedule specialized machinery or field staff.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-600">
                <Building2 className="w-4 h-4" />
                <span>Departmental Accountability</span>
              </div>
            </div>

            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg font-bold mb-4 shadow-sm">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                3. Resolution &amp; Public Proof
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Once repaired, the officer uploads photographic completion proof. Citizens receive live SMS/portal updates and rate the service quality.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Resolution Photo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public Resolved Showcases / Before & After */}
      {resolvedShowcases.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Citizen Impact
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Recently Resolved In Your City
              </h2>
            </div>
            <Link
              to="/public-complaints"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View all public complaints</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {resolvedShowcases.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-2 h-48 bg-slate-100">
                  <div className="relative">
                    <img
                      src={item.image_url}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      Reported Issue
                    </span>
                  </div>
                  <div className="relative border-l border-white">
                    <img
                      src={item.resolved_image_url}
                      alt="After Resolution"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      Repaired &amp; Cleared
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span className="font-mono text-slate-600">{item.complaint_number}</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Resolved in {(item.ward || 'Ward 12').split('-')[0]}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{item.description}</p>
                  {item.feedback && (
                    <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 italic">
                      &ldquo;{item.feedback}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold text-white">CivicConnect</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empowering citizens to report municipal grievances and fostering collaborative, transparent public governance.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Emergency &amp; Helpline
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>24x7 Control Room: 1800-425-1913</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sanitation Flying Squad: 1913</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>support@civicconnect.gov.in</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Quick Navigation
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <Link to="/raise-complaint" className="hover:text-white transition-colors">
                    Raise a New Grievance
                  </Link>
                </li>
                <li>
                  <Link to="/public-complaints" className="hover:text-white transition-colors">
                    Public Complaints Feed
                  </Link>
                </li>
                <li>
                  <Link to="/track" className="hover:text-white transition-colors">
                    Track Complaint Status
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-white transition-colors">
                    Municipal Admin Portal
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Civic Citizen Pledge
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                &ldquo;Together we build safer roads, cleaner streets, and sustainable urban communities for everyone.&rdquo;
              </p>
              <div className="mt-3 flex items-center gap-2 text-emerald-400 text-xs font-medium">
                <HeartHandshake className="w-4 h-4" />
                <span>Verified Public Good Initiative</span>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
            &copy; 2026 CivicConnect Municipal Corporation. All citizen rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
