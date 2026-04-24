import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';

const ModuleRequests = () => {
  const { id } = useParams();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchModule = async () => {
    try {
      const { data } = await API.get(`/modules/${id}`);
      setModule(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModule();
  }, [id]);

  const handleGrant = async (userId) => {
    try {
      await API.post(`/modules/${id}/grant/${userId}`);
      fetchModule();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeny = async (userId) => {
    try {
      await API.post(`/modules/${id}/deny/${userId}`);
      fetchModule();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevoke = async (userId) => {
    if (!window.confirm('Revoke access for this student?')) return;
    try {
      await API.delete(`/modules/${id}/revoke/${userId}`);
      fetchModule();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Link to={`/modules/${id}`} className="text-sm text-purple-600 hover:underline mb-4 block">
        ← Back to module
      </Link>
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Access management</h1>
      <p className="text-sm text-gray-500 mb-6">{module?.title}</p>

      <div className="mb-8">
        <h2 className="text-sm font-medium text-gray-700 mb-3">
          Pending requests ({module?.accessRequests?.length || 0})
        </h2>
        {module?.accessRequests?.length === 0 ? (
          <p className="text-sm text-gray-400">No pending requests.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {module?.accessRequests?.map((req) => (
              <div
                key={req.user._id}
                className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-sm font-medium">
                    {req.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{req.user.name}</p>
                    <p className="text-xs text-gray-400">{req.user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGrant(req.user._id)}
                    className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDeny(req.user._id)}
                    className="text-xs px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-medium text-gray-700 mb-3">
          Students with access ({module?.allowedUsers?.length || 0})
        </h2>
        {module?.allowedUsers?.length === 0 ? (
          <p className="text-sm text-gray-400">No students have access yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {module?.allowedUsers?.map((student) => (
              <div
                key={student._id}
                className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-medium">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{student.name}</p>
                    <p className="text-xs text-gray-400">{student.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRevoke(student._id)}
                  className="text-xs px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleRequests;