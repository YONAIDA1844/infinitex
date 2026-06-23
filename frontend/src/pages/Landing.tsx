const AGENTS = [
  {
    id: 'orchestrator',
    name: 'Orquestador Central',
    area: 'Todos los flujos',
    badge: 'Hub',
    icon: '◎',
    color: 'blue' as const,
    description:
      'Único punto de entrada para email y WhatsApp. Clasifica cada mensaje entrante por actor, tipo y urgencia, luego delega al agente especializado correspondiente.',
    full: true,
  },
  {
    id: 'bodega',
    name: 'Agente Bodega',
    area: 'Bodega Anker',
    badge: 'Bidireccional',
    icon: '▣',
    color: 'emerald' as const,
    description:
      'Confirma recepción de mercadería, gestiona alertas de stock y comunica pesos, CBM y medidas de pallets. Las discrepancias requieren aprobación del Supervisor.',
  },
  {
    id: 'ventas',
    name: 'Agente Ventas',
    area: 'Área Comercial',
    badge: 'Salida',
    icon: '◈',
    color: 'violet' as const,
    description:
      'Mantiene al equipo comercial informado del estado de pedidos y alerta sobre retrasos que afecten compromisos de entrega.',
  },
  {
    id: 'despacho',
    name: 'Agente Despacho',
    area: 'Agente de Despacho',
    badge: 'Automático',
    icon: '▶',
    color: 'orange' as const,
    description:
      'Notifica pedidos listos para retiro con información completa: pesos, medidas, pallets y Packing List adjunto. Siempre automático.',
  },
  {
    id: 'clientes',
    name: 'Agente Clientes',
    area: 'Clientes Finales',
    badge: '⚠ Siempre aprobación',
    icon: '◉',
    color: 'pink' as const,
    description:
      'Confirma despachos y entrega documentación al cliente final. Cada mensaje requiere aprobación del Supervisor sin excepción.',
  },
  {
    id: 'kadi',
    name: 'Agente Kadi',
    area: 'Producción Kadi Internacional',
    badge: 'Importaciones',
    icon: '⬡',
    color: 'cyan' as const,
    description:
      'Rastrea 8 estados del ciclo de importación. Cada reporte incluye tabla de fechas de buque y checklist documental (BL, factura, Packing List, etc.).',
  },
  {
    id: 'admin',
    name: 'Agente Admin',
    area: 'Administración',
    badge: 'Bidireccional',
    icon: '◆',
    color: 'amber' as const,
    description:
      'Gestiona cotizaciones aprobadas, recordatorios de pago a agentes en destino, cierres de importación y reclamos formales con el proveedor.',
  },
]

const COLOR = {
  blue: {
    card: 'border-blue-500/40 bg-blue-500/5',
    icon: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
    badge: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
    dot: 'bg-blue-400',
  },
  emerald: {
    card: 'border-gray-700/60 bg-gray-900/40 hover:border-emerald-500/30',
    icon: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    dot: 'bg-emerald-400',
  },
  violet: {
    card: 'border-gray-700/60 bg-gray-900/40 hover:border-violet-500/30',
    icon: 'border-violet-500/40 bg-violet-500/10 text-violet-400',
    badge: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
    dot: 'bg-violet-400',
  },
  orange: {
    card: 'border-gray-700/60 bg-gray-900/40 hover:border-orange-500/30',
    icon: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
    badge: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
    dot: 'bg-orange-400',
  },
  pink: {
    card: 'border-gray-700/60 bg-gray-900/40 hover:border-pink-500/30',
    icon: 'border-pink-500/40 bg-pink-500/10 text-pink-400',
    badge: 'border-pink-500/30 bg-pink-500/10 text-pink-300',
    dot: 'bg-pink-400',
  },
  cyan: {
    card: 'border-gray-700/60 bg-gray-900/40 hover:border-cyan-500/30',
    icon: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
    badge: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    dot: 'bg-cyan-400',
  },
  amber: {
    card: 'border-gray-700/60 bg-gray-900/40 hover:border-amber-500/30',
    icon: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    dot: 'bg-amber-400',
  },
} as const

