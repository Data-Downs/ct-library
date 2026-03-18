import { Link, useLocation } from 'react-router-dom'

export function Header() {
  const location = useLocation()

  return (
    <header className="border-b border-stone-light/50 bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="no-underline">
          <h1 className="font-serif text-3xl font-medium text-charcoal tracking-tight m-0">
            Charlotte's Library
          </h1>
        </Link>
        <nav className="flex gap-8">
          <Link
            to="/"
            className={`text-base font-medium tracking-wide uppercase no-underline transition-colors ${
              location.pathname === '/'
                ? 'text-charcoal'
                : 'text-stone hover:text-charcoal'
            }`}
          >
            Picks
          </Link>
          <Link
            to="/library"
            className={`text-base font-medium tracking-wide uppercase no-underline transition-colors ${
              location.pathname === '/library'
                ? 'text-charcoal'
                : 'text-stone hover:text-charcoal'
            }`}
          >
            Library
          </Link>
        </nav>
      </div>
    </header>
  )
}
