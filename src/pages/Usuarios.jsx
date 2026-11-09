import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Table from '../components/Table'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { UserCog, Plus, Pencil, Search, Eye, EyeOff, RotateCcw } from 'lucide-react'

const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#E87C1E] focus:ring-2 focus:ring-[#E87C1E]/10 transition"
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
const empty = { email: '', password: '', confirmar: '', fk_rol: '' }
const errMsg = (e, fallback) => e.response?.data?.message || e.response?.data?.error || fallback

const nombreRol = {
  SuperAdmin: 'Super Admin',
  Administrador: 'Administrador',
  co_administrador: 'Co-administrador',
  Conductor: 'Conductor',
}
const rolBadge = {
  SuperAdmin: 'bg-purple-100 text-purple-600',
  Administrador: 'bg-orange-100 text-[#E87C1E]',
  co_administrador: 'bg-blue-100 text-blue-600',
  Conductor: 'bg-gray-100 text-gray-600',
}

// Solo el SuperAdmin entra aquí: crea los usuarios y les asigna la contraseña.
export default function Usuarios() {
  const { usuario: yo } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(empty)
  const [showPass, setShowPass] = useState(false)
  const [search, setSearch] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const cargar = async () => {
    try {
      setLoading(true)
      const [ru, rr] = await Promise.all([api.get('/usuarios'), api.get('/usuarios/roles')])
      setUsuarios(ru.data.data || [])
      setRoles(rr.data.data || [])
    } catch (e) {
      toast.error(errMsg(e, 'Error al cargar usuarios'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const filtrados = usuarios.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return [u.email, u.rol, nombreRol[u.rol]].some(v => v?.toLowerCase().includes(q))
  })

  const abrir = (item = null) => {
    setShowPass(false)
    if (item) {
      setEditando(item)
      setForm({ email: item.email, password: '', confirmar: '', fk_rol: String(item.fk_rol) })
    } else {
      setEditando(null)
      setForm(empty)
    }
    setModal(true)
  }

  const guardar = async () => {
    if (!form.email.trim() || !form.fk_rol) { toast.error('Completa el correo y el rol'); return }
    if (!editando && !form.password) { toast.error('Asigna una contraseña al usuario'); return }
    if (form.password && form.password.length < 6) { toast.error('La contraseña debe tener mínimo 6 caracteres'); return }
    if (form.password !== form.confirmar) { toast.error('Las contraseñas no coinciden'); return }
    const body = { email: form.email.trim(), fk_rol: +form.fk_rol }
    if (form.password) body.password = form.password
    try {
      if (editando) {
        await api.put(`/usuarios/${editando.id_usuario}`, { ...body, estado: editando.estado ?? 1 })
        toast.success('Usuario actualizado ✓')
      } else {
        await api.post('/usuarios', body)
        toast.success('Usuario creado ✓')
      }
      setModal(false)
      cargar()
    } catch (e) {
      toast.error(errMsg(e, 'Error al guardar'))
    }
  }

  const desactivar = async (u) => {
    if (!confirm(`¿Desactivar a ${u.email}? Ya no podrá iniciar sesión.`)) return
    try {
      await api.delete(`/usuarios/${u.id_usuario}`)
      toast.success('Usuario desactivado')
      cargar()
    } catch (e) { toast.error(errMsg(e, 'Error al desactivar')) }
  }

  const reactivar = async (u) => {
    try {
      await api.put(`/usuarios/${u.id_usuario}`, { email: u.email, fk_rol: u.fk_rol, estado: 1 })
      toast.success('Usuario reactivado')
      cargar()
    } catch (e) { toast.error(errMsg(e, 'Error al reactivar')) }
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="relative rounded-2xl overflow-hidden h-36 shadow-md bg-gradient-to-r from-[#1A1814] to-[#3a332b]">
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <UserCog className="text-[#E87C1E]" size={28} />
            <div>
              <h1 className="text-2xl font-black text-white">Usuarios</h1>
              <p className="text-gray-300 text-sm">Solo el Super Admin crea usuarios y asigna contraseñas</p>
            </div>
          </div>
          <button onClick={() => abrir()}
            className="flex items-center gap-2 bg-[#E87C1E] hover:bg-[#C4610E] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-[#E87C1E]/30">
            <Plus size={16} /> Nuevo usuario
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
        <input type="text" placeholder="Buscar por correo o rol..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#E87C1E] focus:ring-2 focus:ring-[#E87C1E]/10 transition" />
      </div>

      <Table
        columns={['#', 'Correo', 'Rol', 'Estado', '']}
        data={filtrados} loading={loading}
        renderRow={(u) => {
          const activo = u.estado === undefined || u.estado === null || Number(u.estado) === 1
          const soyYo = u.id_usuario === (yo?.id_usuario ?? yo?.id)
          return (<>
            <td className="px-4 py-3 text-xs text-gray-400">#{u.id_usuario}</td>
            <td className="px-4 py-3 text-sm font-semibold text-gray-800">
              {u.email}{soyYo && <span className="ml-2 text-xs text-gray-400">(tú)</span>}
            </td>
            <td className="px-4 py-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${rolBadge[u.rol] || 'bg-gray-100 text-gray-500'}`}>
                {nombreRol[u.rol] || u.rol}
              </span>
            </td>
            <td className="px-4 py-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${activo ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                {activo ? 'Activo' : 'Inactivo'}
              </span>
            </td>
            <td className="px-4 py-3">
              <div className="flex justify-end gap-2">
                <button onClick={() => abrir(u)}
                  className="text-xs text-[#E87C1E] border border-[#E87C1E]/30 hover:bg-[#E87C1E]/10 px-2 py-1 rounded-lg transition flex items-center gap-1">
                  <Pencil size={11} /> Editar
                </button>
                {!soyYo && (activo ? (
                  <button onClick={() => desactivar(u)}
                    className="text-xs text-red-400 border border-red-200 hover:bg-red-50 px-2 py-1 rounded-lg transition">
                    Desactivar
                  </button>
                ) : (
                  <button onClick={() => reactivar(u)}
                    className="text-xs text-green-600 border border-green-200 hover:bg-green-50 px-2 py-1 rounded-lg transition flex items-center gap-1">
                    <RotateCcw size={11} /> Reactivar
                  </button>
                ))}
              </div>
            </td>
          </>)
        }}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editando ? 'Editar usuario' : 'Nuevo usuario'} onSubmit={guardar} submitLabel={editando ? 'Actualizar' : 'Crear usuario'}>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Correo electrónico</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="usuario@empresa.com" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Rol</label>
            <select value={form.fk_rol} onChange={set('fk_rol')} className={inputCls}>
              <option value="">Seleccionar...</option>
              {roles.map(r => <option key={r.id_rol} value={r.id_rol}>{nombreRol[r.nombre] || r.nombre}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{editando ? 'Nueva contraseña' : 'Contraseña'}</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder={editando ? 'Dejar vacío = no cambia' : 'Mínimo 6 caracteres'} className={inputCls + ' pr-9'} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelCls}>Confirmar</label>
              <input type={showPass ? 'text' : 'password'} value={form.confirmar} onChange={set('confirmar')}
                placeholder="Repetir contraseña" className={inputCls} />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Entrega el correo y la contraseña al usuario. {editando ? 'Si dejas la contraseña vacía, se mantiene la actual.' : ''}
          </p>
        </div>
      </Modal>
    </div>
  )
}
