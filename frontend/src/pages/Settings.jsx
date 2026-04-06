import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, FilePlus, Save, CheckCircle, AlertCircle, UploadCloud, Database } from 'lucide-react';

const Settings = () => {
  const [schoolName, setSchoolName] = useState('DPS Tajpur');
  const [schoolAddress, setSchoolAddress] = useState('New Delhi, India');
  const [savedSettings, setSavedSettings] = useState(false);

  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('schoolName');
    const savedAddress = localStorage.getItem('schoolAddress');
    if (savedName) setSchoolName(savedName);
    if (savedAddress) setSchoolAddress(savedAddress);
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('schoolName', schoolName);
    localStorage.setItem('schoolAddress', schoolAddress);
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 3000);
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // In production, grab the token if we have full auth logic on the frontend.
      // E.g. const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pdf/upload', {
        method: 'POST',
        // headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      
      const data = await response.json();
      if (response.ok) {
        setUploadResult({ success: true, message: data.message, stats: data.stats });
      } else {
        setUploadResult({ success: false, message: data.error || 'Upload failed' });
      }
    } catch (err) {
      setUploadResult({ success: false, message: 'Server error during upload' });
    } finally {
      setUploading(false);
      setFile(null); // Clear file
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-800 leading-none">System Core</h2>
          <p className="text-slate-500 font-medium mt-3 flex items-center gap-2">
            Global configurations and backend data tools
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Basic Configuration */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Print Configuration</h3>
              <p className="text-sm font-medium text-slate-400">Manage invoice headers</p>
            </div>
          </div>
          <div className="p-8 space-y-6">
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">Institution Name</label>
                <input 
                  value={schoolName} 
                  onChange={e => setSchoolName(e.target.value)} 
                  className="input-field shadow-sm bg-slate-50 border-slate-100 focus:bg-white" 
                />
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">Institution Location / Subheading</label>
                <input 
                  value={schoolAddress} 
                  onChange={e => setSchoolAddress(e.target.value)} 
                  className="input-field shadow-sm bg-slate-50 border-slate-100 focus:bg-white" 
                />
             </div>
             <button 
               onClick={handleSaveSettings}
               className="btn-primary w-full h-12 flex justify-center items-center gap-2 mt-4"
             >
               <Save className="w-4 h-4" /> Save Configuration
             </button>

             {savedSettings && (
               <div className="bg-emerald-50 text-emerald-600 text-sm font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-2 animate-slide-up">
                 <CheckCircle className="w-4 h-4" /> Configuration saved locally!
               </div>
             )}
          </div>
        </div>

        {/* System Ingestion Tool */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Database Ingestion</h3>
              <p className="text-sm font-medium text-slate-400">Import structured book lists via PDF</p>
            </div>
          </div>
          <div className="p-8 space-y-6">
             <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
               <UploadCloud className="w-12 h-12 text-slate-300 mb-4" />
               <p className="font-bold text-slate-600 mb-2">Upload the authorized PDF manifest</p>
               <p className="text-xs font-medium text-slate-400 mb-6 px-4">
                 The parser is strictly configured to automatically extract item definitions, associate them to class bundles, and update the global inventory records.
               </p>
               <input 
                 type="file" 
                 accept=".pdf"
                 onChange={e => setFile(e.target.files[0])}
                 className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2.5 file:px-5
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100 transition-colors file:cursor-pointer"
               />
             </div>

             <button 
               onClick={handleFileUpload}
               disabled={!file || uploading}
               className={`btn-primary bg-slate-900 hover:bg-slate-800 w-full h-12 flex justify-center items-center gap-2 disabled:grayscale disabled:opacity-50`}
             >
               {uploading ? <span className="animate-pulse">Parsing engine active...</span> : <><FilePlus className="w-4 h-4" /> Initialize Injection Vector</>}
             </button>

             {/* Result message */}
             {uploadResult && uploadResult.success && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-bold px-5 py-4 rounded-xl flex items-start gap-3 animate-slide-up">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> 
                  <div>
                     <div className="mb-1">{uploadResult.message}</div>
                     <div className="text-xs text-emerald-600 font-medium">Successfully processed {uploadResult.stats?.bundles} Bundles and {uploadResult.stats?.books} Products into the inventory matrix.</div>
                  </div>
                </div>
             )}
             {uploadResult && !uploadResult.success && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold px-5 py-4 rounded-xl flex items-center gap-3 animate-slide-up">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /> {uploadResult.message}
                </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
