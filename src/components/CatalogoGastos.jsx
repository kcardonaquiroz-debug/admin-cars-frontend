import { useEffect, useState } from 'react'
import api from '../api/axios'
import Modal from './Modal'
import toast from 'react-hot-toast'
import { Plus, Pencil, Loader2, RotateCcw } from 'lucide-react'

const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#E87C1E] focus:ring-2 focus:ring-[#E87C1E]/10 transition"
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
const empty = { nombre: '', descripcion: '' }
const errMsg = (e, fallback) => e.response?.data?.message || e.response?.data?.error || fallback

// Catálogo de tipos de gasto: aquí se crean los gastos que luego se eligen al registrar un gasto.
export default function CatalogoGastos({ esAdmin, onChange }) {
  const [tipos, setTipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(empty)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const cargar = async () => {
    try {
      setLoading(true)
      const res = await api.get('/tipos-gasto?todos=1')
      setTipos(res.data.data || [])
    } catch (e) {
      toast.error(errMsg(e, 'Error al cargar el catálogo'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const refrescar = () => { cargar(); onChange?.() }

  const abrir = (item = null) => {
    if (item) {
      setEditando(item)
      setForm({ nombre: item.nombre, descripcion: item.descripcion || '' })
    } else {
      setEditando(null)
      setForm(empty)
    }
    setModal(true)
  }

  const guardar = async () => {
    if (!form.nombre.trim()) { toast.error('Escribe el nombre del gasto'); return }
    try {
      if (editando) {
        await api.put(`/tipos-gasto/${editando.id_tipo_gasto}`, { ...form, estado: editando.estado })
        toast.success('Tipo de gasto actualizado ✓')
      } else {
        await api.post('/tipos-gasto', form)
        toast.success('Tipo de gasto creado ✓')
      }
      setModal(false)
      refrescar()
    } catch (e) {
      toast.error(errMsg(e, 'Error al guardar'))
    }
  }

  const desactivar = async (t) => {
    if (!confirm(`¿Desactivar "${t.nombre}"? Ya no aparecerá al registrar gastos, pero los gastos anteriores se conservan.`)) return
    try {
      await api.delete(`/tipos-gasto/${t.id_tipo_gasto}`)
      toast.success('Tipo de gasto desactivado')
      refrescar()
    } catch (e) { toast.error(errMsg(e, 'Error al desactivar')) }
  }

  const reactivar = async (t) => {
    try {
      await api.put(`/tipos-gasto/${t.id_tipo_gasto}`, { nombre: t.nombre, descripcion: t.descripcion, estado: 1 })
      toast.success('Tipo de gasto reactivado')
      refrescar()
    } catch (e) { toast.error(errMsg(e, 'Error al reactivar')) }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div>
          <h2 className="font-bold text-sm text-gray-700">Catálogo de gastos</h2>
          <p className="text-xs text-gray-400">Los gastos que crees aquí aparecen al registrar un gasto en un viaje.</p>
        </div>
        <button onClick={() => abrir()}
          className="flex items-center gap-1.5 bg-[#E87C1E] hover:bg-[#C4610E] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
          <Plus size={13} /> Nuevo tipo de gasto
        </button>
      </div>

      {loading ? (
        <div className="py-10"><Loader2 className="animate-spin mx-auto text-[#E87C1E]" size={22} /></div>
      ) : tipos.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-10">Aún no hay gastos en el catálogo</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Nombre</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Descripción</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Usos</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Estado</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {tipos.map(t => (
                <tr key={t.id_tipo_gasto} className={`border-b border-gray-50 last:border-0 hover:bg-orange-50/30 transition ${t.estado ? '' : 'opacity-60'}`}>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{t.nombre}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{t.descripcion || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{t.total_gastos}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${t.estado ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {t.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => abrir(t)}
                        className="text-xs text-[#E87C1E] border border-[#E87C1E]/30 hover:bg-[#E87C1E]/10 px-2 py-1 rounded-lg transition flex items-center gap-1">
                        <Pencil size={11} /> Editar
                      </button>
                      {t.estado ? (
                        esAdmin && <button onClick={() => desactivar(t)}
                          className="text-xs text-red-400 border border-red-200 hover:bg-red-50 px-2 py-1 rounded-lg transition">
                          Desactivar
                        </button>
                      ) : (
                        <button onClick={() => reactivar(t)}
                          className="text-xs text-green-600 border border-green-200 hover:bg-green-50 px-2 py-1 rounded-lg transition flex items-center gap-1">
                          <RotateCcw size={11} /> Reactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editando ? 'Editar tipo de gasto' : 'Nuevo tipo de gasto'} onSubmit={guardar} submitLabel={editando ? 'Actualizar' : 'Guardar'}>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Nombre del gasto</label>
            <input value={form.nombre} onChange={set('nombre')} placeholder="Ej: Peaje, Combustible (ACPM)..." className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Descripción (opcional)</label>
            <input value={form.descripcion} onChange={set('descripcion')} placeholder="Ej: Pagos en casetas de peaje" className={inputCls} />
          </div>
          {editando && editando.total_gastos > 0 && editando.nombre !== form.nombre.trim() && (
            <p className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
              Hay {editando.total_gastos} gasto(s) registrados con este tipo; también se renombrarán.
            </p>
          )}
        </div>
      </Modal>
    </div>
  )
}
