import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, FileText } from 'lucide-react';
import api from '../lib/axios';
import ClassroomMaterials from '../components/ClassroomMaterials';
import ClassroomAssignments from '../components/ClassroomAssignments';

export default function ClassroomDetail() {
 const { id } = useParams();
 const [classroom, setClassroom] = useState<any>(null);
 const [activeTab, setActiveTab] = useState<'materials' | 'assignments'>('materials');
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');

 useEffect(() => {
 const fetchClassroom = async () => {
 try {
 const res = await api.get(`/classrooms/${id}`);
 setClassroom(res.data);
 } catch (err: any) {
 setError(err.response?.data?.error || 'Failed to load classroom');
 } finally {
 setLoading(false);
 }
 };
 fetchClassroom();
 }, [id]);

 if (loading) return <div className="min-h-screen bg-[#0f1115] text-gray-900 flex items-center justify-center">Loading...</div>;
 if (error) return <div className="min-h-screen bg-[#0f1115] text-gray-900 flex flex-col items-center justify-center p-8"><p className="text-red-600 mb-4">{error}</p><Link to="/dashboard" className="text-blue-400 hover:underline">Back to Dashboard</Link></div>;
 if (!classroom) return <div className="min-h-screen bg-[#0f1115] text-gray-900 flex flex-col items-center justify-center p-8"><p className="text-red-600 mb-4">Classroom not found</p><Link to="/dashboard" className="text-blue-400 hover:underline">Back to Dashboard</Link></div>;

 return (
 <div className="min-h-screen bg-[#0f1115] text-gray-900 p-4 md:p-8 font-sans">
 <div className="max-w-6xl mx-auto">
 <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6">
 <ArrowLeft size={20} /> Back to Dashboard
 </Link>
 
 <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-gray-200 rounded-2xl p-8 mb-8">
 <h1 className="text-3xl font-bold text-gray-900 mb-2">{classroom.name}</h1>
 <p className="text-gray-700 text-lg">{classroom.description}</p>
 </div>

 <div className="flex border-b border-gray-200 mb-8">
 <button
 onClick={() => setActiveTab('materials')}
 className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
 activeTab === 'materials' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-800'
 }`}
 >
 <BookOpen size={18} /> Study Materials
 </button>
 <button
 onClick={() => setActiveTab('assignments')}
 className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
 activeTab === 'assignments' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-800'
 }`}
 >
 <FileText size={18} /> Assignments
 </button>
 </div>

 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
 {activeTab === 'materials' ? (
 <ClassroomMaterials classroomId={id!} />
 ) : (
 <ClassroomAssignments classroomId={id!} />
 )}
 </div>
 </div>
 </div>
 );
}
