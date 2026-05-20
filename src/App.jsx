import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Viajes from './pages/Viajes'
import ViajeDetalle from './pages/ViajeDetalle'
import Camiones from './pages/Camiones'
import CamionResumen from './pages/CamionResumen'
import Conductores from './pages/Conductores'
import Gastos from './pages/Gastos'
import Facturas from './pages/Facturas'
import Mantenimientos from './pages/Mantenimientos'
import Liquidacion from './pages/Liquidacion'

function PrivateRoute({ children }) {
  const { usuario } = useAuth()
  return usuario ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { usuario } = useAuth()
  if (!usuario) return <Navigate to="/login" />
  if (usuario.rol === 'Conductor') return <Navigate to="/mis-viajes" />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="viajes" element={<Viajes />} />
        <Route path="viajes/:id" element={<ViajeDetalle />} />
        <Route path="viajes/:id/liquidacion" element={<Liquidacion />} />
        <Route path="camiones" element={<AdminRoute><Camiones /></AdminRoute>} />
        <Route path="camiones/:id/resumen" element={<AdminRoute><CamionResumen /></AdminRoute>} />
        <Route path="conductores" element={<AdminRoute><Conductores /></AdminRoute>} />
        <Route path="gastos" element={<AdminRoute><Gastos /></AdminRoute>} />
        <Route path="facturas" element={<AdminRoute><Facturas /></AdminRoute>} />
        <Route path="mantenimientos" element={<AdminRoute><Mantenimientos /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}