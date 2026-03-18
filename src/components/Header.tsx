import { Link, useLocation } from 'react-router-dom'

export function Header() {
  const location = useLocation()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg/90 backdrop-blur-sm border-b border-gray-400">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="no-underline">
          <h1 className="text-lg font-normal text-fg tracking-wide uppercase m-0">
            Charlotte Troy
          </h1>
        </Link>
        <nav className="flex gap-8">
          <Link
            to="/"
            className={`text-sm uppercase tracking-wider no-underline transition-colors ${
              location.pathname === '/'
                ? 'text-fg font-semibold'
                : 'text-gray-500 hover:text-fg'
            }`}
          >
            Picks
          </Link>
          <Link
            to="/library"
            className={`text-sm uppercase tracking-wider no-underline transition-colors ${
              location.pathname === '/library'
                ? 'text-fg font-semibold'
                : 'text-gray-500 hover:text-fg'
            }`}
          >
            Library
          </Link>
        </nav>
      </div>
    </header>
  )
}
