import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, Pencil, FileText, Truck, User, Package, Calendar } from 'lucide-react'

const cop = (v) => '$' + Number(v).toLocaleString('es-CO')
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-CO') : '—'

const categorias = [
  'Combustible (ACPM)',
  'Peaje',
  'Viáticos / Liga',
  'Comisión',
  'Porcentaje',
  'Engrasado',
  'Aceite de motor',
  'Repuestos',
  'Seguridad',
  'Seguimiento',
  'Planilla',
  'Plástico',
  'Otro',
]

const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#E87C1E] focus:ring-2 focus:ring-[#E87C1E]/10 transition"
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
const emptyGasto = { tipo_gasto: '', categoria: '', monto: '' }

export default function ViajeDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const esConductor = usuario?.rol === 'Conductor'

  const [viaje, setViaje] = useState(null)
  const [gastos, setGastos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(emptyGasto)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const cargar = async () => {
    try {
      setLoading(true)
      const [rv, rg] = await Promise.all([
        api.get(`/viajes/${id}`),
        api.get(`/gastos`)
      ])
      setViaje(rv.data.data)
      const todos = rg.data.data || rg.data
      setGastos(todos.filter(g => g.fk_viaje === +id))
    } catch { toast.error('Error al cargar viaje') }
    finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [id])

  const totalGastos = gastos.reduce((s, g) => s + (g.monto || 0), 0)
  const saldo = (viaje?.valor_flete || 0) - totalGastos

  const abrir = (item = null) => {
    if (item) {
      setEditando(item.id_gastos)
      setForm({ tipo_gasto: item.tipo_gasto, categoria: item.categoria || '', monto: item.monto })
    } else { setEditando(null); setForm(emptyGasto) }
    setModal(true)
  }

  const guardar = async () => {
    if (!form.tipo_gasto || !form.monto) { toast.error('Completa los campos'); return }
    try {
      const body = { fk_viaje: +id, tipo_gasto: form.tipo_gasto, categoria: form.categoria, monto: +form.monto }
      if (editando) {
        await api.put(`/gastos/${editando}`, body)
        toast.success('Gasto actualizado ✓')
      } else {
        await api.post('/gastos', body)
        toast.success('Gasto registrado ✓')
      }
      setModal(false); setForm(emptyGasto); setEditando(null)
      cargar()
    } catch (e) { toast.error(e.response?.data?.error || 'Error al guardar') }
  }

  const eliminarGasto = async (gastoId) => {
    if (!confirm('¿Eliminar este gasto?')) return
    try {
      await api.delete(`/gastos/${gastoId}`)
      toast.success('Eliminado')
      cargar()
    } catch (e) { toast.error(e.response?.data?.error || 'Error al eliminar') }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Cargando...</div>
  if (!viaje) return <div className="flex items-center justify-center h-64 text-gray-400">Viaje no encontrado</div>

  return (
    <div className="p-4 lg:p-8 space-y-6">

      {/* BACK + HEADER */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/app/viajes')}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-800 hover:shadow-sm transition">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-800">
            Viaje #{viaje.id_viaje}
            {viaje.nro_guia && <span className="text-[#E87C1E] ml-2">— {viaje.nro_guia}</span>}
          </h1>
          <p className="text-gray-400 text-sm">{viaje.origen} → {viaje.destino}</p>
        </div>
      </div>

      {/* INFO CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Truck, label: 'Camión', value: `${viaje.placa || ''} ${viaje.marca} ${viaje.modelo}` },
          { icon: User, label: 'Conductor', value: viaje.nombre_conductor || '—' },
          { icon: Package, label: 'Carga', value: viaje.producto_carga || '—' },
          { icon: Calendar, label: 'Fecha salida', value: fmtDate(viaje.fecha_salida) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className="text-[#E87C1E]" />
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{label}</span>
            </div>
            <p className="font-semibold text-sm text-gray-800">{value}</p>
          </div>
        ))}
      </div>

      {/* LIQUIDACIÓN RÁPIDA */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
          <h2 className="font-bold text-sm text-gray-700">Liquidación del viaje</h2>
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          <div className="p-5 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Flete</p>
            <p className="text-xl font-black text-gray-800">{cop(viaje.valor_flete)}</p>
          </div>
          <div className="p-5 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total gastos</p>
            <p className="text-xl font-black text-red-500">{cop(totalGastos)}</p>
          </div>
          <div className="p-5 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Saldo camión</p>
            <p className={`text-xl font-black ${saldo >= 0 ? 'text-green-600' : 'text-red-500'}`}>{cop(saldo)}</p>
          </div>
        </div>
        {!esConductor && (
          <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
            <button onClick={() => navigate(`/app/viajes/${id}/liquidacion`)}
              className="flex items-center gap-2 bg-[#E87C1E] hover:bg-[#C4610E] text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-md shadow-[#E87C1E]/20">
              <FileText size={14} /> Ver liquidación completa / PDF
            </button>
          </div>
        )}
      </div>

      {/* GASTOS */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="font-bold text-sm text-gray-700">Gastos del viaje ({gastos.length})</h2>
          {!esConductor && (
            <button onClick={() => abrir()}
              className="flex items-center gap-1.5 bg-[#E87C1E] hover:bg-[#C4610E] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
              <Plus size={13} /> Agregar gasto
            </button>
          )}
        </div>

        {gastos.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">Sin gastos registrados</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Tipo</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Categoría</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Monto</th>
                {!esConductor && <th className="px-4 py-2.5"></th>}
              </tr>
            </thead>
            <tbody>
              {gastos.map(g => (
                <tr key={g.id_gastos} className="border-b border-gray-50 last:border-0 hover:bg-orange-50/30 transition">
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">{g.tipo_gasto}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{g.categoria || '—'}</td>
                  <td className="px-4 py-3 font-bold text-[#E87C1E] text-sm">{cop(g.monto)}</td>
                  {!esConductor && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => abrir(g)}
                          className="text-xs text-[#E87C1E] border border-[#E87C1E]/30 hover:bg-[#E87C1E]/10 px-2 py-1 rounded-lg transition flex items-center gap-1">
                          <Pencil size={11} /> Editar
                        </button>
                        <button onClick={() => eliminarGasto(g.id_gastos)}
                          className="text-xs text-red-400 border border-red-200 hover:bg-red-50 px-2 py-1 rounded-lg transition">✕</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t border-gray-200">
                <td colSpan={2} className="px-4 py-3 text-sm font-bold text-gray-700">Total gastos</td>
                <td className="px-4 py-3 font-black text-red-500">{cop(totalGastos)}</td>
                {!esConductor && <td />}
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* MODAL GASTO */}
      <Modal open={modal} onClose={() => setModal(false)} title={editando ? 'Editar Gasto' : 'Nuevo Gasto'} onSubmit={guardar} submitLabel={editando ? 'Actualizar' : 'Guardar'}>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Tipo de gasto</label>
            <select value={form.tipo_gasto} onChange={set('tipo_gasto')} className={inputCls}>
              <option value="">Seleccionar...</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Descripción / Detalle</label>
            <input value={form.categoria} onChange={set('categoria')} placeholder="Ej: 50 galones ACPM..." className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Monto ($)</label>
            <input type="number" value={form.monto} onChange={set('monto')} placeholder="0" className={inputCls} />
          </div>
        </div>
      </Modal>
    </div>
  )
}