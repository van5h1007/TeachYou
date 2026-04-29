import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const { default: express } = await import('express');
const { default: mongoose } = await import('mongoose');
const { default: cors } = await import('cors');
const { default: http } = await import('http');
const { Server } = await import('socket.io');
const { default: session } = await import('express-session');
const { default: passport } = await import('passport');
const { onlineUsers, setIO } = await import('./config/socket.js');

await import('./config/passport.js');

const { default: authRoutes } = await import('./routes/auth.js');
const { default: moduleRoutes } = await import('./routes/modules.js');
const { default: chatRoutes } = await import('./routes/chat.js');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
    methods: ['GET', 'POST'],
  }
});

setIO(io);

app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/chat', chatRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB error:', err));

io.on('connection', (socket) => {
  socket.on('userOnline', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} is online.`);
  });

  socket.on('joinRoom', (room) => {
    socket.join(room);
  });

  socket.on('sendMessage', (data) => {
    io.to(data.room).emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(uid);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));