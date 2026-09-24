import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar    from "./components/Navbar";
import Footer    from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import Home      from "./pages/Home";
import About     from "./pages/About";
import Menu      from "./pages/Menu";
import Games     from "./pages/Games";
import Checkout  from "./pages/Checkout";
import Booking   from "./pages/Booking";
import Login     from "./pages/Login";
import Profile   from "./pages/Profile";
import GameScore from "./pages/GameScore";
import Admin     from "./pages/Admin";
import PaymentMock from "./pages/PaymentMock";

// Protected route: requires login
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--clr-text-muted)" }}>Loading...</div>;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
}

// Admin-only route
function RequireAdmin({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading)  return null;
  if (!user)    return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AppShell() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/about"        element={<About />} />
          <Route path="/menu"         element={<Menu />} />
          <Route path="/games"        element={<Games />} />
          <Route path="/booking"      element={<Booking />} />
          <Route path="/login"        element={<Login />} />
          <Route path="/payment/mock" element={<PaymentMock />} />

          {/* Protected Routes */}
          <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="/profile"  element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/score"    element={<RequireAuth><GameScore /></RequireAuth>} />

          {/* Admin */}
          <Route path="/admin/*"  element={<RequireAdmin><Admin /></RequireAdmin>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
