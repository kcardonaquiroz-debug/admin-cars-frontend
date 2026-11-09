// Utilidades para fechas de vencimiento (licencias, seguro, tecnomecánica).
// Se trabaja con la parte 'YYYY-MM-DD' para evitar desfases por zona horaria.

export const DIAS_AVISO = 15

const aFechaLocal = (valor) => {
  if (!valor) return null
  const [y, m, d] = String(valor).slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export const fmtDia = (valor) => {
  const f = aFechaLocal(valor)
  return f ? f.toLocaleDateString('es-CO') : '—'
}

export const diasRestantes = (valor) => {
  const f = aFechaLocal(valor)
  if (!f) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return Math.round((f - hoy) / 86400000)
}

export const textoDias = (dias) => {
  if (dias === null || dias === undefined) return 'Sin fecha'
  if (dias < 0) return `Vencido hace ${-dias} día${dias === -1 ? '' : 's'}`
  if (dias === 0) return 'Vence hoy'
  if (dias === 1) return 'Vence mañana'
  return `Vence en ${dias} días`
}

// nivel: 'sin' | 'vencido' | 'proximo' | 'vigente'
export const estadoVencimiento = (valor) => {
  const dias = diasRestantes(valor)
  if (dias === null) return { nivel: 'sin', dias, texto: 'Sin registrar', cls: 'bg-gray-100 text-gray-400' }
  if (dias < 0) return { nivel: 'vencido', dias, texto: textoDias(dias), cls: 'bg-red-100 text-red-500' }
  if (dias <= DIAS_AVISO) return { nivel: 'proximo', dias, texto: textoDias(dias), cls: 'bg-amber-100 text-amber-600' }
  return { nivel: 'vigente', dias, texto: 'Vigente', cls: 'bg-green-100 text-green-600' }
}
