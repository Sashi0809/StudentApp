import { useState, useEffect } from 'react';
import { BookOpen, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import CalendarView from './CalendarView';
import TimetableView from './TimetableView';
import MyPerformance from './MyPerformance';
import MarkPredictor from './MarkPredictor';
import PastResults from './PastResults';
import api from '../lib/axios';

type Classroom = {
  id: string;
  name: string;
  description: string;
  teacher_id: string;
};

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<'classes' | 'calendar' | 'timetable' | 'performance' | 'predictor' | 'history'>('classes');
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/enrollments', { joinCode });
      setJoinCode('');
      setSuccess('Successfully joined the classroom!');
      fetchClassrooms();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to join classroom');
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) return <div className="mt-8 text-gray-300">Loading your dashboard...</div>;

  return (
    <div className="mt-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2 sticky top-8">
          <button
            onClick={() => setActiveTab('classes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'classes' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <BookOpen size={20} />
            <span className="font-medium">My Classes</span>
          </button>
          
          <button
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'calendar'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <CalendarIcon size={20} />
            <span className="font-medium">Events Calendar</span>
          </button>
          
          <button
            onClick={() => setActiveTab('timetable')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'timetable'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
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
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="font-medium">My Performance</span>
          </button>
          
          <button
            onClick={() => setActiveTab('predictor')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'predictor'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">Mark Predictor</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Academic History</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {activeTab === 'classes' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-semibold mb-6 text-blue-100 flex items-center gap-2">
              <BookOpen className="text-blue-400" /> My Classes
            </h2>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
              <div>
                <h3 className="text-xl mb-2 text-blue-300 font-medium">Join a Classroom</h3>
                <p className="text-sm text-gray-400">Ask your teacher for the class code, then enter it here.</p>
              </div>
              <form onSubmit={handleJoin} className="flex gap-3 w-full xl:w-auto">
                <div className="flex-1 min-w-[200px]">
                  <input 
                    required
                    type="text" 
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2.5 text-white font-mono uppercase focus:outline-none focus:border-blue-500 transition-colors shadow-inner tracking-widest text-center"
                    placeholder="e.g. A1B2C3"
                    maxLength={10}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isJoining || !joinCode}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium disabled:opacity-50 transition-colors shadow-lg whitespace-nowrap"
                >
                  {isJoining ? 'Joining...' : 'Join Class'}
                </button>
              </form>
            </div>
            
            {error && <p className="text-red-400 mb-6 bg-red-400/10 px-4 py-3 rounded-lg border border-red-400/20">{error}</p>}
            {success && <p className="text-green-400 mb-6 bg-green-400/10 px-4 py-3 rounded-lg border border-green-400/20">{success}</p>}

            {classrooms.length === 0 ? (
              <p className="text-gray-400 bg-black/20 p-6 rounded-xl border border-white/5 text-center">You are not enrolled in any classrooms yet. Use a join code above to get started!</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                {classrooms.map(c => (
                  <Link to={`/classrooms/${c.id}`} key={c.id} className="block bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-blue-500/50 hover:shadow-blue-500/20 hover:shadow-xl transition-all h-full flex flex-col">
                    <h4 className="text-xl font-bold mb-2 text-white group-hover:text-blue-300 transition-colors">{c.name}</h4>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3 flex-grow">{c.description || 'No description provided.'}</p>
                    <div className="absolute top-[-20px] right-[-20px] text-8xl opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-110 group-hover:rotate-12 duration-500">
                      🎓
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <CalendarView />
        )}

        {activeTab === 'timetable' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TimetableView />
          </div>
        )}
        
        {activeTab === 'performance' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MyPerformance />
          </div>
        )}

        {activeTab === 'predictor' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MarkPredictor />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PastResults />
          </div>
        )}
      </div>
    </div>
  );
}
