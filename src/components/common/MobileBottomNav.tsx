import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Search,
  User,
  Shield,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {isAdmin ? (
          <>
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>Admin</span>
            </NavLink>
            <NavLink
              to="/admin/complaints"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <FileText className="w-5 h-5 mb-0.5" />
              <span>Complaints</span>
            </NavLink>
            <NavLink
              to="/track"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Search className="w-5 h-5 mb-0.5" />
              <span>Track</span>
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Shield className="w-5 h-5 mb-0.5" />
              <span>Profile</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>Home</span>
            </NavLink>
            <NavLink
              to="/raise-complaint"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <PlusCircle className="w-5 h-5 mb-0.5 text-blue-600" />
              <span>Report</span>
            </NavLink>
            <NavLink
              to="/my-complaints"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <FileText className="w-5 h-5 mb-0.5" />
              <span>Complaints</span>
            </NavLink>
            <NavLink
              to="/track"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Search className="w-5 h-5 mb-0.5" />
              <span>Track</span>
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <User className="w-5 h-5 mb-0.5" />
              <span>Profile</span>
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};
