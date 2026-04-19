import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ROOMS = ['General', 'Algebra room', 'Physics room', 'Chemistry room'];

const Chat = () => {
  const { user } = useAuth();
  const [room, setRoom] = useState('General');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:8000');
    socketRef.current.emit('joinRoom', room);

    socketRef.current.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socketRef.current.disconnect();
  }, []);

  useEffect(() => {
    socketRef.current.emit('joinRoom', room);
    fetchMessages();
  }, [room]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/chat/${room}`);
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
      const { data } = await API.post(`/chat/${room}`, { text });
      socketRef.current.emit('sendMessage', { ...data, room });
      setText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Chat</h1>
      <div className="border border-gray-200 rounded-2xl overflow-hidden flex" style={{ height: '520px' }}>
        <div className="w-48 border-r border-gray-200 p-4 flex flex-col gap-1">
          <p className="text-xs font-medium text-gray-400 mb-2">Rooms</p>
          {ROOMS.map((r) => (
            <button
              key={r}
              onClick={() => setRoom(r)}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                room === r
                  ? 'bg-purple-50 text-purple-700 font-medium'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-800">{room}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50">
            {loading ? (
              <p className="text-center text-gray-400 text-sm">Loading...</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-400 text-sm">No messages yet. Say hello!</p>
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
                    <div className={`px-3 py-2 rounded-2xl text-sm max-w-xs leading-relaxed ${
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
              placeholder="Type a message..."
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
    </div>
  );
};

export default Chat;