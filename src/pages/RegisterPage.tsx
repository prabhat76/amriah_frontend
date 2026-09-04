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
            "Your vision.<br />Our craftsmanship.<br />One unique piece."
          </p>
          <div className="divider-gold mb-4" />
          <p className="text-xs text-stone tracking-widest2 uppercase">Shine Your Own Light.</p>
        </div>
        <p className="text-[10px] text-stone/40 tracking-widest uppercase">Crafted in India · Delivered Worldwide</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <p className="eyebrow mb-3">Join the world of ASTRIMI</p>
            <h1 className="display-md text-navy">Create Account</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="caption mb-2 block uppercase tracking-widest">First Name</label>
                <input type="text" value={form.firstName} onChange={set('firstName')} required className="field" placeholder="Jane" />
              </div>
              <div>
                <label className="caption mb-2 block uppercase tracking-widest">Last Name</label>
                <input type="text" value={form.lastName} onChange={set('lastName')} required className="field" placeholder="Doe" />
              </div>
            </div>
            <div>
              <label className="caption mb-2 block uppercase tracking-widest">Email Address</label>
              <input type="email" value={form.email} onChange={set('email')} required autoComplete="email" className="field" placeholder="you@email.com" />
            </div>
            <div>
              <label className="caption mb-2 block uppercase tracking-widest">
                Password <span className="text-stone/60 font-normal normal-case tracking-normal">(min 8 characters)</span>
              </label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={set('password')} required minLength={8}
                  autoComplete="new-password" placeholder="••••••••" className="field pr-10" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-navy transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-navy w-full gap-2">
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-stone mt-8">
            Already have an account?{' '}
            <Link to="/login" state={{ from }} className="text-gold hover:text-gold-light transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
