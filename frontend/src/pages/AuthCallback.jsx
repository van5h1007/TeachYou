import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  console.log('AuthCallback rendered');
useEffect(() => {
  console.log('AuthCallback hit');
  console.log('Full URL:', window.location.href);
  const params = new URLSearchParams(window.location.search);
  const data = params.get('data');
  console.log('Data param:', data);
  if (data) {
    const user = JSON.parse(decodeURIComponent(data));
    console.log('Parsed user:', user);
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