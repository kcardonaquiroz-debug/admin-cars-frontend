import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Printer, Download } from 'lucide-react'
import jsPDF from 'jspdf'

const cop = (v) => '$' + Number(v).toLocaleString('es-CO')
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-CO') : '—'

export default function Liquidacion() {
  const { id } = useParams()
  const navigate = useNavigate()
  const printRef = useRef()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get(`/liquidacion/${id}`)
        setData(res.data.data)
      } catch { toast.error('Error al cargar liquidación') }
      finally { setLoading(false) }
    }
    cargar()
  }, [id])

  const handlePrint = () => {
    const contenido = printRef.current.innerHTML
    const ventana = window.open('', '_blank', 'width=800,height=900')
    ventana.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Liquidación Viaje #${id}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; color: #1f2937; background: white; }
            .doc { max-width: 700px; margin: 0 auto; }
            .header { background: #E87C1E; padding: 2rem; color: white; display: flex; justify-content: space-between; align-items: center; }
            .header h1 { font-size: 1.5rem; font-weight: 900; letter-spacing: 0.1em; }
            .header-right { text-align: right; }
            .viaje-num { font-size: 2.5rem; font-weight: 900; line-height: 1; }
            .header p { font-size: 0.8rem; opacity: 0.85; margin-top: 0.25rem; }
            .info { padding: 1.5rem 2rem; border-bottom: 1px solid #f3f4f6; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
            .info-item p:first-child { font-size: 0.7rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; }
            .info-item p:last-child { font-weight: 600; font-size: 0.9rem; margin-top: 0.2rem; }
            .gastos { padding: 1.5rem 2rem; }
            .gastos h2 { font-size: 0.75rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 1rem; }
            table { width: 100%; border-collapse: collapse; }
            thead tr { border-bottom: 2px solid #e5e7eb; }
            thead th { text-align: left; font-size: 0.72rem; color: #9ca3af; font-weight: 600; text-transform: uppercase; padding-bottom: 0.5rem; }
            tbody tr { border-bottom: 1px solid #f9fafb; }
            tbody td { padding: 0.6rem 0; font-size: 0.85rem; color: #374151; }
            tbody td:last-child { text-align: right; font-weight: 600; }
            .resumen { padding: 1.5rem 2rem; background: #f9fafb; border-top: 1px solid #e5e7eb; }
            .resumen-row { display: flex; justify-content: space-between; font-size: 0.9rem; padding: 0.3rem 0; }
            .resumen-row span:first-child { color: #6b7280; }
            .resumen-row span:last-child { font-weight: 700; }
            .resumen-total { display: flex; justify-content: space-between; font-size: 1rem; font-weight: 900; border-top: 2px solid #e5e7eb; padding-top: 0.75rem; margin-top: 0.5rem; }
            .saldo-pos { color: #16a34a; }
            .saldo-neg { color: #ef4444; }
            .footer { padding: 1rem 2rem; display: flex; justify-content: space-between; border-top: 1px solid #f3f4f6; }
            .footer p { font-size: 0.72rem; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="doc">${contenido}</div>
          <script>window.onload = function() { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `)
    ventana.document.close()
  }

  const handlePDF = () => {
    if (!data) return
    const { viaje, gastos, resumen } = data
    const doc = new jsPDF('p', 'mm', 'a4')
    const w = doc.internal.pageSize.getWidth()
    let y = 0

    // HEADER naranja
    doc.setFillColor(232, 124, 30)
    doc.rect(0, 0, w, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('AdminCARS', 15, 16)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Liquidación de Viaje', 15, 23)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text(`#${viaje.id_viaje}`, w - 15, 20, { align: 'right' })
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    if (viaje.nro_guia) doc.text(`Guía: ${viaje.nro_guia}`, w - 15, 28, { align: 'right' })
    y = 50

    // INFO VIAJE
    doc.setTextColor(156, 163, 175)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    const campos = [
      ['CAMIÓN', `${viaje.placa || ''} ${viaje.marca} ${viaje.modelo}`.trim()],
      ['CONDUCTOR', viaje.nombre_conductor || '—'],
      ['RUTA', `${viaje.origen} → ${viaje.destino}`],
      ['CARGA', viaje.producto_carga || '—'],
      ['FECHA SALIDA', fmtDate(viaje.fecha_salida)],
      ['FECHA LLEGADA', fmtDate(viaje.fecha_llegada)],
    ]
    campos.forEach(([label, valor], i) => {
      const col = i % 2 === 0 ? 15 : w / 2 + 5
      const row = Math.floor(i / 2)
      doc.setTextColor(156, 163, 175)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text(label, col, y + row * 14)
      doc.setTextColor(31, 41, 55)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(valor, col, y + row * 14 + 5)
    })
    y += Math.ceil(campos.length / 2) * 14 + 8

    // LÍNEA SEPARADORA
    doc.setDrawColor(243, 244, 246)
    doc.line(15, y, w - 15, y)
    y += 8

    // DETALLE GASTOS
    doc.setTextColor(107, 114, 128)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('DETALLE DE GASTOS', 15, y)
    y += 6

    // Encabezado tabla
    doc.setFillColor(249, 250, 251)
    doc.rect(15, y, w - 30, 7, 'F')
    doc.setTextColor(156, 163, 175)
    doc.setFontSize(7)
    doc.text('TIPO', 18, y + 4.5)
    doc.text('DESCRIPCIÓN', 70, y + 4.5)
    doc.text('MONTO', w - 18, y + 4.5, { align: 'right' })
    y += 9

    // Filas gastos
    if (gastos.length === 0) {
      doc.setTextColor(156, 163, 175)
      doc.setFontSize(8)
      doc.text('Sin gastos registrados', 15, y + 4)
      y += 12
    } else {
      gastos.forEach(g => {
        doc.setDrawColor(249, 250, 251)
        doc.line(15, y, w - 15, y)
        doc.setTextColor(55, 65, 81)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(g.tipo_gasto || '—', 18, y + 5)
        doc.setTextColor(156, 163, 175)
        doc.text(g.categoria || '—', 70, y + 5)
        doc.setTextColor(55, 65, 81)
        doc.setFont('helvetica', 'bold')
        doc.text(cop(g.monto), w - 18, y + 5, { align: 'right' })
        y += 9
      })
    }

    y += 4
    doc.setDrawColor(229, 231, 235)
    doc.line(15, y, w - 15, y)
    y += 8

    // RESUMEN FINAL
    doc.setFillColor(249, 250, 251)
    doc.rect(15, y - 4, w - 30, 38, 'F')

    const filaResumen = (label, valor, color) => {
      doc.setTextColor(107, 114, 128)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(label, 20, y + 4)
      const rgb = color || [31, 41, 55]
      doc.setTextColor(...rgb)
      doc.setFont('helvetica', 'bold')
      doc.text(valor, w - 20, y + 4, { align: 'right' })
      y += 9
    }

    filaResumen('Valor del flete', cop(resumen.valor_flete))
    filaResumen('Total gastos', `— ${cop(resumen.total_gastos)}`, [239, 68, 68])

    doc.setDrawColor(229, 231, 235)
    doc.line(20, y, w - 20, y)
    y += 6

    doc.setTextColor(31, 41, 55)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Saldo camión', 20, y + 4)
    const saldoColor = resumen.saldo_camion >= 0 ? [22, 163, 74] : [239, 68, 68]
    doc.setTextColor(...saldoColor)
    doc.setFontSize(12)
    doc.text(cop(resumen.saldo_camion), w - 20, y + 4, { align: 'right' })
    y += 16

    // FOOTER
    doc.setDrawColor(243, 244, 246)
    doc.line(15, y, w - 15, y)
    y += 6
    doc.setTextColor(156, 163, 175)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generado por AdminCARS — ${new Date().toLocaleDateString('es-CO')}`, 15, y + 4)
    doc.text('Firma: _______________', w - 15, y + 4, { align: 'right' })

    doc.save(`Liquidacion-Viaje-${id}.pdf`)
    toast.success('PDF generado ✓')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">Cargando...</div>
  )
  if (!data) return null

  const { viaje, gastos, resumen } = data

  return (
    <div className="p-4 lg:p-8">

      {/* ACCIONES */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(`/app/viajes/${id}`)}
          className="flex items-center gap-2 p-2 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-800 transition">
          <ArrowLeft size={18} />
        </button>
        <div className="flex gap-3">
          <button onClick={handlePrint}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold transition">
            <Printer size={15} /> Imprimir
          </button>
          <button onClick={handlePDF}
            className="flex items-center gap-2 bg-[#E87C1E] hover:bg-[#C4610E] text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-lg shadow-[#E87C1E]/30">
            <Download size={15} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* DOCUMENTO — contenido para imprimir */}
      <div ref={printRef} className="bg-white rounded-2xl shadow-sm border border-gray-200 max-w-2xl mx-auto overflow-hidden">

        {/* HEADER */}
        <div className="bg-[#E87C1E] px-8 py-6 text-white flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-widest">AdminCARS</h1>
            <p className="text-orange-100 text-sm mt-1">Liquidación de Viaje</p>
          </div>
          <div className="text-right">
            <p className="text-orange-100 text-xs uppercase tracking-wider">Viaje #</p>
            <p className="text-4xl font-black">{viaje.id_viaje}</p>
            {viaje.nro_guia && <p className="text-orange-100 text-sm">Guía: {viaje.nro_guia}</p>}
          </div>
        </div>

        {/* INFO */}
        <div className="px-8 py-5 border-b border-gray-100 grid grid-cols-2 gap-4">
          {[
            ['Camión', `${viaje.placa || ''} ${viaje.marca} ${viaje.modelo}`.trim()],
            ['Conductor', viaje.nombre_conductor || '—'],
            ['Ruta', `${viaje.origen} → ${viaje.destino}`],
            ['Carga', viaje.producto_carga || '—'],
            ['Fecha salida', fmtDate(viaje.fecha_salida)],
            ['Fecha llegada', fmtDate(viaje.fecha_llegada)],
          ].map(([label, valor]) => (
            <div key={label}>
              <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
              <p className="font-semibold text-sm text-gray-800 mt-0.5">{valor}</p>
            </div>
          ))}
        </div>

        {/* GASTOS */}
        <div className="px-8 py-5">
          <h2 className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-3">Detalle de gastos</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left text-xs text-gray-400 uppercase pb-2 font-semibold">Tipo</th>
                <th className="text-left text-xs text-gray-400 uppercase pb-2 font-semibold">Descripción</th>
                <th className="text-right text-xs text-gray-400 uppercase pb-2 font-semibold">Monto</th>
              </tr>
            </thead>
            <tbody>
              {gastos.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-4 text-gray-400 text-sm">Sin gastos</td></tr>
              ) : gastos.map((g, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 text-sm text-gray-700">{g.tipo_gasto}</td>
                  <td className="py-2 text-sm text-gray-400">{g.categoria || '—'}</td>
                  <td className="py-2 text-sm text-right font-semibold text-gray-800">{cop(g.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RESUMEN */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Valor del flete</span>
            <span className="font-bold text-gray-800">{cop(resumen.valor_flete)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total gastos</span>
            <span className="font-bold text-red-500">— {cop(resumen.total_gastos)}</span>
          </div>
          <div className="flex justify-between text-base border-t-2 border-gray-300 pt-2">
            <span className="font-black text-gray-800">Saldo camión</span>
            <span className={`font-black text-lg ${resumen.saldo_camion >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {cop(resumen.saldo_camion)}
            </span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-4 border-t border-gray-100 flex justify-between">
          <p className="text-xs text-gray-400">Generado por AdminCARS — {new Date().toLocaleDateString('es-CO')}</p>
          <p className="text-xs text-gray-400">Firma: _______________</p>
        </div>
      </div>
    </div>
  )
}