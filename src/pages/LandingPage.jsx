import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: '🚛',
    title: 'Control de flota',
    desc: 'Registra cada camión con placa, conductor asignado, capacidad y estado operativo en tiempo real.',
    stat: '100%',
    statLabel: 'visibilidad'
  },
  {
    icon: '📍',
    title: 'Gestión de viajes',
    desc: 'Crea viajes, asigna rutas, registra fechas y lleva el historial completo de cada trayecto.',
    stat: '+500',
    statLabel: 'viajes gestionados'
  },
  {
    icon: '💰',
    title: 'Liquidación automática',
    desc: 'El sistema calcula automáticamente: Flete − Gastos = Saldo. Exporta a PDF con un clic.',
    stat: '0',
    statLabel: 'errores de cálculo'
  },
  {
    icon: '🔧',
    title: 'Mantenimientos',
    desc: 'Programa y registra mantenimientos preventivos y correctivos con costos y fechas.',
    stat: '24/7',
    statLabel: 'disponible'
  },
  {
    icon: '🧾',
    title: 'Facturación',
    desc: 'Genera facturas de conductores con básicos, bonificaciones e imprime o envía por WhatsApp.',
    stat: '1 clic',
    statLabel: 'para exportar'
  },
  {
    icon: '👤',
    title: 'Control de roles',
    desc: 'Administradores ven todo. Los conductores solo ven sus viajes y gastos asignados.',
    stat: '3',
    statLabel: 'niveles de acceso'
  },
]

const stats = [
  { num: '500+', label: 'Viajes registrados' },
  { num: '50+', label: 'Camiones gestionados' },
  { num: '99.9%', label: 'Disponibilidad' },
  { num: '0', label: 'Errores de cálculo' },
]

