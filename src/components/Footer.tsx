import { Link } from 'react-router-dom'
import { Instagram, Mail } from 'lucide-react'
import { useState } from 'react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) { setSubscribed(true); setEmail('') }
  }

  return (
    <footer className="bg-navy text-pearl">

      {/* Newsletter strip */}
      <div className="border-b border-white/10">
        <div className="container-astrimi py-14 sm:py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="eyebrow text-stone mb-3">Join the World of ASTRIMI</p>
            <h3 className="display-md text-pearl">
              Light looks good<br />
              <em className="italic font-light text-gold">on you.</em>
            </h3>
            <p className="text-sm text-stone mt-3 leading-relaxed max-w-xs">
              Be the first to discover new collections, custom-made pieces and the stories behind our craftsmanship.
            </p>
          </div>
          <div>
            {subscribed ? (
              <p className="text-gold font-display italic text-lg">
                Welcome to the light. ✦
              </p>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="field-dark flex-1"
                />
                <button type="submit" className="btn-outline-cream btn-sm whitespace-nowrap">
                  Join
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-astrimi py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="block mb-4">
              <span className="font-display text-2xl tracking-[0.2em] text-pearl">ASTRIMI</span>
              <br />
              <span className="text-[9px] tracking-widest2 text-stone uppercase">Shine Your Own Light</span>
            </Link>
            <p className="text-xs text-stone leading-relaxed mb-6">
              Bespoke Indian textiles crafted for the exceptional. Every piece is made with intention, produced with purpose.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com/astrimi" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="text-stone hover:text-gold transition-colors">
                <Instagram size={16} />
              </a>
              <a href="mailto:hello@astrimi.com" aria-label="Email"
                className="text-stone hover:text-gold transition-colors">
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Collections */}
          <div>
            <p className="eyebrow text-gold mb-5">Collections</p>
            <ul className="space-y-3">
              {[
                { label: 'All Pieces', to: '/shop' },
                { label: 'Custom Made', to: '/custom' },
                { label: 'Pre-Orders', to: '/shop?type=preorder' },
                { label: 'Ready to Buy', to: '/shop?type=ready' },
                { label: 'Gift Ideas', to: '/shop?tag=gift' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-xs text-stone hover:text-gold transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <p className="eyebrow text-gold mb-5">ASTRIMI</p>
            <ul className="space-y-3">
              {[
                { label: 'Our Story', to: '/story' },
                { label: 'Craftsmanship', to: '/story#craftsmanship' },
                { label: 'Textiles', to: '/story#textiles' },
                { label: 'Community', to: '/story#community' },
                { label: 'Sustainability', to: '/story#sustainability' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-xs text-stone hover:text-gold transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="eyebrow text-gold mb-5">Support</p>
            <ul className="space-y-3">
              {[
                { label: 'Contact Us', to: '/contact' },
                { label: 'Custom Orders', to: '/custom' },
                { label: 'Sizing Guide', to: '/sizing' },
                { label: 'Shipping & Returns', to: '/shipping' },
                { label: 'FAQ', to: '/faq' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-xs text-stone hover:text-gold transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Large watermark */}
        <div className="border-t border-white/10 pt-12 mb-8 overflow-hidden">
          <p className="font-display text-[80px] sm:text-[120px] md:text-[160px] leading-none font-light text-white/5 select-none tracking-tight whitespace-nowrap -ml-2">
            ASTRIMI
          </p>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone">
          <p>© {new Date().getFullYear()} ASTRIMI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-gold transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-gold transition-colors">Terms</Link>
            <Link to="/cookies" className="hover:text-gold transition-colors">Cookies</Link>
          </div>
          <p className="italic font-display text-stone/60">Rare by Design. Beyond Ordinary.</p>
        </div>
      </div>
    </footer>
  )
}
