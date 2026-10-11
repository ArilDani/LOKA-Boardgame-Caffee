import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { CheckCircle2, Clock, Banknote, QrCode, CreditCard, ArrowLeft, XCircle, AlertCircle, Copy, Check } from "lucide-react";
import { formatPrice } from "../data/menuData";
import { supabase } from "../lib/supabase";
import "./PaymentMock.css";

export default function PaymentMock() {
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const { user } = useAuth();

  const orderId = params.get("order_id");
  const amount  = Number(params.get("amount") || 0);
  const method  = params.get("method") || "cash";

  const [step, setStep] = useState(() => {
    if (orderId && sessionStorage.getItem("tx_waiting_" + orderId)) {
      return 2;
    }
    return 1; // 1=detail, 2=processing, 3=success, "cancelled"=cancelled, "deleted"=deleted
  });
  const [countdown, setCountdown] = useState(method === "qris" ? 180 : 0);
  const [transferBanks, setTransferBanks] = useState([]);
  const [qrisUrl, setQrisUrl] = useState("");
  const [copiedBank, setCopiedBank] = useState("");
  const { clearCart } = useCart();

  useEffect(() => {
    if (!orderId) navigate("/");
    if (method === "transfer") {
      supabase.from("payment_methods").select("bank_name, account_number, account_holder").eq("type", "transfer").eq("is_active", true)
        .then(({ data }) => setTransferBanks(data || []));
    } else if (method === "qris") {
      supabase.from("payment_methods").select("qris_image_url").eq("type", "qris").eq("is_active", true).single()
        .then(({ data }) => setQrisUrl(data?.qris_image_url || ""));
    }
  }, [orderId, method, navigate]);

  useEffect(() => {
    if (step !== 1 || !countdown) return;
    const t = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(t); } return c - 1; }), 1000);
    return () => clearInterval(t);
  }, [step, countdown]);

  // Handle status update received
  const handleStatusUpdate = useCallback((status, paymentStatus) => {
    if (status === "confirmed" || paymentStatus === "paid") {
      clearCart();
      try { sessionStorage.removeItem("tx_waiting_" + orderId); } catch {}
      setStep(3);
    } else if (status === "cancelled") {
      try { sessionStorage.removeItem("tx_waiting_" + orderId); } catch {}
      setStep("cancelled");
    } else if (status === "deleted") {
      try { sessionStorage.removeItem("tx_waiting_" + orderId); } catch {}
      setStep("deleted");
    }
  }, [orderId, clearCart]);

  // Synchronize order status with Supabase & Admin Panel
  useEffect(() => {
    if (!orderId) return;

    // 1. Initial and recurring check
    const checkStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("status, payment_status")
          .eq("id", orderId)
          .single();

        if (!error && data) {
          handleStatusUpdate(data.status, data.payment_status);
        }
      } catch (e) {
        console.error("Status check error:", e);
      }
    };

    checkStatus();
    // Poll every 2 seconds to guarantee sync
    const interval = setInterval(checkStatus, 2000);

    // 2. Supabase Realtime channel
    const channel = supabase
      .channel("tx-status-" + orderId)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.new) {
            handleStatusUpdate(payload.new.status, payload.new.payment_status);
          }
        }
      )
      .subscribe();

    // 3. BroadcastChannel for instant cross-tab sync in same browser
    let bc;
    try {
      bc = new BroadcastChannel("loka_tx_updates");
      bc.onmessage = (event) => {
        if (event.data?.id === orderId) {
          handleStatusUpdate(event.data.status, event.data.paymentStatus);
        }
      };
    } catch {}

    // 4. Window storage event for cross-tab sync
    const handleStorage = (e) => {
      if (e.key === "loka_tx_update" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.id === orderId) {
            handleStatusUpdate(parsed.status, parsed.paymentStatus);
          }
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
      if (bc) bc.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, [orderId, handleStatusUpdate]);

  const confirmPayment = async () => {
    try {
      sessionStorage.setItem("tx_waiting_" + orderId, "true");
    } catch {}
    setStep(2);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedBank(key);
    setTimeout(() => setCopiedBank(""), 2000);
  };

  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  return (
    <div className="payment-page">
      <div className="payment-bg" />
      <div className="payment-card glass-card">

        {step === 1 && (
          <>
            <button className="btn btn-ghost btn-sm payment-back" onClick={() => navigate(-1)}>
              <ArrowLeft size={16}/> Kembali
            </button>
            <div className="payment-header">
              <div className="payment-method-icon">
                {method === "qris" ? <QrCode size={32}/> : method === "transfer" ? <CreditCard size={32}/> : <Banknote size={32}/>}
              </div>
              <h2>Pembayaran <span className="gradient-text">{method === "qris" ? "QRIS" : method === "transfer" ? "Transfer" : "Tunai"}</span></h2>
              <p className="payment-order-id">Order ID: <strong>{orderId}</strong></p>
            </div>

            <div className="payment-amount-box">
              <p className="payment-amount-label">Total Pembayaran</p>
              <p className="payment-amount-value">{formatPrice(amount)}</p>
            </div>

            {/* QRIS Mock */}
            {method === "qris" && (
              <div className="payment-qris-wrap">
                <div className="payment-qris-box">
                  {qrisUrl ? (
                    <img src={qrisUrl} alt="QRIS" style={{ width: "100%", maxWidth: 320, height: "auto", objectFit: "contain", borderRadius: 8 }} />
                  ) : (
                    <svg width="280" height="280" viewBox="0 0 120 120" fill="none" style={{ background: "#fff", borderRadius: 8 }}>
                      <rect width="120" height="120" fill="white" rx="8"/>
                      <rect x="10" y="10" width="30" height="30" rx="2" fill="#0d1117"/>
                      <rect x="80" y="10" width="30" height="30" rx="2" fill="#0d1117"/>
                      <rect x="10" y="80" width="30" height="30" rx="2" fill="#0d1117"/>
                      <rect x="16" y="16" width="18" height="18" rx="1" fill="white"/>
                      <rect x="86" y="16" width="18" height="18" rx="1" fill="white"/>
                      <rect x="16" y="86" width="18" height="18" rx="1" fill="white"/>
                      <rect x="20" y="20" width="10" height="10" fill="#0d1117"/>
                      <rect x="90" y="20" width="10" height="10" fill="#0d1117"/>
                      <rect x="20" y="90" width="10" height="10" fill="#0d1117"/>
                      {[50,55,60,65,70,75,45,50,60,70,75,50,60,65].map((x,i)=>
                        <rect key={i} x={x} y={[10,10,10,10,10,10,20,20,20,20,20,25,25,25][i]} width="4" height="4" fill="#0d1117"/>
                      )}
                      {[10,14,18,22,26,30,50,54,58,62,66,70,74,78,50,54,70,74,50,60,70].map((y,i)=>
                        <rect key={i} x={[45,45,45,45,45,45,80,80,80,80,80,80,80,80,100,100,100,100,110,110,110][i]} y={y} width="4" height="4" fill="#0d1117"/>
                      )}
                      <rect x="45" y="45" width="30" height="30" rx="4" fill="#c8963e" opacity="0.9"/>
                      <text x="60" y="65" textAnchor="middle" fontSize="16" fill="white" fontWeight="bold">L</text>
                    </svg>
                  )}
                  <p className="payment-qris-label">Scan dengan aplikasi e-wallet</p>
                </div>
                <div className="payment-qris-timer">
                  <Clock size={14}/> Kadaluarsa dalam <strong>{fmt(countdown)}</strong>
                </div>
              </div>
            )}

            {/* Transfer Mock */}
            {method === "transfer" && (
              <div className="payment-transfer-info glass-card">
                <p>Silakan transfer ke salah satu rekening resmi Loka:</p>
                <div className="payment-bank-list">
                  {transferBanks.map((b) => (
                    <div key={b.bank_name} className="payment-bank-item">
                      <div style={{ flex: 1 }}>
                        <span className="payment-bank-name">{b.bank_name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <strong className="payment-bank-no">{b.account_number}</strong>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm btn-icon"
                            style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                            onClick={() => copyToClipboard(b.account_number, b.bank_name)}
                            title="Salin nomor rekening"
                          >
                            {copiedBank === b.bank_name ? <Check size={12} color="#52b788"/> : <Copy size={12}/>}
                          </button>
                        </div>
                        <span className="payment-bank-holder">a.n. {b.account_holder || "Loka Boardgame Cafe"}</span>
                      </div>
                    </div>
                  ))}
                  {transferBanks.length === 0 && (
                    <div className="payment-bank-item">Belum ada rekening dikonfigurasi.</div>
                  )}
                </div>
              </div>
            )}

            {/* Cash */}
            {method === "cash" && (
              <div className="payment-cash-info glass-card">
                <Banknote size={24} style={{ color:"var(--clr-primary)" }}/>
                <p>Tunjukkan Order ID <strong>{orderId}</strong> kepada kasir dan lakukan pembayaran tunai di meja kasir.</p>
              </div>
            )}

            <button className="btn btn-primary btn-lg payment-confirm-btn" onClick={confirmPayment}>
              <CheckCircle2 size={18}/> {method === "cash" ? "Saya Bayar di Kasir (Konfirmasi)" : method === "transfer" ? "Saya Sudah Transfer" : "Saya Sudah Scan QRIS"}
            </button>
          </>
        )}

        {step === 2 && (
          <div className="payment-processing">
            <div className="payment-spinner-ring" />
            <h3>Memproses Pembayaran...</h3>
            <p className="payment-processing-desc">Mohon tunggu sebentar</p>

            <div className="payment-processing-card glass-card">
              <div className="payment-processing-row">
                <span>Order ID</span>
                <strong>{orderId}</strong>
              </div>
              <div className="payment-processing-row">
                <span>Total Pembayaran</span>
                <strong style={{ color: "var(--clr-primary)" }}>{formatPrice(amount)}</strong>
              </div>
              <div className="payment-processing-row">
                <span>Metode</span>
                <strong style={{ textTransform: "capitalize" }}>{method}</strong>
              </div>
              <div className="payment-processing-row">
                <span>Status</span>
                <span className="status-badge status-pending" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Clock size={12}/> Menunggu Konfirmasi Admin
                </span>
              </div>
            </div>

            <div className="payment-processing-notice">
              <p>💡 Pesanan Anda telah masuk ke sistem. Pembayaran akan dinyatakan berhasil begitu admin/kasir memverifikasi dan mencentang transaksi Anda di Admin Panel.</p>
            </div>

            <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)} style={{ marginTop: "0.5rem" }}>
              <ArrowLeft size={14}/> {method === "qris" ? "Lihat QRIS Lagi" : method === "transfer" ? "Lihat No. Rekening Lagi" : "Lihat Instruksi Lagi"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="payment-success">
            <div className="payment-success-icon">
              <CheckCircle2 size={56} color="var(--clr-accent-2)"/>
            </div>
            <h2>Pembayaran <span className="gradient-text">Berhasil!</span></h2>
            <p>Pesanan dengan ID <strong>{orderId}</strong> telah dikonfirmasi oleh Admin.</p>
            <div className="payment-success-amount">{formatPrice(amount)}</div>
            <div className="payment-success-actions">
              <button className="btn btn-secondary" onClick={() => navigate("/profile")}>Lihat Profil & Riwayat</button>
              <button className="btn btn-primary" onClick={() => navigate("/")}>Kembali ke Beranda</button>
            </div>
          </div>
        )}

        {step === "cancelled" && (
          <div className="payment-cancelled">
            <div className="payment-cancelled-icon">
              <XCircle size={56} color="#ef4444"/>
            </div>
            <h2>Pembayaran <span style={{ color: "#ef4444" }}>Dibatalkan</span></h2>
            <p>Transaksi dengan ID <strong>{orderId}</strong> telah dibatalkan atau ditolak oleh admin/kasir.</p>
            <div className="payment-success-actions" style={{ marginTop: "1rem" }}>
              <button className="btn btn-secondary" onClick={() => navigate("/menu")}>Lihat Menu</button>
              <button className="btn btn-primary" onClick={() => navigate("/checkout")}>Pesan Ulang</button>
            </div>
          </div>
        )}

        {step === "deleted" && (
          <div className="payment-cancelled">
            <div className="payment-cancelled-icon">
              <AlertCircle size={56} color="#94a3b8"/>
            </div>
            <h2>Pesanan <span style={{ color: "#94a3b8" }}>Dihapus</span></h2>
            <p>Transaksi dengan ID <strong>{orderId}</strong> telah dihapus dari antrean oleh admin.</p>
            <div className="payment-success-actions" style={{ marginTop: "1rem" }}>
              <button className="btn btn-secondary" onClick={() => navigate("/menu")}>Kembali ke Menu</button>
              <button className="btn btn-primary" onClick={() => navigate("/")}>Ke Beranda</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
