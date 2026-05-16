// src/pages/HistoryPage.jsx
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
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--text-muted)",
    margin: "0 0 40px 0",
    lineHeight: 1.6,
  },

  // ── Alerts ──
  alertBase: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "14px 20px",
    marginBottom: 32,
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    lineHeight: 1.6,
    border: "1px solid",
  },
  alertSuccess: {
    background: "rgba(0,0,0,0.02)",
    borderColor: "rgba(0,0,0,0.10)",
    borderLeft: "4px solid var(--accent)",
    color: "var(--text)",
  },
  alertError: {
    background: "rgba(0,0,0,0.02)",
    borderColor: "rgba(0,0,0,0.10)",
    borderLeft: "4px solid var(--text)",
    color: "var(--text)",
  },
  alertWarn: {
    background: "var(--bg-inverted)",
    border: "1px solid var(--bg-inverted)",
    borderLeft: "4px solid var(--accent)",
    color: "var(--text-inv)",
    padding: "20px 24px",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    margin: 40,
  },

  // ── Grid ──
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
    alignItems: "start",
  },

  // ── Cards ──
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    padding: 32,
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

  // ── Form ──
  formGroup: { marginBottom: 24 },

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
    transition: "border-color 0.15s",
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
    lineHeight: 1.6,
    transition: "border-color 0.15s",
  },

  // ── Record type toggle buttons ──
  typeToggleActive: {
    flex: 1,
    background: "var(--bg-inverted)",
    border: "1px solid var(--bg-inverted)",
    borderRadius: 0,
    color: "var(--text-inv)",
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    padding: "10px 8px",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.15s",
  },

  typeToggleInactive: {
    flex: 1,
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: 0,
    color: "var(--text-muted)",
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    padding: "10px 8px",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.15s",
  },

  // ── Submit CTA ──
  btnSubmit: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    width: "100%",
    background: "var(--bg-inverted)",
    border: "none",
    borderRadius: 999,
    color: "var(--text-inv)",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    padding: "10px 10px 10px 22px",
    cursor: "pointer",
    transition: "opacity 0.15s",
  },

  arrowBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30, height: 30,
    background: "var(--accent)",
    borderRadius: "50%",
    color: "var(--text)",
    fontSize: 14,
    flexShrink: 0,
    lineHeight: 1,
  },

  // ── Ghost small button ──
  btnGhost: {
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
    letterSpacing: "0.08em",
    padding: "7px 16px",
    cursor: "pointer",
    transition: "border-color 0.15s, color 0.15s",
  },

  // ── Info blocks ──
  infoBlock: {
    padding: "16px 18px",
    marginBottom: 0,
    borderLeft: "3px solid",
  },

  infoBlockTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 700,
    color: "var(--text)",
    marginBottom: 5,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  infoBlockBody: {
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    color: "var(--text-muted)",
    lineHeight: 1.65,
  },
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span style={{
      width: 14, height: 14,
      borderRadius: "50%",
      border: "2px solid rgba(255,255,255,0.2)",
      borderTopColor: "#fff",
      display: "inline-block",
      animation: "spin 0.7s linear infinite",
      flexShrink: 0,
    }} />
  );
}

// ─── Record type config ───────────────────────────────────────────────────────
const RECORD_TYPES = [
  { id: "service",  label: "Service",  icon: "🔧" },
  { id: "accident", label: "Accident", icon: "💥" },
  { id: "mileage",  label: "Mileage",  icon: "📏" },
];

const PLACEHOLDER = {
  service:  "Oil change, air filter replacement, brake inspection…",
  accident: "Minor front bumper damage from rear collision at Signal Chowk…",
  mileage:  "Routine mileage log — long trip Karachi to Lahore",
};

