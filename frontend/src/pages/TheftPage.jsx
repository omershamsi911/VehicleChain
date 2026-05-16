// src/pages/TheftPage.jsx
import React, { useState } from "react";
import { useWeb3 } from "../utils/Web3Context";
import S from "../styles/shared";

function Spinner() {
  return (
    <span style={{
      width: 14, height: 14, borderRadius: "50%",
      border: "2px solid rgba(255,255,255,0.3)",
      borderTopColor: "#fff",
      display: "inline-block",
      animation: "spin 0.7s linear infinite",
      flexShrink: 0,
    }} />
  );
}

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

  if (!isConnected) return (
    <div style={S.alertWarnConnect}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🔐</div>
      Connect MetaMask to file and view FIRs.
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.pageHeader}>
        <span style={S.pageEyebrow}>On-Chain · FIR System</span>
        <h1 style={S.pageTitle}>Theft Reports</h1>
        <p style={S.pageSub}>File theft reports and mark vehicles as recovered</p>
      </div>

      {msg && (
        <div style={msg.type === "success" ? S.alertSuccess : S.alertError}>
          {msg.type === "success" ? "✓ " : "✕ "}{msg.text}
        </div>
      )}

      <div style={S.grid2}>
        {/* File FIR */}
        <div style={S.card}>
          <div style={S.cardTitle}>🚨 File FIR — Owner / Authority</div>
          <div style={{ ...S.alertError, background: "rgba(220,38,38,0.04)", fontSize: 12, marginBottom: 20 }}>
            ⚠ Vehicle will be marked STOLEN immediately. Prevents ownership transfer.
          </div>
          <form onSubmit={handleFileFIR}>
            <div style={S.formGroup}>
              <label style={S.label}>Vehicle VIN</label>
              <input
                style={{ ...S.input, fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}
                placeholder="1HGBH41JXMN109186"
                value={firVin}
                onChange={(e) => setFirVin(e.target.value.toUpperCase())}
              />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>FIR Details / Circumstances</label>
              <textarea
                style={{ ...S.textarea, minHeight: 100 }}
                placeholder="Describe theft: location, date, circumstances, police station..."
                value={firDetails}
                onChange={(e) => setFirDetails(e.target.value)}
                rows={4}
              />
            </div>
            <button
              type="submit"
              style={{
                ...S.btnFullPrimary,
                background: "linear-gradient(135deg, #dc2626, #991b1b)",
                boxShadow: "0 4px 14px rgba(220,38,38,0.25)",
                opacity: loading ? 0.7 : 1,
              }}
              disabled={loading}
            >
              {loading ? <><Spinner /> Filing FIR…</> : "🚨 File FIR on Blockchain"}
            </button>
          </form>
        </div>

        {/* Mark Recovered */}
        <div style={S.card}>
          <div style={S.cardTitle}>✅ Mark Recovered — Authority Only</div>
          <form onSubmit={handleMarkRecovered}>
            <div style={S.formGroup}>
              <label style={S.label}>Vehicle VIN</label>
              <input
                style={{ ...S.input, fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}
                placeholder="1HGBH41JXMN109186"
                value={recVin}
                onChange={(e) => setRecVin(e.target.value.toUpperCase())}
              />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>FIR Index (0-based)</label>
              <input
                style={S.input}
                type="number" placeholder="0"
                value={firIndex}
                onChange={(e) => setFirIndex(e.target.value)}
              />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Resolution Note</label>
              <textarea
                style={{ ...S.textarea, minHeight: 80 }}
                placeholder="How was vehicle recovered? Location, date, officer badge..."
                value={recNote}
                onChange={(e) => setRecNote(e.target.value)}
                rows={3}
              />
            </div>
            <button
              type="submit"
              style={{ ...S.btnFullPrimary, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? <><Spinner /> Processing…</> : "✅ Mark as Recovered →"}
            </button>
          </form>
        </div>
      </div>

      {/* FIR Lookup */}
      <div style={S.card}>
        <div style={S.cardTitle}>🔍 View FIR Records by VIN</div>
        <form onSubmit={handleLookup} style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <input
            style={{ ...S.inputFlex, fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}
            placeholder="Enter VIN"
            value={lookupVin}
            onChange={(e) => setLookupVin(e.target.value.toUpperCase())}
          />
          <button type="submit" style={S.btnPrimary} disabled={loading}>
            Search FIRs
          </button>
        </form>

        {firs !== null && (
          firs.length === 0 ? (
            <div style={S.emptyState}>
              <span style={S.emptyIcon}>✅</span>
              <p style={S.emptyText}>No FIR records for this VIN — clean history</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {firs.map((fir, i) => (
                <div key={i} style={{
                  padding: 20,
                  background: fir.isResolved ? "rgba(22,163,74,0.04)" : "rgba(220,38,38,0.04)",
                  border: `1px solid ${fir.isResolved ? "rgba(22,163,74,0.18)" : "rgba(220,38,38,0.18)"}`,
                  borderRadius: "var(--radius)",
                }}>
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
                      marginTop: 12, paddingTop: 12,
                      borderTop: "1px solid var(--border)",
                      fontSize: 13, color: "var(--accent)",
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