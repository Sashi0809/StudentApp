import { useState, useEffect } from 'react';
import { MessageSquare, Send, Clock, AlertCircle } from 'lucide-react';
import api from '../lib/axios';

export default function StudentComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      await api.post('/complaints', { description });
      setDescription('');
      fetchComplaints();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-gray-500 p-8">Loading complaints...</div>;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
          <MessageSquare size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Complaints & Feedback</h2>
          <p className="text-gray-500">Submit your concerns to the Head of Department</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">New Complaint</h3>
            
            {error && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg flex items-start gap-2 text-sm border border-red-100">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe your issue in detail..."
                required
                rows={5}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting || !description.trim()}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Submitting...' : (
                <>
                  <Send size={18} />
                  Submit Complaint
                </>
              )}
            </button>
          </form>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[400px]">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Your Previous Complaints</h3>

            {complaints.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                You haven't submitted any complaints yet.
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map(c => (
                  <div key={c.id} className={`p-5 rounded-lg border ${c.status === 'RESOLVED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <p className="text-gray-800 mb-4 whitespace-pre-wrap">{c.description}</p>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/60">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={14} />
                        {new Date(c.created_at).toLocaleString()}
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
                        c.status === 'RESOLVED' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
