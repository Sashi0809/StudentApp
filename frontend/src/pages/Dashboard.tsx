import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../lib/axios';
import TeacherDashboard from '../components/TeacherDashboard';
import StudentDashboard from '../components/StudentDashboard';
import HodDashboard from '../components/HodDashboard';

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [departmentName, setDepartmentName] = useState<string>('');

  useEffect(() => {
    if (user?.department_id) {
      api.get('/departments').then(res => {
        const dept = res.data.find((d: any) => d.id === user.department_id);
        if (dept) setDepartmentName(dept.name);
      }).catch(err => console.error(err));
    }
  }, [user]);

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto backdrop-blur-xl bg-white/10 rounded-2xl shadow-xl border border-white/20 p-8 mt-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h1>
            <p className="text-gray-300 mb-2">Email: {user.email}</p>
            <div className="flex items-center gap-3 text-gray-300">
              <p>Role: <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/50 rounded-full font-semibold text-sm">{user.role}</span></p>
              {departmentName && (
                <p>Branch: <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/50 rounded-full font-semibold text-sm">{departmentName}</span></p>
              )}
              {user.role === 'STUDENT' && user.academic_year && (
                <p>Year: <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 rounded-full font-semibold text-sm">Year {user.academic_year}</span></p>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors font-medium shadow-lg"
          >
            Sign Out
          </button>
        </div>

        <div className="border-t border-white/10 pt-4">
          {user.role === 'TEACHER' && <TeacherDashboard />}
          {user.role === 'STUDENT' && <StudentDashboard />}
          {user.role === 'HOD' && <HodDashboard />}
        </div>
      </div>
    </div>
  );
}
