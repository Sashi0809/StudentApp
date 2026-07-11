import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, AlertCircle, Power } from 'lucide-react';
import api from '../lib/axios';

type Semester = {
 id: string;
 name: string;
 start_date: string;
 end_date: string;
 is_active: boolean;
};

export default function SemesterManager() {
 const [semesters, setSemesters] = useState<Semester[]>([]);
 const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
 
 const [name, setName] = useState('');
 const [startDate, setStartDate] = useState('');
 const [endDate, setEndDate] = useState('');
 
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [ending, setEnding] = useState(false);
 const [message, setMessage] = useState({ text: '', type: '' });

 const fetchSemesters = async () => {
 try {
 const [resAll, resActive] = await Promise.all([
 api.get('/semesters'),
 api.get('/semesters/active').catch(() => ({ data: null }))
 ]);
 setSemesters(resAll.data);
 setActiveSemester(resActive.data);
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchSemesters();
 }, []);

 const handleCreate = async (e: React.FormEvent) => {
 e.preventDefault();
 setSaving(true);
 setMessage({ text: '', type: '' });
 
 try {
 await api.post('/semesters', { name, start_date: startDate, end_date: endDate });
 setMessage({ text: 'New semester started successfully!', type: 'success' });
 setName('');
 setStartDate('');
 setEndDate('');
 fetchSemesters();
 } catch (err: any) {
 setMessage({ text: err.response?.data?.error || 'Failed to create semester', type: 'error' });
 } finally {
 setSaving(false);
 }
 };

 const handleEndSemester = async () => {
 if (!activeSemester) return;
 
 if (!window.confirm("Are you sure you want to end this semester? This will gather all student performance data and trigger the Machine Learning Retraining process.")) {
 return;
 }
 
 setEnding(true);
 setMessage({ text: '', type: '' });
 
 try {
 await api.post(`/semesters/${activeSemester.id}/end`);
 setMessage({ text: 'Semester ended. ML Retraining pipeline triggered in the background!', type: 'success' });
 fetchSemesters();
 } catch (err: any) {
 setMessage({ text: err.response?.data?.error || 'Failed to end semester', type: 'error' });
 } finally {
 setEnding(false);
 }
 };

 if (loading) return <div className="text-gray-500">Loading semesters...</div>;

 return (
 <div className="space-y-8">
 
 {/* Active Semester Status */}
 <div className={`p-6 rounded-xl border ${activeSemester ? 'bg-blue-900/20 border-blue-500/30' : 'bg-black/20 border-gray-200'}`}>
 <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
 <Calendar className={activeSemester ? "text-blue-400" : "text-gray-500"} /> 
 Current Active Semester
 </h3>
 
 {activeSemester ? (
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
 <div>
 <p className="text-3xl font-bold text-blue-300 mb-1">{activeSemester.name}</p>
 <p className="text-sm text-gray-500">
 {new Date(activeSemester.start_date).toLocaleDateString()} to {new Date(activeSemester.end_date).toLocaleDateString()}
 </p>
 </div>
 
 <button
 onClick={handleEndSemester}
 disabled={ending}
 className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-red-900/50 disabled:opacity-50"
 >
 <Power size={18} />
 {ending ? 'Ending & Retraining...' : 'End Semester & Retrain ML'}
 </button>
 </div>
 ) : (
 <p className="text-gray-500">There is currently no active semester. Start a new one below.</p>
 )}
 </div>

 {/* Start New Semester */}
 <div className="bg-white border border-gray-200 rounded-xl p-6">
 <h3 className="text-lg font-semibold text-gray-900 mb-4">Start New Semester</h3>
 
 <form onSubmit={handleCreate} className="max-w-2xl space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <label className="block text-sm text-gray-700 mb-1">Semester Name</label>
 <input
 required
 type="text"
 value={name}
 onChange={e => setName(e.target.value)}
 placeholder="e.g. Spring 2026"
 className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500"
 />
 </div>
 <div>
 <label className="block text-sm text-gray-700 mb-1">Start Date</label>
 <input
 required
 type="date"
 value={startDate}
 onChange={e => setStartDate(e.target.value)}
 className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500"
 />
 </div>
 <div>
 <label className="block text-sm text-gray-700 mb-1">End Date</label>
 <input
 required
 type="date"
 value={endDate}
 onChange={e => setEndDate(e.target.value)}
 className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500"
 />
 </div>
 </div>
 
 <button
 type="submit"
 disabled={saving}
 className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
 >
 {saving ? 'Creating...' : 'Create & Activate'}
 </button>
 </form>
 </div>
 
 {/* Messages */}
 {message.text && (
 <div className={`p-4 rounded-lg border flex items-center gap-2 ${message.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-600' : 'bg-green-500/10 border-green-500/30 text-green-600'}`}>
 {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
 {message.text}
 </div>
 )}

 {/* History */}
 <div className="bg-white border border-gray-200 rounded-xl p-6">
 <h3 className="text-lg font-semibold text-gray-900 mb-4">Semester History</h3>
 {semesters.length === 0 ? (
 <p className="text-gray-500">No semesters recorded.</p>
 ) : (
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-gray-200 text-gray-500 text-sm">
 <th className="pb-3 font-medium">Name</th>
 <th className="pb-3 font-medium">Start Date</th>
 <th className="pb-3 font-medium">End Date</th>
 <th className="pb-3 font-medium">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/5">
 {semesters.map(s => (
 <tr key={s.id}>
 <td className="py-3 text-gray-900">{s.name}</td>
 <td className="py-3 text-gray-500 text-sm">{new Date(s.start_date).toLocaleDateString()}</td>
 <td className="py-3 text-gray-500 text-sm">{new Date(s.end_date).toLocaleDateString()}</td>
 <td className="py-3">
 {s.is_active ? (
 <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">Active</span>
 ) : (
 <span className="px-2 py-1 bg-gray-500/20 text-gray-500 text-xs rounded-full font-medium">Completed</span>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>

 </div>
 );
}
