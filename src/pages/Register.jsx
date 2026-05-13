import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Truck, Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', confirmar: '', fk_rol: '3' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmar) { toast.error('Las contraseñas no coinciden'); return }
    if (form.password.length < 6) { toast.error('Mínimo 6 caracteres'); return }
    setLoading(true)
    try {
      await api.post('/auth/register', {
        email: form.email,
        password: form.password,
        fk_rol: parseInt(form.fk_rol)
      })
      toast.success('Cuenta creada. Inicia sesión')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#1A1814]">
      <div className="hidden lg:flex relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1200&q=80"
          alt="Camiones"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1814] via-[#1A1814]/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <h1 className="text-5xl font-black leading-none tracking-tight mb-4">
            Únete a<br /><span className="text-[#E87C1E]">AdminCARS</span>
          </h1>
          <p className="text-[#B5B2AB] text-sm max-w-xs leading-relaxed">
            Crea tu cuenta y empieza a gestionar tu flota de manera profesional.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-[#E87C1E] rounded-xl flex items-center justify-center">
              <Truck size={20} className="text-white" />
            </div>
            <span className="font-black text-2xl tracking-widest">
              Admin<span className="text-[#E87C1E]">CARS</span>
            </span>
          </div>

          <h2 className="text-3xl font-black mb-1">Crear cuenta</h2>
          <p className="text-[#6B6860] text-sm mb-8">Completa los datos para registrarte</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Correo electrónico', key: 'email', type: 'email', placeholder: 'tu@correo.com' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-[#B5B2AB] uppercase tracking-wider mb-1.5">{label}</label>
                <input type={type} required value={form[key]} onChange={set(key)} placeholder={placeholder}
                  className="w-full bg-white/4 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-[#6B6860] outline-none focus:border-[#E87C1E] transition" />
              </div>
            ))}

            {['password', 'confirmar'].map((key) => (
              <div key={key}>
                <label className="block text-xs font-medium text-[#B5B2AB] uppercase tracking-wider mb-1.5">
                  {key === 'password' ? 'Contraseña' : 'Confirmar contraseña'}
                </label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required value={form[key]} onChange={set(key)}
                    placeholder="••••••••"
                    className="w-full bg-white/4 border border-white/10 rounded-lg px-4 py-3 pr-11 text-sm text-white placeholder-[#6B6860] outline-none focus:border-[#E87C1E] transition" />
                  {key === 'password' && (
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6860] hover:text-white transition">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div>
              <label className="block text-xs font-medium text-[#B5B2AB] uppercase tracking-wider mb-1.5">Rol</label>
              <select value={form.fk_rol} onChange={set('fk_rol')}
                className="w-full bg-white/4 border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#E87C1E] transition appearance-none">
                <option value="1" className="bg-[#2C2A26]">Administrador</option>
                <option value="2" className="bg-[#2C2A26]">Co-administrador</option>
                <option value="3" className="bg-[#2C2A26]">Conductor</option>
              </select>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#E87C1E] hover:bg-[#C4610E] text-white font-medium rounded-lg py-3 text-sm transition-all disabled:opacity-60 mt-2">
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B6860] mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-[#E87C1E] hover:text-[#F5A454] font-medium transition">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}