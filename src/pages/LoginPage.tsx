import { useState, FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const { login, error, clearError, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  // Already logged in
  if (isLoggedIn) { navigate(from, { replace: true }); return null }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch {
      // error is set in context
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[80vh] bg-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="headline text-3xl block mb-2" style={{ fontFamily: 'Anton, Impact, sans-serif' }}>
            XIV QR
          </Link>
          <p className="text-sm text-gray-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-none">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] mb-2">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="field"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-[0.12em]">Password</label>
              <Link to="/forgot-password" className="text-xs text-gray-400 hover:text-black transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-black w-full justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          New customer?{' '}
          <Link to="/register" state={{ from }} className="text-black font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  )
}
