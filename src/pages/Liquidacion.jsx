import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Printer, Download } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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

  const handlePrint = () => window.print()

  const handlePDF = async () => {
    toast.loading('Generando PDF...')
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Liquidacion-Viaje-${id}.pdf`)
      toast.dismiss()
      toast.success('PDF generado ✓')
    } catch {
      toast.dismiss()
      toast.error('Error al generar PDF')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Cargando...</div>
  if (!data) return null

  const { viaje, gastos, resumen } = data

  return (
    <div className="p-4 lg:p-8">

      {/* ACCIONES — no se imprimen */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button onClick={() => navigate(`/viajes/${id}`)}
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

      {/* DOCUMENTO */}
      <div ref={printRef} className="bg-white rounded-2xl shadow-sm border border-gray-200 max-w-2xl mx-auto overflow-hidden">

        {/* HEADER */}
        <div className="bg-[#E87C1E] px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-widest">AdminCARS</h1>
              <p className="text-orange-100 text-sm mt-1">Liquidación de Viaje</p>
            </div>
            <div className="text-right">
              <p className="text-orange-100 text-xs uppercase tracking-wider">Viaje #</p>
              <p className="text-3xl font-black">{viaje.id_viaje}</p>
              {viaje.nro_guia && <p className="text-orange-100 text-sm">Guía: {viaje.nro_guia}</p>}
            </div>
          </div>
        </div>

        {/* INFO VIAJE */}
        <div className="px-8 py-5 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Camión</p>
              <p className="font-semibold text-gray-800">{viaje.placa} — {viaje.marca} {viaje.modelo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Conductor</p>
              <p className="font-semibold text-gray-800">{viaje.nombre_conductor}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Ruta</p>
              <p className="font-semibold text-gray-800">{viaje.origen} → {viaje.destino}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Carga</p>
              <p className="font-semibold text-gray-800">{viaje.producto_carga}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Fecha salida</p>
              <p className="font-semibold text-gray-800">{fmtDate(viaje.fecha_salida)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Fecha llegada</p>
              <p className="font-semibold text-gray-800">{fmtDate(viaje.fecha_llegada)}</p>
            </div>
          </div>
        </div>

        {/* GASTOS */}
        <div className="px-8 py-5">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-3">Detalle de gastos</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left text-xs text-gray-400 uppercase pb-2 font-semibold">Tipo</th>
                <th className="text-left text-xs text-gray-400 uppercase pb-2 font-semibold">Descripción</th>
                <th className="text-right text-xs text-gray-400 uppercase pb-2 font-semibold">Monto</th>
              </tr>
            </thead>
            <tbody>
              {gastos.map((g, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 text-sm text-gray-700">{g.tipo_gasto}</td>
                  <td className="py-2 text-sm text-gray-400">{g.categoria || '—'}</td>
                  <td className="py-2 text-sm text-right font-semibold text-gray-800">{cop(g.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RESUMEN FINAL */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Valor del flete</span>
              <span className="font-bold text-gray-800">{cop(resumen.valor_flete)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total gastos</span>
              <span className="font-bold text-red-500">— {cop(resumen.total_gastos)}</span>
            </div>
            <div className="flex justify-between text-base border-t-2 border-gray-300 pt-2 mt-2">
              <span className="font-black text-gray-800">Saldo camión</span>
              <span className={`font-black text-lg ${resumen.saldo_camion >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {cop(resumen.saldo_camion)}
              </span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-4 border-t border-gray-100 flex justify-between items-center">
          <p className="text-xs text-gray-400">Generado por AdminCARS — {new Date().toLocaleDateString('es-CO')}</p>
          <p className="text-xs text-gray-400">Firma: _______________</p>
        </div>
      </div>

      {/* ESTILOS DE IMPRESIÓN */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #root * { visibility: hidden; }
          [ref="printRef"], [ref="printRef"] * { visibility: visible; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}