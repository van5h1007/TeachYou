import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Modules from './pages/Modules';
import ModuleDetail from './pages/ModuleDetail';
import CreateModule from './pages/CreateModule';
import Chat from './pages/Chat';
import AuthCallback from './pages/AuthCallback';
import ChooseRole from './pages/ChooseRole';
import ModuleRequests from './pages/ModuleRequests';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/modules" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/choose-role" element={<ChooseRole />} />
          <Route path="/modules" element={<PrivateRoute><Modules /></PrivateRoute>} />
          <Route path="/modules/create" element={<PrivateRoute><CreateModule /></PrivateRoute>} />
          <Route path="/modules/:id" element={<PrivateRoute><ModuleDetail /></PrivateRoute>} />
          <Route path="/modules/:id/requests" element={<PrivateRoute><ModuleRequests /></PrivateRoute>} />
          <Route path="/chat/:roomId" element={<PrivateRoute><Chat /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;