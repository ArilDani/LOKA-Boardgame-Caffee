import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CheckCircle2, Clock, Banknote, QrCode, CreditCard, ArrowLeft } from "lucide-react";
import { formatPrice } from "../data/menuData";
import "./PaymentMock.css";

const API = "http://localhost:3001/api";

export default function PaymentMock() {
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const { authFetch } = useAuth();

  const orderId = params.get("order_id");
  const amount  = Number(params.get("amount") || 0);
  const method  = params.get("method") || "cash";

  const [step,      setStep]      = useState(1); // 1=detail, 2=processing, 3=done
  const [countdown, setCountdown] = useState(method === "qris" ? 180 : 0);

  useEffect(() => {
    if (!orderId) navigate("/");
  }, [orderId]);

  useEffect(() => {
    if (step !== 2 || !countdown) return;
    const t = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(t); } return c - 1; }), 1000);
    return () => clearInterval(t);
  }, [step, countdown]);

  const confirmPayment = async () => {
    setStep(2);
    // Simulate processing delay
    setTimeout(async () => {
      try {
        await authFetch(`${API}/payment/confirm/${orderId}`, { method: "POST" });
      } catch {}
      setStep(3);
    }, 2000);
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
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
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
                <p>Transfer ke rekening:</p>
                <div className="payment-bank-list">
                  {[["BCA","1234567890"],["Mandiri","0987654321"],["BNI","1122334455"]].map(([bank, no]) => (
                    <div key={bank} className="payment-bank-item">
                      <span className="payment-bank-name">{bank}</span>
                      <strong className="payment-bank-no">{no}</strong>
                      <span className="payment-bank-name">a.n. Loka Boardgame Cafe</span>
                    </div>
                  ))}
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
              <CheckCircle2 size={18}/> Konfirmasi Pembayaran
            </button>
          </>
        )}

        {step === 2 && (
          <div className="payment-processing">
            <div className="payment-spinner-ring" />
            <h3>Memproses Pembayaran...</h3>
            <p>Mohon tunggu sebentar</p>
          </div>
        )}

        {step === 3 && (
          <div className="payment-success">
            <div className="payment-success-icon">
              <CheckCircle2 size={56} color="var(--clr-accent-2)"/>
            </div>
            <h2>Pembayaran <span className="gradient-text">Berhasil!</span></h2>
            <p>Pesanan dengan ID <strong>{orderId}</strong> telah dikonfirmasi.</p>
            <div className="payment-success-amount">{formatPrice(amount)}</div>
            <div className="payment-success-actions">
              <button className="btn btn-secondary" onClick={() => navigate("/profile")}>Lihat Profil & Poin</button>
              <button className="btn btn-primary" onClick={() => navigate("/")}>Kembali ke Beranda</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
