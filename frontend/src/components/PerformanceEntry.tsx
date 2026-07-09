import { useState, useEffect } from 'react';
import { Activity, Save, Share2 } from 'lucide-react';
import api from '../lib/axios';

export default function PerformanceEntry() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    attendance: '',
    assignment_avg: '',
    mid_marks: '',
    internal_marks: '',
    subject: 'CSE101'
  });

  const [prediction, setPrediction] = useState<any>(null);

  useEffect(() => {
    api.get('/users/students').then(res => {
      setStudents(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSaving(true);
    setMessage('');
    
    try {
      const res = await api.post('/performance', {
        student_id: selectedStudent,
        ...formData
      });
      setPrediction(res.data);
      setMessage('Performance saved and predicted successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to save performance');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!prediction?.id) return;
    try {
      await api.post(`/performance/${prediction.id}/share`);
      setMessage('Performance data shared with student and HOD!');
    } catch (err) {
      setMessage('Failed to share data');
    }
  };

  if (loading) return <div className="text-gray-400">Loading students...</div>;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <Activity className="text-blue-400" /> Student Performance Entry (ML Prediction)
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
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                ))}
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
                <label className="block text-sm text-gray-400 mb-2">Assignment Avg (Max 10)</label>
                <input
                  type="number"
                  required
                  min="0" max="10"
                  value={formData.assignment_avg}
                  onChange={e => setFormData({...formData, assignment_avg: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Mid Marks (Max 30)</label>
                <input
                  type="number"
                  required
                  min="0" max="30"
                  value={formData.mid_marks}
                  onChange={e => setFormData({...formData, mid_marks: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Internal Marks (Max 10)</label>
                <input
                  type="number"
                  required
                  min="0" max="10"
                  value={formData.internal_marks}
                  onChange={e => setFormData({...formData, internal_marks: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-300 mb-1">Subject</label>
                <select
                  required
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="CSE101">CSE101</option>
                  <option value="CSE102">CSE102</option>
                  <option value="CSE201">CSE201</option>
                  <option value="CSE202">CSE202</option>
                  <option value="CSE301">CSE301</option>
                  <option value="CSE302">CSE302</option>
                  <option value="CSE303">CSE303</option>
                  <option value="CSE401">CSE401</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !selectedStudent}
              className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Save size={18} /> {saving ? 'Predicting...' : 'Save & Predict'}
            </button>
            {message && <p className="text-sm text-blue-300 mt-2">{message}</p>}
          </form>
        </div>

        <div>
          {prediction && (
            <div className="bg-black/40 border border-blue-500/30 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">ML Prediction Results</h4>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-300">Passing Probability</span>
                <span className={`text-3xl font-bold ${prediction.predicted_pass_percentage < 50 ? 'text-red-400' : prediction.predicted_pass_percentage < 75 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {prediction.predicted_pass_percentage}%
                </span>
              </div>
              
              <div className="text-sm text-gray-400 mb-6">
                Based on attendance ({prediction.attendance}%), assignment average ({prediction.assignment_avg}), mid marks ({prediction.mid_marks}), internal marks ({prediction.internal_marks}), and calculated subject difficulty ({prediction.subject_difficulty}).
              </div>

              {!prediction.shared_at ? (
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Share2 size={18} /> Share with Student & HOD
                </button>
              ) : (
                <div className="text-center p-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 text-sm font-medium">
                  Shared on {new Date(prediction.shared_at).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
