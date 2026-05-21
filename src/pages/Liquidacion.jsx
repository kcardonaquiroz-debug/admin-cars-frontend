import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios'; // Ajusta la ruta según tu estructura
import { ArrowLeft, Printer, FileText } from 'lucide-react';

const Liquidacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const componentRef = useRef();
  
  const [viaje, setViaje] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchViajeDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/viajes/${id}`);
        setViaje(response.data);
        setError(null);
      } catch (err) {
        console.error("Error al cargar la liquidación:", err);
        setError("No se encontraron datos o hubo un error al cargar la liquidación.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchViajeDetails();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', fontSize: '1.2rem', color: '#666' }}>
        Cargando datos de la liquidación...
      </div>
    );
  }

  if (error || !viaje) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#dc3545', fontSize: '1.1rem' }}>
        {error || "No se pudo cargar la información del viaje."}
      </div>
    );
  }

  // Cálculos financieros seguros
  const valorFlete = Number(viaje.valor_flete) || 0;
  const totalGastos = Array.isArray(viaje.gastos) 
    ? viaje.gastos.reduce((sum, g) => sum + (Number(g.monto) || 0), 0) 
    : 0;
  const saldoCamion = valorFlete - totalGastos;

  // Formateador de moneda de Colombia
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Formateador de fechas
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('es-CO');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* SECCIÓN DE BOTONES (Se oculta automáticamente al imprimir) */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* FORZAR COLORES DE FONDO Y BORDES EN IMPRESIÓN Y PDF */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="no-print" style={{ display: 'table', width: '100%', marginBottom: '24px' }}>
        <div style={{ display: 'table-cell', verticalAlign: 'middle' }}>
          <button 
            onClick={() => navigate('/viajes')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: '1px solid #e2e8f0', backgroundColor: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', color: '#4a5568', transition: 'all 0.2s' }}
          >
            <ArrowLeft size={18} /> Volver
          </button>
        </div>
        <div style={{ display: 'table-cell', textAlign: 'right', verticalAlign: 'middle' }}>
          <div style={{ display: 'inline-flex', gap: '12px' }}>
            <button 
              onClick={handlePrint}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', color: '#334155' }}
            >
              <Printer size={18} /> Imprimir
            </button>
            <button 
              onClick={handlePrint}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#ea580c', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', color: '#fff' }}
            >
              <FileText size={18} /> Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {/* RECUADRO DE LA LIQUIDACIÓN / FACTURA */}
      <div 
        ref={componentRef} 
        style={{ 
          backgroundColor: '#fff', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', 
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        }}
      >
        {/* ENCABEZADO NARANJA REORGANIZADO */}
        <div style={{ backgroundColor: '#ea580c', padding: '32px', color: '#fff', display: 'table', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'table-cell', verticalAlign: 'middle' }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', letterSpacing: '0.5px' }}>AdminCARS</h1>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '15px' }}>Liquidación de Viaje</p>
          </div>
          <div style={{ display: 'table-cell', textAlign: 'right', verticalAlign: 'middle' }}>
            <div style={{ fontSize: '13px', opacity: 0.9, textTransform: 'uppercase', fontWeight: '600' }}>Viaje #</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', lineHeight: '1.1' }}>{viaje.id}</div>
            {viaje.guia && <div style={{ fontSize: '14px', marginTop: '4px', opacity: 0.95 }}>Guía: {viaje.guia}</div>}
          </div>
        </div>

        {/* CONTENIDO INTERNO */}
        <div style={{ padding: '32px' }}>
          
          {/* TABLA DE DETALLES PRINCIPALES (Reemplaza flexbox para garantizar compatibilidad con impresión) */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '36px' }}>
            <tbody>
              <tr>
                <td style={{ width: '50%', paddingBottom: '20px', verticalAlign: 'top' }}>
                  <span style={{ display: 'block', fontSize: '12px', color: '#718096', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Camión</span>
                  <strong style={{ fontSize: '16px', color: '#1a202c' }}>— {viaje.nombre_camion || viaje.placa || 'No asignado'}</strong>
                </td>
                <td style={{ width: '50%', paddingBottom: '20px', verticalAlign: 'top' }}>
                  <span style={{ display: 'block', fontSize: '12px', color: '#718096', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Conductor</span>
                  <strong style={{ fontSize: '16px', color: '#1a202c' }}>{viaje.nombre_conductor || 'No asignado'}</strong>
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '20px', verticalAlign: 'top' }}>
                  <span style={{ display: 'block', fontSize: '12px', color: '#718096', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Ruta</span>
                  <span style={{ fontSize: '16px', color: '#1a202c', fontWeight: '500' }}>{viaje.origen} → {viaje.destino}</span>
                </td>
                <td style={{ paddingBottom: '20px', verticalAlign: 'top' }}>
                  <span style={{ display: 'block', fontSize: '12px', color: '#718096', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Carga</span>
                  <span style={{ fontSize: '16px', color: '#1a202c', fontWeight: '500' }}>{viaje.descripcion_carga || '—'}</span>
                </td>
              </tr>
              <tr>
                <td style={{ verticalAlign: 'top' }}>
                  <span style={{ display: 'block', fontSize: '12px', color: '#718096', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Fecha Salida</span>
                  <span style={{ fontSize: '15px', color: '#1a202c' }}>{formatDate(viaje.fecha_salida)}</span>
                </td>
                <td style={{ verticalAlign: 'top' }}>
                  <span style={{ display: 'block', fontSize: '12px', color: '#718096', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Fecha Llegada</span>
                  <span style={{ fontSize: '15px', color: '#1a202c' }}>{formatDate(viaje.fecha_llegada)}</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* TABLA DE DETALLE DE GASTOS */}
          <h3 style={{ fontSize: '16px', color: '#1a202c', textTransform: 'uppercase', margin: '0 0 12px 0', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', letterSpacing: '0.5px' }}>
            Detalle de Gastos
          </h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ textAlign: 'left', padding: '10px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Tipo</th>
                <th style={{ textAlign: 'left', padding: '10px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Descripción / Detalle</th>
                <th style={{ textAlign: 'right', padding: '10px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(viaje.gastos) && viaje.gastos.length > 0 ? (
                viaje.gastos.map((gasto, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 0', fontSize: '14px', color: '#334155', fontWeight: '500' }}>{gasto.tipo_gasto}</td>
                    <td style={{ padding: '12px 0', fontSize: '14px', color: '#64748b' }}>{gasto.descripcion || '—'}</td>
                    <td style={{ padding: '12px 0', fontSize: '14px', color: '#334155', textAlign: 'right', fontWeight: '500' }}>{formatCurrency(gasto.monto)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ padding: '20px 0', fontSize: '14px', color: '#94a3b8', textAlign: 'center' }}>
                    No se registraron gastos en este viaje.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* BALANCE FINANCIERO (CON ESTILO GRIS TAL CUAL TU IMAGEN) */}
          <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '20px', marginLeft: 'auto', maxWidth: '450px', border: '1px solid #f1f5f9' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 0', fontSize: '14px', color: '#475569' }}>Valor del flete</td>
                  <td style={{ padding: '6px 0', fontSize: '14px', color: '#1e293b', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(valorFlete)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '6px 0', fontSize: '14px', color: '#b91c1c' }}>Total gastos</td>
                  <td style={{ padding: '6px 0', fontSize: '14px', color: '#b91c1c', textAlign: 'right', fontWeight: '600' }}>— {formatCurrency(totalGastos)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '14px 0 0 0', fontSize: '16px', color: '#0f172a', fontWeight: 'bold' }}>Saldo camión</td>
                  <td style={{ padding: '14px 0 0 0', fontSize: '18px', color: '#16a34a', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(saldoCamion)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* PIE DE PÁGINA: FIRMA Y FECHA DE GENERACIÓN */}
          <div style={{ marginTop: '60px', display: 'table', width: '100%', fontSize: '13px', color: '#64748b' }}>
            <div style={{ display: 'table-cell', verticalAlign: 'bottom', width: '50%' }}>
              Generado por AdminCARS — {new Date().toLocaleDateString('es-CO')}
            </div>
            <div style={{ display: 'table-cell', textAlign: 'right', verticalAlign: 'bottom', width: '50%' }}>
              <span style={{ display: 'inline-block', width: '200px', borderBottom: '1px solid #94a3b8', marginBottom: '4px' }}></span>
              <div style={{ marginRight: '40px' }}>Firma</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Liquidacion;