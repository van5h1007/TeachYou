# TeachYou

A full-stack web application for educators and students to create, manage, and share study modules with real-time chat.

## What it does

- Educators can create public or private study modules with tags and descriptions
- Students can browse and read public modules
- Both roles can chat in real-time across multiple rooms
- JWT-based authentication with role-based access control
- Full text search across modules by title, description, and tags

## Tech stack

- **Frontend** — React, Vite, Tailwind CSS, Axios, Socket.IO client, React Router
- **Backend** — Node.js, Express.js
- **Database** — MongoDB with Mongoose
- **Authentication** — JSON Web Tokens (JWT), bcryptjs
- **Real-time** — Socket.IO

## Project structure

```
TeachYou/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema with bcrypt password hashing
│   │   ├── Module.js        # Module schema with full-text search index
│   │   └── Message.js       # Message schema with read receipts
│   ├── routes/
│   │   ├── auth.js          # Register, login, /me
│   │   ├── modules.js       # CRUD for modules
│   │   └── chat.js          # Save and fetch messages with pagination
│   ├── middleware/
│   │   └── auth.js          # JWT protect + educatorOnly middleware
│   ├── server.js            # Express app, Socket.IO, MongoDB connection
│   └── .env                 # Environment variables (not in repo)
└── frontend/
    └── src/
        ├── api/
        │   └── axios.js          # Axios instance with JWT interceptor
        ├── context/
        │   └── AuthContext.jsx   # Global auth state
        ├── components/
        │   ├── Navbar.jsx        # Top navigation
        │   ├── ModuleCard.jsx    # Module preview card
        │   └── PrivateRoute.jsx  # Route protection
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Modules.jsx       # Module list with search and filter
            ├── ModuleDetail.jsx  # Full module view with delete
            ├── CreateModule.jsx  # Module creation form
            └── Chat.jsx          # Real-time chat with room sidebar
```

## Getting started

### Prerequisites

- Node.js v20+
- MongoDB v8+

### 1. Clone the repository

```bash
git clone https://github.com/van5h1007/TeachYou.git
cd TeachYou
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:

```
PORT=8000
JWT_SECRET=your_secret_key_here
MONGO_URI=mongodb://localhost:27017/teachyou
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

### 4. Start MongoDB

```bash
mongod --dbpath /usr/local/var/mongodb
```

### 5. Run the app

Open two terminal tabs:

**Terminal 1 — backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.





