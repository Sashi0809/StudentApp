import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

type Department = {
  id: string;
  name: string;
};

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [departmentId, setDepartmentId] = useState('');
  const [academicYear, setAcademicYear] = useState('1');
  const [subject, setSubject] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLogin) {
      api.get('/departments').then(res => {
        setDepartments(res.data);
        if (res.data.length > 0) setDepartmentId(res.data[0].id);
      }).catch(err => console.error(err));
    }
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { email, password });
        login(res.data.token, res.data.user);
      } else {
        const payload: any = { name, email, password, role, department_id: departmentId };
        if (role === 'STUDENT') {
          payload.academic_year = parseInt(academicYear);
        } else if (role === 'TEACHER') {
          payload.subject = subject;
        }
        const res = await api.post('/auth/register', payload);
        login(res.data.token, res.data.user);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-6 tracking-tight">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">Name</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
          )}
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Password</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Role</label>
                <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors">
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="HOD">Head of Department (HOD)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Department / Branch</label>
                <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors">
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {role === 'STUDENT' && (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Academic Year</label>
                  <select value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors">
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              )}

              {role === 'TEACHER' && (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Subject</label>
                  <input required type="text" placeholder="e.g. Mathematics" value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
              )}
            </>
          )}

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors mt-6 shadow-lg">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
