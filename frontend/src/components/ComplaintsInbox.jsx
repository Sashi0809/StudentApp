import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';
import api from '../lib/axios';

export default function ComplaintsInbox() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleResolve = async (id) => {
    try {
      await api.put(`/complaints/${id}/resolve`);
      fetchComplaints();
    } catch (err) {
      alert('Failed to resolve complaint');
    }
  };

  if (loading) return <div className="text-gray-500">Loading complaints...</div>;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
 <MessageSquare className="text-red-600" /> Student Complaints
 </h3>

 {complaints.length === 0 ?
      <div className="text-center py-8 text-gray-500 bg-black/20 rounded-lg border border-gray-100">
 No complaints received. Everything is running smoothly!
 </div> :

      <div className="space-y-4">
 {complaints.map((c) =>
        <div key={c.id} className={`p-5 rounded-lg border ${c.status === 'RESOLVED' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/30'}`}>
 <div className="flex justify-between items-start gap-4">
 <div>
 <div className="flex items-center gap-2 mb-2">
 <span className="font-semibold text-gray-900">{c.student_name}</span>
 <span className="text-xs text-gray-500">({c.student_email})</span>
 </div>
 <p className="text-gray-700 mb-3">{c.description}</p>
 <div className="flex items-center gap-4 text-xs text-gray-500">
 <span className="flex items-center gap-1">
 <Clock size={12} /> {new Date(c.created_at).toLocaleString()}
 </span>
 <span className={`px-2 py-0.5 rounded-full font-medium ${c.status === 'RESOLVED' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
 {c.status}
 </span>
 </div>
 </div>
 
 {c.status === 'PENDING' &&
            <button
              onClick={() => handleResolve(c.id)}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap">
              
 <CheckCircle size={16} /> Mark Resolved
 </button>
            }
 </div>
 </div>
        )}
 </div>
      }
 </div>);

}