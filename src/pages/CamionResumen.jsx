import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Truck, MapPin, DollarSign, TrendingUp } from 'lucide-react'

const cop = (v) => '$' + Number(v).toLocaleString('es-CO')
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-CO') : '—'

export default function CamionResumen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fechas, setFechas] = useState({
    inicio: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10),
    fin: new Date().toISOString().slice(0, 10)
  })

  const cargar = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/camiones/${id}/resumen?fecha_inicio=${fechas.inicio}&fecha_fin=${fechas.fin}`)
      setData(res.data.data)
    } catch { toast.error('Error al cargar resumen') }
    finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [id, fechas])

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Cargando...</div>
  if (!data) return null

  const { camion, viajes, resumen } = data

  return (
    <div className="p-4 lg:p-8 space-y-6">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/camiones')}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-800 transition">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-800">{camion.placa} — {camion.marca} {camion.modelo}</h1>
          <p className="text-gray-400 text-sm">Conductor: {camion.nombre_conductor || '—'}</p>
        </div>
      </div>

      {/* FOTO + FILTROS */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {camion.foto_url ? (
            <img src={camion.foto_url} alt={camion.placa} className="w-full h-48 object-cover" />
          ) : (
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
              <Truck size={48} className="text-gray-300" />
            </div>
          )}
          <div className="p-4">
            <p className="font-bold text-gray-800">{camion.placa}</p>
            <p className="text-sm text-gray-400">{camion.marca} {camion.modelo} · {camion.capacidad} ton</p>
            <span className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full font-semibold ${camion.estado ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
              {camion.estado ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* FILTRO FECHAS */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Rango de fechas</p>
            <div className="flex gap-3">
              <input type="date" value={fechas.inicio}
                onChange={e => setFechas({ ...fechas, inicio: e.target.value })}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#E87C1E] transition" />
              <input type="date" value={fechas.fin}
                onChange={e => setFechas({ ...fechas, fin: e.target.value })}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#E87C1E] transition" />
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MapPin, label: 'Viajes', value: resumen.totalViajes, color: 'bg-blue-50 border-blue-100', iconColor: 'bg-blue-500' },
              { icon: TrendingUp, label: 'Total fletes', value: cop(resumen.totalFletes), color: 'bg-orange-50 border-orange-100', iconColor: 'bg-[#E87C1E]' },
              { icon: DollarSign, label: 'Total gastos', value: cop(resumen.totalGastos), color: 'bg-red-50 border-red-100', iconColor: 'bg-red-500' },
              { icon: Truck, label: 'Saldo neto', value: cop(resumen.totalSaldo), color: resumen.totalSaldo >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100', iconColor: resumen.totalSaldo >= 0 ? 'bg-green-500' : 'bg-red-500' },
            ].map(({ icon: Icon, label, value, color, iconColor }) => (
              <div key={label} className={`${color} border rounded-2xl p-4`}>
                <div className={`w-8 h-8 ${iconColor} rounded-lg flex items-center justify-center mb-2`}>
                  <Icon size={14} className="text-white" />
                </div>
                <p className="text-lg font-black text-gray-800">{value}</p>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HISTORIAL VIAJES */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-bold text-sm text-gray-700">Historial de viajes</h2>
        </div>
        {viajes.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">Sin viajes en este rango</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['#', 'Ruta', 'Carga', 'Fecha', 'Flete', 'Gastos', 'Saldo'].map(col => (
                  <th key={col} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {viajes.map(v => (
                <tr key={v.id_viaje} className="border-b border-gray-50 last:border-0 hover:bg-orange-50/30 transition cursor-pointer"
                  onClick={() => navigate(`/viajes/${v.id_viaje}`)}>
                  <td className="px-4 py-3 text-xs text-gray-400">#{v.id_viaje}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{v.origen} → {v.destino}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{v.producto_carga}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{fmtDate(v.fecha_salida)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-[#E87C1E]">{cop(v.valor_flete)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-red-500">{cop(v.total_gastos)}</td>
                  <td className="px-4 py-3 text-sm font-black" style={{ color: v.saldo >= 0 ? '#16a34a' : '#ef4444' }}>{cop(v.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}