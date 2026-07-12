import { useState, useEffect } from 'react';
import { Users, UploadCloud, FileText, CheckCircle2, UserPlus, Check, X, Database, MessageSquare, Calendar, Clock, BookOpen } from 'lucide-react';
import api from '../lib/axios';
import CalendarView from './CalendarView';
import CgpaUpload from './CgpaUpload';
import ComplaintsInbox from './ComplaintsInbox';
import SemesterManager from './SemesterManager';
import TimetableView from './TimetableView';

type Teacher = {
 id: string;
 name: string;
 email: string;
 subject: string;
};

export default function HodDashboard() {
  const [activeTab, setActiveTab] = useState<'teachers' | 'calendar' | 'timetable' | 'semesters' | 'cgpa' | 'complaints'>('teachers');
 const [teachers, setTeachers] = useState<Teacher[]>([]);
 const [pendingTeachers, setPendingTeachers] = useState<Teacher[]>([]);
 const [loading, setLoading] = useState(true);
 
 const [file, setFile] = useState<File | null>(null);
 const [uploading, setUploading] = useState(false);
 const [uploadSuccess, setUploadSuccess] = useState(false);
 const [uploadError, setUploadError] = useState('');
 const [hasTimetable, setHasTimetable] = useState<boolean>(false);
 const [showUploadForm, setShowUploadForm] = useState(false);
 const [timetableRefresh, setTimetableRefresh] = useState(0);

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
 setTimetableRefresh(prev => prev + 1);
 setTimeout(() => {
 setShowUploadForm(false);
 setUploadSuccess(false);
 }, 2000);
 // Reset file input
 const fileInput = document.getElementById('timetable-upload') as HTMLInputElement;
 if (fileInput) fileInput.value = '';
 } catch (err: any) {
 setUploadError(err.response?.data?.error || 'Failed to upload timetable');
 } finally {
 setLoading(false);
 }
 };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] w-full">
      {/* Sidebar */}
      <div className="w-full md:w-72 flex-shrink-0 bg-white border-r border-gray-200 h-full overflow-y-auto py-3 pr-4">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setActiveTab('teachers')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-r-full transition-colors ${
              activeTab === 'teachers' 
                ? 'bg-emerald-100/50 text-emerald-900 font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users size={20} className={activeTab === 'teachers' ? 'text-emerald-600' : 'text-gray-600'} />
            <span>Teachers Directory</span>
          </button>
          
          <div className="my-2 border-t border-gray-200 ml-6"></div>
          <div className="px-6 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Department</div>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-r-full transition-colors ${
              activeTab === 'calendar'
                ? 'bg-emerald-100/50 text-emerald-900 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calendar size={20} className={activeTab === 'calendar' ? 'text-emerald-600' : 'text-gray-600'} />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('timetable')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-r-full transition-colors ${
              activeTab === 'timetable'
                ? 'bg-emerald-100/50 text-emerald-900 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Clock size={20} className={activeTab === 'timetable' ? 'text-emerald-600' : 'text-gray-600'} />
            <span>Timetable</span>
          </button>

          <button
            onClick={() => setActiveTab('semesters')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-r-full transition-colors ${
              activeTab === 'semesters'
                ? 'bg-emerald-100/50 text-emerald-900 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BookOpen size={20} className={activeTab === 'semesters' ? 'text-emerald-600' : 'text-gray-600'} />
            <span>Manage Semesters</span>
          </button>

          <button
            onClick={() => setActiveTab('cgpa')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-r-full transition-colors ${
              activeTab === 'cgpa'
                ? 'bg-emerald-100/50 text-emerald-900 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Database size={20} className={activeTab === 'cgpa' ? 'text-emerald-600' : 'text-gray-600'} />
            <span>Upload CGPA</span>
          </button>

          <div className="my-2 border-t border-gray-200 ml-6"></div>
          <div className="px-6 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</div>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-r-full transition-colors ${
              activeTab === 'complaints'
                ? 'bg-emerald-100/50 text-emerald-900 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MessageSquare size={20} className={activeTab === 'complaints' ? 'text-emerald-600' : 'text-gray-600'} />
            <span>Complaints Inbox</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
        {activeTab === 'teachers' && (
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            {/* Pending Approvals */}
            {pendingTeachers.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                <h2 className="text-2xl font-semibold mb-6 text-yellow-900 flex items-center gap-2">
                  <UserPlus className="text-yellow-600" /> Pending Teacher Approvals
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingTeachers.map(teacher => (
                    <div key={teacher.id} className="bg-white border border-yellow-500/20 rounded-lg p-4 flex items-center justify-between gap-4 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 font-bold text-xl flex-shrink-0">
                          {teacher.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{teacher.name}</h4>
                          <p className="text-sm text-yellow-600 font-medium">{teacher.subject}</p>
                          <p className="text-xs text-gray-500 truncate">{teacher.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => handleStatusChange(teacher.id, 'APPROVED')} className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded transition-colors" title="Approve">
                          <Check size={18} />
                        </button>
                        <button onClick={() => handleStatusChange(teacher.id, 'REJECTED')} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded transition-colors" title="Reject">
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Teachers Roster */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                <Users className="text-emerald-600" /> Teachers Directory
              </h2>
              
              {loading ? (
                <p className="text-gray-500">Loading teachers...</p>
              ) : teachers.length === 0 ? (
                <p className="text-gray-500 bg-gray-50 p-6 rounded-xl border border-gray-100 text-center">
                  No teachers are currently registered in your department.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teachers.map(teacher => (
                    <div key={teacher.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4 hover:border-emerald-500/30 transition-colors shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xl flex-shrink-0">
                          {teacher.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{teacher.name}</h4>
                          <p className="text-sm text-emerald-600 font-medium">{teacher.subject}</p>
                          <p className="text-xs text-gray-500 truncate">{teacher.email}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleStatusChange(teacher.id, 'REJECTED')}
                        className="p-2 bg-red-500/10 hover:bg-red-500/30 text-red-600 rounded-lg transition-colors border border-red-500/20" 
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

        {activeTab === 'calendar' && (
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CalendarView />
          </div>
        )}

        {activeTab === 'timetable' && (
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <UploadCloud className="text-emerald-600" /> Department Timetable
                </h2>
                {hasTimetable && (
                  <button
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className="px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg font-medium transition-colors"
                  >
                    {showUploadForm ? 'Cancel Update' : 'Change Timetable'}
                  </button>
                )}
              </div>

              {(!hasTimetable || showUploadForm) && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 animate-in fade-in slide-in-from-top-4 shadow-sm">
                  <form onSubmit={handleUpload} className="max-w-2xl">
                    <div className="border-2 border-dashed border-gray-300 hover:border-emerald-500/50 transition-colors rounded-xl p-8 text-center bg-gray-50">
                      <input 
                        type="file" 
                        id="timetable-upload"
                        accept=".pdf,image/*"
                        onChange={handleFileChange}
                        className="hidden" 
                      />
                      <label htmlFor="timetable-upload" className="cursor-pointer flex flex-col items-center">
                        <FileText size={48} className={`mb-4 ${file ? 'text-emerald-600' : 'text-gray-500'}`} />
                        <span className="text-lg font-medium text-gray-900 mb-2">
                          {file ? file.name : (hasTimetable ? 'Select a new file to replace the current timetable' : 'Click to select a file')}
                        </span>
                        <span className="text-sm text-gray-500">Supported formats: PDF, PNG, JPG</span>
                      </label>
                    </div>

                    {uploadError && <p className="text-red-600 mt-4">{uploadError}</p>}
                    {uploadSuccess && <p className="text-emerald-600 mt-4 flex items-center gap-2"><CheckCircle2 size={18}/> Timetable uploaded successfully and is now visible to your department!</p>}

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
              )}

              <TimetableView 
                key={timetableRefresh} 
                hideIfEmpty={true} 
                onLoad={(exists) => setHasTimetable(exists)} 
              />
            </div>
          </div>
        )}

        {activeTab === 'semesters' && (
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SemesterManager />
          </div>
        )}

        {activeTab === 'cgpa' && (
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CgpaUpload />
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ComplaintsInbox />
          </div>
        )}
      </div>
    </div>
  );
}
