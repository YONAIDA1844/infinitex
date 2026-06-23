import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Proveedor = {
  id: string
  nombre: string
  pais: string
  contacto: string
  email: string | null
  whatsapp: string | null
  tipo: string
  notas: string | null
  activo: boolean
  created_at: string
}

type Form = {
  nombre: string; pais: string; contacto: string
  email: string; whatsapp: string; tipo: string
  notas: string; activo: boolean
}

const EMPTY: Form = {
  nombre: '', pais: '', contacto: '', email: '',
  whatsapp: '', tipo: 'fabricante', notas: '', activo: true,
}

const TIPOS = ['fabricante', 'distribuidor', 'agente', 'otro']

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

export default function ProveedoresSection() {
  const [records, setRecords]         = useState<Proveedor[]>([])
  const [loading, setLoading]         = useState(true)
  const [editing, setEditing]         = useState<Proveedor | null>(null)
  const [modalOpen, setModalOpen]     = useState(false)
  const [form, setForm]               = useState<Form>(EMPTY)
  const [saving, setSaving]           = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('proveedores').select('*').order('nombre')
    setRecords(data ?? [])
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY)
    setModalOpen(true)
  }

  function openEdit(p: Proveedor) {
    setEditing(p)
    setForm({
      nombre: p.nombre, pais: p.pais, contacto: p.contacto,
      email: p.email ?? '', whatsapp: p.whatsapp ?? '',
      tipo: p.tipo, notas: p.notas ?? '', activo: p.activo,
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
      tipo: form.tipo, notas: form.notas || null, activo: form.activo,
    }
    if (editing) {
      await supabase.from('proveedores').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('proveedores').insert(payload)
    }
    setSaving(false)
    closeModal()
    load()
  }

  async function handleDelete(id: string) {
    await supabase.from('proveedores').delete().eq('id', id)
    setDeleteConfirm(null)
    setRecords(prev => prev.filter(r => r.id !== id))
  }

  const f = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Proveedores</h2>
          <p className="mt-0.5 text-sm text-gray-500">Fábricas y distribuidores externos</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
        >
          + Nuevo proveedor
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-10 text-center text-sm text-gray-500">
          Cargando…
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/20 py-16 text-center">
          <p className="font-medium text-gray-400">Sin proveedores registrados</p>
          <p className="mt-1 text-sm text-gray-600">Agrega el primero con el botón de arriba</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/60">
                  {['Nombre', 'País', 'Contacto', 'Email', 'WhatsApp', 'Tipo', 'Estado', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-widest text-gray-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {records.map(p => (
                  <tr key={p.id} className="bg-gray-900/20 transition-colors hover:bg-gray-900/50">
                    <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{p.nombre}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{p.pais}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{p.contacto}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{p.email ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{p.whatsapp ?? '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-xs text-blue-300">
                        {p.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${
                        p.activo
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          : 'border-gray-700 bg-gray-800/60 text-gray-500'
                      }`}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {deleteConfirm === p.id ? (
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-red-400">¿Eliminar?</span>
                          <button onClick={() => handleDelete(p.id)} className="text-xs font-medium text-red-400 hover:text-red-300">Sí</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-xs text-gray-500 hover:text-white">No</button>
                        </span>
                      ) : (
                        <span className="flex items-center gap-3">
                          <button onClick={() => openEdit(p)} className="text-xs text-gray-400 hover:text-white transition-colors">Editar</button>
                          <button onClick={() => setDeleteConfirm(p.id)} className="text-xs text-red-500/60 hover:text-red-400 transition-colors">Eliminar</button>
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
              {editing ? 'Editar proveedor' : 'Nuevo proveedor'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nombre" req>
                  <input required value={form.nombre} onChange={f('nombre')} className={INPUT} placeholder="Shanghai Textile Co." />
                </Field>
                <Field label="País" req>
                  <input required value={form.pais} onChange={f('pais')} className={INPUT} placeholder="China" />
                </Field>
              </div>
              <Field label="Contacto" req>
                <input required value={form.contacto} onChange={f('contacto')} className={INPUT} placeholder="Mr. Li Wei" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email">
                  <input type="email" value={form.email} onChange={f('email')} className={INPUT} placeholder="info@proveedor.com" />
                </Field>
                <Field label="WhatsApp">
                  <input value={form.whatsapp} onChange={f('whatsapp')} className={INPUT} placeholder="+8613000000000" />
                </Field>
              </div>
              <Field label="Tipo">
                <select value={form.tipo} onChange={f('tipo')} className={INPUT}>
                  {TIPOS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </Field>
              <Field label="Notas">
                <textarea value={form.notas} onChange={f('notas')} className={INPUT + ' resize-none'} rows={2} placeholder="Observaciones opcionales" />
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
