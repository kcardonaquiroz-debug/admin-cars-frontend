import { useRef, useState } from 'react'
import api from '../api/axios'
import { comprimirImagen } from '../utils/imagen'
import { useNavigate } from 'react-router-dom'
import { useCRUD } from '../hooks/useCRUD'
import { useAuth } from '../context/AuthContext'
import Table from '../components/Table'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { Truck, Plus, Pencil, Eye, FileText, ShieldCheck, ClipboardCheck, ImagePlus, Trash2 } from 'lucide-react'
import { estadoVencimiento, fmtDia } from '../utils/vencimientos'


const empty = { marca: '', modelo: '', capacidad: '', estado: '1', fk_conductor: '', placa: '', foto_url: '', matricula_nro: '', matricula_fecha: '', seguro_aseguradora: '', seguro_poliza: '', seguro_vence: '', tecnomecanica_nro: '', tecnomecanica_vence: '' }
const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#E87C1E] focus:ring-2 focus:ring-[#E87C1E]/10 transition"
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
const docCampos = ['matricula_nro', 'matricula_fecha', 'seguro_aseguradora', 'seguro_poliza', 'seguro_vence', 'tecnomecanica_nro', 'tecnomecanica_vence']

function BadgeDoc({ label, fecha }) {
  const e = estadoVencimiento(fecha)
  return (
    <span title={fecha ? `${label}: ${fmtDia(fecha)}` : `${label}: sin registrar`}
      className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${e.cls}`}>
      {label}: {e.nivel === 'vigente' ? fmtDia(fecha) : e.texto}
    </span>
  )
}

export default function Camiones() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const esAdmin = ['Administrador', 'SuperAdmin'].includes(usuario?.rol)
  const { data, loading, crear, actualizar, eliminar, fetchAll } = useCRUD('camiones')
  const { data: conductores } = useCRUD('conductores')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(empty)
  const [foto, setFoto] = useState(null) // { archivo, preview } elegido desde el PC
  const [guardando, setGuardando] = useState(false)
  const fileRef = useRef(null)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const limpiarFoto = () => {
    if (foto?.preview) URL.revokeObjectURL(foto.preview)
    setFoto(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const elegirFoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Selecciona una imagen (jpg, png, webp)'); return }
    if (file.size > 15 * 1024 * 1024) { toast.error('La imagen es demasiado grande (máx. 15MB)'); return }
    try {
      const archivo = await comprimirImagen(file)
      if (archivo.size > 5 * 1024 * 1024) { toast.error('La imagen supera 5MB'); return }
      if (foto?.preview) URL.revokeObjectURL(foto.preview)
      setFoto({ archivo, preview: URL.createObjectURL(archivo) })
    } catch (err) {
      toast.error(err.message || 'No se pudo leer la imagen')
    }
  }

  const quitarFoto = () => {
    limpiarFoto()
    setForm(f => ({ ...f, foto_url: '' }))
  }

  const abrir = (item = null) => {
    limpiarFoto()
    if (item) {
      setEditando(item.id_camion)
      setForm({ marca: item.marca, modelo: item.modelo, capacidad: item.capacidad, estado: String(item.estado), fk_conductor: item.fk_conductor || '', placa: item.placa || '', foto_url: item.foto_url || '', ...Object.fromEntries(docCampos.map(k => [k, item[k] ? String(item[k]).slice(0, 10) : ''])) })
    } else { setEditando(null); setForm(empty) }
    setModal(true)
  }

  const guardar = async () => {
    if (+form.capacidad <= 0) { toast.error('La capacidad debe ser mayor a 0'); return }
    const body = { ...form, ...Object.fromEntries(docCampos.map(k => [k, form[k] || null])), capacidad: +form.capacidad, estado: +form.estado, fk_conductor: form.fk_conductor ? +form.fk_conductor : null }
    setGuardando(true)
    try {
      const ok = editando ? await actualizar(editando, body) : await crear(body)
      if (!ok) return
      const id = editando || ok.insertId
      if (foto?.archivo && id) {
        try {
          const fd = new FormData()
          fd.append('foto', foto.archivo)
          await api.post(`/camiones/${id}/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
          toast.success('Foto subida ✓')
          fetchAll()
        } catch (e) {
          toast.error(e.response?.data?.message || 'El camión se guardó, pero no se pudo subir la foto')
        }
      }
      limpiarFoto()
      setModal(false); setForm(empty); setEditando(null)
    } finally {
      setGuardando(false)
    }
  }

  const fotoMostrada = foto?.preview || form.foto_url

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
        columns={['#', 'Placa', 'Marca', 'Modelo', 'Capacidad', 'Documentos', 'Estado', '']}
        data={data} loading={loading}
        renderRow={(c) => (<>
          <td className="px-4 py-3 text-xs text-gray-400">#{c.id_camion}</td>
          <td className="px-4 py-3 font-bold text-sm text-gray-800">{c.placa || '—'}</td>
          <td className="px-4 py-3 font-semibold text-sm text-gray-800">{c.marca}</td>
          <td className="px-4 py-3 text-sm text-gray-500">{c.modelo}</td>
          <td className="px-4 py-3 text-sm text-gray-500">{c.capacidad} ton</td>
          <td className="px-4 py-3">
            <div className="flex flex-col gap-1 items-start">
              <BadgeDoc label="Seguro" fecha={c.seguro_vence} />
              <BadgeDoc label="Tecno" fecha={c.tecnomecanica_vence} />
              {c.matricula_nro && <span className="text-[11px] text-gray-400">Matrícula {c.matricula_nro}</span>}
            </div>
          </td>
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
              {esAdmin && <button onClick={() => eliminar(c.id_camion)}
                className="text-xs text-red-400 border border-red-200 hover:bg-red-50 px-2 py-1 rounded-lg transition">
                Eliminar
              </button>}
              <button onClick={() => navigate(`/app/camiones/${c.id_camion}/resumen`)}
                className="text-xs text-blue-500 border border-blue-200 hover:bg-blue-50 px-2 py-1 rounded-lg transition flex items-center gap-1">
                <Eye size={11} /> Resumen
              </button>
            </div>
          </td>
        </>)}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editando ? 'Editar Camión' : 'Nuevo Camión'} onSubmit={guardando ? () => {} : guardar} submitLabel={guardando ? 'Guardando...' : editando ? 'Actualizar' : 'Guardar'}>
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
              <input type="number" min="0" value={form.capacidad} onChange={set('capacidad')} placeholder="0.00" className={inputCls} />
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
            <label className={labelCls}>Placa</label>
            <input value={form.placa || ''} onChange={set('placa')} placeholder="Ej: ABC-123" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Foto del camión</label>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={elegirFoto} className="hidden" />
            {fotoMostrada ? (
              <div className="flex items-center gap-3">
                <img src={fotoMostrada} alt="Foto del camión" className="w-28 h-20 object-cover rounded-xl border border-gray-200" />
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="text-xs text-[#E87C1E] border border-[#E87C1E]/30 hover:bg-[#E87C1E]/10 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5">
                    <ImagePlus size={13} /> Cambiar foto
                  </button>
                  <button type="button" onClick={quitarFoto}
                    className="text-xs text-red-400 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5">
                    <Trash2 size={13} /> Quitar foto
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 hover:border-[#E87C1E] hover:bg-orange-50/40 rounded-xl py-5 flex flex-col items-center gap-1.5 text-gray-400 hover:text-[#E87C1E] transition">
                <ImagePlus size={22} />
                <span className="text-sm font-medium">Subir foto desde el computador</span>
                <span className="text-xs">JPG, PNG o WEBP</span>
              </button>
            )}
            {foto && <p className="text-xs text-gray-400 mt-1.5">La foto se sube al guardar.</p>}
          </div>
          <div>
            <label className={labelCls}>Conductor asignado</label>
            <select value={form.fk_conductor} onChange={set('fk_conductor')} className={inputCls}>
              <option value="">Sin asignar</option>
              {conductores.map(c => <option key={c.id_conductor} value={c.id_conductor}>{c.nombre}</option>)}
            </select>
          </div>

          {/* DOCUMENTOS */}
          <div className="pt-2 border-t border-gray-100 space-y-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><FileText size={15} className="text-[#E87C1E]" /> Matrícula</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Nro. licencia de tránsito</label>
                  <input value={form.matricula_nro} onChange={set('matricula_nro')} placeholder="Ej: 10012345678" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Fecha de matrícula</label>
                  <input type="date" value={form.matricula_fecha} onChange={set('matricula_fecha')} className={inputCls} />
                </div>
              </div>
            </div>
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><ShieldCheck size={15} className="text-[#E87C1E]" /> Seguro (SOAT / póliza)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Aseguradora</label>
                  <input value={form.seguro_aseguradora} onChange={set('seguro_aseguradora')} placeholder="Ej: Sura" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Nro. póliza</label>
                  <input value={form.seguro_poliza} onChange={set('seguro_poliza')} placeholder="Ej: 123456789" className={inputCls} />
                </div>
              </div>
              <div className="mt-3">
                <label className={labelCls}>Vencimiento del seguro</label>
                <input type="date" value={form.seguro_vence} onChange={set('seguro_vence')} className={inputCls} />
              </div>
            </div>
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><ClipboardCheck size={15} className="text-[#E87C1E]" /> Revisión tecnomecánica</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Nro. certificado</label>
                  <input value={form.tecnomecanica_nro} onChange={set('tecnomecanica_nro')} placeholder="Ej: RTM-0001" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Vencimiento</label>
                  <input type="date" value={form.tecnomecanica_vence} onChange={set('tecnomecanica_vence')} className={inputCls} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}