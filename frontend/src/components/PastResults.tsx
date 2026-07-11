import { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import api from '../lib/axios';

export default function PastResults() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/performance/history').then(res => {
      setHistory(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-gray-400">Loading past results...</div>;

  // Group by semester
  const grouped = history.reduce((acc: any, curr: any) => {
    if (!acc[curr.semester_name]) {
      acc[curr.semester_name] = [];
    }
    acc[curr.semester_name].push(curr);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-blue-100 flex items-center gap-2">
        <History className="text-blue-400" /> Academic History
      </h2>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-gray-400 bg-black/20 p-6 rounded-xl border border-white/5 text-center">
          No past semester results found.
        </p>
      ) : (
        Object.entries(grouped).map(([semName, records]: [string, any]) => (
          <div key={semName} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="bg-white/5 px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">{semName}</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-white/5">
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
                    {records.map((r: any, i: number) => (
                      <tr key={r.id} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-black/20' : 'bg-transparent'}`}>
                        <td className="px-4 py-3 font-medium text-white">{r.subject || 'N/A'}</td>
                        <td className="px-4 py-3">{r.attendance}%</td>
                        <td className="px-4 py-3">{r.mid_sem_1 || 0}</td>
                        <td className="px-4 py-3">{r.mid_sem_2 || 0}</td>
                        <td className="px-4 py-3">{r.internal_marks || 0}</td>
                        <td className="px-4 py-3 font-medium">{r.end_sem_marks || 0}</td>
                        <td className="px-4 py-3 text-right font-bold text-blue-300">{r.final_score || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
