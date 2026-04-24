import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ModuleDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get(`/modules/${id}`);
        setModule(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load module');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this module?')) return;
    try {
      await API.delete(`/modules/${id}`);
      navigate('/modules');
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await API.post(`/modules/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setModule((prev) => ({ ...prev, attachments: data.attachments }));
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-500 text-sm">{error}</div>;

  const isOwner = user?._id === module?.creator?._id;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link to="/modules" className="text-sm text-purple-600 hover:underline mb-4 block">
        ← Back to modules
      </Link>

      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex gap-2 mb-2 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              module.visibility === 'public'
                ? 'bg-green-100 text-green-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {module.visibility}
            </span>
            {module.tags?.map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">{module.title}</h1>
          <p className="text-sm text-gray-500">{module.description}</p>
        </div>
        {isOwner && (
          <div className="flex gap-2 ml-4 flex-shrink-0 flex-wrap justify-end">
            <Link
              to={`/modules/${id}/requests`}
              className="text-sm border border-purple-200 text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-50"
            >
              Requests {module.accessRequests?.length > 0 && `(${module.accessRequests.length})`}
            </Link>
            <button
              onClick={handleDelete}
              className="text-sm border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-6 border-t border-gray-100 pt-4">
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-sm font-medium">
          {module.creator?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{module.creator?.name}</p>
          <p className="text-xs text-gray-400">
            {new Date(module.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric', month: 'short', day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mb-6">
        {module.content}
      </div>

      {module.attachments?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Attachments</h2>
          <div className="flex flex-col gap-2">
            {module.attachments.map((file, i) => (
              <a
                key={i}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 text-sm text-gray-700"
              >
                <span className="text-lg">
                  {file.fileType?.includes('pdf') ? '📄' :
                   file.fileType?.includes('image') ? '🖼️' : '📎'}
                </span>
                <span className="flex-1 truncate">{file.filename}</span>
                <span className="text-xs text-purple-600">Open</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {isOwner && (
        <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500 mb-2">Add attachment</p>
          <label className="cursor-pointer">
            <span className="text-sm bg-purple-50 text-purple-700 border border-purple-200 px-4 py-2 rounded-lg hover:bg-purple-100">
              {uploading ? 'Uploading...' : 'Choose file'}
            </span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
            />
          </label>
          <p className="text-xs text-gray-400 mt-2">PDF, Word, PowerPoint, Images</p>
        </div>
      )}

      <div className="mt-6 border-t border-gray-100 pt-4">
        <Link
          to={`/chat/${id}`}
          className="inline-flex items-center gap-2 text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          💬 Open module chat
        </Link>
      </div>
    </div>
  );
};

export default ModuleDetail;