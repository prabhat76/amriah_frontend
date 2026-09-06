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

  if (isLoggedIn) { navigate(from, { replace: true }); return null }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch { /* error in context */ }
    finally { setLoading(false) }
  }

  return (
    <main className="min-h-[85vh] bg-pearl flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col justify-between bg-navy w-1/2 p-16">
        <Link to="/" className="font-display text-2xl tracking-[0.2em] text-pearl">ASTRIMI</Link>
        <div>
          <p className="font-display italic text-gold text-3xl leading-snug mb-4">
            "Not for everyone.<br />For the ones who glow differently."
          </p>
          <div className="divider-gold mb-4" />
          <p className="text-xs text-stone tracking-widest2 uppercase">Rare by Design. Beyond Ordinary.</p>
        </div>
        <p className="text-[10px] text-stone/40 tracking-widest uppercase">Crafted in India · Delivered Worldwide</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <p className="eyebrow mb-3">Welcome back</p>
            <h1 className="display-md text-navy">Sign In</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3">
                {error}
              </div>
            )}
            <div>
              <label className="caption mb-2 block uppercase tracking-widest">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email" placeholder="you@email.com" className="field" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="caption uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" className="caption hover:text-gold transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} required
                  autoComplete="current-password" placeholder="••••••••" className="field pr-10" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-navy transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-navy w-full gap-2">
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-stone mt-8">
            New to ASTRIMI?{' '}
            <Link to="/register" state={{ from }} className="text-gold hover:text-gold-light transition-colors font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
