import { useState, useEffect } from 'react';
import { Activity, AlertCircle, MessageSquare } from 'lucide-react';
import api from '../lib/axios';

export default function MyPerformance() {
  const [performances, setPerformances] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [loading, setLoading] = useState(true);

  // Complaint State
  const [complaintText, setComplaintText] = useState('');
  const [sendingComplaint, setSendingComplaint] = useState(false);
  const [complaintMsg, setComplaintMsg] = useState('');

  // Meeting State
  const [requestingMeeting, setRequestingMeeting] = useState(null);
  const [meetingTopic, setMeetingTopic] = useState('');

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    fetchPerformance();
  }, [selectedSemester]);

  const fetchSemesters = async () => {
    try {
      const res = await api.get('/semesters');
      setSemesters(res.data);
      if (res.data.length > 0) {
        // Try to find the active one
        const active = res.data.find((s) => s.is_active);
        setSelectedSemester(active ? active.id : res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch semesters', err);
    }
  };

  const fetchPerformance = async () => {
    if (!selectedSemester && semesters.length > 0) return; // Wait until semester is set
    setLoading(true);
    try {
      const endpoint = selectedSemester ? `/performance?semester_id=${selectedSemester}` : '/performance';
      const res = await api.get(endpoint);
      setPerformances(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplaint = async (e) => {
    e.preventDefault();
    setSendingComplaint(true);
    setComplaintMsg('');
    try {
      await api.post('/complaints', { description: complaintText });
      setComplaintText('');
      setComplaintMsg('Complaint raised successfully. HOD will review it.');
    } catch (err) {
      setComplaintMsg('Failed to raise complaint.');
    } finally {
      setSendingComplaint(false);
    }
  };

  const handleRequestMeeting = async (teacherId) => {
    if (!meetingTopic) {
      alert("Please enter a message for the teacher");
      return;
    }
    setRequestingMeeting(teacherId);
    try {
      await api.post('/meetings/request', { teacher_id: teacherId, topic: meetingTopic });
      alert('Message sent to the teacher!');
      setMeetingTopic('');
    } catch (err) {
      alert('Failed to send message.');
    } finally {
      setRequestingMeeting(null);
    }
  };

  if (loading) return <div className="text-gray-500">Loading your performance data...</div>;

  return (
    <div className="space-y-8">
 
 {/* Semester Filter */}
 {semesters.length > 0 &&
      <div className="flex items-center gap-4 bg-white border border-gray-200 p-4 rounded-xl">
 <label className="text-gray-700 font-medium whitespace-nowrap">View Semester:</label>
 <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="bg-black/50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 w-full max-w-xs focus:outline-none focus:border-blue-500">
          
 {semesters.map((s) =>
          <option key={s.id} value={s.id}>{s.name} {s.is_active ? '(Active)' : ''}</option>
          )}
 </select>
 </div>
      }

 {performances.length === 0 ?
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
 <Activity className="mx-auto text-gray-500 mb-4" size={48} />
 <h3 className="text-xl text-gray-700">No performance data available for this semester.</h3>
 <p className="text-gray-500 mt-2">Your teachers will share your ML-predicted performance here once available.</p>
 </div> :

      <div className="space-y-6">
 {performances.map((p) =>
        <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-6 relative overflow-hidden">
 <div className="flex flex-col md:flex-row justify-between gap-6">
 
 {/* Data Column */}
 <div className="flex-1">
 <h3 className="text-xl font-bold text-gray-900 mb-1">Performance Overview ({p.subject || 'Subject'})</h3>
 <p className="text-sm text-gray-500 mb-6">Assessed by: {p.teacher_name}</p>
 
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
 <div className="bg-white p-3 rounded-lg border border-gray-100">
 <div className="text-xs text-gray-500 uppercase tracking-wider">Attendance</div>
 <div className="text-lg font-semibold text-gray-900">{p.attendance}%</div>
 </div>
 <div className="bg-white p-3 rounded-lg border border-gray-100">
 <div className="text-xs text-gray-500 uppercase tracking-wider">Mid Sem 1</div>
 <div className="text-lg font-semibold text-gray-900">{p.mid_sem_1 || 0}/15</div>
 </div>
 <div className="bg-white p-3 rounded-lg border border-gray-100">
 <div className="text-xs text-gray-500 uppercase tracking-wider">Mid Sem 2</div>
 <div className="text-lg font-semibold text-gray-900">{p.mid_sem_2 || 0}/15</div>
 </div>
 <div className="bg-white p-3 rounded-lg border border-gray-100">
 <div className="text-xs text-gray-500 uppercase tracking-wider">Internal Marks</div>
 <div className="text-lg font-semibold text-gray-900">{p.internal_marks || 0}/20</div>
 </div>
 <div className="bg-white p-3 rounded-lg border border-gray-100">
 <div className="text-xs text-gray-500 uppercase tracking-wider">End Sem Marks</div>
 <div className="text-lg font-semibold text-gray-900">{p.end_sem_marks || 0}/50</div>
 </div>
 <div className="bg-white p-3 rounded-lg border border-gray-100">
 <div className="text-xs text-gray-500 uppercase tracking-wider">Difficulty</div>
 <div className="text-lg font-semibold text-gray-900">{p.subject_difficulty}/10</div>
 </div>
 <div className="bg-white p-3 rounded-lg border border-gray-100">
 <div className="text-xs text-gray-500 uppercase tracking-wider">Prev CGPA</div>
 <div className="text-lg font-semibold text-gray-900">{p.previous_cgpa}</div>
 </div>
 </div>
 </div>
 </div>

 {/* Alerts System based on ML output */}
 <div className="mt-6 border-t border-gray-200 pt-6">
 <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
 <AlertCircle className="text-blue-400 flex-shrink-0" size={32} />
 <div className="flex-1">
 <h4 className="text-blue-400 font-bold">Have a question?</h4>
 <p className="text-blue-200 text-sm">In case of any ambiguity with your marks, send a message to the teacher directly.</p>
 </div>
 <div className="flex flex-col gap-2 w-full sm:w-auto">
 <input
                  type="text"
                  placeholder="Type your message..."
                  value={meetingTopic}
                  onChange={(e) => setMeetingTopic(e.target.value)}
                  className="bg-black/50 border border-blue-500/30 rounded px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500" />
                
 <button
                  onClick={() => handleRequestMeeting(p.teacher_id)}
                  disabled={requestingMeeting === p.teacher_id}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  
 <MessageSquare size={16} /> Send Message
 </button>
 </div>
 </div>
 </div>
 </div>
        )}
 </div>
      }

 {/* Complaints Section */}
 <div className="bg-white border border-gray-200 rounded-xl p-6 mt-8">
 <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
 <MessageSquare className="text-blue-400" /> Spot an irregularity?
 </h3>
 <p className="text-gray-500 text-sm mb-4">If any of your marks or attendance data seem incorrect, you can raise a direct complaint to the Head of Department (HOD).</p>
 
 <form onSubmit={handleComplaint} className="max-w-2xl">
 <textarea
            required
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            rows={3}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 mb-3"
            placeholder="Describe the issue with your data here..." />
          
 <button
            type="submit"
            disabled={sendingComplaint || !complaintText}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
            
 {sendingComplaint ? 'Submitting...' : 'Raise Complaint'}
 </button>
 {complaintMsg && <p className="mt-3 text-blue-300 text-sm">{complaintMsg}</p>}
 </form>
 </div>
 </div>);

}