const pasos = [
  { num: '01', title: 'Crea tu cuenta', desc: 'Regístrate como administrador y configura tu empresa en minutos.' },
  { num: '02', title: 'Registra tu flota', desc: 'Agrega tus camiones y conductores con toda su información.' },
  { num: '03', title: 'Gestiona viajes', desc: 'Crea viajes, registra gastos y calcula saldos automáticamente.' },
  { num: '04', title: 'Exporta reportes', desc: 'Genera PDFs de liquidaciones y facturas con un solo clic.' },
]

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [visible, setVisible] = useState({})
  const featuresRef = useRef()
  const statsRef = useRef()
  const pasosRef = useRef()
  const ctaRef = useRef()

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.id]: true }))
        })
      },
      { threshold: 0.15 }
    )
    const refs = [featuresRef, statsRef, pasosRef, ctaRef]
    refs.forEach(r => r.current && observer.observe(r.current))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;700&display=swap');

        * { box-sizing: border-box; }

        .font-bebas { font-family: 'Bebas Neue', sans-serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .anim-fade-up { animation: fadeUp 0.7s ease both; }
        .anim-fade-up-1 { animation: fadeUp 0.7s 0.1s ease both; }
        .anim-fade-up-2 { animation: fadeUp 0.7s 0.2s ease both; }
        .anim-fade-up-3 { animation: fadeUp 0.7s 0.3s ease both; }
        .anim-fade-up-4 { animation: fadeUp 0.7s 0.4s ease both; }
        .anim-float { animation: float 4s ease-in-out infinite; }
        .anim-pulse { animation: pulse-slow 3s ease-in-out infinite; }
        .anim-spin { animation: spin-slow 20s linear infinite; }

        .section-visible .card-anim:nth-child(1) { animation: fadeUp 0.6s 0.0s ease both; }
        .section-visible .card-anim:nth-child(2) { animation: fadeUp 0.6s 0.1s ease both; }
        .section-visible .card-anim:nth-child(3) { animation: fadeUp 0.6s 0.2s ease both; }
        .section-visible .card-anim:nth-child(4) { animation: fadeUp 0.6s 0.3s ease both; }
        .section-visible .card-anim:nth-child(5) { animation: fadeUp 0.6s 0.4s ease both; }
        .section-visible .card-anim:nth-child(6) { animation: fadeUp 0.6s 0.5s ease both; }
        .section-visible .step-anim:nth-child(1) { animation: slideRight 0.6s 0.0s ease both; }
        .section-visible .step-anim:nth-child(2) { animation: slideRight 0.6s 0.15s ease both; }
        .section-visible .step-anim:nth-child(3) { animation: slideRight 0.6s 0.3s ease both; }
        .section-visible .step-anim:nth-child(4) { animation: slideRight 0.6s 0.45s ease both; }
        .section-visible .stat-anim { animation: fadeUp 0.7s ease both; }

        .marquee-track { animation: marquee 25s linear infinite; }

        .hero-bg {
          background: linear-gradient(135deg, #1A1814 0%, #2C2A26 40%, #1A1814 100%);
        }
        .orange-glow {
          background: radial-gradient(circle, rgba(232,124,30,0.3) 0%, transparent 70%);
        }
        .grid-pattern {
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(232,124,30,0.06) 60px, rgba(232,124,30,0.06) 61px),
            repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(232,124,30,0.06) 60px, rgba(232,124,30,0.06) 61px);
        }
        .text-stroke {
          -webkit-text-stroke: 2px rgba(232,124,30,0.3);
          color: transparent;
        }
        .feature-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(232,124,30,0.12); }
        .feature-card { transition: all 0.3s ease; }
        .nav-blur { backdrop-filter: blur(12px); background: rgba(26,24,20,0.85); }
      `}</style>

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-blur border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#E87C1E] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">AC</span>
            </div>
            <span className="font-bebas text-white text-xl tracking-widest">
              Admin<span className="text-[#E87C1E]">CARS</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Características', 'Cómo funciona', 'Contacto'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace('ó','o').replace(' ','-')}`}
                className="font-dm text-sm text-gray-400 hover:text-white transition-colors duration-200">
                {item}
              </a>
            ))}
          </div>
          <Link to="/login"
            className="font-dm text-sm font-semibold bg-[#E87C1E] hover:bg-[#C4610E] text-white px-5 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-[#E87C1E]/30">
            Iniciar sesión
          </Link>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="hero-bg grid-pattern min-h-screen flex items-center relative overflow-hidden pt-16">

        {/* Glow orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 orange-glow anim-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 orange-glow anim-pulse pointer-events-none" style={{ animationDelay: '1.5s' }} />

        {/* Rotating ring */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 w-80 h-80 hidden lg:block pointer-events-none">
          <div className="anim-spin w-full h-full border-2 border-[#E87C1E]/20 rounded-full" />
          <div className="absolute inset-8 anim-spin w-auto h-auto border border-[#E87C1E]/10 rounded-full" style={{ animationDirection: 'reverse', animationDuration: '15s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="anim-float text-8xl">🚛</div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <div className="max-w-3xl">

            <div className="anim-fade-up inline-flex items-center gap-2 bg-[#E87C1E]/10 border border-[#E87C1E]/30 rounded-full px-4 py-1.5 mb-8">
              <div className="w-2 h-2 bg-[#E87C1E] rounded-full anim-pulse" />
              <span className="font-dm text-[#E87C1E] text-xs font-semibold tracking-widest uppercase">
                Sistema de gestión de flota
              </span>
            </div>

            <h1 className="font-bebas anim-fade-up-1 leading-none tracking-tight mb-6">
              <span className="block text-white" style={{ fontSize: 'clamp(3.5rem, 10vw, 7rem)' }}>
                Gestiona tu
              </span>
              <span className="block text-[#E87C1E]" style={{ fontSize: 'clamp(3.5rem, 10vw, 7rem)' }}>
                flota al máximo
              </span>
              <span className="block text-stroke font-bebas" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}>
                AdminCARS
              </span>
            </h1>

            <p className="font-dm anim-fade-up-2 text-gray-400 text-lg leading-relaxed max-w-xl mb-10" style={{ fontWeight: 300 }}>
              Controla camiones, conductores, viajes, gastos y mantenimientos desde un solo panel. 
              Calcula saldos automáticamente y exporta liquidaciones en PDF.
            </p>

            <div className="anim-fade-up-3 flex flex-wrap gap-4">
              <Link to="/register"
                className="font-dm font-semibold bg-[#E87C1E] hover:bg-[#C4610E] text-white px-8 py-3.5 rounded-xl text-base transition-all duration-200 shadow-xl shadow-[#E87C1E]/30 hover:shadow-[#E87C1E]/50 hover:-translate-y-0.5">
                Empezar gratis
              </Link>
              <Link to="/login"
                className="font-dm font-medium border border-white/15 hover:border-white/30 text-white px-8 py-3.5 rounded-xl text-base transition-all duration-200 hover:-translate-y-0.5">
                Iniciar sesión →
              </Link>
            </div>

            <div className="anim-fade-up-4 flex gap-10 mt-14 pt-10 border-t border-white/8">
              {[['500+', 'Viajes'], ['50+', 'Camiones'], ['24/7', 'Disponible'], ['PDF', 'Exportable']].map(([n, l]) => (
                <div key={l}>
                  <div className="font-bebas text-[#E87C1E] text-3xl tracking-wide">{n}</div>
                  <div className="font-dm text-gray-500 text-xs uppercase tracking-wider mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 anim-float">
          <span className="font-dm text-gray-600 text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-[#E87C1E] to-transparent" />
        </div>
      </section>

      {/* ═══ MARQUEE ═══ */}
      <div className="bg-[#E87C1E] py-3 overflow-hidden">
        <div className="marquee-track flex gap-12 whitespace-nowrap" style={{ width: 'max-content' }}>
          {Array(8).fill(['GESTIÓN DE FLOTA', 'LIQUIDACIONES PDF', 'CONTROL DE ROLES', 'VIAJES EN TIEMPO REAL', 'GASTOS POR VIAJE', 'MANTENIMIENTOS', 'CONDUCTORES', 'ADMINCARS']).flat().map((item, i) => (
            <span key={i} className="font-bebas text-white text-lg tracking-widest opacity-90">
              {item} <span className="text-white/40 mx-4">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* ═══ FEATURES ═══ */}
      <section id="características" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-dm text-[#E87C1E] text-xs font-bold uppercase tracking-widest">Características</span>
            <h2 className="font-bebas text-gray-900 mt-3 leading-none" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
              Todo lo que necesitas<br />
              <span className="text-[#E87C1E]">en un solo lugar</span>
            </h2>
            <p className="font-dm text-gray-500 mt-4 max-w-xl mx-auto" style={{ fontWeight: 300 }}>
              Diseñado para empresas de transporte de carga que necesitan visibilidad total sobre sus operaciones.
            </p>
          </div>

          <div
            id="features-grid"
            ref={featuresRef}
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${visible['features-grid'] ? 'section-visible' : 'opacity-0'}`}
          >
            {features.map((f) => (
              <div key={f.title} className="card-anim feature-card bg-white rounded-2xl p-6 border border-gray-100 cursor-default">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#E87C1E]/10 rounded-xl flex items-center justify-center text-2xl">
                    {f.icon}
                  </div>
                  <div className="text-right">
                    <div className="font-bebas text-[#E87C1E] text-2xl leading-none">{f.stat}</div>
                    <div className="font-dm text-gray-400 text-xs">{f.statLabel}</div>
                  </div>
                </div>
                <h3 className="font-dm font-bold text-gray-900 text-base mb-2">{f.title}</h3>
                <p className="font-dm text-gray-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="hero-bg py-20 relative overflow-hidden">
        <div className="absolute inset-0 orange-glow pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(232,124,30,0.15) 0%, transparent 70%)' }} />
        <div
          id="stats-section"
          ref={statsRef}
          className={`max-w-7xl mx-auto px-6 ${visible['stats-section'] ? 'section-visible' : 'opacity-0'}`}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="stat-anim text-center">
                <div className="font-bebas text-[#E87C1E] leading-none mb-2" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>{s.num}</div>
                <div className="font-dm text-gray-400 text-sm uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CÓMO FUNCIONA ═══ */}
      <section id="como-funciona" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="font-dm text-[#E87C1E] text-xs font-bold uppercase tracking-widest">Cómo funciona</span>
              <h2 className="font-bebas text-gray-900 mt-3 leading-none" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
                Simple desde<br /><span className="text-[#E87C1E]">el primer día</span>
              </h2>
              <p className="font-dm text-gray-500 mt-4 leading-relaxed" style={{ fontWeight: 300 }}>
                Un flujo de trabajo claro para que tu equipo adopte el sistema sin fricción y empiece a ver resultados desde el primer viaje.
              </p>
            </div>

            <div
              id="pasos-section"
              ref={pasosRef}
              className={`space-y-4 ${visible['pasos-section'] ? 'section-visible' : 'opacity-0'}`}
            >
              {pasos.map((p) => (
                <div key={p.num} className="step-anim flex gap-5 p-5 rounded-2xl border border-gray-100 hover:border-[#E87C1E]/30 hover:bg-orange-50/30 transition-all duration-300 cursor-default group">
                  <div className="font-bebas text-4xl text-[#E87C1E]/25 group-hover:text-[#E87C1E]/60 transition-colors leading-none w-12 shrink-0">
                    {p.num}
                  </div>
                  <div>
                    <h3 className="font-dm font-bold text-gray-900 mb-1">{p.title}</h3>
                    <p className="font-dm text-gray-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ DEMO VISUAL ═══ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden">
            {/* Mock browser bar */}
            <div className="bg-gray-100 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded-lg px-3 py-1 text-xs text-gray-400 font-dm text-center">
                admin-cars.vercel.app/viajes/1
              </div>
            </div>
            {/* Mock content */}
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[['🚛 Camión', 'Volvo FH16 — ABC-123'], ['👤 Conductor', 'Edwin Quiroz'], ['📦 Carga', 'Cemento · 25 ton']].map(([label, val]) => (
                  <div key={label} className="bg-white rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 font-dm">{val}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-4">
                <div className="grid grid-cols-3 divide-x divide-gray-100">
                  {[['Flete', '$3.800.000', 'text-gray-800'], ['Gastos', '$1.495.000', 'text-red-500'], ['Saldo', '$2.305.000', 'text-green-600']].map(([label, val, color]) => (
                    <div key={label} className="p-4 text-center">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                      <p className={`font-bebas text-2xl ${color}`}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-dm">Gastos del viaje</span>
                  <span className="text-xs bg-[#E87C1E] text-white px-2 py-0.5 rounded-lg font-dm">+ Agregar</span>
                </div>
                {[['Combustible (ACPM)', '890.000'], ['Peaje', '185.000'], ['Viáticos / Liga', '380.000'], ['Liga', '40.000']].map(([tipo, monto]) => (
                  <div key={tipo} className="flex justify-between items-center px-4 py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-700 font-dm">{tipo}</span>
                    <span className="text-sm font-bold text-[#E87C1E] font-dm">${monto}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section
        id="cta-section"
        ref={ctaRef}
        className="hero-bg py-28 relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 orange-glow" style={{ background: 'radial-gradient(ellipse at 60% 50%, rgba(232,124,30,0.2) 0%, transparent 60%)' }} />
          <div className="font-bebas absolute inset-0 flex items-center justify-center text-center leading-none select-none pointer-events-none" style={{ fontSize: 'clamp(8rem, 20vw, 20rem)', color: 'rgba(232,124,30,0.04)' }}>
            ADMINCARS
          </div>
        </div>
        <div className={`max-w-3xl mx-auto px-6 text-center relative z-10 ${visible['cta-section'] ? 'anim-fade-up' : 'opacity-0'}`}>
          <span className="font-dm text-[#E87C1E] text-xs font-bold uppercase tracking-widest">Empieza hoy</span>
          <h2 className="font-bebas text-white mt-4 leading-none" style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}>
            ¿Listo para tomar el<br />
            <span className="text-[#E87C1E]">control de tu flota?</span>
          </h2>
          <p className="font-dm text-gray-400 mt-6 text-lg max-w-xl mx-auto" style={{ fontWeight: 300 }}>
            Únete a las empresas de transporte que ya gestionan sus operaciones con AdminCARS. Configura tu cuenta en minutos.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-10">
            <Link to="/register"
              className="font-dm font-semibold bg-[#E87C1E] hover:bg-[#C4610E] text-white px-10 py-4 rounded-xl text-base transition-all duration-200 shadow-2xl shadow-[#E87C1E]/40 hover:-translate-y-1">
              Crear cuenta gratis
            </Link>
            <Link to="/login"
              className="font-dm font-medium border border-white/15 hover:border-white/30 text-white px-10 py-4 rounded-xl text-base transition-all duration-200 hover:-translate-y-1">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="hero-bg border-t border-white/6 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bebas text-white text-xl tracking-widest">
            Admin<span className="text-[#E87C1E]">CARS</span>
          </span>
          <p className="font-dm text-gray-500 text-sm">
            © {new Date().getFullYear()} AdminCARS — Sistema de gestión de flota
          </p>
          <div className="flex gap-6">
            <Link to="/login" className="font-dm text-sm text-gray-500 hover:text-white transition-colors">Iniciar sesión</Link>
            <Link to="/register" className="font-dm text-sm text-gray-500 hover:text-white transition-colors">Registrarse</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}