import { useState } from 'react'
import { useCRUD } from '../hooks/useCRUD'
import Table from '../components/Table'
import Modal from '../components/Modal'
import { Users, Plus, Pencil } from 'lucide-react'

const empty = { nombre: '', telefono: '', licencia_nro: '', licencia_vence: '', fk_usuario: '' }
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-CO') : '—'
const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#E87C1E] focus:ring-2 focus:ring-[#E87C1E]/10 transition"
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"

export default function Conductores() {
  const { data, loading, crear, actualizar, eliminar } = useCRUD('conductores')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(empty)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const abrir = (item = null) => {
    if (item) {
      setEditando(item.id_conductor)
      setForm({ nombre: item.nombre, telefono: item.telefono || '', licencia_nro: item.licencia_nro, licencia_vence: item.licencia_vence?.slice(0, 10) || '', fk_usuario: item.fk_usuario || '' })
    } else { setEditando(null); setForm(empty) }
    setModal(true)
  }

  const guardar = async () => {
    const body = { ...form, fk_usuario: form.fk_usuario ? +form.fk_usuario : null }
    const ok = editando ? await actualizar(editando, body) : await crear(body)
    if (ok) { setModal(false); setForm(empty); setEditando(null) }
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="relative rounded-2xl overflow-hidden h-36 shadow-md">
        <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80" alt="" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-white/65" />
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Users className="text-[#E87C1E]" size={28} />
            <div>
              <h1 className="text-2xl font-black text-gray-800">Conductores</h1>
              <p className="text-gray-500 text-sm">{data.length} registrados</p>
            </div>
          </div>
          <button onClick={() => abrir()}
            className="flex items-center gap-2 bg-[#E87C1E] hover:bg-[#C4610E] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-[#E87C1E]/30">
            <Plus size={16} /> Nuevo conductor
          </button>
        </div>
      </div>

      <Table
        columns={['#', 'Nombre', 'Teléfono', 'Licencia', 'Vence', '']}
        data={data} loading={loading}
        renderRow={(c) => {
          const vigente = new Date(c.licencia_vence) > new Date()
          return (<>
            <td className="px-4 py-3 text-xs text-gray-400">#{c.id_conductor}</td>
            <td className="px-4 py-3 font-semibold text-sm text-gray-800">{c.nombre}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{c.telefono || '—'}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{c.licencia_nro}</td>
            <td className="px-4 py-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${vigente ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                {fmtDate(c.licencia_vence)}
              </span>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                <button onClick={() => abrir(c)}
                  className="text-xs text-[#E87C1E] border border-[#E87C1E]/30 hover:bg-[#E87C1E]/10 px-2 py-1 rounded-lg transition flex items-center gap-1">
                  <Pencil size={11} /> Editar
                </button>
                <button onClick={() => eliminar(c.id_conductor)}
                  className="text-xs text-red-400 border border-red-200 hover:bg-red-50 px-2 py-1 rounded-lg transition">
                  Eliminar
                </button>
              </div>
            </td>
          </>)
        }}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editando ? 'Editar Conductor' : 'Nuevo Conductor'} onSubmit={guardar} submitLabel={editando ? 'Actualizar' : 'Guardar'}>
        <div className="space-y-4">
          {[
            { label: 'Nombre completo', key: 'nombre', placeholder: 'Nombre del conductor' },
            { label: 'Teléfono', key: 'telefono', placeholder: 'Ej: 3141234567' },
            { label: 'Nro. Licencia', key: 'licencia_nro', placeholder: 'LIC-000' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className={labelCls}>{label}</label>
              <input value={form[key]} onChange={set(key)} placeholder={placeholder} className={inputCls} />
            </div>
          ))}
          <div>
            <label className={labelCls}>Vencimiento licencia</label>
            <input type="date" value={form.licencia_vence} onChange={set('licencia_vence')} className={inputCls} />
          </div>
        </div>
      </Modal>
    </div>
  )
}