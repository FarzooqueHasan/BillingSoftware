import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Placeholder Pages (To be implemented)
const Dashboard = () => (
  <div className="space-y-6 animate-fade-in text-slate-800">
    <div className="flex justify-between items-center bg-white/70 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl shadow-slate-100 italic">
      <h2 className="text-2xl font-bold tracking-tight">Overview Dashboard</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="w-12 h-12 bg-primary-100 rounded-xl mb-4" />
          <div className="h-4 w-24 bg-slate-100 rounded mb-2" />
          <div className="h-8 w-32 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  </div>
);

const POS = () => (
  <div className="space-y-6 animate-fade-in text-slate-800 italic bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-xl">
    <h2 className="text-3xl font-black tracking-tight text-primary-600 mb-6">Counter Billing Terminal</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-600 ml-1 uppercase tracking-wider">Student Name</span>
          <input type="text" placeholder="Enter full name..." className="input-field shadow-inner border-slate-200 focus:border-primary-500" />
        </label>
        <div className="w-full h-80 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 font-medium">
          Quick Item Selection
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 flex flex-col min-h-[500px]">
        <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">₹</span>
          Bill Summary
        </h3>
        <div className="flex-grow space-y-4 text-slate-300 text-center flex flex-col justify-center border-t border-b border-slate-50 py-10">
          No items added yet
        </div>
        <button className="btn-primary w-full h-14 text-lg font-bold mt-8 shadow-primary-500/40">
          Generate Bill
        </button>
      </div>
    </div>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="inventory" element={<div className="font-bold text-slate-400 italic">Inventory system coming soon...</div>} />
          <Route path="deliveries" element={<div className="font-bold text-slate-400 italic">Deliveries tracking coming soon...</div>} />
          <Route path="settings" element={<div className="font-bold text-slate-400 italic">Settings coming soon...</div>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
