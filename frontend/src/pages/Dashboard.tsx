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
    return <div className="min-h-screen bg-white flex items-center justify-center text-gray-900">Loading...</div>;
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
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 bg-white z-50">
        <div className="flex items-center gap-6">

          <div className="text-[22px] font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer tracking-tight">
            Classroom
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-semibold text-xs tracking-wide">{user.role}</span>
            {departmentName && <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold text-xs tracking-wide">{departmentName}</span>}
          </div>
          


          <div className="relative group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-medium text-sm border-2 border-white shadow-sm ring-1 ring-gray-200">
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            {/* Simple dropdown for logout */}
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="p-4 border-b border-gray-100">
                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
              <div className="p-2">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {user.role === 'TEACHER' && <TeacherDashboard />}
        {user.role === 'STUDENT' && <StudentDashboard />}
        {user.role === 'HOD' && <HodDashboard />}
      </main>
    </div>
  );
}
