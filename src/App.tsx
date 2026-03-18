import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { Library } from './pages/Library'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cream">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
        </Routes>
        <footer className="text-center py-8 text-stone text-xs border-t border-stone-light/30">
          Charlotte's Library
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
