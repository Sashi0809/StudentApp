import { useState } from 'react';
import { Calculator } from 'lucide-react';
import api from '../lib/axios';

export default function MarkPredictor() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: 'CSE101',
    attendance: '',
    mid_sem_1: '',
    mid_sem_2: '',
    internal_marks: ''
  });
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/performance/predict-marks', formData);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to predict marks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <Calculator className="text-purple-400" /> Mark Predictor
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Subject</label>
              <select
                required
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
                className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
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
            
            <div>
              <label className="block text-sm text-gray-300 mb-1">Attendance (%) *</label>
              <input
                type="number" required min="0" max="100"
                value={formData.attendance}
                onChange={e => setFormData({...formData, attendance: e.target.value})}
                className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Mid Sem 1 (Optional)</label>
                <input
                  type="number" min="0" max="15"
                  value={formData.mid_sem_1}
                  onChange={e => setFormData({...formData, mid_sem_1: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white"
                  placeholder="Max 15"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Mid Sem 2 (Optional)</label>
                <input
                  type="number" min="0" max="15"
                  value={formData.mid_sem_2}
                  onChange={e => setFormData({...formData, mid_sem_2: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white"
                  placeholder="Max 15"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Internal (Optional)</label>
                <input
                  type="number" min="0" max="20"
                  value={formData.internal_marks}
                  onChange={e => setFormData({...formData, internal_marks: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white"
                  placeholder="Max 20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Predicting...' : 'Predict Marks'}
            </button>
            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
          </form>
        </div>

        <div>
          {result && (
            <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6 animate-in fade-in zoom-in duration-300 h-full flex flex-col justify-center">
              <h4 className="text-lg font-semibold text-white mb-6 text-center">Prediction Results</h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <span className="text-gray-300">Mid Sem 1</span>
                  <span className="font-bold text-white">
                    {result.mid_sem_1} / 15
                    {result.mid_sem_1_predicted && <span className="ml-2 text-xs text-purple-400 uppercase bg-purple-400/10 px-2 py-1 rounded">Predicted</span>}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <span className="text-gray-300">Mid Sem 2</span>
                  <span className="font-bold text-white">
                    {result.mid_sem_2} / 15
                    {result.mid_sem_2_predicted && <span className="ml-2 text-xs text-purple-400 uppercase bg-purple-400/10 px-2 py-1 rounded">Predicted</span>}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <span className="text-gray-300">Internal</span>
                  <span className="font-bold text-white">
                    {result.internal_marks} / 20
                    {result.internal_predicted && <span className="ml-2 text-xs text-purple-400 uppercase bg-purple-400/10 px-2 py-1 rounded">Predicted</span>}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <span className="text-purple-200 font-medium">End Sem</span>
                  <span className="font-bold text-purple-100">
                    {result.end_sem_marks} / 50
                    <span className="ml-2 text-xs text-purple-300 uppercase bg-purple-900/50 px-2 py-1 rounded">Predicted</span>
                  </span>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-sm text-gray-400 mb-2">Projected Total Marks</p>
                <div className="text-5xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {result.total_marks} <span className="text-2xl text-gray-500 font-medium">/ 100</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
