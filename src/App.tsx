import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { Library } from './pages/Library'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/library" element={<Library />} />
          </Routes>
        </div>
        <footer className="max-w-7xl mx-auto px-6 pt-16 pb-6 text-xs text-gray-400">
          Charlotte Troy — Library
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
