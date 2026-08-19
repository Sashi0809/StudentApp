import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';
import api from '../lib/axios';










export default function StudentMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/meetings');
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkResolved = async (id) => {
    try {
      await api.put(`/meetings/${id}/status`, { status: 'COMPLETED' });
      fetchMessages();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (loading) return <div className="text-gray-500">Loading messages...</div>;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
 <MessageSquare className="text-blue-400" /> Student Messages
 </h3>
 
 {messages.length === 0 ?
      <div className="bg-black/20 p-8 rounded-lg border border-gray-100 text-center">
 <MessageSquare className="mx-auto text-gray-500 mb-4" size={40} />
 <p className="text-gray-500">No messages from students yet.</p>
 </div> :

      <div className="space-y-4">
 {messages.map((m) =>
        <div key={m.id} className="bg-white border border-gray-200 rounded-lg p-5 transition-colors hover:border-gray-300">
 <div className="flex justify-between items-start mb-3">
 <div>
 <h4 className="text-gray-900 font-semibold text-lg">{m.student_name}</h4>
 <p className="text-gray-500 text-sm">{m.student_email}</p>
 </div>
 <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
            m.status === 'COMPLETED' ?
            'bg-green-500/10 text-green-600 border-green-500/30' :
            'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'}`
            }>
 {m.status === 'COMPLETED' ? 'Resolved' : 'Pending'}
 </span>
 </div>
 
 <div className="bg-white p-4 rounded border border-gray-100 mb-4">
 <p className="text-gray-800">{m.topic}</p>
 </div>
 
 <div className="flex justify-between items-center text-sm">
 <div className="text-gray-500 flex items-center gap-1">
 <Clock size={14} />
 {new Date(m.created_at).toLocaleString()}
 </div>
 {m.status !== 'COMPLETED' &&
            <button
              onClick={() => handleMarkResolved(m.id)}
              className="flex items-center gap-1 text-green-600 hover:bg-green-400/10 px-3 py-1.5 rounded transition-colors">
              
 <CheckCircle size={16} /> Mark as Resolved
 </button>
            }
 </div>
 </div>
        )}
 </div>
      }
 </div>);

}