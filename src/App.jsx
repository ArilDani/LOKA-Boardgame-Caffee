import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar      from "./components/Navbar";
import Footer      from "./components/Footer";
import CartDrawer  from "./components/CartDrawer";
import Home        from "./pages/Home";
import About       from "./pages/About";
import Menu        from "./pages/Menu";
import Games       from "./pages/Games";
import Checkout    from "./pages/Checkout";
import Booking     from "./pages/Booking";
import Login       from "./pages/Login";
import Profile     from "./pages/Profile";
import GameScore   from "./pages/GameScore";
import Admin       from "./pages/Admin";
import PaymentMock from "./pages/PaymentMock";
import Membership  from "./pages/Membership";

// Protected route: requires login only (email verified OR admin bypass)
function RequireAuth({ children }) {
  const { user, profile, loading, isEmailVerified } = useAuth();
  if (loading) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
      <div style={{ width: 36, height: 36, border: "3px solid var(--clr-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  // Admin accounts bypass email verification check
  if (!isEmailVerified && profile?.role !== "admin") return <Navigate to="/login" replace />;
  return children;
}

// Admin-only route — waits for profile to be fully loaded before deciding
function RequireAdmin({ children }) {
  const { user, profile, loading } = useAuth();
  const isAdmin = profile?.role === "admin";
  // Show spinner while auth is loading OR while user is logged in but profile hasn't arrived yet
  if (loading || (user && !profile)) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
      <div style={{ width: 36, height: 36, border: "3px solid var(--clr-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
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
          <Route path="/membership"   element={<Membership />} />
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
