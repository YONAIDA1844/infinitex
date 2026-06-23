import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Operador = {
  id: string
  nombre: string
  pais: string
  contacto: string
  email: string | null
  whatsapp: string | null
  notas: string | null
  activo: boolean
  created_at: string
}

type Form = {
  nombre: string; pais: string; contacto: string
  email: string; whatsapp: string; notas: string; activo: boolean
}

const EMPTY: Form = {
  nombre: '', pais: '', contacto: '',
  email: '', whatsapp: '', notas: '', activo: true,
}

const INPUT = 'w-full rounded-xl bg-gray-800/80 border border-gray-700 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors'

function Field({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1.5">
        {label}{req && ' *'}
      </label>
      {children}
    </div>
  )
}

export default function OperadoresSection() {
  const [records, setRecords]             = useState<Operador[]>([])
  const [loading, setLoading]             = useState(true)
  const [editing, setEditing]             = useState<Operador | null>(null)
  const [modalOpen, setModalOpen]         = useState(false)
  const [form, setForm]                   = useState<Form>(EMPTY)
  const [saving, setSaving]               = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('operadores').select('*').order('nombre')
    setRecords(data ?? [])
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY)
    setModalOpen(true)
  }

  function openEdit(o: Operador) {
    setEditing(o)
    setForm({
      nombre: o.nombre, pais: o.pais, contacto: o.contacto,
      email: o.email ?? '', whatsapp: o.whatsapp ?? '',
      notas: o.notas ?? '', activo: o.activo,
    })
    setModalOpen(true)
  }

  function closeModal() { setModalOpen(false); setEditing(null) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      nombre: form.nombre, pais: form.pais, contacto: form.contacto,
      email: form.email || null, whatsapp: form.whatsapp || null,
      notas: form.notas || null, activo: form.activo,
    }
    if (editing) {
      await supabase.from('operadores').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('operadores').insert(payload)
    }
    setSaving(false)
    closeModal()
    load()
  }

  async function handleDelete(id: string) {
    await supabase.from('operadores').delete().eq('id', id)
    setDeleteConfirm(null)
    setRecords(prev => prev.filter(r => r.id !== id))
  }

  const f = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Operadores</h2>
          <p className="mt-0.5 text-sm text-gray-500">Agentes de aduana y operadores logísticos</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
        >
          + Nuevo operador
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-10 text-center text-sm text-gray-500">
          Cargando…
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/20 py-16 text-center">
          <p className="font-medium text-gray-400">Sin operadores registrados</p>
          <p className="mt-1 text-sm text-gray-600">Agrega el primero con el botón de arriba</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/60">
                  {['Nombre', 'País', 'Contacto', 'Email', 'WhatsApp', 'Estado', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-widest text-gray-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {records.map(o => (
                  <tr key={o.id} className="bg-gray-900/20 transition-colors hover:bg-gray-900/50">
                    <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{o.nombre}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{o.pais}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{o.contacto}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{o.email ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{o.whatsapp ?? '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${
                        o.activo
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          : 'border-gray-700 bg-gray-800/60 text-gray-500'
                      }`}>
                        {o.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {deleteConfirm === o.id ? (
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-red-400">¿Eliminar?</span>
                          <button onClick={() => handleDelete(o.id)} className="text-xs font-medium text-red-400 hover:text-red-300">Sí</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-xs text-gray-500 hover:text-white">No</button>
                        </span>
                      ) : (
                        <span className="flex items-center gap-3">
                          <button onClick={() => openEdit(o)} className="text-xs text-gray-400 hover:text-white transition-colors">Editar</button>
                          <button onClick={() => setDeleteConfirm(o.id)} className="text-xs text-red-500/60 hover:text-red-400 transition-colors">Eliminar</button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
          <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-950 p-8 overflow-y-auto max-h-full">
            <h3 className="mb-6 text-lg font-bold">
              {editing ? 'Editar operador' : 'Nuevo operador'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nombre" req>
                  <input required value={form.nombre} onChange={f('nombre')} className={INPUT} placeholder="Agencia Marítima Colón" />
                </Field>
                <Field label="País" req>
                  <input required value={form.pais} onChange={f('pais')} className={INPUT} placeholder="Panamá" />
                </Field>
              </div>
              <Field label="Contacto" req>
                <input required value={form.contacto} onChange={f('contacto')} className={INPUT} placeholder="Carlos Méndez" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email">
                  <input type="email" value={form.email} onChange={f('email')} className={INPUT} placeholder="ops@agencia.com" />
                </Field>
                <Field label="WhatsApp">
                  <input value={form.whatsapp} onChange={f('whatsapp')} className={INPUT} placeholder="+50769000000" />
                </Field>
              </div>
              <Field label="Notas">
                <textarea value={form.notas} onChange={f('notas')} className={INPUT + ' resize-none'} rows={2} placeholder="Especialidad, puertos que cubre, etc." />
              </Field>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={e => setForm(prev => ({ ...prev, activo: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-800"
                />
                <span className="text-sm text-gray-300">Activo</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-400 transition-colors hover:text-white">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50">
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
