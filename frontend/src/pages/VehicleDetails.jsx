// src/pages/VehicleDetails.jsx
import React, { useState, useEffect } from "react";
import { useWeb3 } from "../utils/Web3Context";

const RECORD_LABELS  = { 0: "SERVICE", 1: "ACCIDENT", 2: "MILEAGE" };
const RECORD_ICONS   = { 0: "🔧", 1: "💥", 2: "📏" };
const TRANSFER_STATUS = ["PENDING", "APPROVED", "CANCELLED", "COMPLETED"];

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
    gap: 32,
  },

  // ── Stolen banner ──
  stolenBanner: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    padding: "20px 28px",
    background: "var(--bg-inverted)",
    border: "1px solid rgba(255,80,80,0.4)",
    marginBottom: 24,
  },

  stolenBannerIcon: {
    fontSize: 32,
    flexShrink: 0,
  },

  stolenBannerTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#FF6B6B",
    marginBottom: 4,
  },

  stolenBannerSub: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },

  // ── Field label ──
  fieldLabel: {
    display: "block",
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    marginBottom: 6,
  },

  fieldValue: {
    fontFamily: "var(--font-mono)",
    fontSize: 14,
    color: "var(--text)",
    marginBottom: 20,
    lineHeight: 1.4,
    wordBreak: "break-all",
  },

  fieldValueSans: {
    fontFamily: "var(--font-sans)",
    fontSize: 15,
    color: "var(--text)",
    marginBottom: 20,
    lineHeight: 1.4,
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
    padding: "10px 18px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  btnDanger: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "var(--bg-inverted)",
    border: "1px solid rgba(255,80,80,0.4)",
    borderRadius: 999,
    color: "#FF6B6B",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    padding: "9px 16px",
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
    padding: "9px 16px",
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

  // ── Alerts ──
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

  // ── Badges ──
  badgeGreen: {
    display: "inline-flex", alignItems: "center",
    fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
    letterSpacing: "0.1em", textTransform: "uppercase",
    color: "#1A7A4A", background: "rgba(26,122,74,0.08)",
    border: "1px solid rgba(26,122,74,0.2)",
    padding: "4px 10px", borderRadius: 999,
  },
  badgeRed: {
    display: "inline-flex", alignItems: "center",
    fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
    letterSpacing: "0.1em", textTransform: "uppercase",
    color: "#CC2222", background: "rgba(204,34,34,0.08)",
    border: "1px solid rgba(204,34,34,0.2)",
    padding: "4px 10px", borderRadius: 999,
  },
  badgeAmber: {
    display: "inline-flex", alignItems: "center",
    fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
    letterSpacing: "0.1em", textTransform: "uppercase",
    color: "#92600A", background: "rgba(146,96,10,0.08)",
    border: "1px solid rgba(146,96,10,0.2)",
    padding: "4px 10px", borderRadius: 999,
  },
  badgeBlue: {
    display: "inline-flex", alignItems: "center",
    fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
    letterSpacing: "0.1em", textTransform: "uppercase",
    color: "#1A4A8A", background: "rgba(26,74,138,0.08)",
    border: "1px solid rgba(26,74,138,0.2)",
    padding: "4px 10px", borderRadius: 999,
  },
  badgePurple: {
    display: "inline-flex", alignItems: "center",
    fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
    letterSpacing: "0.1em", textTransform: "uppercase",
    color: "#6B3FA0", background: "rgba(107,63,160,0.08)",
    border: "1px solid rgba(107,63,160,0.2)",
    padding: "4px 10px", borderRadius: 999,
  },

  // ── Timeline ──
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },

  timelineItem: {
    display: "flex",
    flexDirection: "column",
    paddingLeft: 24,
    paddingBottom: 24,
    borderLeft: "1px solid var(--border)",
    position: "relative",
    marginLeft: 8,
  },

  timelineDot: (color) => ({
    position: "absolute",
    left: -5,
    top: 2,
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: color,
    border: "2px solid var(--surface)",
    flexShrink: 0,
  }),

  timelineDesc: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "var(--text)",
    lineHeight: 1.6,
    margin: "6px 0 4px",
  },

  timelineMeta: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--text-muted)",
    letterSpacing: "0.04em",
  },

  // ── Table ──
  tableWrap: { overflowX: "auto" },

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
    fontFamily: "var(--font-mono)",
    fontSize: 12,
  },

  // ── Empty state ──
  emptyState: { textAlign: "center", padding: "48px 24px" },
  emptyIcon:  { fontSize: 40, marginBottom: 16, opacity: 0.3 },
  emptyText:  {
    fontFamily: "var(--font-sans)", fontSize: 14,
    color: "var(--text-muted)", marginBottom: 24,
  },

  mono: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "var(--text-muted)",
  },
};

