import { useState } from 'react'
import { useCRUD } from '../hooks/useCRUD'
import Table from '../components/Table'
import Modal from '../components/Modal'
import { Truck, Plus, Pencil } from 'lucide-react'

const empty = { marca: '', modelo: '', capacidad: '', estado: '1', fk_conductor: '' }
const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#E87C1E] focus:ring-2 focus:ring-[#E87C1E]/10 transition"
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"

export default function Camiones() {
  const { data, loading, crear, actualizar, eliminar } = useCRUD('camiones')
  const { data: conductores } = useCRUD('conductores')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(empty)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const abrir = (item = null) => {
    if (item) {
      setEditando(item.id_camion)
      setForm({ marca: item.marca, modelo: item.modelo, capacidad: item.capacidad, estado: String(item.estado), fk_conductor: item.fk_conductor || '' })
    } else { setEditando(null); setForm(empty) }
    setModal(true)
  }

  const guardar = async () => {
    const body = { ...form, capacidad: +form.capacidad, estado: +form.estado, fk_conductor: form.fk_conductor ? +form.fk_conductor : null }
    const ok = editando ? await actualizar(editando, body) : await crear(body)
    if (ok) { setModal(false); setForm(empty); setEditando(null) }
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="relative rounded-2xl overflow-hidden h-36 shadow-md">
        <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=80" alt="" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-white/65" />
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Truck className="text-[#E87C1E]" size={28} />
            <div>
              <h1 className="text-2xl font-black text-gray-800">Camiones</h1>
              <p className="text-gray-500 text-sm">{data.length} en flota</p>
            </div>
          </div>
          <button onClick={() => abrir()}
            className="flex items-center gap-2 bg-[#E87C1E] hover:bg-[#C4610E] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-[#E87C1E]/30">
            <Plus size={16} /> Nuevo camión
          </button>
        </div>
      </div>

      <Table
        columns={['#', 'Marca', 'Modelo', 'Capacidad', 'Estado', '']}
        data={data} loading={loading}
        renderRow={(c) => (<>
          <td className="px-4 py-3 text-xs text-gray-400">#{c.id_camion}</td>
          <td className="px-4 py-3 font-semibold text-sm text-gray-800">{c.marca}</td>
          <td className="px-4 py-3 text-sm text-gray-500">{c.modelo}</td>
          <td className="px-4 py-3 text-sm text-gray-500">{c.capacidad} ton</td>
          <td className="px-4 py-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${c.estado ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
              {c.estado ? 'Activo' : 'Inactivo'}
            </span>
          </td>
          <td className="px-4 py-3">
            <div className="flex gap-2">
              <button onClick={() => abrir(c)}
                className="text-xs text-[#E87C1E] border border-[#E87C1E]/30 hover:bg-[#E87C1E]/10 px-2 py-1 rounded-lg transition flex items-center gap-1">
                <Pencil size={11} /> Editar
              </button>
              <button onClick={() => eliminar(c.id_camion)}
                className="text-xs text-red-400 border border-red-200 hover:bg-red-50 px-2 py-1 rounded-lg transition">
                Eliminar
              </button>
            </div>
          </td>
        </>)}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editando ? 'Editar Camión' : 'Nuevo Camión'} onSubmit={guardar} submitLabel={editando ? 'Actualizar' : 'Guardar'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[{ label: 'Marca', key: 'marca', placeholder: 'Ej: Volvo' }, { label: 'Modelo', key: 'modelo', placeholder: 'Ej: FH16' }].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                <input value={form[key]} onChange={set(key)} placeholder={placeholder} className={inputCls} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Capacidad (ton)</label>
              <input type="number" value={form.capacidad} onChange={set('capacidad')} placeholder="0.00" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Estado</label>
              <select value={form.estado} onChange={set('estado')} className={inputCls}>
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Conductor asignado</label>
            <select value={form.fk_conductor} onChange={set('fk_conductor')} className={inputCls}>
              <option value="">Sin asignar</option>
              {conductores.map(c => <option key={c.id_conductor} value={c.id_conductor}>{c.nombre}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}