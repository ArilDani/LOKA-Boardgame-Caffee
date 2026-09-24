import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Trophy, Play, Save, X, ChevronDown, ChevronUp } from "lucide-react";
import { BOARDGAMES } from "../data/menuData";
import "./GameScore.css";

const API = "http://localhost:3001/api";

function newPlayer(n) { return { name: `Pemain ${n}`, score: 0 }; }

export default function GameScore() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();

  const [sessions,    setSessions]    = useState([]);
  const [sessionName, setSessionName] = useState("Sesi " + new Date().toLocaleDateString("id-ID"));
  const [gameName,    setGameName]    = useState("Catan");
  const [players,     setPlayers]     = useState([newPlayer(1), newPlayer(2)]);
  const [rounds,      setRounds]      = useState([]);
  const [activeRound, setActiveRound] = useState(null);
  const [savedMsg,    setSavedMsg]    = useState("");
  const [tab,         setTab]         = useState("live"); // live | history

  useEffect(() => { if (!user) navigate("/login"); window.scrollTo(0,0); }, [user]);
  useEffect(() => { if (tab === "history") fetchSessions(); }, [tab]);

  const fetchSessions = async () => {
    try {
      const res = await authFetch(`${API}/scores/my`);
      if (res.ok) setSessions(await res.json());
    } catch {}
  };

  const addPlayer = () => {
    if (players.length >= 10) return;
    setPlayers(p => [...p, newPlayer(p.length + 1)]);
  };

  const removePlayer = (idx) => {
    if (players.length <= 2) return;
    setPlayers(p => p.filter((_,i) => i !== idx));
  };

  const updatePlayerName = (idx, name) => {
    setPlayers(p => p.map((pl, i) => i === idx ? { ...pl, name } : pl));
  };

  const addRound = () => {
    const round = { id: Date.now(), scores: players.map(() => 0) };
    setRounds(r => [...r, round]);
    setActiveRound(round.id);
  };

  const updateRoundScore = (roundIdx, playerIdx, val) => {
    setRounds(r => r.map((rnd, ri) => ri === roundIdx
      ? { ...rnd, scores: rnd.scores.map((s, pi) => pi === playerIdx ? Number(val) || 0 : s) }
      : rnd
    ));
  };

  const getTotals = () => players.map((_, pi) => rounds.reduce((sum, rnd) => sum + (rnd.scores[pi] || 0), 0));

  const getWinner = () => {
    const totals = getTotals();
    const max = Math.max(...totals);
    return players[totals.indexOf(max)]?.name || "";
  };

  const saveSession = async () => {
    if (!rounds.length) { setSavedMsg("Tambahkan minimal 1 ronde!"); return; }
    const totals = getTotals();
    const scoresData = players.map((p, i) => ({ name: p.name, total: totals[i] }));
    try {
      const res = await authFetch(`${API}/scores`, {
        method: "POST",
        body: JSON.stringify({ session_name: sessionName, game_name: gameName, players: players.map(p => p.name), scores: scoresData, winner: getWinner() }),
      });
      if (res.ok) { setSavedMsg("Skor berhasil disimpan! 🎉"); setTimeout(() => setSavedMsg(""), 3000); }
    } catch { setSavedMsg("Gagal menyimpan, coba lagi."); }
  };

  const deleteSession = async (id) => {
    await authFetch(`${API}/scores/${id}`, { method: "DELETE" });
    setSessions(s => s.filter(ss => ss.id !== id));
  };

  const totals = getTotals();
  const winner = getWinner();

  return (
    <div className="gamescore-page">
      <div className="gamescore-bg" />
      <div className="container gamescore-inner">

        <div className="gamescore-header">
          <span className="section-label"><Trophy size={12}/> Pelacak Skor</span>
          <h1>Game <span className="gradient-text">Score Tracker</span></h1>
          <p>Catat skor tiap ronde dan lihat siapa yang menang!</p>
        </div>

        <div className="gamescore-tabs">
          <button className={`profile-tab ${tab === "live" ? "active" : ""}`} onClick={() => setTab("live")}><Play size={14}/> Sesi Live</button>
          <button className={`profile-tab ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}><Trophy size={14}/> Riwayat</button>
        </div>

        {tab === "live" && (
          <div className="gamescore-layout">
            {/* Setup */}
            <div className="gamescore-setup glass-card">
              <h4>Setup Sesi</h4>
              <div className="form-group">
                <label className="form-label">Nama Sesi</label>
                <input className="form-input" value={sessionName} onChange={e => setSessionName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Pilih Game</label>
                <select className="form-input" value={gameName} onChange={e => setGameName(e.target.value)}>
                  {BOARDGAMES.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Pemain ({players.length}/10)</label>
                <div className="gs-players">
                  {players.map((pl, idx) => (
                    <div key={idx} className="gs-player-row">
                      <div className="gs-player-avatar">{idx + 1}</div>
                      <input className="form-input gs-player-input" value={pl.name}
                        onChange={e => updatePlayerName(idx, e.target.value)} placeholder={`Pemain ${idx+1}`} />
                      <button className="gs-player-remove" onClick={() => removePlayer(idx)} disabled={players.length <= 2}>
                        <X size={14}/>
                      </button>
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-sm" onClick={addPlayer} disabled={players.length >= 10}>
                    <Plus size={14}/> Tambah Pemain
                  </button>
                </div>
              </div>
            </div>

            {/* Scoreboard */}
            <div className="gamescore-board">
              {/* Scoreboard header */}
              <div className="gsboard-header glass-card">
                <div className="gsboard-row gsboard-row--header">
                  <span className="gsboard-cell gsboard-cell--round">Ronde</span>
                  {players.map((pl, i) => (
                    <span key={i} className="gsboard-cell gsboard-cell--player">
                      <span className="gsboard-player-num">{i+1}</span>
                      {pl.name}
                    </span>
                  ))}
                </div>

                {/* Rounds */}
                {rounds.map((rnd, ri) => (
                  <div key={rnd.id} className={`gsboard-row ${activeRound === rnd.id ? "gsboard-row--active" : ""}`}>
                    <span className="gsboard-cell gsboard-cell--round">Ronde {ri+1}</span>
                    {players.map((_, pi) => (
                      <div key={pi} className="gsboard-cell gsboard-cell--score">
                        {activeRound === rnd.id ? (
                          <input type="number" className="gs-score-input"
                            value={rnd.scores[pi]} onChange={e => updateRoundScore(ri, pi, e.target.value)} />
                        ) : (
                          <span className="gs-score-display">{rnd.scores[pi]}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                {/* Totals */}
                <div className="gsboard-row gsboard-row--total">
                  <span className="gsboard-cell gsboard-cell--round">Total</span>
                  {totals.map((t, i) => (
                    <span key={i} className={`gsboard-cell gsboard-cell--total ${players[i]?.name === winner && rounds.length ? "gsboard-cell--winner" : ""}`}>
                      {t}
                      {players[i]?.name === winner && rounds.length > 0 && <span className="winner-crown">👑</span>}
                    </span>
                  ))}
                </div>
              </div>

              <div className="gsboard-actions">
                <button className="btn btn-ghost" onClick={addRound}><Plus size={16}/> Tambah Ronde</button>
                {rounds.length > 0 && (
                  <button className="btn btn-secondary" onClick={() => setRounds(r => r.slice(0,-1))}>
                    Hapus Ronde Terakhir
                  </button>
                )}
                <button className="btn btn-primary" onClick={saveSession}><Save size={16}/> Simpan Skor</button>
              </div>

              {savedMsg && <div className={`gs-saved-msg ${savedMsg.includes("berhasil") ? "success" : "error"}`}>{savedMsg}</div>}

              {/* Winner banner */}
              {rounds.length > 0 && (
                <div className="gs-winner-banner glass-card">
                  <Trophy size={20} style={{ color: "#ffd700" }}/>
                  <span>Pemimpin saat ini: <strong>{winner}</strong> dengan {Math.max(...totals)} poin</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {tab === "history" && (
          <div className="gs-history">
            {sessions.length === 0 ? (
              <div className="profile-empty glass-card">
                <Trophy size={40} style={{ opacity: 0.3 }}/>
                <p>Belum ada riwayat skor</p>
                <button className="btn btn-primary btn-sm" onClick={() => setTab("live")}>Mulai Sesi Baru</button>
              </div>
            ) : (
              sessions.map(s => (
                <div key={s.id} className="gs-history-card glass-card">
                  <div className="gs-history-card__header">
                    <div>
                      <p className="gs-history-card__name">{s.session_name}</p>
                      <p className="gs-history-card__game">{s.game_name} · {new Date(s.played_at).toLocaleDateString("id-ID")}</p>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {s.winner && <span className="gs-history-winner">👑 {s.winner}</span>}
                      <button className="btn-icon btn-ghost" onClick={() => deleteSession(s.id)} style={{ color: "#f87171", padding: "6px" }}>
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  </div>
                  <div className="gs-history-scores">
                    {(Array.isArray(s.scores) ? s.scores : []).map((sc, i) => (
                      <div key={i} className={`gs-score-chip ${sc.name === s.winner ? "gs-score-chip--winner" : ""}`}>
                        <span>{sc.name}</span>
                        <strong>{sc.total}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
