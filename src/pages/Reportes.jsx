import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useCRUD } from '../hooks/useCRUD'
import toast from 'react-hot-toast'
import GraficoMensual from '../components/GraficoMensual'
import { descargarCSV, crearPDF, pdfSeccion, pdfIndicadores, pdfTabla, pdfGuardar } from '../utils/exportar'
import {
  FileBarChart, FileSpreadsheet, FileDown, Loader2, Truck, Users, Route, Receipt,
  ClipboardList, ChevronLeft, ChevronRight, Search, FlaskConical, Trash2, Database
} from 'lucide-react'

const cop = (v) => '$' + Math.round(Number(v) || 0).toLocaleString('es-CO')
const numero = (v, dec = 0) => (Number(v) || 0).toLocaleString('es-CO', { maximumFractionDigits: dec })
const pct = (v) => `${(Number(v) || 0).toLocaleString('es-CO', { maximumFractionDigits: 1 })}%`
const fmtDia = (s) => s ? s.split('-').reverse().join('/') : '—'
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#E87C1E] focus:ring-2 focus:ring-[#E87C1E]/10 transition"
const labelCls = "block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1"

const rangos = {
  mes: () => { const h = new Date(); return [iso(new Date(h.getFullYear(), h.getMonth(), 1)), iso(h)] },
  trimestre: () => { const h = new Date(); return [iso(new Date(h.getFullYear(), h.getMonth() - 2, 1)), iso(h)] },
  anio: () => { const h = new Date(); return [iso(new Date(h.getFullYear(), 0, 1)), iso(h)] },
  doce: () => { const h = new Date(); return [iso(new Date(h.getFullYear(), h.getMonth() - 11, 1)), iso(h)] },
  todo: () => ['', ''],
}
const etiquetasRango = { mes: 'Este mes', trimestre: 'Últimos 3 meses', anio: 'Este año', doce: 'Últimos 12 meses', todo: 'Todo' }

// Columnas comunes de los reportes agrupados
const colsMetricas = [
  { titulo: 'Viajes', valor: 'viajes', alinear: 'derecha', fmt: numero, ancho: 0.7 },
  { titulo: 'Toneladas', valor: 'toneladas', alinear: 'derecha', fmt: (v) => numero(v, 1), ancho: 0.9 },
  { titulo: 'Ingresos', valor: 'ingresos', alinear: 'derecha', fmt: cop, ancho: 1.3 },
  { titulo: 'Gastos', valor: 'gastos', alinear: 'derecha', fmt: cop, ancho: 1.3 },
  { titulo: 'Utilidad', valor: 'utilidad', alinear: 'derecha', fmt: cop, ancho: 1.3 },
  { titulo: 'Margen', valor: 'margen', alinear: 'derecha', fmt: pct, ancho: 0.8 },
  { titulo: 'Flete / ton', valor: 'flete_por_tonelada', alinear: 'derecha', fmt: cop, ancho: 1 },
]

const REPORTES = {
  camion: {
    titulo: 'Por camión', icon: Truck, clave: 'por_camion', archivo: 'reporte_por_camion',
    columnas: [{ titulo: 'Camión', valor: (r) => r.placa ? `${r.placa} — ${r.marca || ''} ${r.modelo || ''}`.trim() : 'Sin camión', ancho: 2 }, ...colsMetricas],
  },
  conductor: {
    titulo: 'Por conductor', icon: Users, clave: 'por_conductor', archivo: 'reporte_por_conductor',
    columnas: [{ titulo: 'Conductor', valor: (r) => r.nombre || 'Sin conductor', ancho: 2 }, ...colsMetricas],
  },
  ruta: {
    titulo: 'Por ruta', icon: Route, clave: 'por_ruta', archivo: 'reporte_por_ruta',
    columnas: [{ titulo: 'Ruta', valor: (r) => `${r.origen || '—'} → ${r.destino || '—'}`, ancho: 2.2 }, ...colsMetricas],
  },
  mes: {
    titulo: 'Por mes', icon: ClipboardList, clave: 'por_mes', archivo: 'reporte_por_mes',
    columnas: [{ titulo: 'Mes', valor: 'mes', ancho: 1 }, ...colsMetricas],
  },
  gastos: {
    titulo: 'Gastos por tipo', icon: Receipt, clave: 'gastos_por_tipo', archivo: 'reporte_gastos_por_tipo',
    columnas: [
      { titulo: 'Tipo de gasto', valor: 'tipo', ancho: 2 },
      { titulo: 'Registros', valor: 'cantidad', alinear: 'derecha', fmt: numero, ancho: 1 },
      { titulo: 'Total', valor: 'total', alinear: 'derecha', fmt: cop, ancho: 1.4 },
      { titulo: '% del gasto', valor: 'porcentaje', alinear: 'derecha', fmt: pct, ancho: 1 },
    ],
  },
}

