import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const { itemCount, openCart } = useCart()
  const { isLoggedIn, user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [userOpen, setUserOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query.trim())}`)
      setSearchOpen(false)
      setQuery('')
    }
  }

  const navLinks = [
    { label: 'Collections', to: '/shop' },
    { label: 'Custom Made', to: '/custom' },
    { label: 'Pre-Orders', to: '/shop?type=preorder' },
    { label: 'Our Story', to: '/story' },
  ]

  return (
    <>
      {/* Main navbar */}
      <header className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-pearl/95 backdrop-blur-md shadow-sm border-b border-mist' : 'bg-pearl border-b border-mist'
      }`}>
        <div className="container-astrimi">
          {/* 3-column grid: left-nav | logo | right-nav+icons */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center h-16 sm:h-20 gap-4">

            {/* Left nav — desktop */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.slice(0, 2).map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `text-xs tracking-widest uppercase font-medium transition-colors duration-200 ${
                      isActive ? 'text-gold' : 'text-navy hover:text-gold'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>

            {/* Logo — center column */}
            <Link to="/" className="flex flex-col items-center group">
              <span className="font-display text-2xl sm:text-3xl font-light tracking-[0.2em] text-navy group-hover:text-gold transition-colors duration-300 whitespace-nowrap">
                ASTRIMI
              </span>
              <span className="text-[7px] tracking-widest2 text-stone font-body uppercase -mt-0.5 hidden sm:block whitespace-nowrap">
                Shine Your Own Light
              </span>
            </Link>

            {/* Right nav + icons */}
            <div className="flex items-center justify-end gap-5 lg:gap-8">
              {/* Right nav links — desktop */}
              <nav className="hidden lg:flex items-center gap-8">
                {navLinks.slice(2).map(l => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={({ isActive }) =>
                      `text-xs tracking-widest uppercase font-medium transition-colors duration-200 ${
                        isActive ? 'text-gold' : 'text-navy hover:text-gold'
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
              </nav>

              {/* Search */}
              <button
                onClick={() => setSearchOpen(v => !v)}
                className="text-navy hover:text-gold transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {/* User */}
              <div className="relative">
                <button
                  onClick={() => setUserOpen(v => !v)}
                  className="text-navy hover:text-gold transition-colors"
                  aria-label="Account"
                >
                  <User size={18} />
                </button>
                {userOpen && (
                  <div className="absolute right-0 top-8 w-44 bg-pearl border border-mist shadow-lg z-50 py-2">
                    {isLoggedIn ? (
                      <>
                        <p className="px-4 py-2 text-xs text-stone border-b border-mist truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <Link to="/orders" className="block px-4 py-2 text-xs hover:bg-cream hover:text-gold transition-colors" onClick={() => setUserOpen(false)}>
                          My Orders
                        </Link>
                        <button
                          onClick={() => { logout(); setUserOpen(false) }}
                          className="w-full text-left px-4 py-2 text-xs hover:bg-cream hover:text-gold transition-colors"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="block px-4 py-2 text-xs hover:bg-cream hover:text-gold transition-colors" onClick={() => setUserOpen(false)}>
                          Sign In
                        </Link>
                        <Link to="/register" className="block px-4 py-2 text-xs hover:bg-cream hover:text-gold transition-colors" onClick={() => setUserOpen(false)}>
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative text-navy hover:text-gold transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag size={18} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-gold text-navy text-[9px] font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="lg:hidden text-navy hover:text-gold transition-colors"
                aria-label="Menu"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-mist bg-pearl">
            <div className="container-astrimi py-4">
              <form onSubmit={handleSearch} className="flex gap-3">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  autoFocus
                  placeholder="Search ASTRIMI…"
                  className="field flex-1 text-sm"
                />
                <button type="submit" className="btn-gold btn-sm">Search</button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-mist bg-pearl">
            <nav className="container-astrimi py-6 flex flex-col gap-5">
              {navLinks.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-sm tracking-widest uppercase font-medium ${isActive ? 'text-gold' : 'text-navy'}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <div className="divider mt-2" />
              {isLoggedIn ? (
                <>
                  <Link to="/orders" onClick={() => setMenuOpen(false)} className="text-sm text-stone">My Orders</Link>
                  <button onClick={() => { logout(); setMenuOpen(false) }} className="text-sm text-left text-stone">Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm text-stone">Sign In</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="text-sm text-stone">Create Account</Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Backdrop for dropdowns */}
      {(userOpen || menuOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setUserOpen(false); setMenuOpen(false) }} />
      )}
    </>
  )
}
