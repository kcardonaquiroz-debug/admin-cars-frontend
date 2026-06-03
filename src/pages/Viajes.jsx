import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCRUD } from '../hooks/useCRUD'
import { useAuth } from '../context/AuthContext'
import Table from '../components/Table'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { MapPin, Plus, Pencil, Eye, Search } from 'lucide-react'

const cop = (v) => '$' + Number(v).toLocaleString('es-CO')
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-CO') : '—'
const empty = { fk_camion: '', fk_conductor: '', nro_guia: '', origen: '', destino: '', producto_carga: '', fecha_salida: '', fecha_llegada: '', valor_flete: '', estado: 'en_curso' }
const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#E87C1E] focus:ring-2 focus:ring-[#E87C1E]/10 transition"
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"

const estadoBadge = {
  en_curso: 'bg-blue-100 text-blue-600',
  completado: 'bg-green-100 text-green-600',
  cancelado: 'bg-red-100 text-red-500',
}

export default function Viajes() {
  const { usuario } = useAuth()
  const esConductor = usuario?.rol === 'Conductor'
  const esAdmin = usuario?.rol === 'Administrador'
  const { data, loading, crear, actualizar, eliminar } = useCRUD('viajes')
  const { data: camiones } = useCRUD('camiones')
  const { data: conductores } = useCRUD('conductores')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(empty)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const filtered = data.filter((v) => {
    if (!search) return true
    const q = search.toLowerCase()
    return [v.nro_guia, v.origen, v.destino, v.producto_carga, v.placa, v.nombre_conductor, String(v.id_viaje)]
      .some((val) => val?.toLowerCase().includes(q))
  })

  const abrir = (item = null) => {
    if (item) {
      setEditando(item.id_viaje)
      setForm({
        fk_camion: item.fk_camion, fk_conductor: item.fk_conductor,
        nro_guia: item.nro_guia || '',
        origen: item.origen, destino: item.destino,
        producto_carga: item.producto_carga,
        fecha_salida: item.fecha_salida?.slice(0, 10) || '',
        fecha_llegada: item.fecha_llegada?.slice(0, 10) || '',
        valor_flete: item.valor_flete,
        estado: item.estado || 'en_curso'
      })
    } else { setEditando(null); setForm(empty) }
    setModal(true)
  }

  const guardar = async () => {
    if (+form.valor_flete < 0) { toast.error('El valor del flete no puede ser negativo'); return }
    if (form.fecha_salida && form.fecha_llegada && new Date(form.fecha_llegada) < new Date(form.fecha_salida)) {
      toast.error('La fecha de llegada debe ser posterior a la fecha de salida'); return
    }
    const conductorSel = conductores.find(c => c.id_conductor === +form.fk_conductor)
    if (conductorSel?.licencia_vence && form.fecha_salida && new Date(form.fecha_salida) > new Date(conductorSel.licencia_vence)) {
      toast.error('La licencia del conductor está vencida para la fecha de este viaje'); return
    }
    const body = { ...form, fk_camion: +form.fk_camion, fk_conductor: +form.fk_conductor, valor_flete: +form.valor_flete }
    const ok = editando ? await actualizar(editando, body) : await crear(body)
    if (ok) { setModal(false); setForm(empty); setEditando(null) }
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="relative rounded-2xl overflow-hidden h-36 shadow-md">
        <img src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1200&q=80" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/65" />
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <MapPin className="text-[#E87C1E]" size={28} />
            <div>
              <h1 className="text-2xl font-black text-gray-800">{esConductor ? 'Mis Viajes' : 'Viajes'}</h1>
              <p className="text-gray-500 text-sm">{filtered.length} registros</p>
            </div>
          </div>
          {!esConductor && (
            <button onClick={() => abrir()}
              className="flex items-center gap-2 bg-[#E87C1E] hover:bg-[#C4610E] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-[#E87C1E]/30">
              <Plus size={16} /> Nuevo viaje
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
        <input
          type="text"
          placeholder="Buscar por guía, origen, destino, carga, placa, conductor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#E87C1E] focus:ring-2 focus:ring-[#E87C1E]/10 transition"
        />
      </div>

      <Table
        columns={['#', 'Guía', 'Ruta', 'Carga', 'Fecha', 'Flete', 'Estado', '']}
        data={filtered} loading={loading}
        renderRow={(v) => (<>
          <td className="px-4 py-3 text-xs text-gray-400">#{v.id_viaje}</td>
          <td className="px-4 py-3 text-xs text-gray-500">{v.nro_guia || '—'}</td>
          <td className="px-4 py-3 font-semibold text-sm text-gray-800">{v.origen} → {v.destino}</td>
          <td className="px-4 py-3 text-sm text-gray-500">{v.producto_carga}</td>
          <td className="px-4 py-3 text-sm text-gray-500">{fmtDate(v.fecha_salida)}</td>
          <td className="px-4 py-3 font-bold text-[#E87C1E] text-sm">{cop(v.valor_flete)}</td>
          <td className="px-4 py-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${estadoBadge[v.estado] || 'bg-gray-100 text-gray-500'}`}>
              {v.estado?.replace('_', ' ') || 'en curso'}
            </span>
          </td>
          <td className="px-4 py-3">
            <div className="flex gap-2">
              <button onClick={() => navigate(`/app/viajes/${v.id_viaje}`)}
                className="text-xs text-blue-500 border border-blue-200 hover:bg-blue-50 px-2 py-1 rounded-lg transition flex items-center gap-1">
                <Eye size={11} /> Ver
              </button>
              {!esConductor && (<>
                <button onClick={() => abrir(v)}
                  className="text-xs text-[#E87C1E] border border-[#E87C1E]/30 hover:bg-[#E87C1E]/10 px-2 py-1 rounded-lg transition flex items-center gap-1">
                  <Pencil size={11} /> Editar
                </button>
                {esAdmin && <button onClick={() => eliminar(v.id_viaje)}
                  className="text-xs text-red-400 border border-red-200 hover:bg-red-50 px-2 py-1 rounded-lg transition">
                  Eliminar
                </button>}
              </>)}
            </div>
          </td>
        </>)}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editando ? 'Editar Viaje' : 'Nuevo Viaje'} onSubmit={guardar} submitLabel={editando ? 'Actualizar' : 'Guardar'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Camión</label>
              <select value={form.fk_camion} onChange={set('fk_camion')} className={inputCls}>
                <option value="">Seleccionar...</option>
                {camiones.map(c => <option key={c.id_camion} value={c.id_camion}>{c.placa} — {c.marca} {c.modelo}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Conductor</label>
              <select value={form.fk_conductor} onChange={set('fk_conductor')} className={inputCls}>
                <option value="">Seleccionar...</option>
                {conductores.map(c => <option key={c.id_conductor} value={c.id_conductor}>{c.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nro. Guía</label>
              <input value={form.nro_guia} onChange={set('nro_guia')} placeholder="Ej: GU-001" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Estado</label>
              <select value={form.estado} onChange={set('estado')} className={inputCls}>
                <option value="en_curso">En curso</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
          {[
            { label: 'Origen', key: 'origen', placeholder: 'Ciudad de origen' },
            { label: 'Destino', key: 'destino', placeholder: 'Ciudad de destino' },
            { label: 'Producto / Carga', key: 'producto_carga', placeholder: 'Ej: Cemento...' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className={labelCls}>{label}</label>
              <input value={form[key]} onChange={set(key)} placeholder={placeholder} className={inputCls} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Fecha salida</label>
              <input type="date" value={form.fecha_salida} onChange={set('fecha_salida')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Fecha llegada</label>
              <input type="date" value={form.fecha_llegada} onChange={set('fecha_llegada')} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Valor del flete ($)</label>
            <input type="number" min="0" value={form.valor_flete} onChange={set('valor_flete')} placeholder="0" className={inputCls} />
          </div>
        </div>
      </Modal>
    </div>
  )
}