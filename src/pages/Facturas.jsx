import { useState } from 'react'
import { useCRUD } from '../hooks/useCRUD'
import Table from '../components/Table'
import Modal from '../components/Modal'
import { FileText, Plus, Pencil } from 'lucide-react'

const cop = (v) => '$' + Number(v).toLocaleString('es-CO')
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-CO') : '—'
const empty = { fk_conductor: '', nombre_conductor: '', basico: '', fecha_factura: '' }
const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#E87C1E] focus:ring-2 focus:ring-[#E87C1E]/10 transition"
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"

export default function Facturas() {
  const { data, loading, crear, actualizar, eliminar } = useCRUD('facturas')
  const { data: conductores } = useCRUD('conductores')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(empty)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const abrir = (item = null) => {
    if (item) {
      setEditando(item.id_factura)
      setForm({ fk_conductor: String(item.fk_conductor), nombre_conductor: item.nombre_conductor, basico: item.basico, fecha_factura: item.fecha_factura?.slice(0, 10) || '' })
    } else { setEditando(null); setForm(empty) }
    setModal(true)
  }

  const guardar = async () => {
    const body = { ...form, fk_conductor: +form.fk_conductor, basico: +form.basico }
    const ok = editando ? await actualizar(editando, body) : await crear(body)
    if (ok) { setModal(false); setForm(empty); setEditando(null) }
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="relative rounded-2xl overflow-hidden h-36 shadow-md">
        <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&q=80" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/65" />
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <FileText className="text-[#E87C1E]" size={28} />
            <div>
              <h1 className="text-2xl font-black text-gray-800">Facturas</h1>
              <p className="text-gray-500 text-sm">{data.length} registradas</p>
            </div>
          </div>
          <button onClick={() => abrir()}
            className="flex items-center gap-2 bg-[#E87C1E] hover:bg-[#C4610E] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-[#E87C1E]/30">
            <Plus size={16} /> Nueva factura
          </button>
        </div>
      </div>

      <Table
        columns={['#', 'Conductor', 'Básico', 'Fecha', '']}
        data={data} loading={loading}
        renderRow={(f) => (<>
          <td className="px-4 py-3 text-xs text-gray-400">#{f.id_factura}</td>
          <td className="px-4 py-3 font-semibold text-sm text-gray-800">{f.nombre_conductor}</td>
          <td className="px-4 py-3 font-bold text-[#E87C1E] text-sm">{cop(f.basico)}</td>
          <td className="px-4 py-3 text-sm text-gray-500">{fmtDate(f.fecha_factura)}</td>
          <td className="px-4 py-3">
            <div className="flex gap-2">
              <button onClick={() => abrir(f)}
                className="text-xs text-[#E87C1E] border border-[#E87C1E]/30 hover:bg-[#E87C1E]/10 px-2 py-1 rounded-lg transition flex items-center gap-1">
                <Pencil size={11} /> Editar
              </button>
              <button onClick={() => eliminar(f.id_factura)}
                className="text-xs text-red-400 border border-red-200 hover:bg-red-50 px-2 py-1 rounded-lg transition">
                Eliminar
              </button>
            </div>
          </td>
        </>)}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editando ? 'Editar Factura' : 'Nueva Factura'} onSubmit={guardar} submitLabel={editando ? 'Actualizar' : 'Guardar'}>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Conductor</label>
            <select value={form.fk_conductor} onChange={(e) => {
              const c = conductores.find(c => c.id_conductor === +e.target.value)
              setForm({ ...form, fk_conductor: e.target.value, nombre_conductor: c?.nombre || '' })
            }} className={inputCls}>
              <option value="">Seleccionar...</option>
              {conductores.map(c => <option key={c.id_conductor} value={c.id_conductor}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Nombre conductor</label>
            <input value={form.nombre_conductor} onChange={set('nombre_conductor')} placeholder="Nombre completo" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Básico ($)</label>
              <input type="number" value={form.basico} onChange={set('basico')} placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Fecha</label>
              <input type="date" value={form.fecha_factura} onChange={set('fecha_factura')} className={inputCls} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}