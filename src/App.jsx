import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
import About from './pages/About'
import Menu from './pages/Menu'
import Games from './pages/Games'
import Checkout from './pages/Checkout'
import Booking from './pages/Booking'

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navbar />
        <CartDrawer />
        <main>
          <Routes>
            <Route path="/"         element={<Home />} />
            <Route path="/about"    element={<About />} />
            <Route path="/menu"     element={<Menu />} />
            <Route path="/games"    element={<Games />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/booking"  element={<Booking />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </CartProvider>
  )
}
