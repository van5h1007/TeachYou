import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const ChooseRole = () => {
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await API.patch('/auth/role', { role });
      const updated = { ...user, role: data.role };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      navigate('/modules');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">One last step</h1>
        <p className="text-sm text-gray-500 mb-6">Tell us how you'll be using TeachYou</p>
        <div className="flex gap-3 mb-6">
          {['student', 'educator'].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-3 text-sm rounded-xl border transition-colors ${
                role === r
                  ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-purple-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default ChooseRole;