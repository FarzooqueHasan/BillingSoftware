import React, { useState, useEffect } from 'react';
import { BookOpen, PackageOpen, Plus, FileText, IndianRupee } from 'lucide-react';
import { getBooksByClass, getBundlesByClass, createBook, createBundle } from '../services/api';

const CLASSES = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('books');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  
  const [books, setBooks] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', class: '1', price: '', total_price: '' });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      // In a real optimized system, we'd add getAll endpoints or paginate.
      // For immediate offline use, we'll fetch across classes if no class filtered, 
      // but let's just fetch for the selected class to keep it fast.
      if (selectedClassFilter) {
          const [bks, bnds] = await Promise.all([
             getBooksByClass(selectedClassFilter),
             getBundlesByClass(selectedClassFilter)
          ]);
          setBooks(bks.data);
          setBundles(bnds.data);
      } else {
          // If no filter, we could pull all. But our API currently only exposes /books and /bundles
          // Let's just fetch all using the root endpoints
          const resBooks = await fetch('http://localhost:5000/api/books').then(r => r.json());
          const resBundles = await fetch('http://localhost:5000/api/books/bundles').then(r => r.json());
          setBooks(resBooks);
          setBundles(resBundles);
      }
    } catch (err) {
      console.error('Failed to fetch inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedClassFilter]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'books') {
        const payload = { ...formData, price: parseFloat(formData.price) };
        await createBook(payload); // We need to add createBook/createBundle to api.js
      } else {
        const payload = { ...formData, total_price: parseFloat(formData.total_price) };
        await createBundle(payload);
      }
      setShowForm(false);
      setFormData({ name: '', class: '1', price: '', total_price: '' });
      fetchInventory();
    } catch (err) {
       console.error(err);
       alert("Failed to add item.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-800 leading-none">Inventory Vault</h2>
          <p className="text-slate-500 font-medium mt-3 flex items-center gap-2">
            Read-only audit ledger of all registered stock.
          </p>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedClassFilter} 
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="input-field shadow-sm border-slate-200"
          >
            <option value="">All Classes</option>
            {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
          <button 
             onClick={() => setShowForm(!showForm)}
             className="btn-primary h-11 flex items-center gap-2 px-5 shadow-lg shadow-primary-500/20"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </header>

      {/* Manual Entry Form */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl animate-slide-up text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 -mt-16 -mr-16 bg-primary-500/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
               <Plus className="w-5 h-5 text-primary-400" />
               Manual Entry Configuration
            </h3>

            <div className="flex gap-2 mb-6 p-1 bg-slate-800/50 rounded-xl inline-flex backdrop-blur-sm border border-slate-700/50">
               <button 
                  onClick={() => setActiveTab('books')}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'books' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
               >
                 Individual Book
               </button>
               <button 
                  onClick={() => setActiveTab('bundles')}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'bundles' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
               >
                 Class Bundle
               </button>
            </div>

            <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="space-y-2 md:col-span-2">
                 <label className="text-xs font-bold text-slate-400 shadow-sm uppercase tracking-wider block">Item Name</label>
                 <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field bg-slate-800 border-slate-700 text-white placeholder-slate-500" placeholder="e.g. Mathematics Vol 2"/>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 shadow-sm uppercase tracking-wider block">Class</label>
                 <select required value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="input-field bg-slate-800 border-slate-700 text-white">
                    {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 shadow-sm uppercase tracking-wider block">Price (₹)</label>
                 <input 
                   required 
                   type="number" 
                   value={activeTab === 'books' ? formData.price : formData.total_price} 
                   onChange={e => {
                     if(activeTab === 'books') setFormData({...formData, price: e.target.value});
                     else setFormData({...formData, total_price: e.target.value});
                   }}
                   className="input-field bg-slate-800 border-slate-700 text-white placeholder-slate-500 font-bold tabular-nums" 
                   placeholder="0.00"
                 />
              </div>
              <div className="md:col-span-4 flex justify-end mt-2 gap-4">
                 <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white text-sm font-bold transition-colors">Cancel</button>
                 <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/30">
                    Save to Database
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
               <BookOpen className="w-8 h-8" />
            </div>
            <div>
               <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Books Configured</div>
               <div className="text-3xl font-black text-slate-900">{books.length}</div>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
               <PackageOpen className="w-8 h-8" />
            </div>
            <div>
               <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Bundles Configured</div>
               <div className="text-3xl font-black text-slate-900">{bundles.length}</div>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="flex border-b border-slate-50">
           <button 
             className={`flex-1 py-5 text-sm font-black uppercase tracking-widest transition-colors ${activeTab === 'books' ? 'bg-slate-50 text-primary-600 border-b-2 border-primary-500' : 'text-slate-400 hover:bg-slate-50/50'}`}
             onClick={() => setActiveTab('books')}
           >
             Individual Books
           </button>
           <button 
             className={`flex-1 py-5 text-sm font-black uppercase tracking-widest transition-colors ${activeTab === 'bundles' ? 'bg-slate-50 text-primary-600 border-b-2 border-primary-500' : 'text-slate-400 hover:bg-slate-50/50'}`}
             onClick={() => setActiveTab('bundles')}
           >
             Class Bundles
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-8 py-5">System ID</th>
                <th className="px-8 py-5">Name</th>
                <th className="px-8 py-5">Class Target</th>
                <th className="px-8 py-5 text-right">Unit Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-medium italic">
                    Loading inventory...
                  </td>
                </tr>
              ) : (activeTab === 'books' ? books : bundles).length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-medium italic">
                    No items found matching criteria.
                  </td>
                </tr>
              ) : (
                (activeTab === 'books' ? books : bundles).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="font-bold text-slate-400 font-mono text-xs">#{item.id.toString().padStart(4, '0')}</span>
                    </td>
                    <td className="px-8 py-5 font-bold text-slate-700 flex items-center gap-3">
                      {activeTab === 'books' ? <FileText className="w-4 h-4 text-slate-300" /> : <PackageOpen className="w-4 h-4 text-slate-300" />}
                      {item.name}
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg uppercase">Class {item.class}</span>
                    </td>
                    <td className="px-8 py-5 text-right flex items-center justify-end gap-1 font-black text-slate-900 tabular-nums">
                      <IndianRupee className="w-3 h-3 text-emerald-500" />{item.price || item.total_price}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
