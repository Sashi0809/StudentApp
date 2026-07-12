import { useState, useEffect } from 'react';
import { Calendar, Download } from 'lucide-react';
import api from '../lib/axios';

type Timetable = {
 id: string;
 file_path: string;
 uploaded_at: string;
};

export default function TimetableView({ onLoad, hideIfEmpty }: { onLoad?: (exists: boolean) => void, hideIfEmpty?: boolean } = {}) {
 const [timetable, setTimetable] = useState<Timetable | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchTimetable = async () => {
 try {
 const res = await api.get('/timetables');
 if (res.data) {
 setTimetable(res.data);
 onLoad?.(true);
 } else {
 onLoad?.(false);
 }
 } catch (err) {
 console.error('Failed to fetch timetable', err);
 onLoad?.(false);
 } finally {
 setLoading(false);
 }
 };
 fetchTimetable();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 if (loading) return <div className="text-gray-500">Loading timetable...</div>;

 if (!timetable) {
 if (hideIfEmpty) return null;
 return (
 <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
 <Calendar size={32} className="text-gray-500" />
 </div>
 <h3 className="text-xl font-medium text-gray-900 mb-2">No Timetable Available</h3>
 <p className="text-gray-500">Your Head of Department has not uploaded a timetable yet.</p>
 </div>
 );
 }

 const fileUrl = `http://localhost:5000${timetable.file_path}?token=${localStorage.getItem('token')}`;
 const isImage = timetable.file_path.match(/\.(jpeg|jpg|gif|png)$/i);
 const isPDF = timetable.file_path.match(/\.(pdf)$/i);

 return (
 <div className="bg-white border border-gray-200 rounded-xl p-6">
 <div className="flex justify-between items-center mb-6">
 <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
 <Calendar className="text-blue-400" /> Department Timetable
 </h3>
 <a 
 href={fileUrl} 
 target="_blank" 
 rel="noopener noreferrer"
 className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-white rounded-lg text-gray-900 text-sm font-medium transition-colors border border-gray-200"
 >
 <Download size={16} /> Download
 </a>
 </div>

 <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 min-h-[400px] flex items-center justify-center">
 {isImage ? (
 <img src={fileUrl} alt="Timetable" className="max-w-full h-auto" />
 ) : isPDF ? (
 <iframe src={fileUrl} className="w-full h-[600px] border-none" title="Timetable PDF" />
 ) : (
 <div className="text-center p-8">
 <p className="text-gray-700 mb-4">The timetable file cannot be previewed directly.</p>
 <a href={fileUrl} download className="text-blue-600 hover:text-blue-800 font-medium underline">
 Download File to View
 </a>
 </div>
 )}
 </div>
 <p className="text-xs text-gray-500 mt-4 text-right">
 Last updated: {new Date(timetable.uploaded_at).toLocaleString()}
 </p>
 </div>
 );
}
