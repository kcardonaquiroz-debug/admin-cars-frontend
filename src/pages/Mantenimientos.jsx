import { useState } from 'react'
import { useCRUD } from '../hooks/useCRUD'
import Table from '../components/Table'
import Modal from '../components/Modal'
import { Wrench, Plus, Pencil } from 'lucide-react'

const cop = (v) => '$' + Number(v).toLocaleString('es-CO')
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-CO') : '—'
const empty = { fk_camion: '', descripcion: '', costo_total: '', fecha_mantenimiento: '' }
const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#E87C1E] focus:ring-2 focus:ring-[#E87C1E]/10 transition"
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"

export default function Mantenimientos() {
  const { data, loading, crear, actualizar, eliminar } = useCRUD('mantenimientos')
  const { data: camiones } = useCRUD('camiones')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(empty)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const abrir = (item = null) => {
    if (item) {
      setEditando(item.id_mantenimiento)
      setForm({ fk_camion: String(item.fk_camion), descripcion: item.descripcion, costo_total: item.costo_total, fecha_mantenimiento: item.fecha_mantenimiento?.slice(0, 10) || '' })
    } else { setEditando(null); setForm(empty) }
    setModal(true)
  }

  const guardar = async () => {
    const body = { ...form, fk_camion: +form.fk_camion, costo_total: +form.costo_total }
    const ok = editando ? await actualizar(editando, body) : await crear(body)
    if (ok) { setModal(false); setForm(empty); setEditando(null) }
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="relative rounded-2xl overflow-hidden h-36 shadow-md">
        <img src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1200&q=80" alt="" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-white/65" />
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Wrench className="text-[#E87C1E]" size={28} />
            <div>
              <h1 className="text-2xl font-black text-gray-800">Mantenimientos</h1>
              <p className="text-gray-500 text-sm">{data.length} registros</p>
            </div>
          </div>
          <button onClick={() => abrir()}
            className="flex items-center gap-2 bg-[#E87C1E] hover:bg-[#C4610E] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-[#E87C1E]/30">
            <Plus size={16} /> Nuevo mantenimiento
          </button>
        </div>
      </div>

      <Table
        columns={['#', 'Camión', 'Descripción', 'Costo', 'Fecha', '']}
        data={data} loading={loading}
        renderRow={(m) => (<>
          <td className="px-4 py-3 text-xs text-gray-400">#{m.id_mantenimiento}</td>
          <td className="px-4 py-3 font-semibold text-sm text-gray-800">Camión #{m.fk_camion}</td>
          <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{m.descripcion}</td>
          <td className="px-4 py-3 font-bold text-[#E87C1E] text-sm">{cop(m.costo_total)}</td>
          <td className="px-4 py-3 text-sm text-gray-500">{fmtDate(m.fecha_mantenimiento)}</td>
          <td className="px-4 py-3">
            <div className="flex gap-2">
              <button onClick={() => abrir(m)}
                className="text-xs text-[#E87C1E] border border-[#E87C1E]/30 hover:bg-[#E87C1E]/10 px-2 py-1 rounded-lg transition flex items-center gap-1">
                <Pencil size={11} /> Editar
              </button>
              <button onClick={() => eliminar(m.id_mantenimiento)}
                className="text-xs text-red-400 border border-red-200 hover:bg-red-50 px-2 py-1 rounded-lg transition">
                Eliminar
              </button>
            </div>
          </td>
        </>)}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editando ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'} onSubmit={guardar} submitLabel={editando ? 'Actualizar' : 'Guardar'}>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Camión</label>
            <select value={form.fk_camion} onChange={set('fk_camion')} className={inputCls}>
              <option value="">Seleccionar camión...</option>
              {camiones.map(c => <option key={c.id_camion} value={c.id_camion}>{c.marca} {c.modelo}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Descripción</label>
            <textarea value={form.descripcion} onChange={set('descripcion')} placeholder="Describe el mantenimiento..." rows={3}
              className={`${inputCls} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Costo total ($)</label>
              <input type="number" value={form.costo_total} onChange={set('costo_total')} placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Fecha</label>
              <input type="date" value={form.fecha_mantenimiento} onChange={set('fecha_mantenimiento')} className={inputCls} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}