const colsDetalle = [
  { titulo: 'Guía', valor: (v) => v.nro_guia || `#${v.id_viaje}`, ancho: 1 },
  { titulo: 'Salida', valor: 'fecha_salida', fmt: fmtDia, ancho: 0.9 },
  { titulo: 'Ruta', valor: (v) => `${v.origen} → ${v.destino}`, ancho: 2 },
  { titulo: 'Camión', valor: (v) => v.placa || '—', ancho: 0.9 },
  { titulo: 'Conductor', valor: (v) => v.conductor || '—', ancho: 1.4 },
  { titulo: 'Carga', valor: (v) => v.producto_carga || '—', ancho: 1.1 },
  { titulo: 'Ton', valor: 'toneladas', alinear: 'derecha', fmt: (v) => numero(v, 1), ancho: 0.6 },
  { titulo: 'Flete', valor: 'flete', alinear: 'derecha', fmt: cop, ancho: 1.1 },
  { titulo: 'Gastos', valor: 'gastos', alinear: 'derecha', fmt: cop, ancho: 1.1 },
  { titulo: 'Utilidad', valor: 'utilidad', alinear: 'derecha', fmt: cop, ancho: 1.1 },
]

const valorCelda = (c, fila) => {
  const v = typeof c.valor === 'function' ? c.valor(fila) : fila[c.valor]
  return c.fmt ? c.fmt(v) : v
}
const valorCrudo = (c) => (f) => (typeof c.valor === 'function' ? c.valor(f) : f[c.valor])

const limpiarCachesDatos = () => {
  try {
    Object.keys(sessionStorage)
      .filter(k => k.startsWith('snapshot_') || k === 'analisis_snapshot')
      .forEach(k => sessionStorage.removeItem(k))
  } catch { /* sin acceso a sessionStorage */ }
}

function BotonExportar({ onClick, icon: Icon = FileSpreadsheet, children }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 bg-white hover:border-[#E87C1E] hover:text-[#E87C1E] px-3 py-1.5 rounded-lg transition">
      <Icon size={13} /> {children}
    </button>
  )
}

