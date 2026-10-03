import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import { useToast } from '../../context/ToastContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Search,
  User,
  LogOut,
  Clock,
  Wrench,
  CheckCircle2,
  BarChart3,
  Sliders,
  Shield,
  HelpCircle,
  Globe2,
} from 'lucide-react';

interface SidebarProps {
  mode?: 'citizen' | 'admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ mode }) => {
  const { user, isAdmin, logout } = useAuth();
  const { stats, complaints } = useComplaints();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const isCurrentAdminMode = mode === 'admin' || (isAdmin && mode !== 'citizen');

  const myComplaintsCount = complaints.filter(
    (c) =>
      c.user_id === user?.user_id ||
      c.user_id === user?.id ||
      c.citizen_email === user?.email ||
      (user?.email && c.citizen_email?.toLowerCase() === user.email.toLowerCase())
  ).length;

  const handleLogout = () => {
    logout();
    addToast('Signed out successfully.', 'info');
    navigate('/login');
  };

  const citizenNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Raise Complaint', path: '/raise-complaint', icon: PlusCircle },
    { name: 'My Complaints', path: '/my-complaints', icon: FileText, badge: myComplaintsCount },
    { name: 'Public Complaints', path: '/public-complaints', icon: Globe2 },
    { name: 'Track Complaint', path: '/track', icon: Search },
    { name: 'Citizen Profile', path: '/profile', icon: User },
  ];

  const adminNav = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'All Complaints', path: '/admin/complaints', icon: FileText, badge: stats.total },
    { name: 'Public Feed', path: '/public-complaints', icon: Globe2 },
    { name: 'Pending Review', path: '/admin/complaints?status=Under+Review', icon: Clock, badge: stats.underReview + stats.submitted },
    { name: 'In Progress', path: '/admin/complaints?status=In+Progress', icon: Wrench, badge: stats.inProgress },
    { name: 'Resolved', path: '/admin/complaints?status=Resolved', icon: CheckCircle2, badge: stats.resolved },
    { name: 'Analytics & Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Admin Settings', path: '/admin/settings', icon: Sliders },
  ];

  const items = isCurrentAdminMode ? adminNav : citizenNav;

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
          <img
            src={
              user?.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
            }
            alt={user?.name}
            className="w-10 h-10 rounded-full object-cover border border-slate-200"
          />
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900 truncate">{user?.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 truncate">
                {user?.user_id || user?.id || 'UID-Citizen'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
              <Shield className="w-3 h-3 text-blue-500" />
              <span className="capitalize">{user?.role || 'Citizen'}</span>
            </p>
          </div>
        </div>

        {/* Main Navigation Links */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            {isCurrentAdminMode ? 'Municipal Operations' : 'Citizen Services'}
          </p>
          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/admin' || item.path === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-bold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick Civic Info Box */}
        <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 text-blue-900 text-xs font-semibold mb-1">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Civic Helpline 24x7</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Need urgent grievance redressal? Call toll-free <strong>1800-425-1913</strong> or WhatsApp <strong>+91 94451 90000</strong>.
          </p>
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
