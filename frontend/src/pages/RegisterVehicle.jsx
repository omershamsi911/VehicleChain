// src/pages/RegisterVehicle.jsx
import React, { useState } from "react";
import { useWeb3 } from "../utils/Web3Context";

// ─── Shared style objects ─────────────────────────────────────────────────────

const S = {
  page: {
    padding: "48px 40px",
    background: "var(--bg)",
    minHeight: "100%",
  },

  // Micro-label above headings
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

  // Page title — editorial serif
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
    borderLeft: "4px solid",
    border: "1px solid",
  },
  alertSuccess: {
    background: "rgba(0,0,0,0.02)",
    borderColor: "rgba(0,0,0,0.10)",
    borderLeftColor: "var(--accent)",
    color: "var(--text)",
  },
  alertError: {
    background: "rgba(0,0,0,0.02)",
    borderColor: "rgba(0,0,0,0.10)",
    borderLeftColor: "var(--text)",
    color: "var(--text)",
  },
  alertWarn: {
    background: "var(--bg-inverted)",
    borderColor: "var(--bg-inverted)",
    borderLeftColor: "var(--accent)",
    color: "var(--text-inv)",
    padding: "20px 24px",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    margin: 40,
  },

  // ── Two-col grid ──
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
  cardInverted: {
    background: "var(--bg-inverted)",
    border: "1px solid var(--border-inv)",
    padding: 32,
  },

  cardTitle: {
    fontFamily: "var(--font-serif)",
    fontSize: 18,
    fontWeight: 700,
    color: "var(--text)",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: "1px solid var(--border)",
  },
  cardTitleInv: {
    fontFamily: "var(--font-serif)",
    fontSize: 18,
    fontWeight: 700,
    color: "var(--text-inv)",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: "1px solid var(--border-inv)",
  },

  // ── Form ──
  formGroup: {
    marginBottom: 24,
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
    transition: "border-color 0.15s",
  },

  // ── Buttons ──
  btnPrimary: {
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
  btnSuccess: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    width: "100%",
    background: "var(--accent)",
    border: "none",
    borderRadius: 999,
    color: "var(--text)",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    padding: "10px 10px 10px 22px",
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
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
    padding: "6px 14px",
    marginTop: 8,
    cursor: "pointer",
    transition: "border-color 0.15s, color 0.15s",
  },

  // Arrow badge inside CTA buttons
  arrowBadgeDark: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    background: "var(--accent)",
    borderRadius: "50%",
    color: "var(--text)",
    fontSize: 14,
    flexShrink: 0,
    lineHeight: 1,
  },
  arrowBadgeLight: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    background: "var(--bg-inverted)",
    borderRadius: "50%",
    color: "var(--accent)",
    fontSize: 14,
    flexShrink: 0,
    lineHeight: 1,
  },
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ inverted = false }) {
  return (
    <span style={{
      width: 14, height: 14,
      borderRadius: "50%",
      border: inverted
        ? "2px solid rgba(255,255,255,0.2)"
        : "2px solid rgba(0,0,0,0.15)",
      borderTopColor: inverted ? "#FFFFFF" : "#0B0B0B",
      display: "inline-block",
      animation: "spin 0.7s linear infinite",
      flexShrink: 0,
    }} />
  );
}

