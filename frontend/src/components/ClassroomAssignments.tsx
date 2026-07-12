import { useState, useEffect } from 'react';
import { Upload, Download, Calendar, CheckCircle } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

export default function ClassroomAssignments({ classroomId }: { classroomId: string }) {
 const { user } = useAuth();
 const [assignments, setAssignments] = useState<any[]>([]);
 const [submissions, setSubmissions] = useState<Record<string, any[]>>({});
 const [loading, setLoading] = useState(true);
 
 // Create Assignment State
 const [title, setTitle] = useState('');
 const [description, setDescription] = useState('');
 const [deadline, setDeadline] = useState('');
 const [file, setFile] = useState<File | null>(null);
 const [uploading, setUploading] = useState(false);
 const [error, setError] = useState('');

 // Submit Assignment State
 const [submitFile, setSubmitFile] = useState<File | null>(null);
 const [submittingFor, setSubmittingFor] = useState<string | null>(null);
 const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);

 const fetchAssignments = async () => {
 try {
 const res = await api.get(`/classrooms/${classroomId}/assignments`);
 setAssignments(res.data);
 
 // Fetch submissions for assignments
 const subs: Record<string, any[]> = {};
 for (const assign of res.data) {
 try {
 const subRes = await api.get(`/classrooms/${classroomId}/assignments/${assign.id}/submissions`);
 subs[assign.id] = subRes.data;
 } catch (e) {
 console.error('Failed to fetch submissions for', assign.id);
 }
 }
 setSubmissions(subs);
 } catch (err) {
 console.error('Failed to fetch assignments', err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchAssignments();
 }, [classroomId]);

 const handleCreateAssignment = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!title || !deadline) return;
 setUploading(true);
 setError('');

 const formData = new FormData();
 formData.append('title', title);
 formData.append('description', description);
 formData.append('deadline', new Date(deadline).toISOString());
 if (file) formData.append('file', file);

 try {
 await api.post(`/classrooms/${classroomId}/assignments`, formData, {
 headers: { 'Content-Type': 'multipart/form-data' }
 });
 setTitle('');
 setDescription('');
 setDeadline('');
 setFile(null);
 if (document.getElementById('assignFile')) (document.getElementById('assignFile') as HTMLInputElement).value = '';
 fetchAssignments();
 } catch (err: any) {
 setError(err.response?.data?.error || 'Failed to create assignment');
 } finally {
 setUploading(false);
 }
 };

 const handleSubmitAssignment = async (assignmentId: string) => {
 if (!submitFile) return;
 setSubmittingFor(assignmentId);
 
 const formData = new FormData();
 formData.append('file', submitFile);

 try {
 await api.post(`/classrooms/${classroomId}/assignments/${assignmentId}/submit`, formData, {
 headers: { 'Content-Type': 'multipart/form-data' }
 });
 setSubmitFile(null);
 fetchAssignments();
 } catch (err: any) {
 alert(err.response?.data?.error || 'Failed to submit assignment');
 } finally {
 setSubmittingFor(null);
 }
 };

 if (loading) return <div className="text-gray-500">Loading assignments...</div>;

 return (
 <div className="space-y-8">
 {user?.role === 'TEACHER' && (
 <div className="bg-white border border-gray-200 rounded-xl p-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
 <Upload size={20} className="text-purple-400" /> Create New Assignment
 </h3>
 {error && <p className="text-red-600 mb-4 bg-red-400/10 px-4 py-2 rounded">{error}</p>}
 <form onSubmit={handleCreateAssignment} className="flex flex-col gap-4 max-w-xl">
 <div>
 <label className="block text-sm text-gray-700 mb-1">Title</label>
 <input
 type="text"
 required
 value={title}
 onChange={e => setTitle(e.target.value)}
 className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-purple-500"
 />
 </div>
 <div>
 <label className="block text-sm text-gray-700 mb-1">Description</label>
 <textarea
 value={description}
 onChange={e => setDescription(e.target.value)}
 className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-purple-500"
 rows={3}
 />
 </div>
 <div>
 <label className="block text-sm text-gray-700 mb-1">Deadline</label>
 <input
 type="datetime-local"
 required
 value={deadline}
 onChange={e => setDeadline(e.target.value)}
 className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-purple-500 "
 />
 </div>
 <div>
 <label className="block text-sm text-gray-700 mb-1">Attachment (optional)</label>
 <input
 id="assignFile"
 type="file"
 onChange={e => setFile(e.target.files?.[0] || null)}
 className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600/20 file:text-purple-300 hover:file:bg-purple-600/30"
 />
 </div>
 <button
 type="submit"
 disabled={uploading || !title || !deadline}
 className="mt-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 self-start"
 >
 {uploading ? 'Creating...' : 'Create Assignment'}
 </button>
 </form>
 </div>
 )}

 <div>
 <h3 className="text-xl font-semibold text-gray-900 mb-4">Assignments</h3>
 {assignments.length === 0 ? (
 <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
 No assignments yet.
 </div>
 ) : (
 <div className="space-y-4">
 {assignments.map(assign => {
 const mySubmissions = submissions[assign.id] || [];
 const hasSubmitted = user?.role === 'STUDENT' && mySubmissions.length > 0;
 const isPastDeadline = new Date(assign.deadline) < new Date();
 
 return (
 <div key={assign.id} className="bg-white border border-gray-200 rounded-xl p-5 transition-colors">
 <div className="flex flex-col md:flex-row gap-4 justify-between">
 <div>
 <h4 className="text-xl font-medium text-gray-900 flex items-center gap-2">
 {assign.title}
 {hasSubmitted && <CheckCircle size={18} className="text-green-600" />}
 </h4>
 <p className="text-gray-500 mt-2 text-sm">{assign.description}</p>
 
 <div className="flex items-center gap-4 mt-4">
 <div className={`flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full ${isPastDeadline ? 'bg-red-500/20 text-red-600' : 'bg-green-500/20 text-green-600'}`}>
 <Calendar size={14} />
 Due: {new Date(assign.deadline).toLocaleString()}
 </div>
 {assign.file_path && (
 <a
 href={assign.file_path}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 bg-blue-500/10 px-3 py-1 rounded-full transition-colors"
 >
 <Download size={14} /> Attachment
 </a>
 )}
 </div>
 </div>

 <div className="flex flex-col gap-2 min-w-[200px]">
 {user?.role === 'STUDENT' ? (
 hasSubmitted ? (
 <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
 <span className="text-green-600 font-medium text-sm flex items-center justify-center gap-2">
 <CheckCircle size={16} /> Submitted
 </span>
 <a 
 href={mySubmissions[0].file_path}
 target="_blank"
 rel="noopener noreferrer"
 className="text-xs text-blue-400 hover:underline mt-2 block"
 >
 View Submission
 </a>
 </div>
 ) : (
 <div className="bg-white border border-gray-200 rounded-lg p-3">
 <input
 type="file"
 onChange={e => setSubmitFile(e.target.files?.[0] || null)}
 className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-white file:text-gray-900 mb-2"
 />
 <button
 onClick={() => handleSubmitAssignment(assign.id)}
 disabled={!submitFile || submittingFor === assign.id}
 className="w-full bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
 >
 {submittingFor === assign.id ? 'Submitting...' : 'Turn In'}
 </button>
 </div>
 )
 ) : (
 <button
 onClick={() => setExpandedAssignment(expandedAssignment === assign.id ? null : assign.id)}
 className="bg-white hover:bg-white text-gray-900 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
 >
 View Submissions ({mySubmissions.length})
 </button>
 )}
 </div>
 </div>
 
 {/* Teacher View Submissions */}
 {user?.role === 'TEACHER' && expandedAssignment === assign.id && (
 <div className="mt-6 pt-4 border-t border-gray-200">
 <h5 className="text-gray-900 font-medium mb-3">Student Submissions</h5>
 {mySubmissions.length === 0 ? (
 <p className="text-sm text-gray-500">No submissions yet.</p>
 ) : (
 <div className="space-y-2">
 {mySubmissions.map(sub => (
 <div key={sub.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
 <div>
 <p className="text-gray-900 text-sm font-medium">{sub.student_name}</p>
 <p className="text-gray-500 text-xs">{new Date(sub.submitted_at).toLocaleString()}</p>
 </div>
 <a
 href={sub.file_path}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors"
 >
 <Download size={14} /> Download
 </a>
 </div>
 ))}
 </div>
 )}
 </div>
 )}
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 );
}
