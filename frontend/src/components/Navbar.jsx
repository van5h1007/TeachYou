import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
      <Link to="/modules" className="text-lg font-semibold">
        Teach<span className="text-purple-600">You</span>
      </Link>
      {user && (
        <div className="flex items-center gap-6">
          <Link to="/modules" className="text-sm text-gray-500 hover:text-gray-800">
            Modules
          </Link>
          <Link to="/chat" className="text-sm text-gray-500 hover:text-gray-800">
            Chat
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-600">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;