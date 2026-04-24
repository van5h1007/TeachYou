import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { useState } from 'react';

const ModuleCard = ({ module, onRequestSent }) => {
  const { user } = useAuth();
  const [requesting, setRequesting] = useState(false);

  const handleRequest = async () => {
    setRequesting(true);
    try {
      await API.post(`/modules/${module._id}/request`);
      if (onRequestSent) onRequestSent(module._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Request failed');
    } finally {
      setRequesting(false);
    }
  };

  const isPrivate = module.visibility === 'private';
  const isOwner = user?._id === module.creator?._id;

  return (
    <div className={`border rounded-xl p-4 transition-colors ${
      isPrivate && !module.hasAccess
        ? 'border-gray-200 bg-gray-50'
        : 'border-gray-200 hover:border-purple-300'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          module.visibility === 'public'
            ? 'bg-green-100 text-green-800'
            : 'bg-amber-100 text-amber-800'
        }`}>
          {isPrivate && !module.hasAccess ? '🔒 Private' : module.visibility}
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 font-medium">
          {module.creator?.role}
        </span>
      </div>

      <h3 className="font-medium text-gray-900 mb-1">{module.title}</h3>

      {isPrivate && !module.hasAccess ? (
        <p className="text-sm text-gray-400 mb-3 italic">
          This module is private. Request access to view it.
        </p>
      ) : (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{module.description}</p>
      )}

      <div className="flex flex-wrap gap-1 mb-3">
        {module.tags?.map((tag) => (
          <span key={tag} className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-medium">
            {module.creator?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-500">{module.creator?.name}</span>
        </div>

        {isPrivate && !module.hasAccess && !isOwner ? (
          module.hasRequested ? (
            <span className="text-xs text-amber-600 font-medium">Requested</span>
          ) : (
            <button
              onClick={handleRequest}
              disabled={requesting}
              className="text-xs px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 disabled:opacity-50"
            >
              {requesting ? 'Requesting...' : 'Request access'}
            </button>
          )
        ) : (
          <Link
            to={`/modules/${module._id}`}
            className="text-xs px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            View
          </Link>
        )}
      </div>
    </div>
  );
};

export default ModuleCard;