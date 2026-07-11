import { useState, useEffect } from 'react';
import { Activity, Save } from 'lucide-react';
import api from '../lib/axios';

export default function PerformanceEntry() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    attendance: '',
    mid_sem_1: '',
    mid_sem_2: '',
    end_sem_marks: '',
    internal_marks: ''
  });

  const [performances, setPerformances] = useState<any[]>([]);

  const handleEdit = (p: any) => {
    setSelectedStudent(p.student_id);
    setFormData({
      attendance: p.attendance?.toString() || '',
      mid_sem_1: p.mid_sem_1?.toString() || '',
      mid_sem_2: p.mid_sem_2?.toString() || '',
      end_sem_marks: p.end_sem_marks?.toString() || '',
      internal_marks: p.internal_marks?.toString() || ''
    });
  };

  const availableStudents = students.filter(s => 
    s.id === selectedStudent || !performances.some(p => p.student_id === s.id)
  );

  const fetchData = async () => {
    try {
      const [studentsRes, perfRes] = await Promise.all([
        api.get('/users/students'),
        api.get('/performance')
      ]);
      setStudents(studentsRes.data);
      setPerformances(perfRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSaving(true);
    setMessage('');
    
    try {
      await api.post('/performance', {
        student_id: selectedStudent,
        ...formData
      });
      setMessage('Performance saved successfully!');
      setFormData({ attendance: '', mid_sem_1: '', mid_sem_2: '', end_sem_marks: '', internal_marks: '' });
      setSelectedStudent('');
      fetchData();
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to save performance');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-gray-400">Loading students...</div>;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <Activity className="text-blue-400" /> Upload Marks
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Select Student</label>
              <select
                required
                value={selectedStudent}
                onChange={e => setSelectedStudent(e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Choose Student --</option>
                {availableStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                ))}
                {!availableStudents.some(s => s.id === selectedStudent) && selectedStudent && (
                  <option value={selectedStudent}>
                    {performances.find(p => p.student_id === selectedStudent)?.student_name || 'Unknown Student'}
                  </option>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Attendance (%)</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={formData.attendance}
                  onChange={e => setFormData({...formData, attendance: e.target.value})}
                  className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Mid Sem 1 (Max 15)</label>
                <input
                  type="number"
                  min="0" max="15"
                  value={formData.mid_sem_1}
                  onChange={e => setFormData({...formData, mid_sem_1: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Mid Sem 2 (Max 15)</label>
                <input
                  type="number"
                  min="0" max="15"
                  value={formData.mid_sem_2}
                  onChange={e => setFormData({...formData, mid_sem_2: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Assignment (Max 20)</label>
                <input
                  type="number"
                  required
                  min="0" max="20"
                  value={formData.internal_marks}
                  onChange={e => setFormData({...formData, internal_marks: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">End Sem (Max 50)</label>
                <input
                  type="number"
                  min="0" max="50"
                  value={formData.end_sem_marks}
                  onChange={e => setFormData({...formData, end_sem_marks: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-300 mb-1">Subject (Auto-Assigned)</label>
                <input
                  type="text"
                  disabled
                  value={user.subject || 'Not Set'}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !selectedStudent}
              className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Save size={18} /> {saving ? 'Saving...' : (performances.some(p => p.student_id === selectedStudent) ? 'Update Marks' : 'Upload Marks')}
            </button>
            {message && <p className="text-sm text-blue-300 mt-2">{message}</p>}
          </form>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Uploaded Marks</h3>
          {performances.length === 0 ? (
            <p className="text-gray-400 bg-black/20 p-4 rounded-lg border border-white/5 text-sm">No marks uploaded yet.</p>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {performances.map(p => (
                <div key={p.id} className="bg-black/30 border border-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-white font-medium">{p.student_name}</h4>
                      <p className="text-xs text-gray-400">Semester: {p.semester_name || 'Active'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.shared_at && (
                        <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">Visible to Student</span>
                      )}
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-xs text-blue-400 hover:bg-blue-400/10 px-2 py-1 rounded border border-blue-400/30 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                    <div>Attendance: <span className="text-white">{p.attendance}%</span></div>
                    <div>Assignment: <span className="text-white">{p.internal_marks} / 20</span></div>
                    <div>Mid 1: <span className="text-white">{p.mid_sem_1} / 15</span></div>
                    <div>Mid 2: <span className="text-white">{p.mid_sem_2} / 15</span></div>
                    <div>End Sem: <span className="text-white">{p.end_sem_marks} / 50</span></div>
                    <div>Total: <span className="text-purple-300 font-bold">{p.final_score}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
