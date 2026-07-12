import { useState, useEffect } from 'react';
import { Key, BookOpen, Clock, MessageSquare, TrendingUp, Edit2, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import TimetableView from './TimetableView';
import PerformanceEntry from './PerformanceEntry';
import StudentMessages from './StudentMessages';

type Classroom = {
  id: string;
  name: string;
  description: string;
  join_code: string;
  created_at: string;
};

const BANNER_COLORS = [
  'bg-blue-600',
  'bg-purple-700',
  'bg-emerald-600',
  'bg-orange-600',
  'bg-teal-700',
  'bg-indigo-600'
];

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'classes' | 'timetable' | 'performance' | 'messages'>('classes');
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [activeSemester, setActiveSemester] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  
  // Edit state
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchClassrooms = async () => {
    try {
      const [res, semRes] = await Promise.all([
        api.get('/classrooms'),
        api.get('/semesters/active').catch(() => ({ data: null }))
      ]);
      setClassrooms(res.data);
      setActiveSemester(semRes.data);
    } catch (err) {
      console.error('Failed to fetch classrooms', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.approval_status !== 'PENDING') {
      fetchClassrooms();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');
    try {
      await api.post('/classrooms', { name, description });
      setName('');
      setDescription('');
      fetchClassrooms();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create classroom');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string) => {
    setIsUpdating(true);
    try {
      await api.put(`/classrooms/${id}`, { name: editName, description: editDescription });
      setEditingClassId(null);
      fetchClassrooms();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update classroom');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-700 font-medium">Loading your classrooms...</div>;

  if (user?.approval_status === 'PENDING') {
    return (
      <div className="w-full flex items-center justify-center p-8 bg-gray-50 h-[calc(100vh-64px)]">
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center max-w-lg shadow-sm">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="text-yellow-600 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account Pending Approval</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            Your registration as a teacher for the subject <span className="font-semibold text-gray-900">{user.subject}</span> has been received. 
          </p>
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm">
            Please wait for your Head of Department (HOD) to review and approve your account before you can start managing classrooms.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] w-full">
      {/* Sidebar */}
      <div className="w-full md:w-72 flex-shrink-0 bg-white border-r border-gray-200 h-full overflow-y-auto py-3 pr-4">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setActiveTab('classes')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-r-full transition-colors ${
              activeTab === 'classes' 
                ? 'bg-blue-100/50 text-blue-900 font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BookOpen size={20} className={activeTab === 'classes' ? 'text-blue-600' : 'text-gray-600'} />
            <span>Classrooms</span>
          </button>
          
          <div className="my-2 border-t border-gray-200 ml-6"></div>
          <div className="px-6 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Management</div>

          <button
            onClick={() => setActiveTab('timetable')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-r-full transition-colors ${
              activeTab === 'timetable'
                ? 'bg-blue-100/50 text-blue-900 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Clock size={20} className={activeTab === 'timetable' ? 'text-blue-600' : 'text-gray-600'} />
            <span>Timetable</span>
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-r-full transition-colors ${
              activeTab === 'performance'
                ? 'bg-blue-100/50 text-blue-900 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <TrendingUp size={20} className={activeTab === 'performance' ? 'text-blue-600' : 'text-gray-600'} />
            <span>Upload Marks</span>
          </button>
          
          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-r-full transition-colors ${
              activeTab === 'messages'
                ? 'bg-blue-100/50 text-blue-900 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MessageSquare size={20} className={activeTab === 'messages' ? 'text-blue-600' : 'text-gray-600'} />
            <span>Messages</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-white p-6 md:p-8">
        {activeTab === 'classes' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            
            {activeSemester && (new Date(activeSemester.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) && (
              <div className="mb-8 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl p-6 shadow-md text-white flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">🎉 A new semester has started!</h3>
                  <p className="text-emerald-100">Welcome to {activeSemester.name}. You can now record new performance grades and rename your classes for the new term.</p>
                </div>
              </div>
            )}

            <div className="mb-8 flex justify-end">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 w-full md:w-auto md:min-w-[400px]">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Create New Classroom</h3>
                <form onSubmit={handleCreate} className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input 
                      required
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="flex-1 bg-white border border-gray-300 rounded px-3 py-1.5 text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Classroom Name (e.g. Physics 101)"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="flex-1 bg-white border border-gray-300 rounded px-3 py-1.5 text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Section / Description (Optional)"
                    />
                    <button 
                      type="submit" 
                      disabled={isCreating}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {isCreating ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                  {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
                </form>
              </div>
            </div>

            {classrooms.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">You haven't created any classrooms yet.</p>
                <p className="text-gray-400 mt-2">Use the form above to create your first class.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {classrooms.map((c, idx) => {
                  const bannerColor = BANNER_COLORS[idx % BANNER_COLORS.length];
                  const avatarLetter = user?.name?.charAt(0).toUpperCase() || 'T';

                  return (
                    <div key={c.id} className="h-[280px] border border-gray-300 rounded-lg overflow-hidden flex flex-col hover:shadow-md transition-shadow relative bg-white group">
                      
                      {/* Top Banner Half */}
                      <div className={`h-28 p-4 block ${bannerColor} relative group-hover:opacity-95 transition-opacity`}>
                        <div className="flex justify-between items-start">
                          {editingClassId === c.id ? (
                            <div className="w-[90%] flex flex-col gap-1 z-20">
                              <input 
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                className="w-full bg-white/20 border border-white/40 text-white rounded px-2 py-1 text-lg font-medium placeholder-white/60 focus:outline-none focus:bg-white/30"
                                placeholder="Classroom Name"
                                autoFocus
                              />
                              <input 
                                value={editDescription}
                                onChange={e => setEditDescription(e.target.value)}
                                className="w-full bg-white/20 border border-white/40 text-white rounded px-2 py-1 text-sm placeholder-white/60 focus:outline-none focus:bg-white/30"
                                placeholder="Description"
                              />
                            </div>
                          ) : (
                            <Link to={`/classrooms/${c.id}`} className="w-[90%] block">
                              <h4 className="text-white text-[22px] font-medium truncate tracking-tight hover:underline">
                                {c.name}
                              </h4>
                              <p className="text-white/90 text-sm truncate mt-1">{c.description || 'No section'}</p>
                            </Link>
                          )}
                          
                          {editingClassId === c.id ? (
                            <div className="flex gap-1 z-20">
                              <button onClick={() => handleUpdate(c.id)} disabled={isUpdating} className="p-1 bg-white/20 hover:bg-white/40 text-white rounded transition-colors disabled:opacity-50">
                                <Check size={16} />
                              </button>
                              <button onClick={() => setEditingClassId(null)} disabled={isUpdating} className="p-1 bg-white/20 hover:bg-white/40 text-white rounded transition-colors disabled:opacity-50">
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                setEditingClassId(c.id);
                                setEditName(c.name);
                                setEditDescription(c.description || '');
                              }} 
                              className="text-white/80 hover:text-white mt-1 z-20 p-1 hover:bg-white/20 rounded transition-colors"
                              title="Edit Classroom"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Floating Avatar */}
                      <div className="absolute top-[84px] right-4 w-[72px] h-[72px] rounded-full bg-orange-600 border-[4px] border-white flex items-center justify-center shadow-sm overflow-hidden z-10">
                        <span className="text-white text-3xl font-normal">{avatarLetter}</span>
                      </div>

                      {/* Body Half */}
                      <Link to={`/classrooms/${c.id}`} className="flex-1 p-4 pt-10 block">
                        <div className="text-sm text-gray-500">
                          <span className="font-semibold text-gray-700">Class Code:</span> <span className="font-mono tracking-widest">{c.join_code}</span>
                        </div>
                      </Link>


                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'timetable' && <TimetableView />}
        {activeTab === 'performance' && <PerformanceEntry />}
        {activeTab === 'messages' && <StudentMessages />}
      </div>
    </div>
  );
}
