import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Embarque = {
  id: string
  nombre: string
  estado: string
  etd: string | null
  eta: string | null
  proveedor_nombre: string | null
  operador_nombre: string | null
  puerto_destino: string | null
  notas: string | null
  activo: boolean
  created_at: string
}

type Notificacion = {
  id: string
  agent: string | null
  agent_id: string | null
  content: string | null
  recipient_type: string | null
  status: string
  requires_approval: boolean | null
  created_at: string
}

type Form = {
  nombre: string; estado: string
  etd: string; eta: string
  proveedor_nombre: string; operador_nombre: string
  puerto_destino: string; notas: string; activo: boolean
}

const EMPTY_FORM: Form = {
  nombre: '', estado: 'En puerto de origen',
  etd: '', eta: '', proveedor_nombre: '',
  operador_nombre: '', puerto_destino: '', notas: '', activo: true,
}

const ESTADOS = [
  'En puerto de origen', 'En tránsito', 'Asignado operador',
  'Arribo a puerto', 'En aduana', 'En aduana — CRÍTICO',
  'En bodega Anker', 'Disponible',
]

const PUERTOS = ['', 'Manzanillo', 'Cristóbal', 'Rodman']

const STATE_COLOR: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  'En puerto de origen': { border: 'border-gray-500/40',    bg: 'bg-gray-500/10',    text: 'text-gray-300',    dot: 'bg-gray-400'    },
  'En tránsito':         { border: 'border-blue-500/40',    bg: 'bg-blue-500/10',    text: 'text-blue-300',    dot: 'bg-blue-400'    },
  'Asignado operador':   { border: 'border-cyan-500/40',    bg: 'bg-cyan-500/10',    text: 'text-cyan-300',    dot: 'bg-cyan-400'    },
  'Arribo a puerto':     { border: 'border-indigo-500/40',  bg: 'bg-indigo-500/10',  text: 'text-indigo-300',  dot: 'bg-indigo-400'  },
  'En aduana':           { border: 'border-amber-500/40',   bg: 'bg-amber-500/10',   text: 'text-amber-300',   dot: 'bg-amber-400'   },
  'En aduana — CRÍTICO': { border: 'border-red-500/40',     bg: 'bg-red-500/10',     text: 'text-red-300',     dot: 'bg-red-500'     },
  'En bodega Anker':     { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  'Disponible':          { border: 'border-green-500/40',   bg: 'bg-green-500/10',   text: 'text-green-300',   dot: 'bg-green-400'   },
}

const DC = { border: 'border-gray-700', bg: 'bg-gray-800/60', text: 'text-gray-400', dot: 'bg-gray-600' }

function sc(estado: string) { return STATE_COLOR[estado] ?? DC }

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function etaDays(eta: string | null): { label: string; urgent: boolean } | null {
  if (!eta) return null
  const diff = Math.ceil((new Date(eta).getTime() - Date.now()) / 86400000)
  if (diff < 0) return { label: `Hace ${Math.abs(diff)}d`, urgent: true }
  if (diff === 0) return { label: 'Hoy', urgent: true }
  return { label: `en ${diff}d`, urgent: diff <= 5 }
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const h = Math.floor(mins / 60)
  return h < 24 ? `hace ${h}h` : `hace ${Math.floor(h / 24)}d`
}

const INPUT = 'w-full rounded-xl bg-gray-800/80 border border-gray-700 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors'

function Field({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-widest text-gray-400">
        {label}{req && ' *'}
      </label>
      {children}
    </div>
  )
}

