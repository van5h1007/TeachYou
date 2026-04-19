import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const CreateModule = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', content: '', visibility: 'public', tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const tagsArray = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await API.post('/modules', { ...form, tags: tagsArray });
      navigate('/modules');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create module');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Create new module</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
              placeholder="Module title"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Visibility</label>
            <select
              name="visibility"
              value={form.visibility}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Description</label>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
            placeholder="Short description"
            required
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Tags (comma separated)</label>
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
            placeholder="math, algebra, beginner"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Content</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows={10}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 resize-none"
            placeholder="Write your module content here..."
            required
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white text-sm px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish module'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/modules')}
            className="border border-gray-200 text-sm px-6 py-2 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateModule;