import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:8000');
    socketRef.current.emit('userOnline', user._id);
    socketRef.current.emit('joinRoom', roomId);

    socketRef.current.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    fetchModule();
    fetchMessages();

    return () => socketRef.current.disconnect();
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchModule = async () => {
    try {
      const { data } = await API.get(`/modules/${roomId}`);
      setModule(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/chat/${roomId}`);
      setMessages(data.messages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const { data } = await API.post(`/chat/${roomId}`, { text });
      socketRef.current.emit('sendMessage', { ...data, room: roomId });
      setText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(`/modules/${roomId}`)}
          className="text-sm text-purple-600 hover:underline"
        >
          ← Back to module
        </button>
      </div>
      <h1 className="text-xl font-semibold text-gray-900 mb-1">
        {module?.title || 'Module chat'}
      </h1>
      <p className="text-sm text-gray-400 mb-4">Ask questions about this module here</p>

      <div className="border border-gray-200 rounded-2xl overflow-hidden flex flex-col" style={{ height: '520px' }}>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50">
          {loading ? (
            <p className="text-center text-gray-400 text-sm">Loading...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-400 text-sm mt-8">No messages yet. Ask your first question!</p>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
              return (
                <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <span className="text-xs text-gray-400 mb-1">
                      {msg.sender?.name} · {msg.sender?.role}
                    </span>
                  )}
                  <div className={`px-3 py-2 rounded-2xl text-sm max-w-sm leading-relaxed ${
                    isMe
                      ? 'bg-purple-600 text-white rounded-tr-sm'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-xs text-gray-400 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="p-3 border-t border-gray-200 flex gap-2 bg-white">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
          />
          <button
            type="submit"
            className="bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;