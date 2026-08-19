import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import api from '../lib/axios';

export default function CgpaUpload() {
  const [data, setData] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [records, setRecords] = useState([]);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/cgpa');
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');

    try {
      // Parse CSV format: email,cgpa
      const lines = data.split('\n').filter((l) => l.trim().length > 0);
      const parsedRecords = lines.map((line) => {
        const [email, cgpa] = line.split(',').map((s) => s.trim());
        return { student_email: email, cgpa: parseFloat(cgpa) };
      }).filter((r) => r.student_email && !isNaN(r.cgpa));

      if (parsedRecords.length === 0) {
        throw new Error('No valid records found. Use format: email,cgpa');
      }

      const res = await api.post('/cgpa/upload', { records: parsedRecords });
      setMessage(res.data.message);
      setData('');
      fetchRecords();
    } catch (err) {
      setMessage(err.response?.data?.error || err.message || 'Failed to upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
 <div className="bg-white border border-gray-200 rounded-xl p-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
 <Upload className="text-emerald-600" /> Batch Upload CGPA Data
 </h3>
 
 <form onSubmit={handleUpload} className="max-w-xl">
 <p className="text-sm text-gray-500 mb-2">Format: <code>student_email, cgpa</code> (one per line)</p>
 <textarea
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full h-48 bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:border-emerald-500 font-mono text-sm"
            placeholder="student1@example.com, 8.5&#10;student2@example.com, 7.2"
            required />
          
 <button
            type="submit"
            disabled={uploading || !data.trim()}
            className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
            
 {uploading ? 'Uploading...' : 'Upload Records'}
 </button>
 {message && <p className="mt-3 text-emerald-300 font-medium">{message}</p>}
 </form>
 </div>

 <div className="bg-white border border-gray-200 rounded-xl p-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-4">Uploaded Records</h3>
 {records.length === 0 ?
        <p className="text-gray-500">No CGPA records uploaded yet.</p> :

        <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-gray-200 text-gray-500 text-sm">
 <th className="pb-3 font-medium">Student</th>
 <th className="pb-3 font-medium">Email</th>
 <th className="pb-3 font-medium">CGPA</th>
 <th className="pb-3 font-medium">Last Updated</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/5">
 {records.map((r) =>
              <tr key={r.id}>
 <td className="py-3 text-gray-800">{r.student_name}</td>
 <td className="py-3 text-gray-500 text-sm">{r.student_email}</td>
 <td className="py-3 font-semibold text-emerald-600">{r.cgpa}</td>
 <td className="py-3 text-gray-500 text-sm">{new Date(r.updated_at).toLocaleDateString()}</td>
 </tr>
              )}
 </tbody>
 </table>
 </div>
        }
 </div>
 </div>);

}