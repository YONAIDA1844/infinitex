import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ProveedoresSection from '../components/ProveedoresSection'
import OperadoresSection from '../components/OperadoresSection'
import TraficoSection from '../components/TraficoSection'

type Tab = 'aprobaciones' | 'trafico' | 'proveedores' | 'operadores'

type QueueEntry = {
  id: string
  agent: string | null
  agent_id: string | null
  action: string | null
  content: string | null
  recipient_type: string | null
  recipient_contact: string | null
  channel: string | null
  status: string
  requires_approval: boolean | null
  priority: number | null
  created_at: string
}

const AGENT_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  bodega:      { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-300' },
  ventas:      { border: 'border-violet-500/30',  bg: 'bg-violet-500/10',  text: 'text-violet-300'  },
  despacho:    { border: 'border-orange-500/30',  bg: 'bg-orange-500/10',  text: 'text-orange-300'  },
  clientes:    { border: 'border-pink-500/30',    bg: 'bg-pink-500/10',    text: 'text-pink-300'    },
  kadi:        { border: 'border-cyan-500/30',    bg: 'bg-cyan-500/10',    text: 'text-cyan-300'    },
  admin:       { border: 'border-amber-500/30',   bg: 'bg-amber-500/10',   text: 'text-amber-300'   },
  trafico:     { border: 'border-indigo-500/30',  bg: 'bg-indigo-500/10',  text: 'text-indigo-300'  },
  orquestador: { border: 'border-blue-500/30',    bg: 'bg-blue-500/10',    text: 'text-blue-300'    },
}

const DEFAULT_COLOR = { border: 'border-gray-700', bg: 'bg-gray-800/60', text: 'text-gray-400' }

