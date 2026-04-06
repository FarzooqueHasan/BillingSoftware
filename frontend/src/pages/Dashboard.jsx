import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, Clock, IndianRupee, Filter, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getAllSales, getSalesMetrics } from '../services/api';
import { format } from 'date-fns';

const Dashboard = () => {
  const [sales, setSales] = useState([]);
  const [metrics, setMetrics] = useState({ totalRevenue: 0, todayRevenue: 0, pendingDeliveries: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, metricsRes] = await Promise.all([
          getAllSales(),
          getSalesMetrics()
        ]);
        setSales(salesRes.data);
        setMetrics(metricsRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const Card = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-${color}-500/5 rounded-full`} />
      <div className="relative z-10">
        <div className={`w-12 h-12 bg-${color}-50 text-${color}-600 rounded-2xl flex items-center justify-center mb-6 border border-${color}-100 transition-transform group-hover:scale-110 duration-500`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-sm font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{title}</div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {title.includes('Revenue') ? `₹${value.toLocaleString()}` : value}
          </div>
          {trend && (
            <div className={`flex items-center text-xs font-bold ${trend > 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
              {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-800 leading-none">Administration</h2>
          <p className="text-slate-500 font-medium mt-3 flex items-center gap-2">
            Performance analytics & transaction audit
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary h-11 flex items-center gap-2 px-4 shadow-sm border-slate-200">
            <Filter className="w-4 h-4" /> Filter Records
          </button>
          <button className="btn-primary h-11 flex items-center gap-2 px-5 shadow-lg shadow-primary-500/20">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card title="Today's Revenue" value={metrics.todayRevenue} icon={TrendingUp} color="primary" trend={12} />
        <Card title="Total Revenue" value={metrics.totalRevenue} icon={IndianRupee} color="emerald" />
        <Card title="Pending Deliveries" value={metrics.pendingDeliveries} icon={Package} color="amber" />
        <Card title="Total Sales" value={sales.length} icon={Clock} color="indigo" />
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800">Recent Transactions</h3>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-slate-100 italic">
            Live Updates
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-8 py-5">Bill No.</th>
                <th className="px-8 py-5">Student</th>
                <th className="px-8 py-5">Class</th>
                <th className="px-8 py-5 text-right">Amount</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right whitespace-nowrap">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-medium italic">
                    Loading records...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-medium italic">
                    No sales recorded yet.
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors group cursor-default">
                    <td className="px-8 py-6">
                      <span className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{sale.bill_number}</span>
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-700">{sale.student_name}</td>
                    <td className="px-8 py-6">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg uppercase">Cl. {sale.class}</span>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-slate-900 tabular-nums">₹{sale.total_amount}</td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        sale.delivered_status 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {sale.delivered_status ? 'Delivered' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right text-slate-400 text-xs font-bold tabular-nums">
                      {format(new Date(sale.timestamp), 'dd MMM yyyy, hh:mm a')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-50/30 border-t border-slate-50 text-center">
          <button className="text-primary-600 font-bold text-sm tracking-tight hover:underline">View All Historical Records</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