const DOT_COLOR = {
  blue:   "#1A4A8A",
  red:    "#CC2222",
  amber:  "#92600A",
  green:  "#1A7A4A",
};

const RECORD_BADGE = {
  0: S.badgeBlue,
  1: S.badgeRed,
  2: S.badgeAmber,
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
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

// ─── Component ────────────────────────────────────────────────────────────────
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
      const v = await contracts.vehicleRegistry.getVehicle(targetVin);
      setVehicle(v);

      console.log(v);

      const [hist, firList, txIds] = await Promise.all([
        contracts.vehicleHistory.getHistory(targetVin),
        contracts.theftReport.getAllFIRs(targetVin),
        contracts.ownershipTransfer.getTransferHistory(targetVin),
      ]);

      setHistory([...hist].reverse());
      setFirs([...firList].reverse());

      if (txIds.length > 0) {
        const txDetails = await Promise.all(
          txIds.map((id) => contracts.ownershipTransfer.getTransfer(id))
        );
        setTransfers([...txDetails].reverse());
      }
    } catch (err) {
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

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 40 }}>
        <span style={S.microLabel}>Immutable · On-Chain Record</span>
        <h1 style={S.pageTitle}>Vehicle Details</h1>
        <p style={S.pageSub}>Full immutable history, ownership &amp; FIR status</p>
      </div>

      {/* ── VIN Search ── */}
      <div style={S.card}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 12 }}>
          <input
            style={{
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
            }}
            placeholder="Enter VIN number"
            value={vin}
            onChange={(e) => setVin(e.target.value.toUpperCase())}
          />
          <button type="submit" style={S.btnPrimary} disabled={loading}>
            {loading ? <><Spinner /> Searching…</> : <>🔍 Lookup <span style={S.arrowBadgeDark}>→</span></>}
          </button>
        </form>
      </div>

      {error && <div style={S.alertError}>⚠ {error}</div>}

      {vehicle && (
        <>
          {/* ── Stolen Banner ── */}
          {vehicle.isStolen && (
            <div style={S.stolenBanner}>
              <div style={S.stolenBannerIcon}>🚨</div>
              <div>
                <div style={S.stolenBannerTitle}>⚠ THIS VEHICLE IS REPORTED STOLEN</div>
                <div style={S.stolenBannerSub}>Do not purchase this vehicle. Contact authorities.</div>
              </div>
            </div>
          )}

          {/* ── Vehicle Info ── */}
          <div style={S.card}>
            <div style={S.cardTitle}>Vehicle Information</div>
            <div style={S.grid2}>
              <div>
                <span style={S.fieldLabel}>VIN</span>
                <div style={S.fieldValue}>{vehicle.vin}</div>

                <span style={S.fieldLabel}>Model</span>
                <div style={S.fieldValueSans}>{vehicle.model}</div>

                <span style={S.fieldLabel}>Year</span>
                <div style={S.fieldValue}>{vehicle.year?.toString()}</div>
              </div>
              <div>
                <span style={S.fieldLabel}>Current Owner</span>
                <div style={{ ...S.fieldValue, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {vehicle.owner}
                  {isOwner && <span style={S.badgeBlue}>You</span>}
                </div>

                <span style={S.fieldLabel}>Registered</span>
                <div style={S.fieldValue}>{fmtDate(vehicle.registeredAt)}</div>

                <span style={S.fieldLabel}>Status</span>
                <div>
                  {vehicle.isStolen
                    ? <span style={S.badgeRed}>🚨 STOLEN</span>
                    : <span style={S.badgeGreen}>✓ Clean Title</span>
                  }
                </div>
              </div>
            </div>

            {isOwner && (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)", display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button style={S.btnPrimary} onClick={() => navigate("transfer")}>
                  <span>⇄ Transfer Ownership</span>
                  <span style={S.arrowBadgeDark}>→</span>
                </button>
                <button style={S.btnDanger} onClick={() => navigate("theft")}>
                  🚨 File FIR
                </button>
                <button
                  style={S.btnGhost}
                  onClick={() => navigate("history")}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.3)"; e.currentTarget.style.color = "var(--text)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                  📋 Add History
                </button>
              </div>
            )}
          </div>

          {/* ── History Timeline ── */}
          <div style={S.card}>
            <div style={S.cardTitle}>Vehicle History ({history.length} records)</div>

            {history.length === 0 ? (
              <div style={S.emptyState}>
                <div style={S.emptyIcon}>📋</div>
                <p style={S.emptyText}>No history records yet</p>
              </div>
            ) : (
              <div style={S.timeline}>
                {history.map((rec, i) => {
                  const colorKey = { 0: "blue", 1: "red", 2: "amber" }[rec.recordType] || "blue";
                  return (
                    <div key={i} style={S.timelineItem}>
                      <div style={S.timelineDot(DOT_COLOR[colorKey])} />
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span>{RECORD_ICONS[rec.recordType]}</span>
                        <span style={RECORD_BADGE[rec.recordType] || S.badgeBlue}>
                          {RECORD_LABELS[rec.recordType]}
                        </span>
                        {rec.mileage > 0 && (
                          <span style={S.badgePurple}>{rec.mileage.toString()} km</span>
                        )}
                      </div>
                      <p style={S.timelineDesc}>{rec.description}</p>
                      <span style={S.timelineMeta}>
                        {fmtDate(rec.timestamp)} · by {shortAddress(rec.addedBy)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── FIR Records ── */}
          <div style={S.card}>
            <div style={S.cardTitle}>FIR / Theft Reports ({firs.length})</div>

            {firs.length === 0 ? (
              <div style={S.emptyState}>
                <div style={S.emptyIcon}>✅</div>
                <p style={S.emptyText}>No theft reports on file</p>
              </div>
            ) : (
              <div style={S.timeline}>
                {firs.map((fir, i) => (
                  <div key={i} style={S.timelineItem}>
                    <div style={S.timelineDot(fir.isResolved ? DOT_COLOR.green : DOT_COLOR.red)} />
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={fir.isResolved ? S.badgeGreen : S.badgeRed}>
                        {fir.isResolved ? "✓ Recovered" : "🚨 Active FIR"}
                      </span>
                    </div>
                    <p style={S.timelineDesc}>{fir.details}</p>
                    <span style={S.timelineMeta}>
                      Filed {fmtDate(fir.filedAt)} · by {shortAddress(fir.filedBy)}
                    </span>
                    {fir.isResolved && (
                      <span style={{ ...S.timelineMeta, color: "#1A7A4A", marginTop: 4, display: "block" }}>
                        Recovered: {fmtDate(fir.resolvedAt)} · {fir.resolutionNote}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Transfer History ── */}
          <div style={S.card}>
            <div style={S.cardTitle}>Ownership Transfer History ({transfers.length})</div>

            {transfers.length === 0 ? (
              <div style={S.emptyState}>
                <div style={S.emptyIcon}>⇄</div>
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
                      const statusBadge = tx.status === 3n ? S.badgeGreen
                                        : tx.status === 2n ? S.badgeRed
                                        : S.badgeAmber;
                      return (
                        <tr key={i}>
                          <td style={S.td}>{shortAddress(tx.seller)}</td>
                          <td style={S.td}>{shortAddress(tx.buyer)}</td>
                          <td style={S.td}>
                            <span style={statusBadge}>
                              {TRANSFER_STATUS[Number(tx.status)]}
                            </span>
                          </td>
                          <td style={S.td}>
                            {tx.price > 0n ? `${Number(tx.price) / 1e18} ETH` : "Gift"}
                          </td>
                          <td style={S.td}>{fmtDate(tx.initiatedAt)}</td>
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
          <div style={S.emptyIcon}>🔍</div>
          <p style={S.emptyText}>Enter a VIN to look up vehicle details</p>
        </div>
      )}
    </div>
  );
}