export default function TraficoSection() {
  const [embarques, setEmbarques]         = useState<Embarque[]>([])
  const [notifs, setNotifs]               = useState<Notificacion[]>([])
  const [loading, setLoading]             = useState(true)
  const [modalOpen, setModalOpen]         = useState(false)
  const [editing, setEditing]             = useState<Embarque | null>(null)
  const [form, setForm]                   = useState<Form>(EMPTY_FORM)
  const [saving, setSaving]               = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [{ data: emb }, { data: nots }] = await Promise.all([
      supabase
        .from('embarques')
        .select('*')
        .eq('activo', true)
        .order('eta', { ascending: true }),
      supabase
        .from('message_queue')
        .select('id, agent, agent_id, content, recipient_type, status, requires_approval, created_at')
        .or('agent_id.ilike.%trafico%,agent.ilike.%trafico%')
        .order('created_at', { ascending: false })
        .limit(15),
    ])
    setEmbarques(emb ?? [])
    setNotifs(nots ?? [])
    setLoading(false)
  }

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true) }

  function openEdit(e: Embarque) {
    setEditing(e)
    setForm({
      nombre: e.nombre, estado: e.estado,
      etd: e.etd ?? '', eta: e.eta ?? '',
      proveedor_nombre: e.proveedor_nombre ?? '',
      operador_nombre: e.operador_nombre ?? '',
      puerto_destino: e.puerto_destino ?? '',
      notas: e.notas ?? '', activo: e.activo,
    })
    setModalOpen(true)
  }

  async function handleSave(ev: React.FormEvent) {
    ev.preventDefault()
    setSaving(true)
    const payload = {
      nombre: form.nombre, estado: form.estado,
      etd: form.etd || null, eta: form.eta || null,
      proveedor_nombre: form.proveedor_nombre || null,
      operador_nombre: form.operador_nombre || null,
      puerto_destino: form.puerto_destino || null,
      notas: form.notas || null, activo: form.activo,
    }
    if (editing) {
      await supabase.from('embarques').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('embarques').insert(payload)
    }
    setSaving(false)
    setModalOpen(false)
    setEditing(null)
    load()
  }

  async function handleDelete(id: string) {
    await supabase.from('embarques').delete().eq('id', id)
    setDeleteConfirm(null)
    setEmbarques(prev => prev.filter(e => e.id !== id))
  }

  const f = (k: keyof Form) =>
    (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: ev.target.value }))

  return (
    <section>
      {/* ── Embarques activos ── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Embarques Activos</h2>
          <p className="mt-0.5 text-sm text-gray-500">Ciclo de importación internacional</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          + Nuevo embarque
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 animate-pulse rounded-2xl border border-gray-800 bg-gray-900/40" />
          ))}
        </div>
      ) : embarques.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/20 py-14 text-center">
          <p className="font-medium text-gray-400">Sin embarques activos</p>
          <p className="mt-1 text-sm text-gray-600">Agrega el primero con el botón de arriba</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {embarques.map(e => {
            const c = sc(e.estado)
            const eta = etaDays(e.eta)
            return (
              <div key={e.id} className={`flex flex-col gap-3 rounded-2xl border bg-gray-900/50 p-5 ${c.border}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${c.border} ${c.bg} ${c.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                    {e.estado}
                  </span>
                  {eta && (
                    <span className={`shrink-0 text-xs font-semibold ${eta.urgent ? 'text-red-400' : 'text-gray-500'}`}>
                      ETA {eta.label}
                    </span>
                  )}
                </div>

                <p className="font-semibold leading-snug text-white">{e.nombre}</p>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span>ETD <span className="text-gray-400">{fmtDate(e.etd)}</span></span>
                  <span>ETA <span className="text-gray-400">{fmtDate(e.eta)}</span></span>
                  {e.proveedor_nombre && (
                    <span className="col-span-2 truncate">
                      Prov. <span className="text-gray-400">{e.proveedor_nombre}</span>
                    </span>
                  )}
                  {e.operador_nombre && (
                    <span className="col-span-2 truncate">
                      Op. <span className="text-gray-400">{e.operador_nombre}</span>
                    </span>
                  )}
                  {e.puerto_destino && (
                    <span className="col-span-2">
                      Puerto <span className="text-gray-400">{e.puerto_destino}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 border-t border-gray-800/60 pt-2">
                  {deleteConfirm === e.id ? (
                    <>
                      <span className="text-xs text-red-400">¿Eliminar?</span>
                      <button onClick={() => handleDelete(e.id)} className="text-xs font-medium text-red-400 hover:text-red-300">Sí</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-xs text-gray-500 hover:text-white">No</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => openEdit(e)} className="text-xs text-gray-400 transition-colors hover:text-white">Editar</button>
                      <button onClick={() => setDeleteConfirm(e.id)} className="text-xs text-red-500/60 transition-colors hover:text-red-400">Eliminar</button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Notificaciones del Agente de Tráfico ── */}
      <div className="mt-12">
        <h3 className="mb-4 text-base font-semibold text-gray-400">
          Notificaciones del Agente de Tráfico
        </h3>
        {!loading && notifs.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900/20 py-10 text-center text-sm text-gray-600">
            Sin notificaciones aún
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50 rounded-2xl border border-gray-800 bg-gray-900/30">
            {notifs.map(n => {
              const isPending  = n.status === 'pending'
              const statusColor =
                n.status === 'approved' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                n.status === 'rejected' ? 'border-red-500/30 bg-red-500/10 text-red-400' :
                n.status === 'sent'     ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' :
                isPending && n.requires_approval
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                  : 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300'
              const statusLabel =
                n.status === 'approved' ? 'aprobado' :
                n.status === 'rejected' ? 'rechazado' :
                n.status === 'sent'     ? 'enviado' :
                isPending && n.requires_approval ? 'pendiente' : 'automático'
              return (
                <div key={n.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${statusColor}`}>
                    {statusLabel}
                  </span>
                  {n.recipient_type && (
                    <span className="shrink-0 text-xs text-gray-600">→ {n.recipient_type}</span>
                  )}
                  <p className="flex-1 truncate text-sm text-gray-400">{n.content ?? '—'}</p>
                  <span className="hidden shrink-0 text-xs text-gray-600 sm:block">
                    {timeAgo(n.created_at)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
          <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-800 bg-gray-950 p-8">
            <h3 className="mb-6 text-lg font-bold">
              {editing ? 'Editar embarque' : 'Nuevo embarque'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <Field label="Nombre del embarque" req>
                <input
                  required value={form.nombre} onChange={f('nombre')}
                  className={INPUT} placeholder="KADI-2026-03 — Textiles"
                />
              </Field>
              <Field label="Estado">
                <select value={form.estado} onChange={f('estado')} className={INPUT}>
                  {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="ETD (salida)">
                  <input type="date" value={form.etd} onChange={f('etd')} className={INPUT} />
                </Field>
                <Field label="ETA (llegada)">
                  <input type="date" value={form.eta} onChange={f('eta')} className={INPUT} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Proveedor">
                  <input value={form.proveedor_nombre} onChange={f('proveedor_nombre')} className={INPUT} placeholder="Shanghai Textile Co." />
                </Field>
                <Field label="Operador">
                  <input value={form.operador_nombre} onChange={f('operador_nombre')} className={INPUT} placeholder="Agencia Marítima Colón" />
                </Field>
              </div>
              <Field label="Puerto de destino">
                <select value={form.puerto_destino} onChange={f('puerto_destino')} className={INPUT}>
                  {PUERTOS.map(p => (
                    <option key={p} value={p}>{p || '— Sin asignar —'}</option>
                  ))}
                </select>
              </Field>
              <Field label="Notas">
                <textarea
                  value={form.notas} onChange={f('notas')}
                  className={INPUT + ' resize-none'} rows={2}
                  placeholder="Observaciones opcionales"
                />
              </Field>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox" checked={form.activo}
                  onChange={ev => setForm(prev => ({ ...prev, activo: ev.target.checked }))}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-800"
                />
                <span className="text-sm text-gray-300">Activo</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button" onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit" disabled={saving}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                >
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
