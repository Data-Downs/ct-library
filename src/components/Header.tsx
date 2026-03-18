import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export function Header() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const links = [
    { href: '/', label: 'Picks' },
    { href: '/library', label: 'Library' },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#D8D8D8]/90 backdrop-blur-sm border-b border-gray-400">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold tracking-tight no-underline text-fg">
              Charlotte Troy
            </Link>

            {/* Desktop nav */}
            <ul className="hidden md:flex gap-8 list-none m-0 p-0">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className={`text-sm tracking-wider transition-colors no-underline hover:text-gray-600 ${
                      (link.href === '/'
                        ? location.pathname === '/'
                        : location.pathname.startsWith(link.href))
                        ? 'text-gray-900 font-semibold'
                        : 'text-gray-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Hamburger button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 bg-transparent border-0 cursor-pointer"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <span
                className={`block w-6 h-0.5 bg-gray-900 transition-transform duration-300 ${
                  menuOpen ? 'translate-y-2 rotate-45' : ''
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-gray-900 transition-opacity duration-300 ${
                  menuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-gray-900 transition-transform duration-300 ${
                  menuOpen ? '-translate-y-2 -rotate-45' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[45] bg-[#D8D8D8] flex flex-col items-start pt-32 px-6 transition-opacity duration-300 md:hidden ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <ul className="flex flex-col items-start gap-8 list-none m-0 p-0">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-4xl font-bold transition-colors no-underline hover:text-gray-600 ${
                  (link.href === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(link.href))
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
