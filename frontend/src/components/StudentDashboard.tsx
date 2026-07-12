import { useState, useEffect } from 'react';
import { BookOpen, Calendar as CalendarIcon, Clock, AlertCircle, Folder, ClipboardList, TrendingUp, History, Activity, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import CalendarView from './CalendarView';
import TimetableView from './TimetableView';
import MyPerformance from './MyPerformance';
import MarkPredictor from './MarkPredictor';
import PastResults from './PastResults';
import StudentComplaints from './StudentComplaints';
import api from '../lib/axios';

type Classroom = {
  id: string;
  name: string;
  description: string;
  teacher_id: string;
};

// Google Classroom style banner colors
const BANNER_COLORS = [
  'bg-blue-600',
  'bg-purple-700',
  'bg-emerald-600',
  'bg-orange-600',
  'bg-teal-700',
  'bg-indigo-600'
];

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<'classes' | 'calendar' | 'timetable' | 'performance' | 'predictor' | 'history' | 'complaints'>('classes');
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([]);
  const [activeSemester, setActiveSemester] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [classRes, assignRes, semRes] = await Promise.all([
        api.get('/classrooms'),
        api.get('/users/me/assignments'),
        api.get('/semesters/active').catch(() => ({ data: null }))
      ]);
      setClassrooms(classRes.data);
      setPendingAssignments(assignRes.data);
      setActiveSemester(semRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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
      fetchDashboardData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to join classroom');
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-700 font-medium">Loading your classes...</div>;

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
            <span>Home</span>
          </button>
          
          <button
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-r-full transition-colors ${
              activeTab === 'calendar'
                ? 'bg-blue-100/50 text-blue-900 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <CalendarIcon size={20} className={activeTab === 'calendar' ? 'text-blue-600' : 'text-gray-600'} />
            <span>Calendar</span>
          </button>
          
          <div className="my-2 border-t border-gray-200 ml-6"></div>
          <div className="px-6 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Academics</div>

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
            <Activity size={20} className={activeTab === 'performance' ? 'text-blue-600' : 'text-gray-600'} />
            <span>My Performance</span>
          </button>
          
          <button
            onClick={() => setActiveTab('predictor')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-r-full transition-colors ${
              activeTab === 'predictor'
                ? 'bg-blue-100/50 text-blue-900 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <TrendingUp size={20} className={activeTab === 'predictor' ? 'text-blue-600' : 'text-gray-600'} />
            <span>Mark Predictor</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-r-full transition-colors ${
              activeTab === 'history'
                ? 'bg-blue-100/50 text-blue-900 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <History size={20} className={activeTab === 'history' ? 'text-blue-600' : 'text-gray-600'} />
            <span>Academic History</span>
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-r-full transition-colors ${
              activeTab === 'complaints'
                ? 'bg-blue-100/50 text-blue-900 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MessageSquare size={20} className={activeTab === 'complaints' ? 'text-blue-600' : 'text-gray-600'} />
            <span>Complaints</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-white p-6 md:p-8">
        {activeTab === 'classes' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            
            {activeSemester && (new Date(activeSemester.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) && (
              <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 shadow-md text-white flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">🎉 A new semester has started!</h3>
                  <p className="text-blue-100">Welcome to {activeSemester.name}. Have a great term ahead!</p>
                </div>
              </div>
            )}

            {/* Join Class form - subtle */}
            <div className="mb-8 flex justify-end">
              <form onSubmit={handleJoin} className="flex gap-2">
                <input 
                  required
                  type="text" 
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  className="w-48 bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-colors uppercase tracking-wider"
                  placeholder="Class Code"
                  maxLength={10}
                />
                <button 
                  type="submit" 
                  disabled={isJoining || !joinCode}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  Join
                </button>
              </form>
            </div>
            
            {error && <p className="text-red-600 mb-6 bg-red-50 px-4 py-3 rounded-lg border border-red-200 text-sm">{error}</p>}
            {success && <p className="text-green-600 mb-6 bg-green-50 px-4 py-3 rounded-lg border border-green-200 text-sm">{success}</p>}

            {classrooms.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">You are not enrolled in any classrooms.</p>
                <p className="text-gray-400 mt-2">Enter a class code above to join one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {classrooms.map((c, idx) => {
                  const bannerColor = BANNER_COLORS[idx % BANNER_COLORS.length];
                  // Determine an avatar letter
                  const avatarLetter = c.description ? c.description.charAt(0).toUpperCase() : c.name.charAt(0).toUpperCase();

                  return (
                    <div key={c.id} className="h-[280px] border border-gray-300 rounded-lg overflow-hidden flex flex-col hover:shadow-md transition-shadow relative bg-white group">
                      
                      {/* Top Banner Half */}
                      <Link to={`/classrooms/${c.id}`} className={`h-28 p-4 block ${bannerColor} relative group-hover:opacity-95 transition-opacity`}>
                        <div className="flex justify-between items-start">
                          <h4 className="text-white text-[22px] font-medium truncate w-[90%] tracking-tight hover:underline">
                            {c.name}
                          </h4>
                          <button className="text-white/80 hover:text-white mt-1">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-white/90 text-sm truncate mt-1">{c.description || 'No section'}</p>
                      </Link>

                      {/* Floating Avatar */}
                      <div className="absolute top-[84px] right-4 w-[72px] h-[72px] rounded-full bg-orange-600 border-[4px] border-white flex items-center justify-center shadow-sm overflow-hidden z-10">
                        <span className="text-white text-3xl font-normal">{avatarLetter}</span>
                      </div>

                      {/* Body Half */}
                      <Link to={`/classrooms/${c.id}`} className="flex-1 p-4 pt-10 block">
                        {/* If we had specific pending assignments for THIS class, show here */}
                        <div className="text-sm text-gray-500">
                          {pendingAssignments.filter(a => a.classroom_id === c.id).length > 0 
                            ? `Due soon: ${pendingAssignments.filter(a => a.classroom_id === c.id)[0].title}`
                            : 'No due work soon'}
                        </div>
                      </Link>


                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'timetable' && <TimetableView />}
        {activeTab === 'performance' && <MyPerformance />}
        {activeTab === 'predictor' && <MarkPredictor />}
        {activeTab === 'history' && <PastResults />}
        {activeTab === 'complaints' && <StudentComplaints />}
      </div>
    </div>
  );
}
