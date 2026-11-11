import { useState } from 'react'

// Barras agrupadas por mes: ingresos (fletes) vs gastos. Paleta validada (azul / naranja).
const COLORES = { ingresos: '#2a78d6', gastos: '#eb6834' }
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const etiquetaMes = (ym) => {
  const [y, m] = ym.split('-').map(Number)
  return `${MESES[m - 1]} ${String(y).slice(2)}`
}
const millones = (v) => {
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toLocaleString('es-CO', { maximumFractionDigits: 1 })} mil M`
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toLocaleString('es-CO', { maximumFractionDigits: 1 })} M`
  return '$' + Math.round(v).toLocaleString('es-CO')
}
const cop = (v) => '$' + Math.round(v).toLocaleString('es-CO')

// Tope "redondo" apenas por encima del máximo (ej. 230 M -> 250 M)
const escalaBonita = (max) => {
  if (max <= 0) return 1
  const exp = Math.pow(10, Math.floor(Math.log10(max)))
  const n = max / exp
  const paso = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find(p => n <= p)
  return paso * exp
}

export default function GraficoMensual({ datos }) {
  const [activo, setActivo] = useState(null)
  if (!datos?.length) return <p className="text-center text-sm text-gray-400 py-10">Sin datos para el período elegido</p>

  const tope = escalaBonita(Math.max(...datos.map(d => Math.max(d.ingresos, d.gastos))))
  const marcas = [0, tope / 4, tope / 2, (tope * 3) / 4, tope]
  const ALTO = 220

  return (
    <div>
      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
        {[['ingresos', 'Ingresos (fletes)'], ['gastos', 'Gastos']].map(([k, l]) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: COLORES[k] }} /> {l}
          </span>
        ))}
      </div>
      <div className="flex">
        {/* Eje Y */}
        <div className="relative w-16 flex-shrink-0" style={{ height: ALTO }}>
          {marcas.map(m => (
            <span key={m} className="absolute right-2 text-[10px] text-gray-400" style={{ bottom: `${(m / tope) * 100}%`, transform: 'translateY(50%)' }}>
              {millones(m)}
            </span>
          ))}
        </div>
        <div className="flex-1 overflow-x-auto">
          <div className="relative" style={{ height: ALTO, minWidth: datos.length * 44 }}>
            {marcas.map(m => (
              <div key={m} className="absolute left-0 right-0 border-t border-gray-100" style={{ bottom: `${(m / tope) * 100}%` }} />
            ))}
            <div className="absolute inset-0 flex items-end">
              {datos.map((d, i) => (
                <div key={d.mes} className="relative flex-1 h-full flex items-end justify-center gap-[2px] cursor-default"
                  onMouseEnter={() => setActivo(i)} onMouseLeave={() => setActivo(null)}>
                  {activo === i && <div className="absolute inset-0 bg-gray-100/60 rounded-md" />}
                  {['ingresos', 'gastos'].map(k => (
                    <div key={k} className="relative w-[38%] max-w-[18px] rounded-t-[4px]"
                      style={{ height: `${(d[k] / tope) * 100}%`, background: COLORES[k], minHeight: d[k] > 0 ? 2 : 0 }} />
                  ))}
                  {activo === i && (
                    <div className={`absolute top-0 z-10 bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs whitespace-nowrap pointer-events-none ${i > datos.length / 2 ? 'right-0' : 'left-0'}`}>
                      <p className="font-bold text-gray-800 mb-1 capitalize">{etiquetaMes(d.mes)}</p>
                      <p className="flex justify-between gap-4 text-gray-600"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm" style={{ background: COLORES.ingresos }} />Ingresos</span><b className="text-gray-800">{cop(d.ingresos)}</b></p>
                      <p className="flex justify-between gap-4 text-gray-600"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm" style={{ background: COLORES.gastos }} />Gastos</span><b className="text-gray-800">{cop(d.gastos)}</b></p>
                      <p className="flex justify-between gap-4 text-gray-600 border-t border-gray-100 mt-1 pt-1"><span>Utilidad</span><b className={d.utilidad >= 0 ? 'text-green-600' : 'text-red-500'}>{cop(d.utilidad)}</b></p>
                      <p className="flex justify-between gap-4 text-gray-400"><span>Viajes</span><span>{d.viajes}</span></p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex" style={{ minWidth: datos.length * 44 }}>
            {datos.map(d => (
              <div key={d.mes} className="flex-1 text-center text-[10px] text-gray-400 pt-1.5 capitalize">{etiquetaMes(d.mes)}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
