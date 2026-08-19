import { useState } from 'react';
import { X, Trash2, Plus, ShieldCheck } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';


















export default function EventModal({ date, events, onClose, onEventChanged }) {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isOfficial, setIsOfficial] = useState(false);
  const [targetYear, setTargetYear] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/events', {
        event_date: date,
        title,
        description,
        is_official: isOfficial,
        target_year: parseInt(targetYear)
      });
      setTitle('');
      setDescription('');
      setIsOfficial(false);
      setTargetYear('0');
      setIsAdding(false);
      onEventChanged();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/events/${id}`);
      onEventChanged();
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
 <div className="bg-gray-50 border border-gray-300 rounded-2xl w-full max-w-md shadow-sm overflow-hidden flex flex-col">
 {/* Header */}
 <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
 <h3 className="text-xl font-semibold text-gray-900">{formattedDate}</h3>
 <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors">
 <X size={24} />
 </button>
 </div>

 {/* Content */}
 <div className="p-6 flex-1 overflow-y-auto max-h-[60vh]">
 {events.length === 0 ?
          <p className="text-gray-500 italic text-center mb-6">No events for this date.</p> :

          <div className="space-y-3 mb-6">
 {events.map((ev) => {
              const isDatesheet = ev.user_id === null;
              const canDelete = user?.role === 'HOD' || !isDatesheet && ev.user_id === user?.id;

              return (
                <div key={ev.id} className={`border rounded-lg p-3 flex justify-between items-start group ${isDatesheet ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-white border-gray-200'}`}>
 <div>
 <div className="flex items-center gap-2">
 {isDatesheet && <ShieldCheck size={16} className="text-emerald-600" />}
 <h4 className={`font-medium ${isDatesheet ? 'text-emerald-300' : 'text-gray-900'}`}>{ev.title}</h4>
 </div>
 {isDatesheet && ev.target_year > 0 &&
                    <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded mt-1 inline-block">
 Year {ev.target_year}
 </span>
                    }
 {ev.description && <p className="text-sm text-gray-500 mt-1">{ev.description}</p>}
 </div>
 {canDelete &&
                  <button
                    onClick={() => handleDelete(ev.id)}
                    className="text-gray-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all p-1"
                    title="Delete Event">
                    
 <Trash2 size={16} />
 </button>
                  }
 </div>);

            })}
 </div>
          }

 {/* Add Event Form */}
 {isAdding ?
          <form onSubmit={handleAdd} className="bg-white p-4 rounded-xl border border-gray-200">
 <h4 className="font-medium text-blue-300 mb-3">Add New Event</h4>
 {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
 <div className="space-y-3">
 <input
                required
                type="text"
                placeholder="Event Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500" />
              
 
 {user?.role === 'HOD' &&
              <div className="bg-white p-3 rounded border border-gray-200 space-y-2">
 <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
 <input
                    type="checkbox"
                    checked={isOfficial}
                    onChange={(e) => setIsOfficial(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-800 text-emerald-500 focus:ring-emerald-500" />
                  
 <span>Mark as Official Datesheet</span>
 </label>
 
 {isOfficial &&
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-gray-900 text-sm focus:outline-none focus:border-emerald-500">
                  
 <option value="0">All Years (1st-4th)</option>
 <option value="1">1st Year Only</option>
 <option value="2">2nd Year Only</option>
 <option value="3">3rd Year Only</option>
 <option value="4">4th Year Only</option>
 </select>
                }
 </div>
              }

 <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 resize-none h-20" />
              
 <div className="flex justify-end gap-2 pt-2">
 <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900">
                  
 Cancel
 </button>
 <button
                  type="submit"
                  disabled={loading || !title}
                  className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded text-gray-900 font-medium disabled:opacity-50">
                  
 {loading ? 'Saving...' : 'Save'}
 </button>
 </div>
 </div>
 </form> :

          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-gray-900 hover:border-white/40 hover:bg-white transition-all">
            
 <Plus size={18} />
 <span>Add Event</span>
 </button>
          }
 </div>
 </div>
 </div>);

}