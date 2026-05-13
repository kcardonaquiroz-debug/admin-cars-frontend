import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Truck, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.data)
      toast.success('¡Bienvenido!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">

      {/* LEFT — imagen */}
      <div className="hidden lg:flex relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=80"
          alt="Camiones" className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <div className="inline-flex items-center gap-2 bg-[#E87C1E]/10 border border-[#E87C1E]/30 rounded-full px-4 py-1.5 text-[#E87C1E] text-xs font-semibold tracking-widest uppercase mb-6 w-fit">
            Sistema de gestión
          </div>
          <h1 className="text-5xl font-black leading-none tracking-tight text-gray-800 mb-4">
            Controla tu<br />
            <span className="text-[#E87C1E]">flota al máximo</span>
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
            Gestiona camiones, conductores, viajes y gastos desde un solo panel seguro y eficiente.
          </p>
          <div className="flex gap-8 mt-8">
            {[['100%', 'Control'], ['5', 'Módulos'], ['24/7', 'Disponible']].map(([num, label]) => (
              <div key={label}>
                <div className="text-2xl font-black text-[#E87C1E]">{num}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-[#E87C1E] rounded-xl flex items-center justify-center shadow-lg shadow-[#E87C1E]/30">
              <Truck size={20} className="text-white" />
            </div>
            <span className="font-black text-2xl tracking-widest text-gray-800">
              Admin<span className="text-[#E87C1E]">CARS</span>
            </span>
          </div>

          <h2 className="text-3xl font-black text-gray-800 mb-1">Bienvenido</h2>
          <p className="text-gray-400 text-sm mb-8">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Correo electrónico
              </label>
              <input type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="tu@correo.com"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#E87C1E] focus:ring-2 focus:ring-[#E87C1E]/10 transition shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#E87C1E] focus:ring-2 focus:ring-[#E87C1E]/10 transition shadow-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#E87C1E] hover:bg-[#C4610E] text-white font-semibold rounded-xl py-3 text-sm transition-all shadow-lg shadow-[#E87C1E]/30 disabled:opacity-60 mt-2">
              {loading ? 'Verificando...' : 'Ingresar al sistema'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-[#E87C1E] hover:text-[#C4610E] font-semibold transition">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}