const DESC_LABEL = {
  service:  "Service Description",
  accident: "Accident Report",
  mileage:  "Notes",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function HistoryPage({ navigate }) {
  const { contracts, isConnected } = useWeb3();

  const [vin,     setVin]     = useState("");
  const [type,    setType]    = useState("service");
  const [desc,    setDesc]    = useState("");
  const [mileage, setMileage] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState(null);

  const showMsg = (t, text) => setMsg({ type: t, text });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!vin || !desc) return showMsg("error", "VIN and description are required.");
    if (type === "mileage" && !mileage) return showMsg("error", "Mileage value required.");
    setLoading(true);
    try {
      let tx;
      if (type === "service") {
        tx = await contracts.vehicleHistory.addServiceRecord(vin.toUpperCase(), desc);
      } else if (type === "accident") {
        tx = await contracts.vehicleHistory.addAccidentRecord(vin.toUpperCase(), desc);
      } else {
        tx = await contracts.vehicleHistory.addMileageRecord(vin.toUpperCase(), Number(mileage), desc);
      }
      await tx.wait();
      showMsg("success", `${type.charAt(0).toUpperCase() + type.slice(1)} record added for ${vin.toUpperCase()}.`);
      setDesc(""); setMileage("");
    } catch (err) {
      showMsg("error", err.reason || err.message);
    }
    setLoading(false);
  };

  // ── Not connected ──
  if (!isConnected) return (
    <div style={S.alertWarn}>
      Wallet Required — Connect MetaMask to continue.
    </div>
  );

  return (
    <div style={S.page}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 40 }}>
        <span style={S.microLabel}>Vehicle History · Service Centers Only</span>
        <h1 style={S.pageTitle}>Vehicle History</h1>
        <p style={S.pageSub}>Add service, accident, and mileage records to the blockchain</p>
      </div>

      {/* ── Alert ── */}
      {msg && (
        <div style={{ ...S.alertBase, ...(msg.type === "success" ? S.alertSuccess : S.alertError) }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10, fontWeight: 600,
            letterSpacing: "0.1em", textTransform: "uppercase",
            flexShrink: 0, marginTop: 2,
          }}>
            {msg.type === "success" ? "✓ Success" : "✕ Error"}
          </span>
          <span>{msg.text}</span>
        </div>
      )}

      <div style={S.grid2}>

        {/* ── Left: Add Record Form ── */}
        <div style={S.card}>
          <div style={S.cardTitle}>Add History Record</div>
          <form onSubmit={handleSubmit}>

            {/* VIN */}
            <div style={S.formGroup}>
              <label style={S.label}>Vehicle VIN</label>
              <input
                style={S.input}
                placeholder="1HGBH41JXMN109186"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
              />
            </div>

            {/* Record Type toggle */}
            <div style={S.formGroup}>
              <label style={S.label}>Record Type</label>
              <div style={{ display: "flex", gap: 0, border: "1px solid var(--border)" }}>
                {RECORD_TYPES.map((t, i) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    style={{
                      ...(type === t.id ? S.typeToggleActive : S.typeToggleInactive),
                      borderLeft: i === 0 ? "none" : "1px solid var(--border)",
                      borderTop: "none", borderBottom: "none",
                      borderRight: "none",
                    }}
                    onMouseEnter={e => {
                      if (type !== t.id) e.currentTarget.style.color = "var(--text)";
                    }}
                    onMouseLeave={e => {
                      if (type !== t.id) e.currentTarget.style.color = "var(--text-muted)";
                    }}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional mileage input */}
            {type === "mileage" && (
              <div style={S.formGroup}>
                <label style={S.label}>Odometer Reading (km)</label>
                <input
                  style={S.input}
                  type="number"
                  placeholder="45000"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                />
              </div>
            )}

            {/* Description / notes */}
            <div style={S.formGroup}>
              <label style={S.label}>{DESC_LABEL[type]}</label>
              <textarea
                style={S.textarea}
                placeholder={PLACEHOLDER[type]}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={4}
              />
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              style={{
                ...S.btnSubmit,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
            >
              <span>{loading ? "Recording…" : "Add to Blockchain"}</span>
              <span style={S.arrowBadge}>
                {loading ? <Spinner /> : "→"}
              </span>
            </button>

          </form>
        </div>

        {/* ── Right: Record Types info ── */}
        <div style={S.card}>
          <div style={S.cardTitle}>Record Types</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>

            {/* Service */}
            <div style={{
              ...S.infoBlock,
              borderLeftColor: "var(--accent)",
              background: "rgba(255,222,0,0.04)",
            }}>
              <div style={S.infoBlockTitle}>
                <span>🔧</span>
                <span>Service Records</span>
              </div>
              <p style={S.infoBlockBody}>
                Maintenance, inspections, repairs. Added by authorized service centers.
              </p>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "var(--border)" }} />

            {/* Accident */}
            <div style={{
              ...S.infoBlock,
              borderLeftColor: "#CC2222",
              background: "rgba(204,34,34,0.04)",
            }}>
              <div style={S.infoBlockTitle}>
                <span>💥</span>
                <span>Accident Reports</span>
              </div>
              <p style={S.infoBlockBody}>
                Damage reports, collision history. Critical for buyers evaluating a vehicle.
              </p>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "var(--border)" }} />

            {/* Mileage */}
            <div style={{
              ...S.infoBlock,
              borderLeftColor: "rgba(0,0,0,0.4)",
              background: "rgba(0,0,0,0.02)",
            }}>
              <div style={S.infoBlockTitle}>
                <span>📏</span>
                <span>Mileage Logs</span>
              </div>
              <p style={S.infoBlockBody}>
                Odometer readings over time. Monotonically enforced — values cannot decrease.
              </p>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "var(--border)" }} />

            {/* Access — inverted */}
            <div style={{
              background: "var(--bg-inverted)",
              padding: "16px 18px",
              borderLeft: "3px solid var(--accent)",
            }}>
              <div style={{ ...S.infoBlockTitle, color: "var(--text-inv)" }}>
                <span>🔐</span>
                <span>Access Control</span>
              </div>
              <p style={{ ...S.infoBlockBody, color: "var(--text-inv-muted)" }}>
                Only addresses authorized as Service Centers in VehicleRegistry can add records.
              </p>
            </div>

          </div>

          {/* View history link */}
          <div style={{ marginTop: 24 }}>
            <button
              style={S.btnGhost}
              onClick={() => navigate("vehicle")}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(0,0,0,0.35)";
                e.currentTarget.style.color = "var(--text)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              View vehicle history →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}