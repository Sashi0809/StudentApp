import { useState, useEffect } from 'react';
import { Upload, Download, FileText } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

export default function ClassroomMaterials({ classroomId }: { classroomId: string }) {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fetchMaterials = async () => {
    try {
      const res = await api.get(`/classrooms/${classroomId}/materials`);
      setMaterials(res.data);
    } catch (err) {
      console.error('Failed to fetch materials', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [classroomId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    try {
      await api.post(`/classrooms/${classroomId}/materials`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTitle('');
      setFile(null);
      if (document.getElementById('materialFile')) (document.getElementById('materialFile') as HTMLInputElement).value = '';
      fetchMaterials();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="text-gray-400">Loading materials...</div>;

  return (
    <div className="space-y-8">
      {user?.role === 'TEACHER' && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Upload size={20} className="text-blue-400" /> Upload New Material
          </h3>
          {error && <p className="text-red-400 mb-4 bg-red-400/10 px-4 py-2 rounded">{error}</p>}
          <form onSubmit={handleUpload} className="flex flex-col gap-4 max-w-xl">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. Chapter 1 Notes"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">File</label>
              <input
                id="materialFile"
                type="file"
                required
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600/20 file:text-blue-300 hover:file:bg-blue-600/30"
              />
            </div>
            <button
              type="submit"
              disabled={uploading || !file || !title}
              className="mt-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 self-start"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Study Materials</h3>
        {materials.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-400">
            No materials have been uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materials.map(m => (
              <div key={m.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{m.title}</h4>
                    <p className="text-xs text-gray-400">{new Date(m.uploaded_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <a
                  href={`http://localhost:5000${m.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  title="Download"
                >
                  <Download size={20} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
