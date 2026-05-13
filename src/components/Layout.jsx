import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Truck, Users, MapPin,
  DollarSign, FileText, Wrench, LogOut, Menu, X
} from 'lucide-react'

const nav = [
  { to: '/', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/viajes', label: 'Viajes', icon: MapPin },
  { to: '/camiones', label: 'Camiones', icon: Truck },
  { to: '/conductores', label: 'Conductores', icon: Users },
  { to: '/gastos', label: 'Gastos', icon: DollarSign },
  { to: '/facturas', label: 'Facturas', icon: FileText },
  { to: '/mantenimientos', label: 'Mantenimientos', icon: Wrench },
]

export default function Layout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }
  const initials = usuario?.email?.substring(0, 2).toUpperCase() || 'AC'

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 overflow-hidden">

      {open && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-white border-r border-gray-200
        flex flex-col shadow-sm transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#E87C1E] rounded-xl flex items-center justify-center shadow-md">
              <Truck size={18} className="text-white" />
            </div>
            <span className="font-black text-xl tracking-widest text-gray-800">
              Admin<span className="text-[#E87C1E]">CARS</span>
            </span>
          </div>
        </div>

        {/* Usuario */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#E87C1E]/10 border-2 border-[#E87C1E]/30 flex items-center justify-center text-[#E87C1E] text-sm font-bold">
            {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-gray-800">{usuario?.email}</p>
            <p className="text-xs text-gray-400">{usuario?.rol || 'Usuario'}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150
                ${isActive
                  ? 'bg-[#E87C1E] text-white shadow-md shadow-[#E87C1E]/30'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }
              `}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 bg-white flex-shrink-0 shadow-sm">
          <button className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition"
            onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="text-sm text-gray-400 hidden lg:block capitalize">
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="w-9 h-9 rounded-full bg-[#E87C1E]/10 border-2 border-[#E87C1E]/30 flex items-center justify-center text-[#E87C1E] text-sm font-bold lg:hidden">
            {initials}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}