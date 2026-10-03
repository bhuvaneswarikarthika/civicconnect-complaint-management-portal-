import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheck,
  PlusCircle,
  Search,
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Repeat,
  Building,
  Home,
  Bell,
  Globe2,
  ArrowRight,
  Clock,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout, switchRole } = useAuth();
  const { complaints } = useComplaints();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Compute live notifications for the logged in user's complaints
  const userNotifications = complaints
    .filter(
      (c) =>
        c.user_id === user?.user_id ||
        c.user_id === user?.id ||
        c.citizen_email === user?.email ||
        (user?.email && c.citizen_email?.toLowerCase() === user.email.toLowerCase())
    )
    .flatMap((c) =>
      (c.updates || [])
        .filter(
          (u) =>
            u.updated_by_role === 'admin' ||
            u.updated_by_role === 'staff' ||
            (u.updated_by || '').toLowerCase().includes('desk') ||
            (u.updated_by || '').toLowerCase().includes('officer')
        )
        .map((u) => ({
          ...u,
          complaint_id: c.id,
          complaint_number: c.complaint_number,
          complaint_title: c.title,
        }))
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const unreadNotifCount = userNotifications.length;

  const handleRoleToggle = () => {
    const nextRole = isAdmin ? 'citizen' : 'admin';
    switchRole(nextRole);
    addToast(
      `Switched view to ${nextRole === 'admin' ? 'Municipal Admin / Officer' : 'Citizen'} mode.`,
      'info'
    );
    if (nextRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    addToast('You have been signed out successfully.', 'info');
    navigate('/login');
  };

  const navLinks = isAuthenticated
    ? isAdmin
      ? [
          { name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
          { name: 'All Complaints', path: '/admin/complaints', icon: FileText },
          { name: 'Public Feed', path: '/public-complaints', icon: Globe2 },
          { name: 'Reports & Analytics', path: '/admin/reports', icon: Building },
          { name: 'Settings', path: '/admin/settings', icon: ShieldCheck },
        ]
      : [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Raise Complaint', path: '/raise-complaint', icon: PlusCircle },
          { name: 'My Complaints', path: '/my-complaints', icon: FileText },
          { name: 'Public Complaints', path: '/public-complaints', icon: Globe2 },
          { name: 'Track Status', path: '/track', icon: Search },
        ]
    : [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Public Complaints', path: '/public-complaints', icon: Globe2 },
        { name: 'Track Complaint', path: '/track', icon: Search },
      ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  CivicConnect
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-1">
                  Citizen Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Utility Controls */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Quick Role Switcher Pill (only when logged in) */}
            {isAuthenticated && (
              <button
                onClick={handleRoleToggle}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-xs cursor-pointer ${
                  isAdmin
                    ? 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                }`}
                title="Click to switch instantly between Citizen and Admin persona"
              >
                <Repeat className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Role:{' '}
                  <strong className="font-semibold">
                    {isAdmin ? 'Admin / Officer' : 'Citizen'}
                  </strong>
                </span>
                <span className="text-[10px] text-slate-500 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">
                  Switch
                </span>
              </button>
            )}

            {isAuthenticated && !isAdmin && (
              <Link
                to="/raise-complaint"
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs shadow-blue-500/20 transition-all hover:shadow"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Raise Complaint</span>
              </Link>
            )}

            {/* Notification Bell (Citizens & Admins) */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setUserDropdownOpen(false);
                  }}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Official Municipal Updates & Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotifCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setNotifDropdownOpen(false)}
                  >
                    <div className="px-4 pb-2 mb-2 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <Bell className="w-3.5 h-3.5 text-blue-600" />
                        <span>Official Notices &amp; Responses</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {unreadNotifCount} updates
                      </span>
                    </div>

                    {userNotifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-500">
                        <Clock className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                        <p className="font-semibold text-slate-700">All caught up!</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          No new messages or status changes from municipal officers.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 px-2">
                        {userNotifications.map((notif, idx) => (
                          <Link
                            key={idx}
                            to={`/complaints/${notif.complaint_id}`}
                            onClick={() => setNotifDropdownOpen(false)}
                            className="block p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                              <span className="font-mono font-bold text-blue-700">
                                {notif.complaint_number}
                              </span>
                              <span>
                                {new Date(notif.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                              {notif.complaint_title}
                            </h4>
                            <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                              "{notif.message}"
                            </p>
                            <span className="text-[10px] text-purple-700 font-semibold mt-1 inline-flex items-center gap-1">
                              <span>By: {notif.updated_by}</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}

                    <div className="px-3 pt-2 mt-1 border-t border-slate-100 text-center">
                      <Link
                        to="/my-complaints"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                      >
                        View all my complaints &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Dropdown / Login Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <img
                    src={
                      user?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
                    }
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-slate-400 capitalize">{user?.role}</p>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    {isAdmin ? (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>Admin Console</span>
                      </Link>
                    ) : (
                      <Link
                        to="/my-complaints"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>My Filed Complaints</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login?role=citizen"
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                  Citizen Login
                </Link>
                <Link
                  to="/login?role=admin"
                  className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                >
                  Admin Login
                </Link>
                <Link
                  to="/login?tab=register"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={handleRoleToggle}
              className="text-[11px] px-2 py-1 rounded bg-slate-100 font-semibold text-slate-700"
            >
              {isAdmin ? 'Admin' : 'Citizen'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 text-sm font-semibold rounded-lg ${
                isActive(link.path)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 px-3 py-1">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-[11px] text-slate-500">{user?.email}</p>
                </div>
              </div>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded"
              >
                My Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <div className="flex gap-2">
                <Link
                  to="/login?role=citizen"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  Citizen Login
                </Link>
                <Link
                  to="/login?role=admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg"
                >
                  Admin Login
                </Link>
              </div>
              <Link
                to="/login?tab=register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg"
              >
                Create New Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