// ─── Step item for info card ──────────────────────────────────────────────────
function Step({ number, children }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 14,
      marginBottom: 16,
    }}>
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 22, height: 22,
        border: "1px solid var(--border-inv)",
        borderRadius: "50%",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        color: "var(--accent)",
        flexShrink: 0,
        marginTop: 1,
      }}>
        {number}
      </span>
      <span style={{
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        color: "var(--text-inv-muted)",
        lineHeight: 1.65,
      }}>
        {children}
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RegisterVehicle({ navigate }) {
  const { contracts, account, isConnected, shortAddress } = useWeb3();

  const [form, setForm]       = useState({ vin: "", owner: "", model: "", year: "" });
  const [scAddress, setScAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState(null); // { type, text }

  const update = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg(null);
    const { vin, owner, model, year } = form;
    if (!vin || !owner || !model || !year) return setMsg({ type: "error", text: "All fields are required." });
    if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return setMsg({ type: "error", text: "VIN must be 17 alphanumeric characters." });
    setLoading(true);
    try {
      const tx = await contracts.vehicleRegistry.registerVehicle(vin.toUpperCase(), owner, model, Number(year));
      await tx.wait();
      setMsg({ type: "success", text: `Vehicle ${vin.toUpperCase()} registered successfully!` });
      setForm({ vin: "", owner: "", model: "", year: "" });
    } catch (err) {
      setMsg({ type: "error", text: err.reason || err.message || "Transaction failed." });
    }
    setLoading(false);
  };

  const handleAddServiceCenter = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!scAddress) return setMsg({ type: "error", text: "Enter service center address." });
    setLoading(true);
    try {
      const tx = await contracts.vehicleRegistry.addServiceCenter(scAddress);
      await tx.wait();
      setMsg({ type: "success", text: `Service center ${shortAddress(scAddress)} authorized!` });
      setScAddress("");
    } catch (err) {
      setMsg({ type: "error", text: err.reason || err.message || "Transaction failed." });
    }
    setLoading(false);
  };

  // ── Not connected ──
  if (!isConnected) return (
    <div style={S.alertWarn}>
      Wallet Required — Connect MetaMask to register vehicles.
    </div>
  );

  return (
    <div style={S.page}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 40 }}>
        <span style={S.microLabel}>Vehicle Registry · Authority Panel</span>
        <h1 style={S.pageTitle}>Register Vehicle</h1>
        <p style={S.pageSub}>Authority-only: add new vehicles to the blockchain registry</p>
      </div>

      {/* ── Alert ── */}
      {msg && (
        <div style={{
          ...S.alertBase,
          ...(msg.type === "success" ? S.alertSuccess : S.alertError),
        }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            flexShrink: 0,
            marginTop: 2,
          }}>
            {msg.type === "success" ? "✓ Success" : "✕ Error"}
          </span>
          <span>{msg.text}</span>
        </div>
      )}

      {/* ── Two-column grid ── */}
      <div style={S.grid2}>

        {/* ── Left: Register Vehicle ── */}
        <div style={S.card}>
          <div style={S.cardTitle}>Register New Vehicle</div>

          <form onSubmit={handleRegister}>
            <div style={S.formGroup}>
              <label style={S.label}>VIN (17 characters)</label>
              <input
                style={S.input}
                placeholder="1HGBH41JXMN109186"
                value={form.vin}
                onChange={(e) => update("vin", e.target.value.toUpperCase())}
                maxLength={17}
              />
            </div>

            <div style={S.formGroup}>
              <label style={S.label}>Owner Address</label>
              <input
                style={S.input}
                placeholder="0x..."
                value={form.owner}
                onChange={(e) => update("owner", e.target.value)}
              />
              <button
                type="button"
                style={S.btnGhost}
                onClick={() => update("owner", account)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(0,0,0,0.4)";
                  e.currentTarget.style.color = "var(--text)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                ↙ Use My Address
              </button>
            </div>

            <div style={S.formGroup}>
              <label style={S.label}>Model</label>
              <input
                style={S.input}
                placeholder="Toyota Corolla 2.0"
                value={form.model}
                onChange={(e) => update("model", e.target.value)}
              />
            </div>

            <div style={S.formGroup}>
              <label style={S.label}>Year</label>
              <input
                style={S.input}
                type="number"
                placeholder="2020"
                value={form.year}
                min="1886" max="2026"
                onChange={(e) => update("year", e.target.value)}
              />
            </div>

            {/* Primary CTA */}
            <button
              type="submit"
              style={{ ...S.btnPrimary, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              disabled={loading}
            >
              <span>{loading ? "Processing…" : "Register on Blockchain"}</span>
              <span style={S.arrowBadgeDark}>
                {loading ? <Spinner /> : "→"}
              </span>
            </button>
          </form>
        </div>

        {/* ── Right column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Authorize Service Center */}
          <div style={S.card}>
            <div style={S.cardTitle}>Authorize Service Center</div>
            <p style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              color: "var(--text-muted)",
              marginBottom: 24,
              lineHeight: 1.65,
            }}>
              Only authority can authorize service centers to add history records.
            </p>
            <form onSubmit={handleAddServiceCenter}>
              <div style={S.formGroup}>
                <label style={S.label}>Service Center Address</label>
                <input
                  style={S.input}
                  placeholder="0x..."
                  value={scAddress}
                  onChange={(e) => setScAddress(e.target.value)}
                />
              </div>
              {/* Success CTA — yellow pill */}
              <button
                type="submit"
                style={{ ...S.btnSuccess, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                disabled={loading}
              >
                <span>{loading ? "Processing…" : "Authorize Service Center"}</span>
                <span style={S.arrowBadgeLight}>
                  {loading ? <Spinner inverted /> : "→"}
                </span>
              </button>
            </form>
          </div>

          {/* How Registration Works — inverted card */}
          <div style={S.cardInverted}>
            <div style={S.cardTitleInv}>How Registration Works</div>
            <Step number="01">
              Only the <strong style={{ color: "var(--accent)", fontWeight: 600 }}>authority</strong> (contract deployer) can register vehicles.
            </Step>
            <Step number="02">
              Each VIN must be unique — duplicate VINs are rejected on-chain.
            </Step>
            <Step number="03">
              Service centers must be authorized before adding history records.
            </Step>
            <Step number="04">
              Once registered, all ownership and history is immutable.
            </Step>
          </div>

        </div>
      </div>
    </div>
  );
}