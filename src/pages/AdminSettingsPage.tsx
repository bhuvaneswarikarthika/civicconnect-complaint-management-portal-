import React, { useState } from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { useToast } from '../context/ToastContext';
import { useComplaints } from '../context/ComplaintContext';
import { Sliders, Bell, Mail, Shield, Smartphone, Save, Database, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { addToast } = useToast();
  const { dbStatus } = useComplaints();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [autoTriage, setAutoTriage] = useState(true);
  const [slaHours, setSlaHours] = useState('48');
  const [copied, setCopied] = useState(false);

  const sampleUri = 'mongodb+srv://bhuvaneswarikarthika51_db_user:karthika11@cluster0.m23arlw.mongodb.net/civicconnect?retryWrites=true&w=majority&appName=Cluster0';

  const handleCopyUri = () => {
    navigator.clipboard.writeText(`MONGODB_URI="${sampleUri}"`);
    setCopied(true);
    addToast('MongoDB URI template copied!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Municipal system configurations successfully updated.', 'success');
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar mode="admin" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full pb-20 lg:pb-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
            <Sliders className="w-4 h-4" />
            <span>Administrative Controls</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Portal Operations &amp; SLA Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure automated triage, database connectivity, and citizen notification webhooks.
          </p>
        </div>

        {/* Database Live Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Database Connection Status</span>
            </h3>
            <span
              className={`text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 ${
                dbStatus.mongoConfigured
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {dbStatus.mongoConfigured ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>MongoDB Atlas Connected</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Active Engine: {dbStatus.database}</span>
                </>
              )}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            CivicConnect is engineered with a hybrid persistence layer. It runs out of the box with zero setup, and automatically switches to <strong>MongoDB Atlas</strong> when your <code>MONGODB_URI</code> environment variable is set.
          </p>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-700">How to configure MongoDB Atlas:</span>
              <button
                type="button"
                onClick={handleCopyUri}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy env format'}</span>
              </button>
            </div>
            <code className="font-mono text-[11px] text-slate-800 bg-white p-2 rounded block border border-slate-200 overflow-x-auto">
              MONGODB_URI="{sampleUri}"
            </code>
            <ol className="list-decimal list-inside text-[11px] text-slate-500 mt-2 space-y-1">
              <li>Create a free cluster on <a href="https://www.mongodb.com/atlas" target="_blank" rel="noreferrer" className="text-blue-600 underline">MongoDB Atlas</a>.</li>
              <li>Under Database Access, create a database user and password.</li>
              <li>Under Network Access, allow IP Address <code className="bg-slate-200/80 px-1 rounded">0.0.0.0/0</code>.</li>
              <li>Set <code className="bg-slate-200/80 px-1 rounded">MONGODB_URI</code> in your environment or secrets.</li>
            </ol>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Citizen Notification Gateway
            </h3>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Email Status Notifications</p>
                  <p className="text-[11px] text-slate-500">
                    Dispatch email alerts when complaint status changes to In Progress or Resolved.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-slate-800">SMS / WhatsApp Alerts</p>
                  <p className="text-[11px] text-slate-500">
                    Send SMS tracking PIN upon complaint registration.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Automated Dispatch &amp; SLA Compliance
            </h3>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Automated Department Routing</p>
                  <p className="text-[11px] text-slate-500">
                    Auto-route categories to designated engineering wings upon citizen submission.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoTriage}
                onChange={(e) => setAutoTriage(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Citizen Redressal SLA Escalation Mandate (Hours)
              </label>
              <input
                type="number"
                value={slaHours}
                onChange={(e) => setSlaHours(e.target.value)}
                className="w-32 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Flag complaints exceeding this threshold directly to the Municipal Commissioner desk.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
