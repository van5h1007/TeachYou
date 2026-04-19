import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import ModuleCard from '../components/ModuleCard';
import { useAuth } from '../context/AuthContext';

const Modules = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const { user } = useAuth();

  const fetchModules = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (tag) params.tag = tag;
      const { data } = await API.get('/modules', { params });
      setModules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchModules();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">All modules</h1>
        {user?.role === 'educator' && (
          <Link
            to="/modules/create"
            className="bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            + New module
          </Link>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search modules..."
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
        />
        <input
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Filter by tag..."
          className="w-40 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
        />
        <button
          type="submit"
          className="border border-gray-200 text-sm px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          Search
        </button>
      </form>

      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">Loading modules...</div>
      ) : modules.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">No modules found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <ModuleCard key={mod._id} module={mod} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Modules;