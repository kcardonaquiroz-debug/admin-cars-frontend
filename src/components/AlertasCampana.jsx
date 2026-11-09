import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Bell, IdCard, ShieldCheck, ClipboardCheck, AlertTriangle } from 'lucide-react'
import { DIAS_AVISO, fmtDia, textoDias } from '../utils/vencimientos'

const REFRESCO_MS = 30 * 60 * 1000 // cada 30 minutos
const CLAVE_AVISADO = 'alertas_avisadas'

const config = {
  licencia: { icon: IdCard, nombre: 'Licencia de conducción' },
  seguro: { icon: ShieldCheck, nombre: 'Seguro (SOAT / póliza)' },
  tecnomecanica: { icon: ClipboardCheck, nombre: 'Revisión tecnomecánica' },
}

// Campana de avisos: licencias, seguros y tecnomecánicas que vencen en 15 días o menos (o ya vencieron).
export default function AlertasCampana({ esConductor }) {
  const navigate = useNavigate()
  const [alertas, setAlertas] = useState([])
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)

  const cargar = useCallback(async () => {
    try {
      const res = await api.get('/alertas')
      const lista = res.data.data || []
      setAlertas(lista)

      // Aviso emergente una vez por sesión
      if (lista.length > 0 && !sessionStorage.getItem(CLAVE_AVISADO)) {
        sessionStorage.setItem(CLAVE_AVISADO, '1')
        const vencidos = lista.filter(a => a.dias_restantes < 0).length
        toast(
          `Tienes ${lista.length} aviso${lista.length === 1 ? '' : 's'} de vencimiento` +
          (vencidos ? ` (${vencidos} ya vencido${vencidos === 1 ? '' : 's'})` : '') +
          '. Revisa la campana 🔔',
          { icon: '⚠️', duration: 7000 }
        )
      }
    } catch {
      // Si falla, la campana simplemente queda sin avisos
    }
  }, [])

  useEffect(() => {
    const inicial = setTimeout(cargar, 0)
    const intervalo = setInterval(cargar, REFRESCO_MS)
    const refrescar = () => cargar()
    window.addEventListener('alertas:refrescar', refrescar)
    window.addEventListener('focus', refrescar)
    return () => {
      clearTimeout(inicial)
      clearInterval(intervalo)
      window.removeEventListener('alertas:refrescar', refrescar)
      window.removeEventListener('focus', refrescar)
    }
  }, [cargar])

  useEffect(() => {
    if (!abierto) return
    const cerrar = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false) }
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [abierto])

  const ir = (a) => {
    setAbierto(false)
    if (esConductor) navigate('/app/mi-resumen')
    else if (a.tipo === 'licencia') navigate('/app/conductores')
    else navigate(`/app/camiones/${a.id_referencia}/resumen`)
  }

  const hayVencidos = alertas.some(a => a.dias_restantes < 0)

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setAbierto(!abierto)} title="Avisos de vencimiento"
        className="relative p-2 rounded-xl text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition">
        <Bell size={19} />
        {alertas.length > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center ${hayVencidos ? 'bg-red-500' : 'bg-amber-500'}`}>
            {alertas.length > 99 ? '99+' : alertas.length}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-2xl shadow-2xl z-40 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="font-bold text-sm text-gray-800">Avisos de vencimiento</p>
            <p className="text-xs text-gray-400">Documentos que vencen en {DIAS_AVISO} días o menos</p>
          </div>
          {alertas.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">Todo al día ✓</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto divide-y divide-gray-50">
              {alertas.map((a) => {
                const { icon: Icon, nombre } = config[a.tipo] || { icon: AlertTriangle, nombre: a.tipo }
                const vencido = a.dias_restantes < 0
                return (
                  <li key={`${a.tipo}-${a.id_referencia}`}>
                    <button onClick={() => ir(a)} className="w-full text-left px-4 py-3 hover:bg-orange-50/50 transition flex gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${vencido ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-600'}`}>
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">{nombre}</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{a.titulo}</p>
                        <p className={`text-xs font-semibold ${vencido ? 'text-red-500' : 'text-amber-600'}`}>
                          {textoDias(a.dias_restantes)} · {fmtDia(a.vence)}
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
