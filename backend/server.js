import dotenv from "dotenv"
dotenv.config()
import express from "express"
import mongoose from "mongoose"
import cors from "cors"

import http from "http";
import { Server } from "socket.io"
import authRoutes from "./routes/auth.js"
import moduleRoutes from "./routes/modules.js"
import chatRoutes from "./routes/chat.js"
import './config/passport.js';
import session from 'express-session';
import passport from 'passport';


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
    methods: ['GET', 'POST'],
  }
});


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

app.use("/api/auth", authRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/chat", chatRoutes);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Body:', req.body);
  next();
});

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log('MongoDB error:', err));

export const onlineUsers= new Map();

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
      for(const [uid, sid] of onlineUsers.entries()) {
        if(sid === socket.id) {
          onlineUsers.delete(uid);
          break;
        }
      }
    });

});


export { io };

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));