import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (data) {
      const user = JSON.parse(decodeURIComponent(data));
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      if (!user.role) {
        navigate('/choose-role');
      } else {
        navigate('/modules');
      }
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
      Signing you in...
    </div>
  );
};

export default AuthCallback;