function TablaReporte({ columnas, filas, totales }) {
  if (!filas.length) return <p className="text-center text-sm text-gray-400 py-10">Sin datos para los filtros elegidos</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {columnas.map(c => (
              <th key={c.titulo} className={`px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap ${c.alinear === 'derecha' ? 'text-right' : 'text-left'}`}>{c.titulo}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i} className="border-b border-gray-50 hover:bg-orange-50/40 transition">
              {columnas.map(c => {
                const v = valorCelda(c, f)
                const neg = (c.titulo === 'Utilidad' || c.titulo === 'Margen') && (typeof c.valor === 'function' ? 0 : f[c.valor]) < 0
                return (
                  <td key={c.titulo} className={`px-4 py-2.5 whitespace-nowrap ${c.alinear === 'derecha' ? 'text-right tabular-nums' : 'text-left'} ${neg ? 'text-red-500' : 'text-gray-700'} ${c === columnas[0] ? 'font-semibold text-gray-800' : ''}`}>{v}</td>
                )
              })}
            </tr>
          ))}
        </tbody>
        {totales && (
          <tfoot>
            <tr className="bg-gray-50 border-t border-gray-200 font-bold">
              {totales.map((t, i) => (
                <td key={i} className={`px-4 py-2.5 whitespace-nowrap text-gray-800 ${columnas[i].alinear === 'derecha' ? 'text-right tabular-nums' : ''}`}>{t}</td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

export default function Reportes() {
  const { usuario } = useAuth()
  const esAdmin = ['Administrador', 'SuperAdmin'].includes(usuario?.rol)
  const { data: camiones } = useCRUD('camiones')
  const { data: conductores } = useCRUD('conductores')

  const [filtros, setFiltros] = useState(() => { const [desde, hasta] = rangos.doce(); return { desde, hasta, camion: '', conductor: '' } })
  const [rangoActivo, setRangoActivo] = useState('doce')
  const [reporte, setReporte] = useState(null)
  const [detalle, setDetalle] = useState([])
  const [cargando, setCargando] = useState(true)
  const [pestana, setPestana] = useState('camion')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [demo, setDemo] = useState(null)
  const [procesandoDemo, setProcesandoDemo] = useState(false)
  const POR_PAGINA = 25

  const cargar = useCallback(async (f) => {
    setCargando(true)
    try {
      const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== ''))
      const [r, v] = await Promise.all([api.get('/reportes', { params }), api.get('/reportes/viajes', { params })])
      setReporte(r.data.data)
      setDetalle(v.data.data || [])
      setPagina(1)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al cargar el reporte')
    } finally {
      setCargando(false)
    }
  }, [])

  const cargarDemo = useCallback(async () => {
    if (!esAdmin) return
    try { const r = await api.get('/reportes/demo'); setDemo(r.data.data) } catch { /* opcional */ }
  }, [esAdmin])

  useEffect(() => {
    const t = setTimeout(() => cargar(filtros), 0)
    return () => clearTimeout(t)
  }, [filtros, cargar])

  useEffect(() => {
    const t = setTimeout(cargarDemo, 0)
    return () => clearTimeout(t)
  }, [cargarDemo])

  const setFiltro = (k) => (e) => { setFiltros(f => ({ ...f, [k]: e.target.value })); if (k === 'desde' || k === 'hasta') setRangoActivo(null) }
  const elegirRango = (k) => { const [desde, hasta] = rangos[k](); setRangoActivo(k); setFiltros(f => ({ ...f, desde, hasta })) }

  const descripcionFiltros = useMemo(() => {
    const partes = [filtros.desde || filtros.hasta ? `${fmtDia(filtros.desde) || 'inicio'} a ${fmtDia(filtros.hasta) || 'hoy'}` : 'Todo el historial']
    if (filtros.camion) partes.push(`Camión ${camiones.find(c => String(c.id_camion) === String(filtros.camion))?.placa || filtros.camion}`)
    if (filtros.conductor) partes.push(conductores.find(c => String(c.id_conductor) === String(filtros.conductor))?.nombre || 'Conductor')
    return partes.join(' · ')
  }, [filtros, camiones, conductores])

  const detalleFiltrado = useMemo(() => {
    if (!busqueda) return detalle
    const q = busqueda.toLowerCase()
    return detalle.filter(v => [v.nro_guia, v.origen, v.destino, v.placa, v.conductor, v.producto_carga]
      .some(x => x && String(x).toLowerCase().includes(q)))
  }, [detalle, busqueda])
  const totalPaginas = Math.max(1, Math.ceil(detalleFiltrado.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const filasPagina = detalleFiltrado.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA)

  const r = reporte?.resumen
  const totalesMetricas = r ? [numero(r.viajes), numero(r.toneladas, 1), cop(r.ingresos), cop(r.gastos), cop(r.utilidad), pct(r.margen), cop(r.flete_por_tonelada)] : null

  const totalesDe = (clave) => {
    if (!reporte) return null
    if (clave === 'gastos_por_tipo') {
      const lista = reporte.gastos_por_tipo
      return ['Total', numero(lista.reduce((s, g) => s + g.cantidad, 0)), cop(lista.reduce((s, g) => s + g.total, 0)), '100%']
    }
    return ['Total', ...totalesMetricas]
  }

  const fechaArchivo = iso(new Date())

  const exportarExcel = (id) => {
    const def = REPORTES[id]
    descargarCSV(`${def.archivo}_${fechaArchivo}`, def.columnas.map(c => ({ titulo: c.titulo, valor: valorCrudo(c) })), reporte[def.clave])
  }

  const exportarDetalleExcel = () => {
    descargarCSV(`reporte_viajes_${fechaArchivo}`, colsDetalle.map(c => ({ titulo: c.titulo, valor: valorCrudo(c) })), detalleFiltrado)
  }

  const exportarPDF = () => {
    if (!reporte) return
    const estado = crearPDF('Reporte de operación', descripcionFiltros)
    pdfSeccion(estado, 'Resumen')
    pdfIndicadores(estado, [
      ['Viajes', numero(r.viajes)], ['Toneladas', numero(r.toneladas, 1)], ['Ingresos (fletes)', cop(r.ingresos)], ['Gastos', cop(r.gastos)],
      ['Utilidad', cop(r.utilidad)], ['Margen', pct(r.margen)], ['Flete promedio', cop(r.flete_promedio)], ['Flete por tonelada', cop(r.flete_por_tonelada)],
    ])
    const aPDF = (cols) => cols.map(c => ({ ...c, valor: (f) => valorCelda(c, f) }))
    for (const id of ['mes', 'camion', 'conductor', 'ruta', 'gastos']) {
      const def = REPORTES[id]
      const filas = reporte[def.clave]
      if (!filas.length) continue
      pdfSeccion(estado, def.titulo)
      pdfTabla(estado, aPDF(def.columnas), filas, { totales: totalesDe(def.clave) })
    }
    pdfGuardar(estado, `reporte_operacion_${fechaArchivo}`)
  }

  const exportarDetallePDF = () => {
    const estado = crearPDF('Detalle de viajes', `${descripcionFiltros} · ${numero(detalleFiltrado.length)} viajes`)
    pdfTabla(estado, colsDetalle.map(c => ({ ...c, valor: (f) => valorCelda(c, f) })), detalleFiltrado)
    pdfGuardar(estado, `detalle_viajes_${fechaArchivo}`)
  }

  const generarDemo = async () => {
    if (!confirm('Se crearán 1000 viajes de prueba (guía DEMO-…) con sus gastos, repartidos en los últimos 12 meses entre los camiones y conductores activos. ¿Continuar?')) return
    setProcesandoDemo(true)
    try {
      const res = await api.post('/reportes/demo', { cantidad: 1000 }, { timeout: 120000 })
      toast.success(`Se crearon ${numero(res.data.data.viajes_creados)} viajes y ${numero(res.data.data.gastos_creados)} gastos de prueba`)
      limpiarCachesDatos()
      await Promise.all([cargar(filtros), cargarDemo()])
    } catch (e) {
      toast.error(e.response?.data?.message || 'No se pudieron generar los datos de prueba')
    } finally { setProcesandoDemo(false) }
  }

  const borrarDemo = async () => {
    if (!confirm(`Se borrarán los ${numero(demo?.viajes)} viajes de prueba (guía DEMO-…) y sus gastos. Los datos reales no se tocan. Esta acción no se puede deshacer. ¿Continuar?`)) return
    setProcesandoDemo(true)
    try {
      const res = await api.delete('/reportes/demo', { timeout: 120000 })
      toast.success(`Se borraron ${numero(res.data.data.viajes_borrados)} viajes de prueba`)
      limpiarCachesDatos()
      await Promise.all([cargar(filtros), cargarDemo()])
    } catch (e) {
      toast.error(e.response?.data?.message || 'No se pudieron borrar los datos de prueba')
    } finally { setProcesandoDemo(false) }
  }

  const def = REPORTES[pestana]
  const pestanas = [...Object.entries(REPORTES).map(([id, d]) => ({ id, titulo: d.titulo, icon: d.icon })), { id: 'detalle', titulo: 'Detalle de viajes', icon: ClipboardList }]

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* ENCABEZADO */}
      <div className="relative rounded-2xl overflow-hidden shadow-md bg-gradient-to-r from-[#1A1814] to-[#3a332b]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-6">
          <div className="flex items-center gap-3">
            <FileBarChart className="text-[#E87C1E]" size={28} />
            <div>
              <h1 className="text-2xl font-black text-white">Reportes</h1>
              <p className="text-gray-300 text-sm">{descripcionFiltros}</p>
            </div>
          </div>
          <button onClick={exportarPDF} disabled={!reporte || cargando}
            className="flex items-center gap-2 bg-[#E87C1E] hover:bg-[#C4610E] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-[#E87C1E]/30 self-start sm:self-auto">
            <FileDown size={16} /> Descargar reporte PDF
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap gap-2">
          {Object.keys(rangos).map(k => (
            <button key={k} onClick={() => elegirRango(k)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${rangoActivo === k ? 'bg-[#E87C1E] text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-800'}`}>
              {etiquetasRango[k]}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div><label className={labelCls}>Desde</label><input type="date" value={filtros.desde} onChange={setFiltro('desde')} className={inputCls} /></div>
          <div><label className={labelCls}>Hasta</label><input type="date" value={filtros.hasta} onChange={setFiltro('hasta')} className={inputCls} /></div>
          <div>
            <label className={labelCls}>Camión</label>
            <select value={filtros.camion} onChange={setFiltro('camion')} className={inputCls}>
              <option value="">Todos</option>
              {camiones.map(c => <option key={c.id_camion} value={c.id_camion}>{c.placa} — {c.marca}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Conductor</label>
            <select value={filtros.conductor} onChange={setFiltro('conductor')} className={inputCls}>
              <option value="">Todos</option>
              {conductores.map(c => <option key={c.id_conductor} value={c.id_conductor}>{c.nombre}</option>)}
            </select>
          </div>
        </div>
      </div>

      {cargando && !reporte ? (
        <div className="flex flex-col items-center py-20 text-gray-400"><Loader2 className="animate-spin text-[#E87C1E] mb-3" size={28} />Generando reporte...</div>
      ) : reporte && (
        <div className={`space-y-6 transition-opacity ${cargando ? 'opacity-60' : ''}`}>
          {/* INDICADORES */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ['Viajes', numero(r.viajes), `${numero(r.toneladas_promedio, 1)} t promedio por viaje`],
              ['Toneladas movidas', numero(r.toneladas, 1), `${cop(r.flete_por_tonelada)} por tonelada`],
              ['Ingresos (fletes)', cop(r.ingresos), `${cop(r.flete_promedio)} promedio por viaje`],
              ['Gastos', cop(r.gastos), `${cop(r.gasto_promedio)} promedio por viaje`],
            ].map(([l, v, s]) => (
              <div key={l} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{l}</p>
                <p className="text-2xl font-black text-gray-800 mt-1 tabular-nums">{v}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s}</p>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-3 items-start">
            <div className={`rounded-2xl p-5 border ${r.utilidad >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Utilidad (fletes − gastos)</p>
              <p className={`text-3xl font-black mt-1 tabular-nums ${r.utilidad >= 0 ? 'text-green-700' : 'text-red-600'}`}>{cop(r.utilidad)}</p>
              <p className="text-sm text-gray-500 mt-1">Margen: <b className="text-gray-800">{pct(r.margen)}</b></p>
              <p className="text-xs text-gray-400 mt-3">No incluye mantenimientos, salarios ni depreciación.</p>
            </div>
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="font-bold text-sm text-gray-700 mb-3">Ingresos vs gastos por mes</p>
              <GraficoMensual datos={reporte.por_mes} />
            </div>
          </div>

          {/* REPORTES DETALLADOS */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex gap-1 overflow-x-auto border-b border-gray-100 px-3 pt-3">
              {pestanas.map(({ id, titulo, icon: Icon }) => (
                <button key={id} onClick={() => setPestana(id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition ${pestana === id ? 'border-[#E87C1E] text-[#E87C1E]' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
                  <Icon size={14} /> {titulo}
                </button>
              ))}
            </div>

            {pestana !== 'detalle' ? (
              <>
                <div className="flex items-center justify-between px-4 py-3">
                  <p className="text-xs text-gray-400">{numero(reporte[def.clave].length)} filas</p>
                  <BotonExportar onClick={() => exportarExcel(pestana)}>Exportar a Excel</BotonExportar>
                </div>
                <TablaReporte columnas={def.columnas} filas={reporte[def.clave]} totales={totalesDe(def.clave)} />
              </>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3">
                  <div className="relative sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                    <input value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPagina(1) }}
                      placeholder="Buscar guía, ruta, placa, conductor..." className={inputCls + ' pl-9'} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{numero(detalleFiltrado.length)} viajes</span>
                    <BotonExportar onClick={exportarDetalleExcel}>Excel</BotonExportar>
                    <BotonExportar onClick={exportarDetallePDF} icon={FileDown}>PDF</BotonExportar>
                  </div>
                </div>
                <TablaReporte columnas={colsDetalle} filas={filasPagina} />
                {detalleFiltrado.length > POR_PAGINA && (
                  <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
                    <button disabled={paginaActual === 1} onClick={() => setPagina(paginaActual - 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={16} /></button>
                    Página {paginaActual} de {totalPaginas}
                    <button disabled={paginaActual === totalPaginas} onClick={() => setPagina(paginaActual + 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={16} /></button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* DATOS DE PRUEBA */}
      {esAdmin && (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <FlaskConical size={18} className="text-purple-500 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-gray-700">Datos de prueba</p>
              <p className="text-xs text-gray-400">
                {demo ? `${numero(demo.viajes)} viajes de prueba (guía DEMO-…) en la base de datos.` : 'Genera viajes de ejemplo para probar los reportes.'} Se pueden borrar sin afectar los datos reales.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={generarDemo} disabled={procesandoDemo}
              className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 border border-purple-200 hover:bg-purple-50 disabled:opacity-50 px-3 py-2 rounded-lg transition">
              {procesandoDemo ? <Loader2 size={13} className="animate-spin" /> : <Database size={13} />} Generar 1000 viajes de prueba
            </button>
            {demo?.viajes > 0 && (
              <button onClick={borrarDemo} disabled={procesandoDemo}
                className="flex items-center gap-1.5 text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 disabled:opacity-50 px-3 py-2 rounded-lg transition">
                <Trash2 size={13} /> Borrar datos de prueba
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
