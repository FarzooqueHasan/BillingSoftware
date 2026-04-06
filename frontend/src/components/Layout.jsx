import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Receipt, BookOpen, Settings, LogOut, Package } from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
        isActive
          ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
          : 'text-slate-500 hover:bg-slate-50 hover:text-primary-600'
      }`
    }
  >
    <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
    <span className="font-medium">{children}</span>
  </NavLink>
);

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white p-6 flex flex-col gap-8 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-primary-500/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">Scholars</h1>
            <p className="text-xs text-slate-400 font-medium">Billing System</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          <SidebarLink to="/" icon={LayoutDashboard}>Dashboard</SidebarLink>
          <SidebarLink to="/pos" icon={Receipt}>POS Billing</SidebarLink>
          <SidebarLink to="/inventory" icon={BookOpen}>Books & Bundles</SidebarLink>
          <SidebarLink to="/deliveries" icon={Package}>Deliveries</SidebarLink>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-2">
          <SidebarLink to="/settings" icon={Settings}>Settings</SidebarLink>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group">
            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
