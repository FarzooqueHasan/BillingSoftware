import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, Search, RefreshCw, XCircle } from 'lucide-react';
import { getAllSales, updateDeliveryStatus } from '../services/api';
import { format } from 'date-fns';

const Deliveries = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await getAllSales();
      setSales(res.data);
    } catch (err) {
      console.error('Failed to fetch sales', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    setUpdatingId(id);
    try {
      await updateDeliveryStatus(id, !currentStatus);
      // Optimistically update
      setSales(prev => prev.map(s => s.id === id ? { ...s, delivered_status: !currentStatus ? 1 : 0 } : s));
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingSales = sales.filter(s => s.delivered_status === 0);
  const deliveredSales = sales.filter(s => s.delivered_status === 1);

  const filteredPending = pendingSales.filter(s => 
    s.student_name.toLowerCase().includes(search.toLowerCase()) || 
    s.bill_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-800 leading-none">Deliveries</h2>
          <p className="text-slate-500 font-medium mt-3 flex items-center gap-2">
            Track and fulfill pending student orders
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search student or bill..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10 shadow-sm w-64"
            />
          </div>
          <button onClick={fetchSales} className="btn-secondary h-11 px-4 shadow-sm border-slate-200" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Package className="text-amber-500" />
          Pending Fulfillment ({pendingSales.length})
        </h3>
        
        {filteredPending.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
             </div>
             <p className="text-slate-500 font-bold text-lg">All caught up! No pending deliveries.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPending.map(sale => (
              <div key={sale.id} className="bg-white border text-left border-rose-100 shadow-xl shadow-rose-500/5 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 bg-rose-50 rounded-full transition-transform group-hover:scale-150 duration-500 z-0"></div>
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-start">
                     <div>
                       <div className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">{sale.bill_number}</div>
                       <div className="text-lg font-black text-slate-800 leading-tight">{sale.student_name}</div>
                       <div className="text-xs font-bold text-slate-400 mt-1">Class {sale.class}</div>
                     </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-xs font-medium text-slate-600 line-clamp-2">
                    {/* Items preview */}
                    {(() => {
                        try {
                           const items = JSON.parse(sale.items_json);
                           return items.map(i => i.name).join(', ');
                        } catch(e) { return 'Items unavailable'; }
                    })()}
                  </div>
                  <button 
                    onClick={() => handleToggleStatus(sale.id, sale.delivered_status === 1)}
                    disabled={updatingId === sale.id}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2"
                  >
                    {updatingId === sale.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Mark as Delivered
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12 pt-8 border-t border-slate-200">
        <h3 className="text-lg font-bold text-slate-400 flex items-center gap-2 mb-6">
          <CheckCircle className="w-5 h-5" />
          Recently Delivered ({deliveredSales.length})
        </h3>
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
           {deliveredSales.slice(0, 5).map(sale => (
             <div key={sale.id} className="p-4 border-b border-slate-50 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                     <CheckCircle className="w-5 h-5" />
                   </div>
                   <div>
                     <div className="font-bold text-slate-700">{sale.student_name}</div>
                     <div className="text-xs font-bold text-slate-400 uppercase">{sale.bill_number} • Class {sale.class}</div>
                   </div>
                </div>
                <button onClick={() => handleToggleStatus(sale.id, true)} className="text-xs font-bold text-slate-400 hover:text-rose-500 uppercase tracking-wider flex items-center gap-1 transition-colors">
                  <XCircle className="w-3 h-3" /> Revert
                </button>
             </div>
           ))}
           {deliveredSales.length === 0 && (
             <div className="p-8 text-center text-slate-400 font-medium italic">No recent deliveries found.</div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Deliveries;
