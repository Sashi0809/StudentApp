import { useState, useEffect } from 'react';
import { Key, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import TimetableView from './TimetableView';
import PerformanceEntry from './PerformanceEntry';

type Classroom = {
  id: string;
  name: string;
  description: string;
  join_code: string;
  created_at: string;
};

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'classes' | 'timetable' | 'performance'>('classes');
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  if (user?.approval_status === 'PENDING') {
    return (
      <div className="mt-8 bg-black/40 border border-yellow-500/30 rounded-xl p-8 text-center max-w-2xl mx-auto shadow-2xl backdrop-blur-md">
        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Key className="text-yellow-400 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-yellow-100 mb-4">Account Pending Approval</h2>
        <p className="text-gray-300 text-lg leading-relaxed">
          Your registration as a teacher for the subject <span className="font-semibold text-yellow-400">{user.subject}</span> has been received. 
        </p>
        <p className="text-gray-400 mt-4">
          Please wait for your Head of Department (HOD) to review and approve your account before you can start managing classrooms.
        </p>
      </div>
    );
  }

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchClassrooms = async () => {
    try {
      const res = await api.get('/classrooms');
      setClassrooms(res.data);
    } catch (err) {
      console.error('Failed to fetch classrooms', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

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

  if (loading) return <div className="mt-8 text-gray-300">Loading your classrooms...</div>;

  return (
    <div className="mt-8 space-y-8">
      <h2 className="text-2xl font-semibold mb-4 text-purple-100">Teacher Dashboard</h2>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          <button
            onClick={() => setActiveTab('classes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'classes' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <BookOpen size={20} />
            <span className="font-medium">Classrooms</span>
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'timetable'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">Timetable</span>
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'performance'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="font-medium">Performance (ML)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'classes' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
                <h3 className="text-xl mb-4 text-purple-300">Create New Classroom</h3>
                {error && <p className="text-red-400 mb-4">{error}</p>}
                <form onSubmit={handleCreate} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm mb-1 text-gray-300">Classroom Name</label>
                    <input 
                      required
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="e.g. Physics 101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-300">Description (optional)</label>
                    <input 
                      type="text" 
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="e.g. Advanced mechanics"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isCreating}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium transition-colors shadow-lg disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create Classroom'}
                  </button>
                </form>
              </div>

              <h3 className="text-xl mb-4 text-purple-100">Your Classrooms</h3>
              {classrooms.length === 0 ? (
                <p className="text-gray-400 bg-black/20 p-4 rounded-lg border border-white/5">You haven't created any classrooms yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {classrooms.map(c => (
                    <Link to={`/classrooms/${c.id}`} key={c.id} className="block bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-purple-500/50 hover:shadow-purple-500/20 hover:shadow-xl transition-all">
                      <h4 className="text-xl font-bold mb-2 text-white">{c.name}</h4>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{c.description || 'No description provided.'}</p>
                      <div className="bg-black/40 rounded-lg px-4 py-3 flex items-center justify-between border border-white/10">
                        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Join Code</span>
                        <span className="font-mono text-purple-300 font-bold tracking-widest text-lg bg-purple-500/10 px-2 py-1 rounded">{c.join_code}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'timetable' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <TimetableView />
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <PerformanceEntry />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
