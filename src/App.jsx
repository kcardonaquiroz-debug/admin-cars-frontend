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
import Analisis from './pages/Analisis'
import LandingPage from './pages/LandingPage'

// Componente auxiliar para manejar redirecciones inteligentes en rutas inexistentes
function FallbackRedirect() {
  const { usuario } = useAuth()
  // Si está logueado, cualquier error de ruta lo deja dentro del panel, si no, va a la landing
  return usuario ? <Navigate to="/app" /> : <Navigate to="/" />
}

function PrivateRoute({ children }) {
  const { usuario, loading } = useAuth() // Añadido loading para evitar parpadeos y expulsiones
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white font-bebas tracking-widest text-2xl">
        Cargando AdminCARS...
      </div>
    )
  }
  
  return usuario ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { usuario, loading } = useAuth()
  
  if (loading) return null
  if (!usuario) return <Navigate to="/login" />
  
  // CORRECCIÓN: Si es Conductor, lo mandamos al dashboard interno de la app, 
  // ya que "/mis-viajes" de forma independiente no existe y causaba la expulsión.
  if (usuario.rol === 'Conductor') return <Navigate to="/app" />
  
  return children
}

export default function App() {
  return (
    <Routes>
      {/* ================= RUTAS PÚBLICAS ================= */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ================= RUTAS PRIVADAS (PANEL) ================= */}
      <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="viajes" element={<Viajes />} />
        <Route path="viajes/:id" element={<ViajeDetalle />} />
        <Route path="viajes/:id/liquidacion" element={<Liquidacion />} />
        <Route path="mi-resumen" element={<CamionResumen conductorMode />} />
        
        {/* Rutas exclusivas de Administrador */}
        <Route path="camiones" element={<AdminRoute><Camiones /></AdminRoute>} />
        <Route path="camiones/:id/resumen" element={<AdminRoute><CamionResumen /></AdminRoute>} />
        <Route path="conductores" element={<AdminRoute><Conductores /></AdminRoute>} />
        <Route path="gastos" element={<AdminRoute><Gastos /></AdminRoute>} />
        <Route path="facturas" element={<AdminRoute><Facturas /></AdminRoute>} />
        <Route path="mantenimientos" element={<AdminRoute><Mantenimientos /></AdminRoute>} />
        <Route path="analisis" element={<AdminRoute><Analisis /></AdminRoute>} />
      </Route>

      {/* Comodín: Redirección inteligente controlada */}
      <Route path="*" element={<FallbackRedirect />} />
    </Routes>
  )
}