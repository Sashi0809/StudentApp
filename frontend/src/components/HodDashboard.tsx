import { useState, useEffect } from 'react';
import { Users, UploadCloud, FileText, CheckCircle2, UserPlus, Check, X, Database, MessageSquare, Calendar } from 'lucide-react';
import api from '../lib/axios';
import CalendarView from './CalendarView';
import CgpaUpload from './CgpaUpload';
import ComplaintsInbox from './ComplaintsInbox';
import SemesterManager from './SemesterManager';

type Teacher = {
  id: string;
  name: string;
  email: string;
  subject: string;
};

export default function HodDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'semesters' | 'cgpa' | 'complaints'>('overview');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [pendingTeachers, setPendingTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchTeachers = async () => {
    try {
      const [resTeachers, resPending] = await Promise.all([
        api.get('/users/teachers'),
        api.get('/users/teachers/pending')
      ]);
      setTeachers(resTeachers.data);
      setPendingTeachers(resPending.data);
    } catch (err) {
      console.error('Failed to fetch teachers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleStatusChange = async (teacherId: string, status: 'APPROVED' | 'REJECTED') => {
    if (status === 'REJECTED') {
       if (!window.confirm("Are you sure you want to REJECT / KICK OUT this teacher? They will immediately lose access to the system.")) {
         return;
       }
    }
    try {
      await api.patch(`/users/teachers/${teacherId}/status`, { status });
      fetchTeachers();
    } catch (err) {
      console.error(`Failed to ${status} teacher`, err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadSuccess(false);
      setUploadError('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append('timetable', file);

    try {
      await api.post('/timetables/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadSuccess(true);
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById('timetable-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Failed to upload timetable');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-8 space-y-8">
      <div className="flex border-b border-white/10 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'overview' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Users size={18} /> Department Overview
        </button>
        <button
          onClick={() => setActiveTab('semesters')}
          className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'semesters' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Calendar size={18} /> Manage Semesters
        </button>
        <button
          onClick={() => setActiveTab('cgpa')}
          className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'cgpa' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Database size={18} /> Upload CGPA
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'complaints' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <MessageSquare size={18} /> Complaints Inbox
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          {/* Pending Approvals */}
          {pendingTeachers.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-6 text-yellow-100 flex items-center gap-2">
                <UserPlus className="text-yellow-400" /> Pending Teacher Approvals
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingTeachers.map(teacher => (
                  <div key={teacher.id} className="bg-black/40 border border-yellow-500/20 rounded-lg p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-300 font-bold text-xl flex-shrink-0">
                        {teacher.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{teacher.name}</h4>
                        <p className="text-sm text-yellow-400 font-medium">{teacher.subject}</p>
                        <p className="text-xs text-gray-400 truncate">{teacher.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => handleStatusChange(teacher.id, 'APPROVED')} className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded transition-colors" title="Approve">
                        <Check size={18} />
                      </button>
                      <button onClick={() => handleStatusChange(teacher.id, 'REJECTED')} className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded transition-colors" title="Reject">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calendar Section */}
          <CalendarView />

          {/* Upload Section */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-6 text-emerald-100 flex items-center gap-2">
              <UploadCloud className="text-emerald-400" /> Upload Department Timetable
            </h2>
            
            <form onSubmit={handleUpload} className="max-w-2xl">
              <div className="border-2 border-dashed border-white/20 hover:border-emerald-500/50 transition-colors rounded-xl p-8 text-center bg-black/20">
                <input 
                  type="file" 
                  id="timetable-upload"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  className="hidden" 
                />
                <label htmlFor="timetable-upload" className="cursor-pointer flex flex-col items-center">
                  <FileText size={48} className={`mb-4 ${file ? 'text-emerald-400' : 'text-gray-500'}`} />
                  <span className="text-lg font-medium text-white mb-2">
                    {file ? file.name : 'Click to select a file'}
                  </span>
                  <span className="text-sm text-gray-400">Supported formats: PDF, PNG, JPG</span>
                </label>
              </div>

              {uploadError && <p className="text-red-400 mt-4">{uploadError}</p>}
              {uploadSuccess && <p className="text-emerald-400 mt-4 flex items-center gap-2"><CheckCircle2 size={18}/> Timetable uploaded successfully and is now visible to your department!</p>}

              <div className="mt-6 flex justify-end">
                <button 
                  type="submit" 
                  disabled={!file || uploading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium disabled:opacity-50 transition-colors shadow-lg"
                >
                  {uploading ? 'Uploading...' : 'Publish Timetable'}
                </button>
              </div>
            </form>
          </div>

          {/* Teachers Roster */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-6 text-emerald-100 flex items-center gap-2">
              <Users className="text-emerald-400" /> Teachers Directory
            </h2>
            
            {loading ? (
              <p className="text-gray-400">Loading teachers...</p>
            ) : teachers.length === 0 ? (
              <p className="text-gray-400 bg-black/20 p-6 rounded-xl border border-white/5 text-center">
                No teachers are currently registered in your department.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teachers.map(teacher => (
                  <div key={teacher.id} className="bg-black/30 border border-white/10 rounded-lg p-4 flex items-center justify-between gap-4 hover:border-emerald-500/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-300 font-bold text-xl flex-shrink-0">
                        {teacher.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{teacher.name}</h4>
                        <p className="text-sm text-emerald-400 font-medium">{teacher.subject}</p>
                        <p className="text-xs text-gray-400 truncate">{teacher.email}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleStatusChange(teacher.id, 'REJECTED')}
                      className="p-2 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors border border-red-500/20" 
                      title="Kick Out / Revoke Access"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'semesters' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SemesterManager />
        </div>
      )}

      {activeTab === 'cgpa' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CgpaUpload />
        </div>
      )}

      {activeTab === 'complaints' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ComplaintsInbox />
        </div>
      )}

    </div>
  );
}
