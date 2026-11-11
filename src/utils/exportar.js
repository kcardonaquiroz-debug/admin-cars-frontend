import { jsPDF } from 'jspdf'

// ---------- Excel (CSV) ----------
// Separador ';' y decimales con coma para que Excel en español lo abra bien en columnas.
const celdaCSV = (v) => {
  if (v === null || v === undefined) return ''
  if (typeof v === 'number') return String(v).replace('.', ',')
  const s = String(v)
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function descargarCSV(nombreArchivo, columnas, filas) {
  const lineas = [
    columnas.map(c => celdaCSV(c.titulo)).join(';'),
    ...filas.map(f => columnas.map(c => celdaCSV(typeof c.valor === 'function' ? c.valor(f) : f[c.valor])).join(';')),
  ]
  const blob = new Blob(['﻿' + lineas.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivo.endsWith('.csv') ? nombreArchivo : `${nombreArchivo}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ---------- PDF ----------
const NARANJA = [232, 124, 30]
const GRIS_TEXTO = [55, 65, 81]
const GRIS_SUAVE = [156, 163, 175]

export function crearPDF(titulo, subtitulo) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()
  doc.setFillColor(...NARANJA)
  doc.rect(0, 0, w, 22, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('AdminCARS', 12, 10)
  doc.setFontSize(11)
  doc.text(titulo, 12, 17)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(subtitulo, w - 12, 10, { align: 'right' })
  doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, w - 12, 17, { align: 'right' })
  return { doc, y: 30 }
}

const asegurarEspacio = (estado, alto) => {
  const { doc } = estado
  if (estado.y + alto > doc.internal.pageSize.getHeight() - 12) {
    doc.addPage()
    estado.y = 14
  }
}

export function pdfSeccion(estado, texto) {
  asegurarEspacio(estado, 16)
  const { doc } = estado
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...GRIS_TEXTO)
  doc.text(texto, 12, estado.y)
  doc.setDrawColor(...NARANJA)
  doc.setLineWidth(0.5)
  doc.line(12, estado.y + 1.5, 40, estado.y + 1.5)
  estado.y += 7
}

// Fichas de indicadores: [[etiqueta, valor], ...]
export function pdfIndicadores(estado, items) {
  const { doc } = estado
  const w = doc.internal.pageSize.getWidth() - 24
  const porFila = Math.min(items.length, 4)
  const ancho = w / porFila
  for (let i = 0; i < items.length; i++) {
    if (i % porFila === 0) { asegurarEspacio(estado, 16); if (i) estado.y += 15 }
    const x = 12 + (i % porFila) * ancho
    doc.setFillColor(249, 250, 251)
    doc.roundedRect(x, estado.y, ancho - 3, 12, 1.5, 1.5, 'F')
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...GRIS_SUAVE)
    doc.text(items[i][0].toUpperCase(), x + 3, estado.y + 4.5)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(...GRIS_TEXTO)
    doc.text(String(items[i][1]), x + 3, estado.y + 10)
  }
  estado.y += 19
}

// Tabla con salto de página automático. columnas: [{ titulo, valor, ancho (proporción), alinear }]
export function pdfTabla(estado, columnas, filas, { totales = null } = {}) {
  const { doc } = estado
  const anchoTotal = doc.internal.pageSize.getWidth() - 24
  const suma = columnas.reduce((s, c) => s + (c.ancho || 1), 0)
  const anchos = columnas.map(c => ((c.ancho || 1) / suma) * anchoTotal)
  const alto = 6

  const dibujarFila = (valores, { cabecera = false, total = false, par = false } = {}) => {
    asegurarEspacio(estado, alto)
    let x = 12
    if (cabecera) { doc.setFillColor(...NARANJA); doc.rect(12, estado.y, anchoTotal, alto, 'F') }
    else if (total) { doc.setFillColor(243, 244, 246); doc.rect(12, estado.y, anchoTotal, alto, 'F') }
    else if (par) { doc.setFillColor(252, 248, 244); doc.rect(12, estado.y, anchoTotal, alto, 'F') }
    doc.setFont('helvetica', cabecera || total ? 'bold' : 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...(cabecera ? [255, 255, 255] : GRIS_TEXTO))
    valores.forEach((v, i) => {
      const derecha = columnas[i].alinear === 'derecha'
      let texto = String(v ?? '—')
      const max = anchos[i] - 3
      while (texto.length > 1 && doc.getTextWidth(texto) > max) texto = texto.slice(0, -2) + '…'
      doc.text(texto, derecha ? x + anchos[i] - 1.5 : x + 1.5, estado.y + 4.2, { align: derecha ? 'right' : 'left' })
      x += anchos[i]
    })
    estado.y += alto
  }

  dibujarFila(columnas.map(c => c.titulo), { cabecera: true })
  filas.forEach((f, i) => {
    if (estado.y + alto > doc.internal.pageSize.getHeight() - 12) {
      doc.addPage(); estado.y = 14
      dibujarFila(columnas.map(c => c.titulo), { cabecera: true })
    }
    dibujarFila(columnas.map(c => (typeof c.valor === 'function' ? c.valor(f) : f[c.valor])), { par: i % 2 === 1 })
  })
  if (totales) dibujarFila(totales, { total: true })
  estado.y += 6
}

export function pdfGuardar(estado, nombre) {
  const { doc } = estado
  const paginas = doc.getNumberOfPages()
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...GRIS_SUAVE)
    doc.text(`Página ${i} de ${paginas}`, doc.internal.pageSize.getWidth() - 12, doc.internal.pageSize.getHeight() - 6, { align: 'right' })
  }
  doc.save(nombre.endsWith('.pdf') ? nombre : `${nombre}.pdf`)
}