const AUTO_MSGS = [
  'Confirmaciones de recepción de mercadería a Bodega',
  'Reportes de estado de pedidos a Ventas',
  'Notificaciones de pedidos listos al Agente de Despacho',
  'Actualizaciones de estado de importaciones a Producción Kadi',
  'Tablas de fechas de buque (salida y llegada)',
  'Recordatorios de pago con anticipación configurable',
  'Reportes diarios consolidados a todos los actores',
]

const APPROVAL_MSGS = [
  'Toda comunicación directa con Clientes finales',
  'Alertas de faltantes o discrepancias en Bodega',
  'Retrasos que afecten compromisos comerciales',
  'Documentación incompleta en importaciones Kadi',
  'Pagos a agentes en destino',
  'Reclamos formales y solicitudes de descuento',
]

const PHASES = [
  { n: '01', label: 'MVP Core', desc: 'Orquestador + Agente Despacho + Dashboard básico' },
  { n: '02', label: 'Operativa Completa', desc: 'Agentes Bodega, Ventas, Clientes + sistema de aprobaciones' },
  { n: '03', label: 'Importaciones Kadi', desc: '8 estados + tabla de fechas + checklist documental' },
  { n: '04', label: 'Administración', desc: 'Pagos, cierres de importación, reclamos formales' },
  { n: '05', label: 'Optimización', desc: 'Dashboard completo, alertas inteligentes, métricas' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-950 text-white antialiased">

      {/* ── NAV ── */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-1">
            <span className="text-xl font-black tracking-widest text-blue-400">INFINITE</span>
            <span className="text-xl font-black tracking-widest text-white">X</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            {['#agentes', '#flujos', '#aprobaciones', '#roadmap'].map((href) => (
              <a
                key={href}
                href={href}
                className="text-sm text-gray-400 capitalize transition-colors hover:text-white"
              >
                {href.slice(1)}
              </a>
            ))}
          </div>
          <a
            href="#agentes"
            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
          >
            Ver Dashboard →
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Gradients */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(59,130,246,0.18),transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_80%,rgba(6,182,212,0.07),transparent)]" />
        {/* Grid */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px]" />

        <div className="relative mx-auto max-w-4xl px-6 py-32 text-center">
          {/* pill */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-300">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-blue-400" />
            Sistema de uso interno · Sicoben Ediciones
          </div>

          <h1 className="mb-4 text-[clamp(4rem,10vw,8rem)] font-black leading-none tracking-tighter">
            <span className="text-white">Infinite</span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">X</span>
          </h1>

          <p className="mb-3 text-xl font-light text-gray-300">
            Sistema Interno de Inteligencia Operativa
          </p>
          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-gray-500">
            Herramienta de uso exclusivo de Sicoben Ediciones. 8 agentes especializados coordinados
            por un hub central automatizan las comunicaciones internas de logística, importaciones
            y administración — con el Supervisor como único punto de control y aprobación.
          </p>

          {/* stats */}
          <div className="mb-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[
              { v: '8', l: 'Agentes' },
              { v: '6', l: 'Actores externos' },
              { v: '1', l: 'Supervisor' },
              { v: '0', l: 'Omisiones' },
            ].map(({ v, l }) => (
              <div key={l} className="text-center">
                <div className="text-4xl font-black text-white">{v}</div>
                <div className="mt-0.5 text-xs uppercase tracking-widest text-gray-500">{l}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#agentes"
              className="rounded-xl bg-blue-600 px-8 py-3.5 font-semibold transition-all hover:bg-blue-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.45)]"
            >
              Conocer los Agentes →
            </a>
            <a
              href="#flujos"
              className="rounded-xl border border-white/10 px-8 py-3.5 font-semibold text-gray-300 transition-all hover:border-white/20 hover:text-white"
            >
              Ver Arquitectura
            </a>
          </div>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="mx-auto h-10 w-px animate-bounce bg-gradient-to-b from-gray-600 to-transparent" />
        </div>
      </section>

      {/* ── AGENTS ── */}
      <section id="agentes" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">
              Los 8 Agentes
            </p>
            <h2 className="mb-4 text-4xl font-bold">Cada agente, un experto en su área</h2>
            <p className="mx-auto max-w-lg text-gray-400">
              El Orquestador clasifica y delega internamente. Los 7 agentes especializados ejecutan
              sus flujos de forma autónoma, encolando los mensajes críticos para aprobación del
              equipo de Sico Benediciones.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {AGENTS.map((a) => {
              const c = COLOR[a.color]
              return (
                <div
                  key={a.id}
                  className={`group relative rounded-2xl border p-6 transition-all duration-200 ${
                    a.full ? `lg:col-span-3 ${c.card}` : c.card
                  }`}
                >
                  <div className="flex gap-4">
                    <div
                      className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border text-lg ${c.icon}`}
                    >
                      {a.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-white">{a.name}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-xs ${c.badge}`}>
                          {a.badge}
                        </span>
                      </div>
                      <p className="mb-2 text-xs text-gray-500">{a.area}</p>
                      <p className="text-sm leading-relaxed text-gray-400">{a.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="flujos" className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Arquitectura
            </p>
            <h2 className="mb-4 text-4xl font-bold">Hub y radio. Trazabilidad total.</h2>
            <p className="mx-auto max-w-lg text-gray-400">
              Todo mensaje entrante a la operación pasa por el Orquestador. Todo mensaje saliente
              se persiste en la cola antes de enviarse, garantizando auditoría completa para uso
              interno.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                n: '01',
                title: 'Entrada',
                color: 'text-blue-500/25',
                accent: 'bg-blue-400',
                items: ['Gmail API / SMTP', 'WhatsApp Business API', 'Clasificación automática por actor y urgencia'],
                desc: 'El Orquestador lee todos los emails y WhatsApp entrantes, los clasifica y los delega al agente correcto.',
              },
              {
                n: '02',
                title: 'Procesamiento',
                color: 'text-violet-500/25',
                accent: 'bg-violet-400',
                items: ['Generación con Claude claude-sonnet-4', 'Cola de aprobaciones con notificación', 'Adjuntos automáticos (PL, facturas, BL)'],
                desc: 'El agente especializado genera el mensaje. Si es crítico, lo encola y notifica al Supervisor vía Dashboard + WhatsApp.',
              },
              {
                n: '03',
                title: 'Envío y Registro',
                color: 'text-emerald-500/25',
                accent: 'bg-emerald-400',
                items: ['Envío multicanal (email + WhatsApp)', 'Log de auditoría permanente', 'Reintento automático en caso de fallo'],
                desc: 'Tras aprobación (si aplica), el mensaje se envía y queda registrado en el historial de auditoría.',
              },
            ].map(({ n, title, color, accent, items, desc }) => (
              <div
                key={n}
                className="relative rounded-2xl border border-gray-800/60 bg-gray-900/40 p-7"
              >
                <div className={`mb-5 text-5xl font-black ${color}`}>{n}</div>
                <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
                <p className="mb-5 text-sm leading-relaxed text-gray-500">{desc}</p>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-gray-500">
                      <span className={`mt-1.5 h-1 w-1 flex-shrink-0 rounded-full ${accent}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APPROVAL SYSTEM ── */}
      <section id="aprobaciones" className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-400">
              Sistema de Aprobaciones
            </p>
            <h2 className="mb-4 text-4xl font-bold">Automatización con control total</h2>
            <p className="mx-auto max-w-lg text-gray-400">
              Las comunicaciones rutinarias salen en menos de 2 minutos. Los mensajes de alto
              impacto esperan la aprobación del Supervisor.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                  ✓
                </div>
                <h3 className="font-semibold text-emerald-400">Envío Automático</h3>
              </div>
              <ul className="space-y-3">
                {AUTO_MSGS.map((m) => (
                  <li key={m} className="flex items-start gap-2.5 text-sm text-gray-400">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
                  ⚠
                </div>
                <h3 className="font-semibold text-amber-400">Requiere Aprobación del Supervisor</h3>
              </div>
              <ul className="space-y-3">
                {APPROVAL_MSGS.map((m) => (
                  <li key={m} className="flex items-start gap-2.5 text-sm text-gray-400">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── ROADMAP ── */}
      <section id="roadmap" className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-400">
              Roadmap
            </p>
            <h2 className="mb-4 text-4xl font-bold">5 fases de desarrollo</h2>
          </div>

          <div className="relative space-y-4">
            <div className="pointer-events-none absolute left-[26px] top-6 h-full w-px bg-gradient-to-b from-blue-500/40 via-violet-500/20 to-transparent" />
            {PHASES.map((p, i) => (
              <div key={p.n} className="relative flex gap-5">
                <div
                  className={`relative z-10 flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                    i === 0
                      ? 'border-blue-500/60 bg-blue-500/20 text-blue-300'
                      : 'border-gray-700 bg-gray-900 text-gray-500'
                  }`}
                >
                  {p.n}
                </div>
                <div
                  className={`flex-1 rounded-xl border p-4 ${
                    i === 0
                      ? 'border-blue-500/30 bg-blue-500/5'
                      : 'border-gray-800/60 bg-gray-900/30'
                  }`}
                >
                  <p className={`font-semibold ${i === 0 ? 'text-blue-300' : 'text-gray-300'}`}>
                    {p.label}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH ── */}
      <section className="border-t border-white/5 px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-8 text-xs uppercase tracking-widest text-gray-600">Stack Tecnológico</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { name: 'Claude AI', sub: 'claude-sonnet-4' },
              { name: 'Python', sub: 'FastAPI' },
              { name: 'React', sub: 'TypeScript' },
              { name: 'Twilio', sub: 'WhatsApp API' },
              { name: 'Gmail', sub: 'Google API' },
              { name: 'PostgreSQL', sub: 'SQLite MVP' },
              { name: 'APScheduler', sub: 'Reportes diarios' },
            ].map(({ name, sub }) => (
              <div
                key={name}
                className="rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-3 text-center"
              >
                <div className="text-sm font-medium text-gray-300">{name}</div>
                <div className="text-xs text-gray-600">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-white/5 px-6 py-24">
        <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/5 p-12 text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(59,130,246,0.15),transparent)]" />
          <h2 className="relative mb-3 text-3xl font-bold">
            Acceso restringido al equipo operativo
          </h2>
          <p className="relative mb-8 text-gray-400">
            InfiniteX es una herramienta interna de Sico Benediciones. Su uso está limitado al
            personal autorizado de logística, administración y supervisión.
          </p>
          <div className="relative flex flex-wrap items-center justify-center gap-4">
            <button className="rounded-xl bg-blue-600 px-8 py-3.5 font-semibold transition-all hover:bg-blue-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]">
              Iniciar Sesión →
            </button>
            <a
              href="/docs/MASTERPLAN.md"
              className="rounded-xl border border-white/10 px-8 py-3.5 font-semibold text-gray-300 transition-all hover:border-white/20 hover:text-white"
            >
              Ver Documentación Interna
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <span className="font-black tracking-widest text-blue-400">INFINITE</span>
            <span className="font-black tracking-widest text-white">X</span>
          </div>
          <p className="text-xs text-gray-600">
            Sico Benediciones · Herramienta de uso interno · 2026
          </p>
        </div>
      </footer>
    </div>
  )
}
