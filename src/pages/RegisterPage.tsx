import { useState, FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function RegisterPage() {
  const { register, error, clearError, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/'

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  if (isLoggedIn) { navigate(from, { replace: true }); return null }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    setLoading(true)
    try {
      await register(form.email, form.password, form.firstName, form.lastName)
      navigate(from, { replace: true })
    } catch {
      // error set in context
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[80vh] bg-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="headline text-3xl block mb-2" style={{ fontFamily: 'Anton, Impact, sans-serif' }}>
            XIV QR
          </Link>
          <p className="text-sm text-gray-500">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.12em] mb-2">First name</label>
              <input type="text" value={form.firstName} onChange={set('firstName')} required className="field" placeholder="Jane" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.12em] mb-2">Last name</label>
              <input type="text" value={form.lastName} onChange={set('lastName')} required className="field" placeholder="Doe" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] mb-2">Email address</label>
            <input type="email" value={form.email} onChange={set('email')} required autoComplete="email" className="field" placeholder="you@example.com" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] mb-2">
              Password <span className="text-gray-400 font-normal normal-case tracking-normal">(min 8 chars)</span>
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="••••••••"
                className="field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-black w-full justify-center gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account?{' '}
          <Link to="/login" state={{ from }} className="text-black font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
