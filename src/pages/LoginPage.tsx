import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { WARDS } from '../data/mockData';
import { UserRole } from '../types';
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Building2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  X,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const initialRoleParam = searchParams.get('role');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  const { login, register, isAuthenticated, isAdmin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Unified Login state: single portal for admin1234 or User ID
  const [loginInput, setLoginInput] = useState(
    initialRoleParam === 'admin' ? 'admin1234' : 'UID-2026-10492'
  );
  const [loginPassword, setLoginPassword] = useState('password123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regWard, setRegWard] = useState(WARDS[0]);
  const [regRole, setRegRole] = useState<UserRole>('citizen');
  const [regPassword, setRegPassword] = useState('pass123');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  useEffect(() => {
    if (searchParams.get('tab') === 'register') {
      setActiveTab('register');
    }
    const r = searchParams.get('role');
    if (r === 'admin') {
      setLoginInput('admin1234');
      setLoginPassword('admin1234');
    } else if (r === 'citizen') {
      setLoginInput('UID-2026-10492');
      setLoginPassword('password123');
    }
  }, [searchParams]);

  // Realtime detection of admin1234 vs citizen User ID
  const cleanInput = loginInput.trim().toLowerCase();
  const isAdminInput =
    cleanInput === 'admin1234' ||
    cleanInput === 'admin' ||
    cleanInput.includes('commissioner') ||
    cleanInput.includes('admin') ||
    loginPassword.trim() === 'admin1234';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim()) {
      addToast('Please enter admin1234 or your User ID.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const clean = loginInput.trim().toLowerCase();
      // If admin1234 is given -> admin role, otherwise -> citizen role
      const isTargetAdmin =
        clean === 'admin1234' ||
        clean === 'admin' ||
        clean.includes('commissioner') ||
        clean.includes('admin') ||
        loginPassword.trim() === 'admin1234';

      const determinedRole: UserRole = isTargetAdmin ? 'admin' : 'citizen';
      const effectivePassword =
        loginPassword.trim() || (isTargetAdmin ? 'admin1234' : 'password123');

      const success = await login(loginInput.trim(), determinedRole, effectivePassword);
      if (success) {
        if (determinedRole === 'admin') {
          addToast('Admin Login Verified (admin1234)! Welcome to Municipal Operations.', 'success');
          navigate('/admin');
        } else {
          addToast(`User Login Verified (${loginInput.trim()})! Welcome to Citizen Portal.`, 'success');
          navigate('/dashboard');
        }
      } else {
        addToast(
          isTargetAdmin
            ? 'Invalid Admin Credentials. Enter admin1234 to access admin console.'
            : 'Login failed. Please verify credentials.',
          'error'
        );
      }
    } catch (err: any) {
      addToast(err?.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      addToast('Please fill in your full name and email.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        phone: regPhone.trim() || '+91 98400 99881',
        address: regAddress.trim() || 'Ward 12, Anna Nagar West',
        ward: regWard,
        role: regRole,
      });

      if (success) {
        addToast('Account created successfully! Unique User ID generated.', 'success');
        navigate(regRole === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (err: any) {
      addToast(err?.message || 'Registration failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillAdmin = () => {
    setLoginInput('admin1234');
    setLoginPassword('admin1234');
  };

  const handleFillUser = () => {
    setLoginInput('UID-2026-10492');
    setLoginPassword('password123');
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      addToast('Please provide your registered email address.', 'error');
      return;
    }
    setShowForgotModal(false);
    addToast(
      `Password reset instructions have been dispatched to ${forgotEmail}.`,
      'success'
    );
    setForgotEmail('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full">
        {/* App Title & Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              CivicConnect
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900">
            {activeTab === 'login' ? 'Unified Login Portal' : 'Create CivicConnect Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Type <strong className="font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">admin1234</strong> for Admin Portal, or enter your <strong className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">User ID</strong> for Citizen Portal.
          </p>
        </div>

        {/* Quick 1-Click Fast Fill Buttons */}
        <div className="mb-5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Quick 1-Click Credentials:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleFillAdmin}
              className={`p-2.5 text-left rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                isAdminInput
                  ? 'bg-purple-100/70 border-purple-400 text-purple-900 ring-2 ring-purple-400/20'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300'
              }`}
            >
              <div className="font-bold text-purple-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>admin1234</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">&rarr; Admin Dashboard</div>
            </button>

            <button
              type="button"
              onClick={handleFillUser}
              className={`p-2.5 text-left rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                !isAdminInput
                  ? 'bg-blue-100/70 border-blue-400 text-blue-900 ring-2 ring-blue-400/20'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
              }`}
            >
              <div className="font-bold text-blue-800 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>UID-2026-10492</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">&rarr; User Dashboard</div>
            </button>
          </div>
        </div>

        {/* Tab switch container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6">
          <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Login Portal
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New User Register
            </button>
          </div>

          {activeTab === 'login' ? (
            /* Unified Single Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Dynamic Role Indicator Banner */}
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                  isAdminInput
                    ? 'bg-purple-50 border-purple-200 text-purple-900'
                    : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isAdminInput ? (
                    <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                  ) : (
                    <User className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold block">
                      {isAdminInput ? 'Admin Credentials Detected' : 'Citizen Credentials Detected'}
                    </span>
                    <span className="text-[11px] opacity-80">
                      {isAdminInput
                        ? 'Will automatically route to Municipal Admin Console (/admin)'
                        : 'Will automatically route to Citizen Portal (/dashboard)'}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    isAdminInput ? 'bg-purple-200 text-purple-800' : 'bg-blue-200 text-blue-800'
                  }`}
                >
                  {isAdminInput ? 'Admin' : 'User'}
                </span>
              </div>

              {/* Single Login Identifier Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter Admin ID or User ID:
                </label>
                <div className="relative">
                  {isAdminInput ? (
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
                  ) : (
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                  )}
                  <input
                    type="text"
                    required
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Enter 'admin1234' or your User ID..."
                    className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-mono text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Type <strong className="text-purple-700 font-mono">admin1234</strong> for Admin, or any <strong className="text-blue-700 font-mono">User ID / Email</strong> for User.
                </p>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-800"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder={isAdminInput ? 'admin1234' : '••••••••'}
                    className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Unified Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2.5 px-4 text-xs font-bold text-white rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                  isAdminInput
                    ? 'bg-purple-700 hover:bg-purple-800'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <span>
                  {isSubmitting
                    ? 'Authenticating...'
                    : isAdminInput
                    ? 'Login as Municipal Admin (admin1234) →'
                    : 'Login to User Portal →'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Ananya Sundaram"
                    className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ananya@example.com"
                    className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98400..."
                      className="w-full pl-8 pr-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-medium"
                  >
                    <option value="citizen">Citizen</option>
                    <option value="admin">Municipal Officer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ward / Locality
                </label>
                <select
                  value={regWard}
                  onChange={(e) => setRegWard(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  {WARDS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Street Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="House / Flat No., Street Name"
                    className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Register &amp; Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Reset Password</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Enter your registered email address or mobile number. We will send a secure link to reset your CivicConnect credentials.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="text"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter email or phone..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
