// src/pages/TheftPage.jsx
import React, { useState } from "react";
import { useWeb3 } from "../utils/Web3Context";

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

  if (!isConnected) return <div className="alert alert-warn">Connect MetaMask first.</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🚨 Theft FIR System</h1>
        <p className="page-sub">File theft reports and mark vehicles recovered</p>
      </div>

      {msg && <div className={`alert alert-${msg.type === "success" ? "success" : "error"}`}>{msg.text}</div>}

      <div className="grid-2" style={{ alignItems: "start", marginBottom: 24 }}>
        {/* File FIR */}
        <div className="card">
          <div className="card-title">🚨 File FIR (Owner / Authority)</div>
          <form onSubmit={handleFileFIR}>
            <div className="form-group">
              <label className="label">Vehicle VIN</label>
              <input className="input" placeholder="1HGBH41JXMN109186" value={firVin}
                onChange={(e) => setFirVin(e.target.value.toUpperCase())} />
            </div>
            <div className="form-group">
              <label className="label">FIR Details / Circumstances</label>
              <textarea className="textarea"
                placeholder="Describe theft: location, date, circumstances, police station..."
                value={firDetails}
                onChange={(e) => setFirDetails(e.target.value)}
                rows={4}
              />
            </div>
            <button type="submit" className="btn btn-danger" disabled={loading} style={{ width: "100%" }}>
              {loading ? <><span className="spinner" /> Filing FIR…</> : "🚨 File FIR on Blockchain"}
            </button>
          </form>
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--text2)", fontFamily: "var(--mono)" }}>
            ⚠ Vehicle will be marked STOLEN immediately. Prevents ownership transfer.
          </div>
        </div>

        {/* Mark Recovered */}
        <div className="card">
          <div className="card-title">✅ Mark Vehicle Recovered (Authority Only)</div>
          <form onSubmit={handleMarkRecovered}>
            <div className="form-group">
              <label className="label">Vehicle VIN</label>
              <input className="input" placeholder="1HGBH41JXMN109186" value={recVin}
                onChange={(e) => setRecVin(e.target.value.toUpperCase())} />
            </div>
            <div className="form-group">
              <label className="label">FIR Index (0-based)</label>
              <input className="input" type="number" placeholder="0" value={firIndex}
                onChange={(e) => setFirIndex(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Resolution Note</label>
              <textarea className="textarea"
                placeholder="How was vehicle recovered? Location, date, officer badge..."
                value={recNote}
                onChange={(e) => setRecNote(e.target.value)}
                rows={3}
              />
            </div>
            <button type="submit" className="btn btn-success" disabled={loading} style={{ width: "100%" }}>
              {loading ? <><span className="spinner" /> Processing…</> : "✅ Mark as Recovered"}
            </button>
          </form>
        </div>
      </div>

      {/* Lookup FIRs */}
      <div className="card">
        <div className="card-title">🔍 View FIR Records by VIN</div>
        <form onSubmit={handleLookup} style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <input className="input" placeholder="Enter VIN" value={lookupVin}
            onChange={(e) => setLookupVin(e.target.value.toUpperCase())} />
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ whiteSpace: "nowrap" }}>
            {loading ? <span className="spinner" /> : "Search FIRs"}
          </button>
        </form>

        {firs !== null && (
          firs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <div className="empty-state-text">No FIR records for this VIN — clean history</div>
            </div>
          ) : (
            <div>
              {firs.map((fir, i) => (
                <div key={i} style={{
                  padding: 16,
                  background: fir.isResolved ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)",
                  border: `1px solid ${fir.isResolved ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                  borderRadius: 8,
                  marginBottom: 12,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span className={`badge ${fir.isResolved ? "badge-green" : "badge-red"}`}>
                      FIR #{i} · {fir.isResolved ? "Resolved" : "Active"}
                    </span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text2)" }}>
                      {fmtDate(fir.filedAt)}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, marginBottom: 6 }}>{fir.details}</div>
                  <div style={{ fontSize: 12, color: "var(--text2)", fontFamily: "var(--mono)" }}>
                    Filed by: {shortAddress(fir.filedBy)}
                  </div>
                  {fir.isResolved && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)", fontSize: 13, color: "var(--green)" }}>
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
