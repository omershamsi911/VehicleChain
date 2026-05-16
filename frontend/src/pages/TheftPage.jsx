// src/pages/TheftPage.jsx
import React, { useState } from "react";
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

  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 24,
    marginBottom: 24,
    alignItems: "start",
  },

  formGroup: {
    marginBottom: 20,
  },

  label: {
    display: "block",
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    marginBottom: 8,
  },

  input: {
    width: "100%",
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

  textarea: {
    width: "100%",
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
    resize: "vertical",
  },

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
    padding: "10px 18px",
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

  btnSuccess: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(26,122,74,0.08)",
    border: "1px solid rgba(26,122,74,0.3)",
    borderRadius: 999,
    color: "#1A7A4A",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    padding: "9px 18px",
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

  alertSuccess: {
    padding: "14px 20px",
    background: "rgba(26,122,74,0.06)",
    border: "1px solid rgba(26,122,74,0.2)",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "#1A7A4A",
    marginBottom: 24,
    lineHeight: 1.5,
  },

  alertError: {
    padding: "14px 20px",
    background: "rgba(204,34,34,0.06)",
    border: "1px solid rgba(204,34,34,0.2)",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "#CC2222",
    marginBottom: 24,
    lineHeight: 1.5,
  },

  alertWarn: {
    padding: "14px 20px",
    background: "rgba(255,170,0,0.08)",
    border: "1px solid rgba(255,170,0,0.3)",
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "var(--text)",
    marginBottom: 24,
  },

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

  mono: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "var(--text-muted)",
  },
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span style={{
      width: 14, height: 14,
      borderRadius: "50%",
      border: "2px solid rgba(0,0,0,0.08)",
      borderTopColor: "currentColor",
      display: "inline-block",
      animation: "spin 0.7s linear infinite",
      flexShrink: 0,
    }} />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TheftPage({ navigate }) {
  const { contracts, isConnected, shortAddress } = useWeb3();

  const [firVin,     setFirVin]     = useState("");
  const [firDetails, setFirDetails] = useState("");
  const [recVin,     setRecVin]     = useState("");
  const [firIndex,   setFirIndex]   = useState("");
  const [recNote,    setRecNote]    = useState("");
  const [lookupVin,  setLookupVin]  = useState("");
  const [firs,       setFirs]       = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [msg,        setMsg]        = useState(null);

  const showMsg = (type, text) => setMsg({ type, text });

  const handleFileFIR = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!firVin || !firDetails) return showMsg("error", "VIN and details are required.");
    setLoading(true);
    try {
      const tx = await contracts.theftReport.fileFIR(firVin.toUpperCase(), firDetails);
      await tx.wait();
      showMsg("success", `FIR filed for VIN ${firVin.toUpperCase()}. Vehicle marked stolen on-chain.`);
      setFirVin(""); setFirDetails("");
    } catch (err) {
      showMsg("error", err.reason || err.message);
    }
    setLoading(false);
  };

  const handleMarkRecovered = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!recVin || firIndex === "" || !recNote) return showMsg("error", "All fields required.");
    setLoading(true);
    try {
      const tx = await contracts.theftReport.markRecovered(recVin.toUpperCase(), Number(firIndex), recNote);
      await tx.wait();
      showMsg("success", "Vehicle marked as recovered. Stolen flag cleared.");
      setRecVin(""); setFirIndex(""); setRecNote("");
    } catch (err) {
      showMsg("error", err.reason || err.message);
    }
    setLoading(false);
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupVin) return;
    setLoading(true);
    try {
      const allFirs = await contracts.theftReport.getAllFIRs(lookupVin.toUpperCase());
      setFirs(allFirs);
    } catch (err) {
      showMsg("error", err.reason || err.message);
      setFirs(null);
    }
    setLoading(false);
  };

  const fmtDate = (ts) => ts ? new Date(Number(ts) * 1000).toLocaleString() : "—";

  if (!isConnected) {
    return (
      <div style={{ padding: "48px 40px" }}>
        <div style={S.alertWarn}>Connect MetaMask first.</div>
      </div>
    );
  }

  return (
    <div style={S.page}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 40 }}>
        <span style={S.microLabel}>On-Chain · FIR System</span>
        <h1 style={S.pageTitle}>Theft Reports</h1>
        <p style={S.pageSub}>File theft reports and mark vehicles recovered</p>
      </div>

      {msg && (
        <div style={msg.type === "success" ? S.alertSuccess : S.alertError}>
          {msg.text}
        </div>
      )}

      {/* ── File FIR + Mark Recovered ── */}
      <div style={S.grid2}>

        {/* File FIR */}
        <div style={S.card}>
          <div style={S.cardTitle}>File FIR — Owner / Authority</div>
          <form onSubmit={handleFileFIR}>
            <div style={S.formGroup}>
              <label style={S.label}>Vehicle VIN</label>
              <input
                style={S.input}
                placeholder="1HGBH41JXMN109186"
                value={firVin}
                onChange={(e) => setFirVin(e.target.value.toUpperCase())}
              />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>FIR Details / Circumstances</label>
              <textarea
                style={S.textarea}
                placeholder="Describe theft: location, date, circumstances, police station..."
                value={firDetails}
                onChange={(e) => setFirDetails(e.target.value)}
                rows={4}
              />
            </div>
            <button
              type="submit"
              style={{ ...S.btnDanger, width: "100%", justifyContent: "center" }}
              disabled={loading}
            >
              {loading ? <><Spinner /> Filing FIR…</> : "🚨 File FIR on Blockchain"}
            </button>
          </form>
          <p style={{ ...S.mono, marginTop: 14, lineHeight: 1.6 }}>
            ⚠ Vehicle will be marked STOLEN immediately. Prevents ownership transfer.
          </p>
        </div>

        {/* Mark Recovered */}
        <div style={S.card}>
          <div style={S.cardTitle}>Mark Recovered — Authority Only</div>
          <form onSubmit={handleMarkRecovered}>
            <div style={S.formGroup}>
              <label style={S.label}>Vehicle VIN</label>
              <input
                style={S.input}
                placeholder="1HGBH41JXMN109186"
                value={recVin}
                onChange={(e) => setRecVin(e.target.value.toUpperCase())}
              />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>FIR Index (0-based)</label>
              <input
                style={S.input}
                type="number"
                placeholder="0"
                value={firIndex}
                onChange={(e) => setFirIndex(e.target.value)}
              />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Resolution Note</label>
              <textarea
                style={S.textarea}
                placeholder="How was vehicle recovered? Location, date, officer badge..."
                value={recNote}
                onChange={(e) => setRecNote(e.target.value)}
                rows={3}
              />
            </div>
            <button
              type="submit"
              style={{ ...S.btnSuccess, width: "100%", justifyContent: "center" }}
              disabled={loading}
            >
              {loading ? <><Spinner /> Processing…</> : "✅ Mark as Recovered"}
            </button>
          </form>
        </div>
      </div>

      {/* ── FIR Lookup ── */}
      <div style={S.card}>
        <div style={S.cardTitle}>View FIR Records by VIN</div>

        <form onSubmit={handleLookup} style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <input
            style={{ ...S.input, flex: 1 }}
            placeholder="Enter VIN"
            value={lookupVin}
            onChange={(e) => setLookupVin(e.target.value.toUpperCase())}
          />
          <button type="submit" style={S.btnPrimary} disabled={loading}>
            {loading ? <Spinner /> : "Search FIRs"}
          </button>
        </form>

        {firs !== null && (
          firs.length === 0 ? (
            <div style={S.emptyState}>
              <div style={S.emptyIcon}>✅</div>
              <p style={S.emptyText}>No FIR records for this VIN — clean history</p>
            </div>
          ) : (
            <div>
              {firs.map((fir, i) => (
                <div
                  key={i}
                  style={{
                    padding: 20,
                    background: fir.isResolved ? "rgba(26,122,74,0.04)" : "rgba(204,34,34,0.04)",
                    border: `1px solid ${fir.isResolved ? "rgba(26,122,74,0.18)" : "rgba(204,34,34,0.18)"}`,
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={fir.isResolved ? S.badgeGreen : S.badgeRed}>
                      FIR #{i} · {fir.isResolved ? "Resolved" : "Active"}
                    </span>
                    <span style={S.mono}>{fmtDate(fir.filedAt)}</span>
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 8, lineHeight: 1.5 }}>
                    {fir.details}
                  </p>
                  <span style={S.mono}>Filed by: {shortAddress(fir.filedBy)}</span>
                  {fir.isResolved && (
                    <div style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: "1px solid var(--border)",
                      fontSize: 13,
                      color: "#1A7A4A",
                      fontFamily: "var(--font-sans)",
                      lineHeight: 1.5,
                    }}>
                      ✓ Recovered {fmtDate(fir.resolvedAt)}: {fir.resolutionNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}