import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

let socket;

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    socket = io('http://localhost:8000');
    socket.emit('userOnline', user._id);

    socket.on('accessRequest', (data) => {
      setNotifications((prev) => [
        { type: 'request', ...data, id: Date.now() },
        ...prev,
      ]);
    });

    socket.on('accessGranted', (data) => {
      setNotifications((prev) => [
        { type: 'granted', ...data, id: Date.now() },
        ...prev,
      ]);
    });

    socket.on('accessDenied', (data) => {
      setNotifications((prev) => [
        { type: 'denied', ...data, id: Date.now() },
        ...prev,
      ]);
    });

    return () => socket.disconnect();
  }, [user]);

  const unread = notifications.length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
      >
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-800">Notifications</p>
            {unread > 0 && (
              <button
                onClick={() => setNotifications([])}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (n.type === 'request') navigate(`/modules/${n.moduleId}/requests`);
                    else navigate(`/modules/${n.moduleId}`);
                    setOpen(false);
                  }}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50"
                >
                  <p className="text-sm text-gray-800">
                    {n.type === 'request' && (
                      <><span className="font-medium">{n.student?.name}</span> requested access to <span className="font-medium">{n.moduleTitle}</span></>
                    )}
                    {n.type === 'granted' && (
                      <>Access to <span className="font-medium">{n.moduleTitle}</span> was approved ✅</>
                    )}
                    {n.type === 'denied' && (
                      <>Access to <span className="font-medium">{n.moduleTitle}</span> was denied ❌</>
                    )}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;