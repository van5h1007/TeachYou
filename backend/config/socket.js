let io;
const onlineUsers = new Map();

const setIO = (ioInstance) => {
  io = ioInstance;
};

const getIO = () => io;

export { io, onlineUsers, setIO, getIO };