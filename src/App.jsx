import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Viajes from './pages/Viajes'
import Camiones from './pages/Camiones'
import Conductores from './pages/Conductores'
import Gastos from './pages/Gastos'
import Facturas from './pages/Facturas'
import Mantenimientos from './pages/Mantenimientos'

function PrivateRoute({ children }) {
  const { usuario } = useAuth()
  return usuario ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="viajes" element={<Viajes />} />
        <Route path="camiones" element={<Camiones />} />
        <Route path="conductores" element={<Conductores />} />
        <Route path="gastos" element={<Gastos />} />
        <Route path="facturas" element={<Facturas />} />
        <Route path="mantenimientos" element={<Mantenimientos />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}