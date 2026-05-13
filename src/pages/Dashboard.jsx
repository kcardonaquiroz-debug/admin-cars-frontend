import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { Truck, Users, MapPin, DollarSign, Wrench, TrendingUp } from 'lucide-react'

const cop = (v) => '$' + Number(v).toLocaleString('es-CO')
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-CO') : '—'

export default function Dashboard() {
  const [stats, setStats] = useState({})
  const [viajes, setViajes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [cam, con, via, gas, mant] = await Promise.all([
          api.get('/camiones'), api.get('/conductores'),
          api.get('/viajes'), api.get('/gastos'), api.get('/mantenimientos')
        ])
        const get = (r) => r.data.data || r.data
        setStats({
          camiones: get(cam).length,
          conductores: get(con).length,
          viajes: get(via).length,
          gastos: get(gas).reduce((s, g) => s + (g.monto || 0), 0),
          mantenimientos: get(mant).length,
        })
        setViajes(get(via).slice(-5).reverse())
      } catch { } finally { setLoading(false) }
    }
    load()
  }, [])

  const cards = [
    { label: 'Camiones', value: stats.camiones, icon: Truck, to: '/camiones', bg: 'bg-orange-50', border: 'border-orange-100', icon_bg: 'bg-[#E87C1E]' },
    { label: 'Conductores', value: stats.conductores, icon: Users, to: '/conductores', bg: 'bg-blue-50', border: 'border-blue-100', icon_bg: 'bg-blue-500' },
    { label: 'Viajes', value: stats.viajes, icon: MapPin, to: '/viajes', bg: 'bg-green-50', border: 'border-green-100', icon_bg: 'bg-green-500' },
    { label: 'Gastos totales', value: stats.gastos ? cop(stats.gastos) : '—', icon: DollarSign, to: '/gastos', bg: 'bg-yellow-50', border: 'border-yellow-100', icon_bg: 'bg-yellow-500' },
    { label: 'Mantenimientos', value: stats.mantenimientos, icon: Wrench, to: '/mantenimientos', bg: 'bg-purple-50', border: 'border-purple-100', icon_bg: 'bg-purple-500' },
  ]

  return (
    <div className="p-4 lg:p-8 space-y-8">

      {/* HERO */}
      <div className="relative rounded-2xl overflow-hidden h-48 lg:h-64 shadow-lg">
        <img
          src="https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=1400&q=80"
          alt="Flota" className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 lg:px-10">
          <p className="text-[#E87C1E] text-xs font-bold uppercase tracking-widest mb-2">Panel principal</p>
          <h1 className="text-2xl lg:text-4xl font-black leading-tight text-gray-800">
            Bienvenido a <span className="text-[#E87C1E]">AdminCARS</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2 max-w-md">
            Gestiona tu flota de transporte de carga en tiempo real.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {cards.map(({ label, value, icon: Icon, to, bg, border, icon_bg }) => (
          <Link key={to} to={to}
            className={`${bg} border ${border} rounded-2xl p-4 hover:shadow-md transition-all group`}>
            <div className={`w-9 h-9 ${icon_bg} rounded-xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
              <Icon size={16} className="text-white" />
            </div>
            <div className="text-xl lg:text-2xl font-black text-gray-800">{loading ? '—' : value}</div>
            <div className="text-xs text-gray-400 mt-1 font-medium">{label}</div>
          </Link>
        ))}
      </div>

      {/* ÚLTIMOS VIAJES */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#E87C1E]" /> Últimos viajes
          </h2>
          <Link to="/viajes" className="text-xs text-[#E87C1E] hover:text-[#C4610E] font-semibold transition">Ver todos →</Link>
        </div>
        <div className="grid gap-3">
          {loading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Cargando...</div>
          ) : viajes.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Sin viajes registrados</div>
          ) : viajes.map((v, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-md hover:border-[#E87C1E]/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#E87C1E]/10 flex items-center justify-center">
                  <MapPin size={16} className="text-[#E87C1E]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{v.origen} → {v.destino}</p>
                  <p className="text-xs text-gray-400">{v.producto_carga} · {fmtDate(v.fecha_salida)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#E87C1E] text-sm">{cop(v.valor_flete)}</p>
                <p className="text-xs text-gray-400">flete</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BANNER CTA */}
      <div className="relative rounded-2xl overflow-hidden h-36 shadow-md">
        <img
          src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&q=80"
          alt="Camión" className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/70" />
        <div className="absolute inset-0 flex items-center justify-between px-6 lg:px-10">
          <div>
            <p className="text-gray-800 font-bold text-lg">¿Nuevo viaje hoy?</p>
            <p className="text-gray-500 text-sm">Registra tu próxima ruta en segundos</p>
          </div>
          <Link to="/viajes"
            className="bg-[#E87C1E] hover:bg-[#C4610E] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-[#E87C1E]/30 shrink-0">
            + Nuevo viaje
          </Link>
        </div>
      </div>
    </div>
  )
}