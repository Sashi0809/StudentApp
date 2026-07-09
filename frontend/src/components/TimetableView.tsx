import { useState, useEffect } from 'react';
import { Calendar, Download } from 'lucide-react';
import api from '../lib/axios';

type Timetable = {
  id: string;
  file_path: string;
  uploaded_at: string;
};

export default function TimetableView() {
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await api.get('/timetables');
        if (res.data) {
          setTimetable(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch timetable', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  if (loading) return <div className="text-gray-400">Loading timetable...</div>;

  if (!timetable) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <Calendar size={32} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">No Timetable Available</h3>
        <p className="text-gray-400">Your Head of Department has not uploaded a timetable yet.</p>
      </div>
    );
  }

  const fileUrl = `http://localhost:5000${timetable.file_path}`;
  const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png)$/i);
  const isPDF = fileUrl.match(/\.(pdf)$/i);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Calendar className="text-blue-400" /> Department Timetable
        </h3>
        <a 
          href={fileUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-colors border border-white/10"
        >
          <Download size={16} /> Download
        </a>
      </div>

      <div className="border border-white/10 rounded-lg overflow-hidden bg-black/40 min-h-[400px] flex items-center justify-center">
        {isImage ? (
          <img src={fileUrl} alt="Timetable" className="max-w-full h-auto" />
        ) : isPDF ? (
          <iframe src={fileUrl} className="w-full h-[600px] border-none" title="Timetable PDF" />
        ) : (
          <div className="text-center p-8">
            <p className="text-gray-300 mb-4">The timetable file cannot be previewed directly.</p>
            <a href={fileUrl} download className="text-blue-400 hover:text-blue-300 font-medium underline">
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
