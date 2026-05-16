// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useWeb3 } from "../utils/Web3Context";

// ─── Style objects ────────────────────────────────────────────────────────────
const S = {
  page: {
    padding: "48px 40px",
    background: "var(--bg)",
    minHeight: "100%",
  },

  microLabel: {
    display: "block",
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    marginBottom: 10,
  },

  pageTitle: {
    fontFamily: "var(--font-serif)",
    fontSize: 34,
    fontWeight: 700,
    color: "var(--text)",
    margin: "0 0 6px 0",
    lineHeight: 1.15,
  },

  pageSub: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "var(--text-muted)",
    margin: "0 0 40px 0",
    letterSpacing: "0.06em",
  },

  // ── Cards ──
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    padding: 32,
    marginBottom: 24,
  },

  cardTitle: {
    fontFamily: "var(--font-serif)",
    fontSize: 17,
    fontWeight: 700,
    color: "var(--text)",
    marginBottom: 24,
    paddingBottom: 14,
    borderBottom: "1px solid var(--border)",
  },

  // ── Stats row ──
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 24,
  },

  statCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    padding: "28px 32px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  statNum: {
    fontFamily: "var(--font-serif)",
    fontSize: 40,
    fontWeight: 700,
    lineHeight: 1,
  },

  statLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
  },

  // ── Input ──
  input: {
    flex: 1,
    padding: "12px 16px",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--text)",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderBottom: "1px solid rgba(0,0,0,0.25)",
    borderRadius: 0,
    outline: "none",
    boxSizing: "border-box",
  },

  // ── Buttons ──
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    background: "var(--bg-inverted)",
    border: "none",
    borderRadius: 999,
    color: "var(--text-inv)",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    padding: "10px 10px 10px 18px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  btnAccent: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    background: "var(--accent)",
    border: "none",
    borderRadius: 999,
    color: "var(--text)",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    padding: "10px 10px 10px 18px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  btnGhost: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: 999,
    color: "var(--text-muted)",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    padding: "9px 18px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  btnDanger: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    background: "var(--bg-inverted)",
    border: "1px solid rgba(255,80,80,0.4)",
    borderRadius: 999,
    color: "#FF6B6B",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    padding: "9px 18px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  btnSmGhost: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: 999,
    color: "var(--text-muted)",
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    padding: "5px 12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  // Arrow badge
  arrowBadgeDark: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24, height: 24,
    background: "var(--accent)",
    borderRadius: "50%",
    color: "var(--text)",
    fontSize: 12,
    flexShrink: 0,
  },

  arrowBadgeLight: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24, height: 24,
    background: "var(--bg-inverted)",
    borderRadius: "50%",
    color: "var(--accent)",
    fontSize: 12,
    flexShrink: 0,
  },

  // ── Table ──
  tableWrap: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
  },

  th: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    padding: "0 16px 12px 0",
    borderBottom: "1px solid var(--border)",
    textAlign: "left",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "14px 16px 14px 0",
    borderBottom: "1px solid var(--border)",
    color: "var(--text)",
    verticalAlign: "middle",
  },

  tdMono: {
    padding: "14px 16px 14px 0",
    borderBottom: "1px solid var(--border)",
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "var(--text)",
    verticalAlign: "middle",
    letterSpacing: "0.04em",
  },

  // ── Badges ──
  badgeGreen: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#1A7A4A",
    background: "rgba(26,122,74,0.08)",
    border: "1px solid rgba(26,122,74,0.2)",
    padding: "4px 10px",
    borderRadius: 999,
  },

  badgeRed: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#CC2222",
    background: "rgba(204,34,34,0.08)",
    border: "1px solid rgba(204,34,34,0.2)",
    padding: "4px 10px",
    borderRadius: 999,
  },

  // ── Empty state ──
  emptyState: {
    textAlign: "center",
    padding: "48px 24px",
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 16,
    opacity: 0.3,
  },

  emptyText: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--text-muted)",
    marginBottom: 24,
  },
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span style={{
      width: 20, height: 20,
      borderRadius: "50%",
      border: "2px solid rgba(0,0,0,0.08)",
      borderTopColor: "var(--text)",
      display: "inline-block",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Dashboard({ navigate }) {
  const { contracts, account, isConnected, formatToken, shortAddress } = useWeb3();

  const [myVINs,    setMyVINs]    = useState([]);
  const [vehicles,  setVehicles]  = useState([]);
  const [tokenBal,  setTokenBal]  = useState("0");
  const [stakedBal, setStakedBal] = useState("0");
  const [totalVeh,  setTotalVeh]  = useState("0");
  const [loading,   setLoading]   = useState(false);
  const [searchVIN, setSearchVIN] = useState("");

  useEffect(() => {
    if (!isConnected || !contracts.vehicleRegistry) return;
    loadDashboard();
  }, [isConnected, contracts, account]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [vins, bal, staked, total] = await Promise.all([
        contracts.vehicleRegistry.getOwnerVehicles(account),
        contracts.govToken.balanceOf(account),
        contracts.govToken.stakedBalance(account),
        contracts.vehicleRegistry.getTotalVehicles(),
      ]);
      setMyVINs(vins);
      setTokenBal(formatToken(bal));
      setStakedBal(formatToken(staked));
      setTotalVeh(total.toString());

      const details = await Promise.all(
        vins.map((vin) => contracts.vehicleRegistry.getVehicle(vin))
      );
      setVehicles(details);
    } catch (err) {
      console.error("Dashboard load error:", err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVIN.trim()) navigate("vehicle", searchVIN.trim().toUpperCase());
  };

  // ── Not connected — editorial landing ──
  if (!isConnected) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        padding: "80px 40px",
        textAlign: "center",
        background: "var(--bg)",
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 48,
          color: "var(--accent)",
          display: "block",
          marginBottom: 24,
          lineHeight: 1,
        }}>▣</span>

        <span style={S.microLabel}>Decentralised Vehicle Registry</span>

        <h1 style={{
          fontFamily: "var(--font-serif)",
          fontSize: 52,
          fontWeight: 700,
          color: "var(--text)",
          margin: "0 0 16px 0",
          lineHeight: 1.1,
          maxWidth: 480,
        }}>
          VehicleChain
        </h1>

        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: 15,
          color: "var(--text-muted)",
          marginBottom: 40,
          maxWidth: 380,
          lineHeight: 1.7,
        }}>
          Ownership · History · Dispute Governance — all on-chain, immutable, and transparent.
        </p>

        {/* Divider */}
        <div style={{
          width: 40,
          height: 2,
          background: "var(--accent)",
          marginBottom: 32,
        }} />

        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--text-muted)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}>
          Connect MetaMask to continue →
        </p>
      </div>
    );
  }

  // ── Connected dashboard ──
  return (
    <div style={S.page}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 40 }}>
        <span style={S.microLabel}>Overview · Connected</span>
        <h1 style={S.pageTitle}>Dashboard</h1>
        <p style={S.pageSub}>
          {shortAddress(account)}
        </p>
      </div>

      {/* ── Stats Row ── */}
      <div style={S.statsGrid}>
        <div style={S.statCard}>
          <span style={{ ...S.statNum, color: "var(--accent)" }}>{myVINs.length}</span>
          <span style={S.statLabel}>Your Vehicles</span>
        </div>
        <div style={S.statCard}>
          <span style={{ ...S.statNum, color: "var(--text)" }}>{tokenBal}</span>
          <span style={S.statLabel}>VCT Balance</span>
        </div>
        <div style={S.statCard}>
          <span style={{ ...S.statNum, color: "var(--text-muted)" }}>{stakedBal}</span>
          <span style={S.statLabel}>VCT Staked</span>
        </div>
      </div>

      {/* ── VIN Search ── */}
      <div style={S.card}>
        <div style={S.cardTitle}>Search Vehicle by VIN</div>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 12 }}>
          <input
            style={S.input}
            placeholder="Enter VIN — e.g. 1HGBH41JXMN109186"
            value={searchVIN}
            onChange={(e) => setSearchVIN(e.target.value)}
          />
          <button type="submit" style={S.btnPrimary}>
            <span>View Details</span>
            <span style={S.arrowBadgeDark}>→</span>
          </button>
        </form>
      </div>

      {/* ── Quick Actions ── */}
      <div style={S.card}>
        <div style={S.cardTitle}>Quick Actions</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>

          <button style={S.btnPrimary} onClick={() => navigate("register")}>
            <span>＋ Register Vehicle</span>
            <span style={S.arrowBadgeDark}>→</span>
          </button>

          <button
            style={S.btnGhost}
            onClick={() => navigate("transfer")}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.35)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            ⇄ Transfer Ownership
          </button>

          <button style={S.btnDanger} onClick={() => navigate("theft")}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,80,80,0.7)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,80,80,0.4)"}
          >
            🚨 File FIR
          </button>

          <button
            style={S.btnGhost}
            onClick={() => navigate("dao")}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.35)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            ⚖ DAO Votes
          </button>

          <button style={S.btnAccent} onClick={() => navigate("token")}>
            <span>🪙 Token Dashboard</span>
            <span style={S.arrowBadgeLight}>→</span>
          </button>

        </div>
      </div>

      {/* ── My Vehicles ── */}
      <div style={S.card}>
        <div style={S.cardTitle}>Your Vehicles</div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spinner />
          </div>

        ) : vehicles.length === 0 ? (
          <div style={S.emptyState}>
            <div style={S.emptyIcon}>🚗</div>
            <p style={S.emptyText}>No vehicles registered to your address</p>
            <button style={S.btnPrimary} onClick={() => navigate("register")}>
              <span>Register First Vehicle</span>
              <span style={S.arrowBadgeDark}>→</span>
            </button>
          </div>

        ) : (
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  {["VIN", "Model", "Year", "Status", "Action"].map((h) => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v, i) => (
                  <tr key={i}>
                    <td style={S.tdMono}>{v.vin}</td>
                    <td style={S.td}>{v.model}</td>
                    <td style={{ ...S.tdMono }}>{v.year?.toString()}</td>
                    <td style={S.td}>
                      {v.isStolen
                        ? <span style={S.badgeRed}>● Stolen</span>
                        : <span style={S.badgeGreen}>✓ Clear</span>
                      }
                    </td>
                    <td style={S.td}>
                      <button
                        style={S.btnSmGhost}
                        onClick={() => navigate("vehicle", v.vin)}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.3)"; e.currentTarget.style.color = "var(--text)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}