import { useState } from 'react'
import { useCRUD } from '../hooks/useCRUD'
import Table from '../components/Table'
import Modal from '../components/Modal'
import { MapPin, Plus, Pencil } from 'lucide-react'

// Funciones de formateo
const cop = (v) => '$' + Number(v).toLocaleString('es-CO')
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-CO') : '—'
const empty = { fk_camion: '', fk_conductor: '', origen: '', destino: '', producto_carga: '', fecha_salida: '', fecha_llegada: '', valor_flete: '' }

// Clases de estilo Tailwind (uniformes)
const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#E87C1E] focus:ring-2 focus:ring-[#E87C1E]/10 transition"
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"

export default function Viajes() {
  const { data, loading, crear, actualizar, eliminar } = useCRUD('viajes')
  const { data: camiones } = useCRUD('camiones')
  const { data: conductores } = useCRUD('conductores')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(empty)
  
  // Manejador de cambios genérico
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const abrir = (item = null) => {
    if (item) {
      setEditando(item.id_viaje)
      setForm({
        fk_camion: item.fk_camion, 
        fk_conductor: item.fk_conductor,
        origen: item.origen, 
        destino: item.destino,
        producto_carga: item.producto_carga,
        // Formatear fechas para input type="date" (YYYY-MM-DD)
        fecha_salida: item.fecha_salida?.slice(0, 10) || '',
        fecha_llegada: item.fecha_llegada?.slice(0, 10) || '',
        valor_flete: item.valor_flete
      })
    } else {
      setEditando(null)
      setForm(empty)
    }
    setModal(true)
  }

  // --- INTEGRACIÓN DE VALIDACIONES AQUÍ ---
  const guardar = async () => {
    // 1. Validación: Valor del flete no negativo
    // Convertimos a número antes de validar
    const fleteNum = Number(form.valor_flete);
    if (fleteNum < 0) {
        alert("El valor del flete no puede ser negativo.");
        return; // Detiene la ejecución
    }

    // 2. Validación: Fechas lógicas
    if (form.fecha_salida && form.fecha_llegada) {
        // Convertimos los textos del formulario a objetos Date reales
        const salida = new Date(form.fecha_salida);
        const llegada = new Date(form.fecha_llegada);
        
        // Comparamos matemáticamente las fechas
        if (llegada < salida) {
            alert("La fecha de llegada no puede ser anterior a la fecha de salida.");
            return; // Detiene la ejecución
        }
    }

    // 3. Preparar el cuerpo de la petición (asegurando tipos numéricos)
    const body = { 
        ...form, 
        fk_camion: +form.fk_camion, 
        fk_conductor: +form.fk_conductor, 
        valor_flete: fleteNum 
    }

    // 4. Ejecutar la operación CRUD
    const ok = editando ? await actualizar(editando, body) : await crear(body)
    
    // 5. Limpiar estado si todo salió bien
    if (ok) { 
        setModal(false); 
        setForm(empty); 
        setEditando(null); 
    }
  }

  // --- El bloque antiguo de handleSubmit fue eliminado ---

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* HEADER CON IMAGEN Y BOTÓN NUEVO */}
      <div className="relative rounded-2xl overflow-hidden h-36 shadow-md">
        <img src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1200&q=80" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/65" />
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <MapPin className="text-[#E87C1E]" size={28} />
            <div>
              <h1 className="text-2xl font-black text-gray-800">Viajes</h1>
              <p className="text-gray-500 text-sm">{data.length} registros</p>
            </div>
          </div>
          <button onClick={() => abrir()}
            className="flex items-center gap-2 bg-[#E87C1E] hover:bg-[#C4610E] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-[#E87C1E]/30">
            <Plus size={16} /> Nuevo viaje
          </button>
        </div>
      </div>

      {/* TABLA DE DATOS */}
      <Table
        columns={['#', 'Origen → Destino', 'Carga', 'Salida', 'Llegada', 'Flete', 'Acciones']}
        data={data} loading={loading}
        renderRow={(v) => (<>
          <td className="px-4 py-3 text-xs text-gray-400">#{v.id_viaje}</td>
          <td className="px-4 py-3 font-semibold text-sm text-gray-800">{v.origen} → {v.destino}</td>
          <td className="px-4 py-3 text-sm text-gray-500">{v.producto_carga}</td>
          <td className="px-4 py-3 text-sm text-gray-500">{fmtDate(v.fecha_salida)}</td>
          <td className="px-4 py-3 text-sm text-gray-500">{fmtDate(v.fecha_llegada)}</td>
          <td className="px-4 py-3 font-bold text-[#E87C1E] text-sm">{cop(v.valor_flete)}</td>
          <td className="px-4 py-3">
            <div className="flex gap-2">
              <button onClick={() => abrir(v)}
                className="text-xs text-[#E87C1E] border border-[#E87C1E]/30 hover:bg-[#E87C1E]/10 px-2 py-1 rounded-lg transition flex items-center gap-1">
                <Pencil size={11} /> Editar
              </button>
              <button onClick={() => eliminar(v.id_viaje)}
                className="text-xs text-red-400 border border-red-200 hover:bg-red-50 px-2 py-1 rounded-lg transition">
                Eliminar
              </button>
            </div>
          </td>
        </>)}
      />

      {/* MODAL DE FORMULARIO (Crea y Edita) */}
      {/* onSubmit={guardar} se encarga de llamar a las validaciones */}
      <Modal open={modal} onClose={() => setModal(false)} title={editando ? 'Editar Viaje' : 'Nuevo Viaje'} onSubmit={guardar} submitLabel={editando ? 'Actualizar' : 'Guardar'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Camión</label>
              <select value={form.fk_camion} onChange={set('fk_camion')} className={inputCls} required>
                <option value="">Seleccionar...</option>
                {camiones.map(c => <option key={c.id_camion} value={c.id_camion}>{c.marca} {c.modelo}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Conductor</label>
              <select value={form.fk_conductor} onChange={set('fk_conductor')} className={inputCls} required>
                <option value="">Seleccionar...</option>
                {conductores.map(c => <option key={c.id_conductor} value={c.id_conductor}>{c.nombre}</option>)}
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
              <input value={form[key]} onChange={set(key)} placeholder={placeholder} className={inputCls} required />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Fecha salida</label>
              <input type="date" value={form.fecha_salida} onChange={set('fecha_salida')} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Fecha llegada</label>
              <input type="date" value={form.fecha_llegada} onChange={set('fecha_llegada')} className={inputCls} required />
            </div>
          </div>
          <div>
            <label className={labelCls}>Valor del flete ($)</label>
            <input type="number" value={form.valor_flete} onChange={set('valor_flete')} placeholder="0" className={inputCls} required />
          </div>
        </div>
      </Modal>
    </div>
  )
}