function agentColor(name: string | null) {
  if (!name) return DEFAULT_COLOR
  const key = name.toLowerCase().split(/\s+/).find(w => AGENT_COLORS[w])
  return key ? AGENT_COLORS[key] : DEFAULT_COLOR
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins} min`
  const h = Math.floor(mins / 60)
  return h < 24 ? `hace ${h}h` : `hace ${Math.floor(h / 24)}d`
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [tab, setTab]       = useState<Tab>('aprobaciones')
  const [queue, setQueue]   = useState<QueueEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/login'); return }
      const { data } = await supabase
        .from('message_queue')
        .select('id, agent, agent_id, action, content, recipient_type, recipient_contact, channel, status, requires_approval, priority, created_at')
        .order('created_at', { ascending: false })
        .limit(50)
      if (alive) { setQueue(data ?? []); setLoading(false) }
    }
    init()
    return () => { alive = false }
  }, [navigate])

  async function reload() {
    setLoading(true)
    const { data } = await supabase
      .from('message_queue')
      .select('id, agent, agent_id, action, content, recipient_type, recipient_contact, channel, status, requires_approval, priority, created_at')
      .order('created_at', { ascending: false })
      .limit(50)
    setQueue(data ?? [])
    setLoading(false)
  }

  async function handleAction(id: string, action: 'approved' | 'rejected') {
    setActing(id)
    const entry = queue.find(m => m.id === id)
    let finalStatus = action === 'approved' ? 'approved' : 'rejected'

    if (action === 'approved' && entry) {
      try {
        const res = await fetch(`/api/v1/queue/${id}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'approved',
            content: entry.content,
            recipient_contact: entry.recipient_contact,
            channel: entry.channel ?? 'email',
            subject: `🚢 InfiniteX | ${entry.agent ?? 'Agente de Tráfico'}`,
          }),
        })
        if (res.ok) {
          const data = await res.json() as { status: string }
          finalStatus = data.status  // 'sent' on success
        }
      } catch {
        // Backend not running — still mark approved in Supabase for audit
      }
    }

    await supabase.from('message_queue').update({ status: finalStatus }).eq('id', id)
    setQueue(prev => prev.map(m => m.id === id ? { ...m, status: finalStatus } : m))
    setActing(null)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const pending  = queue.filter(m => m.status === 'pending')
  const approved = queue.filter(m => m.status === 'approved')
  const rejected = queue.filter(m => m.status === 'rejected')
  const sent     = queue.filter(m => m.status === 'sent')
  const history  = [...approved, ...rejected, ...sent]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const TABS: { id: Tab; label: string; badge?: number }[] = [
    { id: 'aprobaciones', label: 'Aprobaciones', badge: pending.length },
    { id: 'trafico',      label: 'Tráfico' },
    { id: 'proveedores',  label: 'Proveedores' },
    { id: 'operadores',   label: 'Operadores' },
  ]

  return (
    <div className="min-h-screen bg-[#030712] text-white">

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-lg font-black tracking-widest text-blue-400">INFINITE</span>
              <span className="text-lg font-black tracking-widest text-white">X</span>
            </div>
            <span className="text-xs uppercase tracking-widest text-gray-600">Dashboard Supervisor</span>
          </div>
          <div className="flex items-center gap-3">
            {tab === 'aprobaciones' && (
              <button
                onClick={reload}
                className="rounded-lg border border-gray-800 px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-gray-600 hover:text-white"
              >
                Recargar
              </button>
            )}
            <button
              onClick={handleLogout}
              className="rounded-lg border border-gray-800 px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-gray-600 hover:text-white"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* Tab navigation */}
        <div className="mb-8 flex gap-1 border-b border-gray-800">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'border-blue-400 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-xs font-semibold text-amber-300">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Aprobaciones ── */}
        {tab === 'aprobaciones' && (
          <>
            {/* KPIs */}
            <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { label: 'Pendientes', value: pending.length,  color: 'text-amber-400'   },
                { label: 'Aprobados',  value: approved.length, color: 'text-emerald-400' },
                { label: 'Rechazados', value: rejected.length, color: 'text-red-400'     },
                { label: 'Enviados',   value: sent.length,     color: 'text-blue-400'    },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
                  <div className={`text-3xl font-black ${color}`}>{loading ? '…' : value}</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-gray-500">{label}</div>
                </div>
              ))}
            </div>

            {/* Cola */}
            <section>
              <div className="mb-6 flex items-center gap-3">
                <h2 className="text-xl font-bold">Cola de Aprobaciones</h2>
                {!loading && pending.length > 0 && (
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                    {pending.length} pendiente{pending.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse rounded-2xl border border-gray-800 bg-gray-900/40 p-6">
                      <div className="mb-3 h-5 w-1/3 rounded bg-gray-800" />
                      <div className="mb-2 h-3 w-1/2 rounded bg-gray-800" />
                      <div className="mb-4 h-16 rounded bg-gray-800" />
                      <div className="flex gap-2">
                        <div className="h-10 flex-1 rounded-xl bg-gray-800" />
                        <div className="h-10 flex-1 rounded-xl bg-gray-800" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : pending.length === 0 ? (
                <div className="rounded-2xl border border-gray-800 bg-gray-900/20 py-16 text-center">
                  <div className="mb-3 text-4xl">✓</div>
                  <p className="font-medium text-gray-400">Sin mensajes pendientes</p>
                  <p className="mt-1 text-sm text-gray-600">Todos los mensajes han sido procesados</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pending.map(entry => {
                    const label = entry.agent ?? entry.agent_id ?? 'Agente'
                    const c = agentColor(label)
                    const isActing = acting === entry.id
                    return (
                      <div key={entry.id} className="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
                        <div className="flex items-start justify-between gap-2">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${c.border} ${c.bg} ${c.text}`}>
                            {label}
                          </span>
                          <span className="shrink-0 text-xs text-gray-600">{timeAgo(entry.created_at)}</span>
                        </div>
                        {entry.recipient_type && (
                          <p className="text-xs text-gray-500">
                            Para: <span className="text-gray-300">{entry.recipient_type}</span>
                          </p>
                        )}
                        <p className="line-clamp-4 flex-1 text-sm leading-relaxed text-gray-300">
                          {entry.content ?? entry.action ?? '(sin contenido)'}
                        </p>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleAction(entry.id, 'rejected')}
                            disabled={isActing}
                            className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-sm font-medium text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/20 disabled:opacity-40"
                          >
                            Rechazar
                          </button>
                          <button
                            onClick={() => handleAction(entry.id, 'approved')}
                            disabled={isActing}
                            className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-sm font-medium text-emerald-400 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/20 disabled:opacity-40"
                          >
                            {isActing ? '…' : 'Aprobar'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Historial */}
            {!loading && history.length > 0 && (
              <section className="mt-14">
                <h2 className="mb-4 text-base font-semibold text-gray-500">Historial</h2>
                <div className="divide-y divide-gray-800/50 rounded-2xl border border-gray-800 bg-gray-900/30">
                  {history.map(entry => {
                    const label = entry.agent ?? entry.agent_id ?? 'Agente'
                    const c = agentColor(label)
                    const statusColor =
                      entry.status === 'approved' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                      entry.status === 'rejected'  ? 'border-red-500/30 bg-red-500/10 text-red-400' :
                      entry.status === 'sent'      ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' :
                      'border-gray-700 text-gray-500'
                    return (
                      <div key={entry.id} className="flex items-center gap-4 px-5 py-3.5">
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${c.border} ${c.bg} ${c.text}`}>
                          {label}
                        </span>
                        <p className="flex-1 truncate text-sm text-gray-400">
                          {entry.content ?? entry.action ?? '—'}
                        </p>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${statusColor}`}>
                          {entry.status}
                        </span>
                        <span className="hidden shrink-0 text-xs text-gray-600 sm:block">
                          {timeAgo(entry.created_at)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </>
        )}

        {tab === 'trafico'     && <TraficoSection />}
        {tab === 'proveedores' && <ProveedoresSection />}
        {tab === 'operadores'  && <OperadoresSection />}

      </main>
    </div>
  )
}
