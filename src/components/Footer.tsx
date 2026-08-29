import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Newsletter */}
      <div className="max-w-content mx-auto px-6 lg:px-10 py-14 grid md:grid-cols-2 gap-10 items-start">
        <div>
          <p
            className="font-display text-5xl lg:text-6xl uppercase leading-none tracking-tight text-black"
            style={{ fontFamily: 'Anton, Impact, sans-serif' }}
          >
            XIV<br />QR
          </p>
          <p className="mt-4 text-sm text-gray-500 max-w-xs leading-relaxed">
            An elegant approach to fashion design — timeless pieces crafted to the highest quality.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] mb-4">Stay in the loop</p>
          <form className="flex" onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 field text-sm py-3 border-r-0"
            />
            <button type="submit" className="btn-black border-l-0 px-5 shrink-0">
              <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Link grid */}
      <div className="border-t border-gray-100">
        <div className="max-w-content mx-auto px-6 lg:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            {
              heading: 'Shop',
              links: ["Women's", "Men's", 'Collections', 'New Arrivals', 'Sale'],
            },
            {
              heading: 'Help',
              links: ['Size Guide', 'Shipping & Returns', 'FAQ', 'Track Order', 'Contact'],
            },
            {
              heading: 'Company',
              links: ['About Us', 'Sustainability', 'Careers', 'Press'],
            },
            {
              heading: 'Follow',
              links: ['Instagram', 'Twitter', 'Facebook', 'Pinterest'],
            },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <p className="text-2xs font-semibold uppercase tracking-[0.18em] text-gray-500 mb-4">{heading}</p>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l}>
                    <Link to="/shop" className="text-sm text-black hover:text-gray-500 transition-colors">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-100 py-4">
        <div className="max-w-content mx-auto px-6 lg:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-400">
          <p>&copy; 2026 XIV QR. All rights reserved.</p>
          <div className="flex gap-5">
            {['Privacy', 'Terms', 'Cookies'].map(l => (
              <a key={l} href="#" className="hover:text-black transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
