import { Link } from 'react-router-dom';

const ModuleCard = ({ module }) => {
  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          module.visibility === 'public'
            ? 'bg-green-100 text-green-800'
            : 'bg-amber-100 text-amber-800'
        }`}>
          {module.visibility}
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 font-medium">
          {module.creator?.role}
        </span>
      </div>
      <h3 className="font-medium text-gray-900 mb-1">{module.title}</h3>
      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{module.description}</p>
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
        <Link
          to={`/modules/${module._id}`}
          className="text-xs px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700"
        >
          View
        </Link>
      </div>
    </div>
  );
};

export default ModuleCard;