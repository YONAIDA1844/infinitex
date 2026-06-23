import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="flex items-center justify-center gap-1.5 mb-10">
          <span className="text-2xl font-black tracking-widest text-blue-400">INFINITE</span>
          <span className="text-2xl font-black tracking-widest text-white">X</span>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8">
          <h1 className="text-xl font-bold mb-1">Acceso Supervisor</h1>
          <p className="text-sm text-gray-500 mb-6">Panel de control operativo</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="supervisor@empresa.com"
                className="w-full rounded-xl bg-gray-800/80 border border-gray-700 px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl bg-gray-800/80 border border-gray-700 px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:bg-blue-900 disabled:text-blue-500"
            >
              {loading ? 'Iniciando sesión…' : 'Entrar al Dashboard'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-700">
          InfiniteX · Sistema de Supervisión Logística
        </p>
      </div>
    </div>
  )
}
