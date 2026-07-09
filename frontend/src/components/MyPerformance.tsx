import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, AlertCircle, CheckCircle, Video, MessageSquare } from 'lucide-react';
import api from '../lib/axios';

export default function MyPerformance() {
  const [performances, setPerformances] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Complaint State
  const [complaintText, setComplaintText] = useState('');
  const [sendingComplaint, setSendingComplaint] = useState(false);
  const [complaintMsg, setComplaintMsg] = useState('');

  // Meeting State
  const [requestingMeeting, setRequestingMeeting] = useState<string | null>(null);
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
        const active = res.data.find((s: any) => s.is_active);
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

  const handleComplaint = async (e: React.FormEvent) => {
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

  const handleRequestMeeting = async (teacherId: string) => {
    if (!meetingTopic) {
      alert("Please enter a topic for the meeting");
      return;
    }
    setRequestingMeeting(teacherId);
    try {
      await api.post('/meetings/request', { teacher_id: teacherId, topic: meetingTopic });
      alert('Meeting request sent to the teacher!');
      setMeetingTopic('');
    } catch (err) {
      alert('Failed to request meeting.');
    } finally {
      setRequestingMeeting(null);
    }
  };

  if (loading) return <div className="text-gray-400">Loading your performance data...</div>;

  return (
    <div className="space-y-8">
      
      {/* Semester Filter */}
      {semesters.length > 0 && (
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl">
          <label className="text-gray-300 font-medium whitespace-nowrap">View Semester:</label>
          <select 
            value={selectedSemester} 
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="bg-black/50 border border-white/20 text-white rounded-lg px-4 py-2 w-full max-w-xs focus:outline-none focus:border-blue-500"
          >
            {semesters.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name} {s.is_active ? '(Active)' : ''}</option>
            ))}
          </select>
        </div>
      )}

      {performances.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <Activity className="mx-auto text-gray-500 mb-4" size={48} />
          <h3 className="text-xl text-gray-300">No performance data available for this semester.</h3>
          <p className="text-gray-500 mt-2">Your teachers will share your ML-predicted performance here once available.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {performances.map(p => (
            <div key={p.id} className="bg-black/30 border border-white/10 rounded-xl p-6 relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                
                {/* Data Column */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">Performance Overview</h3>
                  <p className="text-sm text-gray-400 mb-6">Assessed by: {p.teacher_name}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="text-xs text-gray-400 uppercase tracking-wider">Attendance</div>
                      <div className="text-lg font-semibold text-white">{p.attendance}%</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="text-xs text-gray-400 uppercase tracking-wider">Assignments</div>
                      <div className="text-lg font-semibold text-white">{p.assignment_avg}/10</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="text-xs text-gray-400 uppercase tracking-wider">Mid Marks</div>
                      <div className="text-lg font-semibold text-white">{p.mid_marks}/30</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="text-xs text-gray-400 uppercase tracking-wider">Internal Marks</div>
                      <div className="text-lg font-semibold text-white">{p.internal_marks}/10</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="text-xs text-gray-400 uppercase tracking-wider">Difficulty</div>
                      <div className="text-lg font-semibold text-white">{p.subject_difficulty}/10</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="text-xs text-gray-400 uppercase tracking-wider">Prev CGPA</div>
                      <div className="text-lg font-semibold text-white">{p.previous_cgpa}</div>
                    </div>
                  </div>
                </div>

                {/* ML Prediction Column */}
                <div className="w-full md:w-1/3 flex flex-col justify-center">
                  <div className={`p-6 rounded-xl border flex flex-col items-center justify-center text-center ${
                    p.predicted_pass_percentage < 50 ? 'bg-red-500/10 border-red-500/30' :
                    p.predicted_pass_percentage < 75 ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-green-500/10 border-green-500/30'
                  }`}>
                    <span className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-2">Predicted Pass %</span>
                    <span className={`text-4xl font-black ${
                      p.predicted_pass_percentage < 50 ? 'text-red-400' :
                      p.predicted_pass_percentage < 75 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {p.predicted_pass_percentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Alerts System based on ML output */}
              <div className="mt-6 border-t border-white/10 pt-6">
                {p.predicted_pass_percentage < 50 && (
                  <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <AlertTriangle className="text-red-400 flex-shrink-0" size={32} />
                    <div className="flex-1">
                      <h4 className="text-red-400 font-bold">Critical Alert</h4>
                      <p className="text-red-200 text-sm">Your predicted passing chance is very low. You must schedule a meeting with your teacher immediately to discuss a recovery plan.</p>
                    </div>
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <input 
                        type="text"
                        placeholder="Meeting topic..."
                        value={meetingTopic}
                        onChange={e => setMeetingTopic(e.target.value)}
                        className="bg-black/50 border border-red-500/30 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-red-500"
                      />
                      <button 
                        onClick={() => handleRequestMeeting(p.teacher_id)}
                        disabled={requestingMeeting === p.teacher_id}
                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Video size={16} /> Request Meet
                      </button>
                    </div>
                  </div>
                )}

                {p.predicted_pass_percentage >= 50 && p.predicted_pass_percentage < 75 && (
                  <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 mb-4 flex items-start gap-4">
                    <AlertCircle className="text-yellow-400 flex-shrink-0" size={28} />
                    <div>
                      <h4 className="text-yellow-400 font-bold">Warning</h4>
                      <p className="text-yellow-200 text-sm">You are at risk of falling behind. Consider these suggested changes:</p>
                      <ul className="list-disc list-inside text-yellow-200/80 text-sm mt-2">
                        {p.attendance < 75 && <li>Improve your attendance immediately.</li>}
                        {p.assignment_avg < 60 && <li>Focus on scoring higher in upcoming assignments.</li>}
                        {p.mid_marks < 60 && <li>Review mid-term topics and seek extra help.</li>}
                        <li>Dedicate more self-study hours per week.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {p.predicted_pass_percentage >= 75 && (
                  <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-4 flex items-start gap-4">
                    <CheckCircle className="text-green-400 flex-shrink-0" size={28} />
                    <div>
                      <h4 className="text-green-400 font-bold">On Track</h4>
                      <p className="text-green-200 text-sm">Great job! Keep up the good work to maintain this trajectory.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complaints Section */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-8">
        <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
          <MessageSquare className="text-blue-400" /> Spot an irregularity?
        </h3>
        <p className="text-gray-400 text-sm mb-4">If any of your marks or attendance data seem incorrect, you can raise a direct complaint to the Head of Department (HOD).</p>
        
        <form onSubmit={handleComplaint} className="max-w-2xl">
          <textarea
            required
            value={complaintText}
            onChange={e => setComplaintText(e.target.value)}
            rows={3}
            className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 mb-3"
            placeholder="Describe the issue with your data here..."
          />
          <button
            type="submit"
            disabled={sendingComplaint || !complaintText}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {sendingComplaint ? 'Submitting...' : 'Raise Complaint'}
          </button>
          {complaintMsg && <p className="mt-3 text-blue-300 text-sm">{complaintMsg}</p>}
        </form>
      </div>
    </div>
  );
}
