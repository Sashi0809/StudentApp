import { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import api from '../lib/axios';

export default function PastResults() {
  const [history, setHistory] = useState([]);
  const [cgpa, setCgpa] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/performance/history'),
      api.get('/cgpa/me').catch(() => ({ data: { cgpa: 0 } }))
    ]).then(([histRes, cgpaRes]) => {
      setHistory(histRes.data);
      setCgpa(cgpaRes.data.cgpa || 0);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-gray-500">Loading past results...</div>;

  // Group by semester
  const grouped = history.reduce((acc, curr) => {
    if (!acc[curr.semester_name]) {
      acc[curr.semester_name] = [];
    }
    acc[curr.semester_name].push(curr);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <History className="text-blue-400" /> Academic History
        </h2>
        <div className="text-gray-600 font-medium">
          Cumulative GPA: <span className="font-bold text-gray-900">{Number(cgpa).toFixed(2)}</span>
        </div>
      </div>

 {Object.keys(grouped).length === 0 ?
      <p className="text-gray-500 bg-black/20 p-6 rounded-xl border border-gray-100 text-center">
 No past semester results found.
 </p> :

      Object.entries(grouped).map(([semName, records]) =>
      <div key={semName} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
 <div className="bg-white px-6 py-4 border-b border-gray-200">
 <h3 className="text-lg font-semibold text-gray-900">{semName}</h3>
 </div>
 <div className="p-6">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm text-gray-700">
 <thead className="text-xs text-gray-500 uppercase bg-white">
 <tr>
 <th className="px-4 py-3 rounded-tl-lg">Subject</th>
 <th className="px-4 py-3">Attendance</th>
 <th className="px-4 py-3">Mid 1</th>
 <th className="px-4 py-3">Mid 2</th>
 <th className="px-4 py-3">Internal</th>
 <th className="px-4 py-3">End Sem</th>
 <th className="px-4 py-3 text-right rounded-tr-lg">Total</th>
 </tr>
 </thead>
 <tbody>
 {records.map((r, i) =>
                <tr key={r.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-black/20' : 'bg-transparent'}`}>
 <td className="px-4 py-3 font-medium text-gray-900">{r.subject || 'N/A'}</td>
 <td className="px-4 py-3">{r.attendance}%</td>
 <td className="px-4 py-3">{r.mid_sem_1 || 0}</td>
 <td className="px-4 py-3">{r.mid_sem_2 || 0}</td>
 <td className="px-4 py-3">{r.internal_marks || 0}</td>
 <td className="px-4 py-3 font-medium">{r.end_sem_marks || 0}</td>
 <td className="px-4 py-3 text-right font-bold text-blue-300">{r.final_score || 0}</td>
 </tr>
                )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
      )
      }
 </div>);

}