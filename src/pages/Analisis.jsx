import { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Truck,
  Users, MapPin, Wrench, Fuel, Calendar, AlertTriangle,
  Award, PieChart, Activity, Route, Clock, Percent,
  CreditCard, FileText, ListChecks, RefreshCw
} from 'lucide-react'

const CACHE_KEY = 'analisis_snapshot'
const cop = (v) => '$' + Number(v).toLocaleString('es-CO')
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-CO') : '—'

const getCache = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

const setCache = (data) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: new Date().toISOString()
    }))
  } catch { }
}

const fmtHora = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-CO', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
  })
}

export default function Analisis() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) { setLoading(true) }
    try {
      const res = await api.get('/analisis')
      setData(res.data.data)
      setCache(res.data.data)
      setLastUpdate(new Date().toISOString())
    } catch { } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    const cached = getCache()
    if (cached) {
      setData(cached.data)
      setLastUpdate(cached.timestamp)
      setLoading(false)
    } else {
      fetchData()
    }
  }, [fetchData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData(true)
  }

  if (loading) {
    return (
      <div className="p-4 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <BarChart3 className="animate-pulse mx-auto text-[#E87C1E] mb-4" size={40} />
          <p className="text-gray-400 text-sm font-medium">Cargando análisis...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-4 lg:p-8 text-center py-20">
        <AlertTriangle size={40} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-400 text-sm">No se pudieron cargar los datos de análisis</p>
      </div>
    )
  }

  const rf = data.resumen_financiero
  const viajes = data.viajes
  const flota = data.flota
  const mant = data.mantenimiento
  const cond = data.conductores
  const comb = data.combustible
  const dep = data.depreciacion_flota?.resumen
  const mejorRuta = data.mejor_ruta

  const KpiCard = ({ icon: Icon, label, value, sub, color = 'text-[#E87C1E]', bg = 'bg-orange-50', border = 'border-orange-100' }) => (
    <div className={`${bg} border ${border} rounded-2xl p-5 hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${color.replace('text-', 'bg-').replace('#E87C1E', '[#E87C1E]')} bg-opacity-15 rounded-xl flex items-center justify-center`}>
          <Icon size={18} className={color} />
        </div>
      </div>
      <div className={`text-2xl font-black text-gray-800`}>{value}</div>
      <div className="text-xs text-gray-400 mt-1 font-medium">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )

  const SectionTitle = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 bg-[#E87C1E]/10 rounded-xl flex items-center justify-center">
        <Icon size={18} className="text-[#E87C1E]" />
      </div>
      <h2 className="text-lg font-black text-gray-800 uppercase tracking-wider">{title}</h2>
    </div>
  )

  return (
    <div className="p-4 lg:p-8 space-y-10">

      {/* HEADER */}
      <div className="relative rounded-2xl overflow-hidden shadow-md h-36">
        <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=80" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <BarChart3 size={36} className="text-[#E87C1E]" />
            <div>
              <h1 className="text-3xl font-black text-white">Análisis Global</h1>
              <p className="text-gray-300 text-sm">
                Snapshot · {lastUpdate ? fmtHora(lastUpdate) : 'cargando...'}
              </p>
            </div>
          </div>
          <button onClick={handleRefresh} disabled={refreshing}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition border border-white/20 disabled:opacity-50">
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* 1. RESUMEN FINANCIERO */}
      <div>
        <SectionTitle icon={DollarSign} title="Rentabilidad y Finanzas" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard icon={TrendingUp} label="Ingresos totales" value={cop(rf.ingresos_totales)} color="text-green-500" bg="bg-green-50" border="border-green-100" />
          <KpiCard icon={TrendingDown} label="Gastos totales" value={cop(rf.gastos_totales)} color="text-red-500" bg="bg-red-50" border="border-red-100" />
          <KpiCard icon={DollarSign} label="Ganancia neta" value={cop(rf.ganancia_neta)} color={rf.ganancia_neta >= 0 ? 'text-green-500' : 'text-red-500'} bg="bg-blue-50" border="border-blue-100" />
          <KpiCard icon={Percent} label="Rentabilidad" value={`${rf.rentabilidad_porcentaje}%`} color="text-purple-500" bg="bg-purple-50" border="border-purple-100" />
          <KpiCard icon={Activity} label="Promedio gasto/viaje" value={cop(rf.promedio_gasto_por_viaje)} color="text-yellow-500" bg="bg-yellow-50" border="border-yellow-100" />
          <KpiCard icon={TrendingUp} label="Promedio flete/viaje" value={cop(rf.promedio_flete_por_viaje)} color="text-emerald-500" bg="bg-emerald-50" border="border-emerald-100" />
          <KpiCard icon={FileText} label="Facturas emitidas" value={rf.total_facturas} color="text-indigo-500" bg="bg-indigo-50" border="border-indigo-100" />
          <KpiCard icon={ListChecks} label="Liquidaciones" value={rf.total_liquidaciones} color="text-teal-500" bg="bg-teal-50" border="border-teal-100" />
        </div>
      </div>

      {/* 2. VIAJES */}
      <div>
        <SectionTitle icon={MapPin} title="Viajes" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard icon={Route} label="Total viajes" value={viajes.total_viajes} color="text-blue-500" bg="bg-blue-50" border="border-blue-100" />
          <KpiCard icon={Clock} label="En curso" value={viajes.viajes_en_curso} color="text-orange-500" bg="bg-orange-50" border="border-orange-100" />
          <KpiCard icon={Award} label="Completados" value={viajes.viajes_completados} color="text-green-500" bg="bg-green-50" border="border-green-100" />
          <KpiCard icon={AlertTriangle} label="Pendientes" value={viajes.viajes_pendientes} color="text-gray-500" bg="bg-gray-50" border="border-gray-200" />
        </div>
        {mejorRuta && (
          <div className="mt-3 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award size={20} className="text-[#E87C1E]" />
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Mejor ruta</p>
                <p className="font-bold text-gray-800">{mejorRuta.ruta}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-[#E87C1E]">{mejorRuta.total_viajes} viajes</p>
              <p className="text-xs text-gray-400">{cop(mejorRuta.total_ingresos)} generados</p>
            </div>
          </div>
        )}
      </div>

      {/* 3. FLOTA */}
      <div>
        <SectionTitle icon={Truck} title="Flota y Conductores" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard icon={Truck} label="Camiones activos" value={flota.camiones_activos} color="text-orange-500" bg="bg-orange-50" border="border-orange-100" />
          <KpiCard icon={AlertTriangle} label="Camiones sin conductor" value={flota.camiones_sin_conductor} sub="Requieren asignación" color="text-red-500" bg="bg-red-50" border="border-red-100" />
          <KpiCard icon={Activity} label="Viajes promedio/camión" value={flota.promedio_viajes_por_camion} color="text-blue-500" bg="bg-blue-50" border="border-blue-100" />
          <KpiCard icon={Users} label="Conductores activos" value={flota.conductores_activos} color="text-green-500" bg="bg-green-50" border="border-green-100" />
          <KpiCard icon={Activity} label="Viajes promedio/conductor" value={flota.promedio_viajes_por_conductor} color="text-purple-500" bg="bg-purple-50" border="border-purple-100" />
        </div>
      </div>

      {/* 4. MANTENIMIENTO Y ALERTAS */}
      <div>
        <SectionTitle icon={Wrench} title="Mantenimiento y Alertas" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard icon={Wrench} label="Total mantenimientos" value={mant.total_mantenimientos} color="text-orange-500" bg="bg-orange-50" border="border-orange-100" />
          <KpiCard icon={DollarSign} label="Costo total mantenimiento" value={cop(mant.costo_total_mantenimiento)} color="text-red-500" bg="bg-red-50" border="border-red-100" />
          <KpiCard icon={Calendar} label="Próximos mantenimientos (30d)" value={mant.mantenimientos_proximos_30dias} color="text-yellow-500" bg="bg-yellow-50" border="border-yellow-100" />
          <KpiCard icon={Calendar} label="Licencias por vencer (30d)" value={cond.licencias_por_vencer_30dias} color="text-orange-500" bg="bg-orange-50" border="border-orange-100" />
          <KpiCard icon={AlertTriangle} label="Licencias vencidas" value={cond.licencias_vencidas} sub="Requieren acción urgente" color="text-red-500" bg="bg-red-50" border="border-red-100" />
        </div>
      </div>

      {/* 5. COMBUSTIBLE */}
      <div>
        <SectionTitle icon={Fuel} title="Combustible" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <KpiCard icon={Fuel} label="Total gastado en combustible" value={cop(comb.total_gastado_combustible)} color="text-yellow-500" bg="bg-yellow-50" border="border-yellow-100" />
          <KpiCard icon={PieChart} label="Combustible vs gastos totales" value={`${comb.porcentaje_combustible_vs_gastos}%`} sub="Del total de gastos" color="text-orange-500" bg="bg-orange-50" border="border-orange-100" />
        </div>
      </div>

      {/* 6. DEPRECIACIÓN */}
      <div>
        <SectionTitle icon={TrendingDown} title="Depreciación de Flota" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard icon={DollarSign} label="Valor inicial flota" value={cop(dep?.valor_inicial_total || 0)} color="text-green-500" bg="bg-green-50" border="border-green-100" />
          <KpiCard icon={DollarSign} label="Valor actual flota" value={cop(dep?.valor_actual_total || 0)} color="text-blue-500" bg="bg-blue-50" border="border-blue-100" />
          <KpiCard icon={TrendingDown} label="Depreciación total" value={cop(dep?.depreciacion_total || 0)} color="text-red-500" bg="bg-red-50" border="border-red-100" />
        </div>

        {data.depreciacion_flota?.camiones?.length > 0 && (
          <div className="mt-4 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Camión</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Año</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Edad</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Valor inicial</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Valor actual</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Depreciación</th>
                  </tr>
                </thead>
                <tbody>
                  {data.depreciacion_flota.camiones.map((c, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-orange-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-sm text-gray-800">{c.marca} {c.modelo}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{c.anio || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{c.edad} años</td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">{cop(c.valor_inicial)}</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-600 text-right">{cop(c.valor_actual)}</td>
                      <td className="px-4 py-3 text-sm font-bold text-red-500 text-right">{cop(c.valor_inicial - c.valor_actual)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 7. GASTOS POR TIPO */}
      {data.gastos_por_tipo?.length > 0 && (
        <div>
          <SectionTitle icon={PieChart} title="Gastos por Tipo" />
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">% del total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.gastos_por_tipo.map((g, i) => {
                    const pct = rf.gastos_totales > 0 ? ((g.total / rf.gastos_totales) * 100).toFixed(1) : 0
                    return (
                      <tr key={i} className="border-b border-gray-50 hover:bg-orange-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-sm text-gray-800">{g.tipo}</td>
                        <td className="px-4 py-3 text-sm font-bold text-[#E87C1E] text-right">{cop(g.total)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 text-right">{pct}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
