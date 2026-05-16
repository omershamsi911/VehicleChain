// src/pages/HistoryPage.jsx
import React, { useState } from "react";
import { useWeb3 } from "../utils/Web3Context";
import S from "../styles/shared";

const RECORD_TYPES = [
  { id: "service",  label: "Service",  icon: "🔧" },
  { id: "accident", label: "Accident", icon: "💥" },
  { id: "mileage",  label: "Mileage",  icon: "📏" },
];

const PLACEHOLDER = {
  service:  "Oil change, brake pad replacement, full service at 40k km…",
  accident: "Minor front bumper damage from rear collision at Signal Chowk…",
  mileage:  "Routine mileage log — long trip Karachi to Lahore",
};

const DESC_LABEL = {
  service:  "Service Description",
  accident: "Accident Report",
  mileage:  "Notes",
};

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

  if (!isConnected) return (
    <div style={S.alertWarnConnect}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🔐</div>
      Connect MetaMask to add history records.
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.pageHeader}>
        <span style={S.pageEyebrow}>Vehicle History · Service Centers Only</span>
        <h1 style={S.pageTitle}>Vehicle History</h1>
        <p style={S.pageSub}>Add service, accident, and mileage records to the blockchain</p>
      </div>

      {msg && (
        <div style={msg.type === "success" ? S.alertSuccess : S.alertError}>
          {msg.type === "success" ? "✓ " : "✕ "}{msg.text}
        </div>
      )}

      <div style={S.grid2}>
        {/* ── Add Record Form ── */}
        <div style={S.card}>
          <div style={S.cardTitle}>📝 Add History Record</div>
          <form onSubmit={handleSubmit}>

            <div style={S.formGroup}>
              <label style={S.label}>Vehicle VIN</label>
              <input
                style={{ ...S.input, fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}
                placeholder="1HGBH41JXMN109186"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
              />
            </div>

            {/* Record type toggle */}
            <div style={S.formGroup}>
              <label style={S.label}>Record Type</label>
              <div style={{ display: "flex", gap: 8 }}>
                {RECORD_TYPES.map((t) => {
                  const active = type === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      style={{
                        flex: 1,
                        padding: "9px 6px",
                        borderRadius: "var(--radius-sm)",
                        border: `1px solid ${active ? "var(--accent)" : "var(--border-strong)"}`,
                        background: active ? "var(--accent)" : "var(--bg)",
                        color: active ? "#fff" : "var(--text-secondary)",
                        fontFamily: "var(--font-sans)",
                        fontSize: 12,
                        fontWeight: active ? 600 : 400,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                      }}
                    >
                      {t.icon} {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

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

            <div style={S.formGroup}>
              <label style={S.label}>{DESC_LABEL[type]}</label>
              <textarea
                style={{ ...S.textarea, minHeight: 100 }}
                placeholder={PLACEHOLDER[type]}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={4}
              />
            </div>

            <button
              type="submit"
              style={{ ...S.btnFullPrimary, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              disabled={loading}
            >
              {loading ? <><Spinner /> Recording…</> : "Add to Blockchain →"}
            </button>
          </form>
        </div>

        {/* ── Right: Record types info ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            {
              icon: "🔧",
              title: "Service Records",
              desc: "Maintenance, inspections, repairs. Added by authorized service centers.",
              color: "var(--accent)",
              bg: "var(--accent-light)",
              border: "var(--border-strong)",
            },
            {
              icon: "💥",
              title: "Accident Reports",
              desc: "Damage reports, collision history. Critical for buyers evaluating a vehicle.",
              color: "var(--danger)",
              bg: "var(--danger-bg)",
              border: "var(--danger-border)",
            },
            {
              icon: "📏",
              title: "Mileage Logs",
              desc: "Odometer readings over time. Monotonically enforced — values cannot decrease.",
              color: "var(--warning)",
              bg: "var(--warning-bg)",
              border: "var(--warning-border)",
            },
          ].map(({ icon, title, desc, color, bg, border }) => (
            <div key={title} style={{
              ...S.card,
              background: bg,
              border: `1px solid ${border}`,
              borderLeft: `3px solid ${color}`,
              marginBottom: 0,
              padding: 20,
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                marginBottom: 8,
              }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <strong style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text)",
                }}>{title}</strong>
              </div>
              <p style={{
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                color: "var(--text-secondary)",
                lineHeight: 1.65,
                margin: 0,
              }}>{desc}</p>
            </div>
          ))}

          <div style={{
            ...S.card,
            background: "var(--bg-inverted)",
            border: "none",
            borderLeft: "3px solid var(--accent)",
            marginBottom: 0,
            padding: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>🔐</span>
              <strong style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "var(--text-inv)" }}>
                Access Control
              </strong>
            </div>
            <p style={{
              fontFamily: "var(--font-sans)", fontSize: 13,
              color: "var(--text-inv-muted)", lineHeight: 1.65, margin: 0,
            }}>
              Only addresses authorized as Service Centers in VehicleRegistry can add records.
            </p>
          </div>

          <button
            style={{ ...S.btnSecondary, alignSelf: "flex-start" }}
            onClick={() => navigate("vehicle")}
          >
            View vehicle history →
          </button>
        </div>
      </div>
    </div>
  );
}