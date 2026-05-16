// src/components/Navbar.jsx
import React from "react";
import { useWeb3 } from "../utils/Web3Context";
import { useTheme } from "../utils/ThemeContext";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "register",  label: "Register",  icon: "＋" },
  { id: "history",   label: "History",   icon: "📋" },
  { id: "transfer",  label: "Transfer",  icon: "⇄"  },
  { id: "theft",     label: "FIR",       icon: "🚨" },
  { id: "dao",       label: "DAO",       icon: "⚖"  },
  { id: "token",     label: "Tokens",    icon: "🪙" },
];

function Spinner() {
  return (
    <span style={{
      width: 14, height: 14,
      borderRadius: "50%",
      border: "2px solid rgba(11,11,11,0.2)",
      borderTopColor: "#0B0B0B",
      display: "inline-block",
      animation: "spin 0.7s linear infinite",
      flexShrink: 0,
    }} />
  );
}

// ── Theme Toggle Button ────────────────────────────────────────────────────────
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.15)",
        background: "rgba(255,255,255,0.07)",
        cursor: "pointer",
        color: "var(--text-inv)",
        fontSize: 15,
        flexShrink: 0,
        transition: "background 0.2s, border-color 0.2s, transform 0.2s",
        outline: "none",
        // subtle spin on click via CSS — handled by key toggle below
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.14)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.07)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
      }}
    >
      {isDark ? "☀︎" : "☾"}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Navbar({ navigate, currentPage }) {
  const {
    account, connectWallet, disconnectWallet,
    isConnected, connecting, shortAddress, network,
  } = useWeb3();

  return (
    <nav style={{
      background: "var(--bg-inverted)",
      borderBottom: "1px solid var(--border-inv)",
      padding: "0 32px",
      display: "flex",
      alignItems: "center",
      height: 60,
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>

      {/* ── Logo ── */}
      <button
        onClick={() => navigate("dashboard")}
        style={{
          background: "transparent", border: "none", outline: "none",
          fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13,
          color: "var(--accent)", textTransform: "uppercase",
          letterSpacing: "0.18em", cursor: "pointer",
          userSelect: "none", marginRight: 40, whiteSpace: "nowrap", padding: 0,
        }}
      >
        ▣ VehicleChain
      </button>

      {/* ── Nav Links ── */}
      <div style={{ display: "flex", flex: 1, overflowX: "auto" }}>
        {NAV_ITEMS.map((item) => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                outline: "none",
                height: 60, padding: "0 14px",
                whiteSpace: "nowrap", cursor: "pointer",
                fontFamily: "var(--font-sans)", fontSize: 11,
                fontWeight: active ? 600 : 400,
                textTransform: "uppercase", letterSpacing: "0.08em",
                color: active ? "var(--text-inv)" : "var(--text-inv-muted)",
                transition: "color 0.15s, border-bottom-color 0.15s",
              }}
            >
              <span style={{ marginRight: 6, fontSize: 11 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ── Wallet Area ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 16 }}>

        {/* Network badge */}
        {isConnected && network && (
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
            color: "var(--accent)",
            background: "rgba(255,222,0,0.08)",
            border: "1px solid rgba(255,222,0,0.25)",
            padding: "4px 10px", borderRadius: 999,
            textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap",
          }}>
            ● {network.name || `Chain ${network.chainId}`}
          </span>
        )}

        {isConnected ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

            {/* Address pill */}
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 11,
              color: "rgba(255,255,255,0.55)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              padding: "6px 14px", borderRadius: 999,
              letterSpacing: "0.04em", whiteSpace: "nowrap",
            }}>
              {shortAddress(account)}
            </span>

            {/* Disconnect */}
            <button
              onClick={disconnectWallet}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.20)";
                e.currentTarget.style.color = "rgba(255,255,255,0.45)";
              }}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.20)",
                borderRadius: 999,
                color: "rgba(255,255,255,0.45)",
                fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.08em",
                padding: "6px 16px", cursor: "pointer",
                whiteSpace: "nowrap", transition: "border-color 0.15s, color 0.15s",
              }}
            >
              Disconnect
            </button>
          </div>
        ) : (

          /* ── Connect CTA — yellow pill + black arrow badge ── */
          <button
            onClick={connectWallet}
            disabled={connecting}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "var(--accent)",
              border: "none", borderRadius: 999,
              color: "var(--text)",
              fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.08em",
              padding: "8px 8px 8px 18px",
              cursor: connecting ? "not-allowed" : "pointer",
              opacity: connecting ? 0.5 : 1,
              transition: "opacity 0.15s", whiteSpace: "nowrap",
            }}
          >
            {connecting ? (
              <>
                <Spinner />
                <span>Connecting…</span>
              </>
            ) : (
              <>
                <span>Connect MetaMask</span>
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 26, height: 26,
                  background: "var(--bg-inverted)",
                  borderRadius: "50%",
                  color: "var(--accent)", fontSize: 14,
                  flexShrink: 0, lineHeight: 1,
                }}>→</span>
              </>
            )}
          </button>
        )}

        {/* ── Theme Toggle ── */}
        <ThemeToggle />

      </div>
    </nav>
  );
}