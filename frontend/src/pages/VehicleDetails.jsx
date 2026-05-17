// src/pages/VehicleDetails.jsx
import React, { useState, useEffect } from "react";
import { useWeb3 } from "../utils/Web3Context";
import S from "../styles/shared";

const RECORD_LABELS  = { 0: "SERVICE", 1: "ACCIDENT", 2: "MILEAGE" };
const RECORD_ICONS   = { 0: "🔧", 1: "💥", 2: "📏" };
// FIXED: Matched to OwnershipTransfer.sol -> enum TransferStatus { PENDING, COMPLETED, CANCELLED }
const TRANSFER_STATUS = ["PENDING", "COMPLETED", "CANCELLED"];

const DOT_COLOR = {
  blue:   "#1A4A8A",
  red:    "#CC2222",
  amber:  "#92600A",
  green:  "#1A7A4A",
};

function Spinner() {
  return (
    <span style={{
      width: 16, height: 16,
      borderRadius: "50%",
      border: "2px solid rgba(0,0,0,0.08)",
      borderTopColor: "currentColor",
      display: "inline-block",
      animation: "spin 0.7s linear infinite",
      flexShrink: 0,
    }} />
  );
}

export default function VehicleDetails({ vin: propVin, navigate }) {
  const { contracts, account, isConnected, shortAddress } = useWeb3();

  const [vin,       setVin]       = useState(propVin || "");
  const [vehicle,   setVehicle]   = useState(null);
  const [history,   setHistory]   = useState([]);
  const [firs,      setFirs]      = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [searched,  setSearched]  = useState(!!propVin);

  useEffect(() => {
    if (propVin && isConnected && contracts.vehicleRegistry) {
      loadVehicle(propVin);
    }
  }, [propVin, isConnected, contracts]);

  const loadVehicle = async (targetVin) => {
    setLoading(true);
    setError("");
    try {
      // 1. FIXED: Correctly call getVehicleByVIN
      const vData = await contracts.vehicleRegistry.getVehicleByVIN(targetVin);
      
      // 2. FIXED: Unpack the nested tuple returned by the contract
      setVehicle({
        tokenId: vData.tokenId,
        owner: vData.owner,
        vin: vData.data.vin,
        model: vData.data.model,
        year: vData.data.year,
        isStolen: vData.data.isStolen,
        registeredAt: vData.data.registeredAt
      });

      // 3. Fetch secondary data safely
      let hist = [];
      try { hist = await contracts.vehicleHistory.getHistory(targetVin); } 
      catch (e) { console.warn("No history or fetch failed"); }

      let firList = [];
      try { firList = await contracts.theftReport.getAllFIRs(targetVin); } 
      catch (e) { console.warn("No FIRs or fetch failed"); }

      let txIds = [];
      try { txIds = await contracts.ownershipTransfer.getTransferHistory(targetVin); } 
      catch (e) { console.warn("No transfers or fetch failed"); }

      setHistory([...hist].reverse());
      setFirs([...firList].reverse());

      if (txIds.length > 0) {
        const txDetails = await Promise.all(
          txIds.map((id) => contracts.ownershipTransfer.getTransfer(id))
        );
        setTransfers([...txDetails].reverse());
      } else {
        setTransfers([]);
      }

    } catch (err) {
      console.error("Lookup Error:", err);
      setError("Vehicle not found or not registered.");
      setVehicle(null);
    }
    setLoading(false);
    setSearched(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (vin.trim()) loadVehicle(vin.trim().toUpperCase());
  };

  const fmtDate = (ts) =>
    ts ? new Date(Number(ts) * 1000).toLocaleString() : "—";

  const isOwner = vehicle && account &&
    vehicle.owner?.toLowerCase() === account?.toLowerCase();

  return (
    <div style={S.page}>
      {/* Page Header */}
      <div style={S.pageHeader}>
        <span style={S.pageEyebrow}>Immutable · On-Chain Record</span>
        <h1 style={S.pageTitle}>Vehicle Details</h1>
        <p style={S.pageSub}>Full immutable history, ownership &amp; FIR status</p>
      </div>

      {/* VIN Search */}
      <div style={S.card}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 12 }}>
          <input
            style={S.inputFlex}
            placeholder="Enter VIN number"
            value={vin}
            onChange={(e) => setVin(e.target.value.toUpperCase())}
          />
          <button type="submit" style={S.btnPrimary} disabled={loading}>
            {loading ? <><Spinner /> Searching…</> : <>🔍 Lookup</>}
          </button>
        </form>
      </div>

      {error && <div style={S.alertError}>⚠ {error}</div>}

      {vehicle && (
        <>
          {/* Stolen Banner */}
          {vehicle.isStolen && (
            <div style={{
              display: "flex", alignItems: "center", gap: 20, padding: "20px 28px",
              background: "var(--danger-bg)", border: "1px solid var(--danger-border)",
              borderRadius: "var(--radius-sm)", marginBottom: 24,
            }}>
              <span style={{ fontSize: 32 }}>🚨</span>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--danger)", letterSpacing: "0.1em", fontSize: 12, marginBottom: 4 }}>
                  ⚠ THIS VEHICLE IS REPORTED STOLEN
                </div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-secondary)" }}>
                  Do not purchase this vehicle. Contact authorities.
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Information */}
          <div style={S.card}>
            <div style={S.cardTitle}>Vehicle Information</div>
            <div style={S.grid2}>
              <div>
                <span style={S.label}>VIN</span>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text)", marginBottom: 16 }}>{vehicle.vin}</div>

                <span style={S.label}>Model</span>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--text)", marginBottom: 16 }}>{vehicle.model}</div>

                <span style={S.label}>Year</span>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text)", marginBottom: 16 }}>{vehicle.year?.toString()}</div>
              </div>
              <div>
                <span style={S.label}>Current Owner</span>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text)", marginBottom: 16, wordBreak: "break-all" }}>
                  {vehicle.owner}
                  {isOwner && <span style={S.badgeBlue}>You</span>}
                </div>

                <span style={S.label}>Registered</span>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text)", marginBottom: 16 }}>{fmtDate(vehicle.registeredAt)}</div>

                <span style={S.label}>Status</span>
                <div>
                  {vehicle.isStolen
                    ? <span style={S.badgeRed}>🚨 STOLEN</span>
                    : <span style={S.badgeGreen}>✓ Clean Title</span>
                  }
                </div>
              </div>
            </div>

            {isOwner && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)", display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button style={S.btnPrimary} onClick={() => navigate("transfer")}>⇄ Transfer Ownership</button>
                <button style={S.btnDanger} onClick={() => navigate("theft")}>🚨 File FIR</button>
                <button style={S.btnGhost} onClick={() => navigate("history")}>📋 Add History</button>
              </div>
            )}
          </div>

          {/* History Timeline */}
          <div style={S.card}>
            <div style={S.cardTitle}>Vehicle History ({history.length} records)</div>
            {history.length === 0 ? (
              <div style={S.emptyState}>
                <span style={S.emptyIcon}>📋</span>
                <p style={S.emptyText}>No history records yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", paddingLeft: 16 }}>
                {history.map((rec, i) => {
                  const colorKey = { 0: "blue", 1: "red", 2: "amber" }[rec.recordType] || "blue";
                  return (
                    <div key={i} style={{ borderLeft: `2px solid ${DOT_COLOR[colorKey]}`, paddingLeft: 20, paddingBottom: 20, position: "relative" }}>
                      <div style={{ position: "absolute", left: -6, top: 2, width: 10, height: 10, borderRadius: "50%", background: DOT_COLOR[colorKey], border: "2px solid var(--surface)" }} />
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span>{RECORD_ICONS[rec.recordType]}</span>
                        <span style={S.badgeBlue}>{RECORD_LABELS[rec.recordType]}</span>
                        {rec.mileage > 0 && <span style={S.badgePurple}>{rec.mileage.toString()} km</span>}
                      </div>
                      <p style={{ margin: "4px 0", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text)" }}>{rec.description}</p>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                        {fmtDate(rec.timestamp)} · by {shortAddress(rec.addedBy)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* FIR Records */}
          <div style={S.card}>
            <div style={S.cardTitle}>FIR / Theft Reports ({firs.length})</div>
            {firs.length === 0 ? (
              <div style={S.emptyState}>
                <span style={S.emptyIcon}>✅</span>
                <p style={S.emptyText}>No theft reports on file</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", paddingLeft: 16 }}>
                {firs.map((fir, i) => (
                  <div key={i} style={{ borderLeft: `2px solid ${fir.isResolved ? DOT_COLOR.green : DOT_COLOR.red}`, paddingLeft: 20, paddingBottom: 20, position: "relative" }}>
                    <div style={{ position: "absolute", left: -6, top: 2, width: 10, height: 10, borderRadius: "50%", background: fir.isResolved ? DOT_COLOR.green : DOT_COLOR.red, border: "2px solid var(--surface)" }} />
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={fir.isResolved ? S.badgeGreen : S.badgeRed}>
                        {fir.isResolved ? "✓ Recovered" : "🚨 Active FIR"}
                      </span>
                    </div>
                    <p style={{ margin: "4px 0", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text)" }}>{fir.details}</p>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                      Filed {fmtDate(fir.filedAt)} · by {shortAddress(fir.filedBy)}
                    </span>
                    {fir.isResolved && (
                      <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", marginTop: 4 }}>
                        Recovered: {fmtDate(fir.resolvedAt)} · {fir.resolutionNote}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transfer History */}
          <div style={S.card}>
            <div style={S.cardTitle}>Ownership Transfer History ({transfers.length})</div>
            {transfers.length === 0 ? (
              <div style={S.emptyState}>
                <span style={S.emptyIcon}>⇄</span>
                <p style={S.emptyText}>No transfers recorded</p>
              </div>
            ) : (
              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {["From", "To", "Status", "Price (ETH)", "Date"].map((h) => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((tx, i) => {
                      const statusBadge = tx.status === 1n ? S.badgeGreen
                                        : tx.status === 2n ? S.badgeRed
                                        : S.badgeAmber;
                      return (
                        <tr key={i}>
                          <td style={S.tdMono}>{shortAddress(tx.seller)}</td>
                          <td style={S.tdMono}>{shortAddress(tx.buyer)}</td>
                          <td style={S.td}><span style={statusBadge}>{TRANSFER_STATUS[Number(tx.status)]}</span></td>
                          <td style={S.tdMono}>{tx.price > 0n ? `${Number(tx.price) / 1e18} ETH` : "Gift"}</td>
                          <td style={S.tdMono}>{fmtDate(tx.initiatedAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {searched && !vehicle && !loading && !error && (
        <div style={S.emptyState}>
          <span style={S.emptyIcon}>🔍</span>
          <p style={S.emptyText}>Enter a VIN to look up vehicle details</p>
        </div>
      )}
    </div>
  );
}