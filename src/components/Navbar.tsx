import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingBag, Search, Menu, X, User, Package, LogOut, ChevronDown } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Collections', to: '/shop' },
  { label: 'New', to: '/shop?category=new' },
]

function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 text-black hover:text-gray-500 transition-colors"
        aria-label="Account"
      >
        <User size={18} />
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 shadow-lg z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-xs font-semibold truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
          </div>
          {/* Links */}
          <Link
            to="/orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
          >
            <Package size={14} /> My Orders
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors text-red-600"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const { itemCount, toggleCart } = useCart()
  const { isLoggedIn, isLoading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-content mx-auto px-6 lg:px-10">
          <div className="flex items-center h-14 gap-6">

            {/* Mobile: burger */}
            <button
              className="lg:hidden shrink-0"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Nav links (desktop left) */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`text-sm font-medium transition-colors ${
                    (l.to === '/' ? pathname === '/' : pathname === l.to)
                      ? 'text-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Logo center */}
            <div className="flex-1 flex justify-center">
              <Link
                to="/"
                className="font-display text-[1.6rem] tracking-[0.08em] uppercase text-black select-none"
                style={{ fontFamily: 'Anton, Impact, sans-serif' }}
              >
                XIV QR
              </Link>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={() => setSearchOpen(v => !v)}
                aria-label="Search"
                className="text-black hover:text-gray-500 transition-colors"
              >
                <Search size={18} />
              </button>

              {/* Auth */}
              {!isLoading && (
                isLoggedIn
                  ? <UserMenu />
                  : (
                    <Link
                      to="/login"
                      state={{ from: pathname }}
                      className="text-black hover:text-gray-500 transition-colors"
                      aria-label="Sign in"
                    >
                      <User size={18} />
                    </Link>
                  )
              )}

              {/* Cart */}
              <button
                onClick={toggleCart}
                aria-label="Cart"
                className="relative text-black hover:text-gray-500 transition-colors"
              >
                <ShoppingBag size={18} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-black text-white text-[8px] font-bold min-w-[14px] h-3.5 px-0.5 flex items-center justify-center rounded-full leading-none">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search row */}
          {searchOpen && (
            <div className="border-t border-gray-100 py-3">
              <input
                autoFocus
                type="text"
                placeholder="Search products…"
                className="w-full text-sm bg-transparent focus:outline-none placeholder-gray-400"
              />
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <nav className="flex flex-col px-6 py-4 gap-0">
              {NAV_LINKS.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="py-4 text-sm font-medium border-b border-gray-100 text-black hover:text-gray-500 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              {!isLoading && !isLoggedIn && (
                <Link
                  to="/login"
                  className="py-4 text-sm font-medium text-black hover:text-gray-500 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
              )}
              {!isLoading && isLoggedIn && (
                <Link
                  to="/orders"
                  className="py-4 text-sm font-medium border-b border-gray-100 text-black hover:text-gray-500 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  My Orders
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
