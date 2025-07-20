import { Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Register from './pages/Register';
import Login from './pages/Login';
import Landing from './pages/Landing';
import ProtectedRoute from './components/ProtectedRoute';
import LinkBot from './pages/LinkBot';
import Reminders from './pages/Reminders';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}/>
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />

         <Route
        path="/landing"
        element={
          <ProtectedRoute>
            <Landing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/link-bot"
        element={
          <ProtectedRoute>
            <LinkBot />
          </ProtectedRoute>
        }
      />

       <Route
        path="/view-reminders"
        element={
          <ProtectedRoute>
            <Reminders />
          </ProtectedRoute>
        }
      />
    </Routes>
    
  );
}

export default App;
