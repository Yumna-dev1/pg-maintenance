import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import TenantDashboard from './pages/TenantDashboard'
import AdminDashboard from './pages/AdminDashboard'
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tenant" element={<ProtectedRoute role="tenant"><TenantDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/coordinator" element={<ProtectedRoute role="coordinator"><Dashboard title="Coordinator Dashboard" /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}