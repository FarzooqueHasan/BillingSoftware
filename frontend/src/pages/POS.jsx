import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, BookOpen, CreditCard, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { getBooksByClass, getBundlesByClass, createSale } from '../services/api';

const CLASSES = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const POS = () => {
  const [studentName, setStudentName] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [books, setBooks] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [amountPaid, setAmountPaid] = useState('');
  const [deliveredStatus, setDeliveredStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch books/bundles when class changes
  useEffect(() => {
    if (selectedClass) {
      const fetchData = async () => {
        try {
          const [booksRes, bundlesRes] = await Promise.all([
            getBooksByClass(selectedClass),
            getBundlesByClass(selectedClass)
          ]);
          setBooks(booksRes.data);
          setBundles(bundlesRes.data);
          // Auto-select the first bundle if available
          if (bundlesRes.data.length > 0) {
            handleSelectItem(bundlesRes.data[0], true);
          }
        } catch (err) {
          setError('Failed to fetch data for the selected class');
        }
      };
      fetchData();
    } else {
      setBooks([]);
      setBundles([]);
      setSelectedItems([]);
    }
  }, [selectedClass]);

  const handleSelectItem = (item, isBundle = false) => {
    const newItem = {
      ...item,
      isBundle,
      uniqueId: Date.now() + Math.random()
    };
    setSelectedItems(prev => [...prev, newItem]);
  };

  const removeItem = (uniqueId) => {
    setSelectedItems(prev => prev.filter(item => item.uniqueId !== uniqueId));
  };

  const totalAmount = selectedItems.reduce((sum, item) => sum + (item.price || item.total_price), 0);
  const changeReturned = Math.max(0, (parseFloat(amountPaid) || 0) - totalAmount);

  const handleSubmit = async () => {
    if (!studentName || !selectedClass || selectedItems.length === 0) {
      setError('Please fill all required fields and select items');
      return;
    }

    setLoading(true);
    setError(null);

    const saleData = {
      student_name: studentName,
      class: selectedClass,
      items: selectedItems,
      total_amount: totalAmount,
      amount_paid: parseFloat(amountPaid) || 0,
      change_returned: changeReturned,
      delivered_status: deliveredStatus
    };

    try {
      await createSale(saleData);
      setSuccess(true);
      // Reset form
      setStudentName('');
      setSelectedClass('');
      setSelectedItems([]);
      setAmountPaid('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to create sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex justify-between items-center bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl shadow-slate-100">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Counter Terminal</h2>
          <p className="text-slate-500 font-medium ml-1 flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Ready for transaction
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Current Date</span>
            <span className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 border border-primary-200">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-xl flex items-center gap-3 animate-slide-up">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-6 py-4 rounded-xl flex items-center gap-3 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Bill created successfully! Invoice printing...</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-500" /> Student Full Name
                </label>
                <input 
                  type="text" 
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter name (e.g., Rahul Sharma)" 
                  className="input-field shadow-sm bg-slate-50 border-slate-100 focus:bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary-500" /> Class Selection
                </label>
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="input-field shadow-sm bg-slate-50 border-slate-100 focus:bg-white cursor-pointer"
                >
                  <option value="">Select a class...</option>
                  {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
              </div>
            </div>

            {selectedClass && (
              <div className="space-y-6 border-t border-slate-50 pt-8 animate-fade-in">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                    Available Bundles
                    <span className="px-2 py-0.5 bg-primary-100 text-primary-600 text-xs rounded-full">{bundles.length}</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bundles.map(bundle => (
                      <button 
                        key={bundle.id}
                        onClick={() => handleSelectItem(bundle, true)}
                        className="p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 transition-all text-left group"
                      >
                        <div className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors uppercase tracking-tight mb-1">{bundle.name}</div>
                        <div className="text-xl font-black text-slate-900 leading-none">₹{bundle.total_price}</div>
                        <div className="mt-3 flex items-center text-xs font-bold text-primary-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                          Add to bill <ChevronRight className="w-3 h-3 ml-1" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                    Individual Books
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">{books.length}</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {books.map(book => (
                      <button 
                        key={book.id}
                        onClick={() => handleSelectItem(book, false)}
                        className="px-4 py-3 rounded-xl border border-slate-100 bg-white hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all text-left flex justify-between items-center group"
                      >
                        <div className="overflow-hidden">
                          <div className="font-bold text-slate-700 truncate group-hover:text-emerald-600 transition-colors">{book.name}</div>
                          <div className="text-xs font-bold text-slate-400">Class {book.class}</div>
                        </div>
                        <div className="font-black text-slate-900 group-hover:text-emerald-700 tabular-nums ml-2">₹{book.price}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cart & Billing Section */}
        <div className="lg:col-span-4 sticky top-8">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl p-8 flex flex-col min-h-[600px] overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm">
                  <Receipt className="w-4 h-4" />
                </div>
                Current Bill
              </h3>
              <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full uppercase tracking-widest">
                {selectedItems.length} items
              </span>
            </div>

            <div className="flex-grow overflow-y-auto min-h-[200px] mb-8 pr-2 space-y-4">
              {selectedItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-50 rounded-3xl">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <p className="text-slate-400 font-bold italic leading-tight">Your bill is empty.<br/>Select items to begin.</p>
                </div>
              ) : (
                <>
                  {selectedItems.map((item) => (
                    <div key={item.uniqueId} className="flex justify-between items-center group animate-slide-up">
                      <div className="flex-grow overflow-hidden">
                        <div className="font-bold text-slate-800 leading-tight truncate">{item.name}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                          {item.isBundle ? 'Bundle Box' : 'Individual Item'}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="font-black text-slate-900 tabular-nums">₹{item.price || item.total_price}</div>
                        <button 
                          onClick={() => removeItem(item.uniqueId)}
                          className="w-6 h-6 rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-100">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-slate-500 font-bold mb-2">
                  <span className="uppercase tracking-widest text-xs">Total Amount</span>
                  <span className="text-2xl font-black text-slate-900 tabular-nums">₹{totalAmount}</span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5" /> Cash Received (₹)
                  </label>
                  <input 
                    type="number" 
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="Enter amount..." 
                    className="w-full h-12 rounded-xl bg-slate-50 border-none px-4 text-lg font-black tabular-nums focus:ring-2 focus:ring-primary-500 transition-all text-slate-800"
                  />
                </div>

                <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Change to Return</div>
                    <div className="text-2xl font-black text-primary-700 tabular-nums leading-none mt-1">₹{changeReturned}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={deliveredStatus}
                        onChange={(e) => setDeliveredStatus(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Delivered</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={loading || selectedItems.length === 0}
                className={`btn-primary w-full h-16 text-lg font-black shadow-2xl transition-all disabled:grayscale disabled:opacity-30 ${
                  loading ? 'opacity-80' : 'active:scale-95'
                }`}
              >
                {loading ? 'Processing...' : 'Confirm & Print Bill'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
