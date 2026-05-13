import { useState } from 'react'
import { useCRUD } from '../hooks/useCRUD'
import Modal from '../components/Modal'
import { DollarSign, Plus, ChevronDown, Pencil } from 'lucide-react'

const cop = (v) => '$' + Number(v).toLocaleString('es-CO')
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-CO') : '—'
const empty = { fk_viaje: '', tipo_gasto: '', monto: '' }
const tipos = ['Combustible', 'Peaje', 'Alimentación', 'Reparación menor', 'Hospedaje', 'Otro']
const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#E87C1E] focus:ring-2 focus:ring-[#E87C1E]/10 transition"
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"

export default function Gastos() {
  const { data: gastos, loading, crear, actualizar, eliminar } = useCRUD('gastos')
  const { data: viajes } = useCRUD('viajes')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [abiertos, setAbiertos] = useState({})
  const [form, setForm] = useState(empty)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const toggle = (id) => setAbiertos(prev => ({ ...prev, [id]: !prev[id] }))

  const abrir = (item = null, viajeId = '') => {
    if (item) {
      setEditando(item.id_gastos)
      setForm({ fk_viaje: String(item.fk_viaje), tipo_gasto: item.tipo_gasto, monto: item.monto })
    } else {
      setEditando(null)
      setForm({ ...empty, fk_viaje: String(viajeId) })
    }
    setModal(true)
  }

  const guardar = async () => {
    if (!form.fk_viaje || !form.tipo_gasto || !form.monto) {
      toast.error('Completa todos los campos')
      return
    }
    const body = {
      fk_viaje: parseInt(form.fk_viaje),
      tipo_gasto: form.tipo_gasto,
      monto: parseFloat(form.monto)
    }
    const ok = editando
      ? await actualizar(editando, body)
      : await crear(body)
    if (ok) { setModal(false); setForm(empty); setEditando(null) }
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="relative rounded-2xl overflow-hidden h-36 shadow-md">
        <img src="https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=1200&q=80" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/65" />
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <DollarSign className="text-[#E87C1E]" size={28} />
            <div>
              <h1 className="text-2xl font-black text-gray-800">Gastos</h1>
              <p className="text-gray-500 text-sm">Agrupados por viaje</p>
            </div>
          </div>
          <button onClick={() => abrir()}
            className="flex items-center gap-2 bg-[#E87C1E] hover:bg-[#C4610E] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-[#E87C1E]/30">
            <Plus size={16} /> Nuevo gasto
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : viajes.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">Sin viajes registrados</div>
      ) : (
        <div className="space-y-3">
          {viajes.map(v => {
            const gastosViaje = gastos.filter(g => g.fk_viaje === v.id_viaje)
            const total = gastosViaje.reduce((s, g) => s + (g.monto || 0), 0)
            const open = abiertos[v.id_viaje]
            return (
              <div key={v.id_viaje} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <button onClick={() => toggle(v.id_viaje)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition text-left">
                  <div className="flex items-center gap-4">
                    <div className="font-black text-[#E87C1E] text-lg w-12">V#{v.id_viaje}</div>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{v.origen} → {v.destino}</p>
                      <p className="text-xs text-gray-400">{v.producto_carga} · {fmtDate(v.fecha_salida)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-[#E87C1E]">{total ? cop(total) : 'Sin gastos'}</p>
                      <p className="text-xs text-gray-400">{gastosViaje.length} gastos</p>
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {open && (
                  <div className="border-t border-gray-100">
                    {gastosViaje.length === 0 ? (
                      <p className="text-center text-sm text-gray-400 py-4">Sin gastos en este viaje</p>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-4 py-2 text-left text-xs text-gray-400 uppercase font-semibold">Tipo</th>
                            <th className="px-4 py-2 text-left text-xs text-gray-400 uppercase font-semibold">Monto</th>
                            <th className="px-4 py-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {gastosViaje.map(g => (
                            <tr key={g.id_gastos} className="border-b border-gray-50 last:border-0 hover:bg-orange-50/30 transition">
                              <td className="px-4 py-2.5 text-sm text-gray-700">{g.tipo_gasto}</td>
                              <td className="px-4 py-2.5 text-sm font-bold text-[#E87C1E]">{cop(g.monto)}</td>
                              <td className="px-4 py-2.5 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => abrir(g)}
                                    className="text-xs text-[#E87C1E] border border-[#E87C1E]/30 hover:bg-[#E87C1E]/10 px-2 py-1 rounded-lg transition flex items-center gap-1">
                                    <Pencil size={11} /> Editar
                                  </button>
                                  <button onClick={() => eliminar(g.id_gastos)}
                                    className="text-xs text-red-400 border border-red-200 hover:bg-red-50 px-2 py-1 rounded-lg transition">
                                    ✕
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    <div className="flex justify-end p-3 border-t border-gray-100">
                      <button onClick={() => abrir(null, v.id_viaje)}
                        className="text-xs text-[#E87C1E] border border-[#E87C1E]/30 hover:bg-[#E87C1E]/10 px-3 py-1.5 rounded-lg transition font-medium">
                        + Agregar gasto
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editando ? 'Editar Gasto' : 'Nuevo Gasto'} onSubmit={guardar} submitLabel={editando ? 'Actualizar' : 'Guardar'}>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Viaje</label>
            <select
              value={form.fk_viaje}
              onChange={(e) => setForm({ ...form, fk_viaje: e.target.value })}
              className={inputCls}
            >
              <option value="">Seleccionar viaje...</option>
              {viajes.map(v => (
                <option key={v.id_viaje} value={String(v.id_viaje)}>
                  #{v.id_viaje} {v.origen} → {v.destino}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Tipo de gasto</label>
            <select value={form.tipo_gasto} onChange={set('tipo_gasto')} className={inputCls}>
              <option value="">Seleccionar...</option>
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
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