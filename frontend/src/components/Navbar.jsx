// src/components/Navbar.jsx
import React from "react";
import { useWeb3 } from "../utils/Web3Context";
import { useTheme } from "../utils/ThemeContext";

function Spinner() {
  return (
    <span style={{
      width: 13, height: 13,
      borderRadius: "50%",
      border: "2px solid rgba(255,255,255,0.3)",
      borderTopColor: "#fff",
      display: "inline-block",
      animation: "spin 0.7s linear infinite",
      flexShrink: 0,
    }} />
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light" : "Switch to dark"}
      style={{
        width: 36, height: 36,
        borderRadius: "50%",
        border: "1px solid var(--border-strong)",
        background: "var(--accent-light)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        color: "var(--accent)",
        fontSize: 16,
        flexShrink: 0,
        transition: "all 0.2s",
        outline: "none",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "var(--accent)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "var(--accent-light)"; e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
    >
      {isDark ? "☀" : "◑"}
    </button>
  );
}

export default function Navbar({ navigate, currentPage, onToggleSidebar, sidebarCollapsed }) {
  const { account, connectWallet, disconnectWallet, isConnected, connecting, shortAddress, network } = useWeb3();

  return (
    <nav style={{
      height: 60,
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      padding: "0 20px 0 16px",
      gap: 12,
      position: "sticky",
      top: 0,
      zIndex: 200,
      boxShadow: "var(--shadow-sm)",
    }}>

      {/* ── Sidebar Toggle ── */}
      <button
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        style={{
          width: 36, height: 36,
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border)",
          background: "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          color: "var(--text-muted)",
          fontSize: 14,
          flexShrink: 0,
          transition: "all 0.15s",
          outline: "none",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "var(--accent-light)"; e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
      >
        {sidebarCollapsed ? "▶" : "◀"}
      </button>

      {/* ── Logo ── */}
      <button
        onClick={() => navigate("dashboard")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "0 8px 0 0",
          outline: "none",
        }}
      >
        <div style={{
          width: 30, height: 30,
          borderRadius: "var(--radius-sm)",
          background: "linear-gradient(135deg, var(--accent), #15803d)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          boxShadow: "var(--shadow-green)",
        }}>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-mono)" }}>V</span>
        </div>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fontSize: 13,
          color: "var(--text)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}>
          VehicleChain
        </span>
      </button>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── Network badge ── */}
      {isConnected && network && (
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 600,
          color: "var(--accent)",
          background: "var(--accent-light)",
          border: "1px solid var(--border-strong)",
          padding: "4px 10px",
          borderRadius: 999,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--accent)",
            display: "inline-block",
            animation: "pulse-green 2s infinite",
          }} />
          {network.name || `Chain ${network.chainId}`}
        </span>
      )}

      {/* ── Wallet area ── */}
      {isConnected ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-secondary)",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            padding: "6px 12px",
            borderRadius: 999,
            whiteSpace: "nowrap",
          }}>
            {shortAddress(account)}
          </span>
          <button
            onClick={disconnectWallet}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid var(--danger-border)",
              background: "var(--danger-bg)",
              color: "var(--danger)",
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--danger)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "var(--danger)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--danger-bg)"; e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.borderColor = "var(--danger-border)"; }}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={connecting}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 18px",
            borderRadius: 999,
            border: "none",
            background: "linear-gradient(135deg, var(--accent), #15803d)",
            color: "#fff",
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            fontWeight: 600,
            cursor: connecting ? "not-allowed" : "pointer",
            opacity: connecting ? 0.7 : 1,
            whiteSpace: "nowrap",
            boxShadow: "var(--shadow-green)",
            transition: "opacity 0.15s, transform 0.15s",
          }}
          onMouseEnter={e => { if (!connecting) e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
        >
          {connecting ? <><Spinner /> Connecting…</> : <>🦊 Connect Wallet</>}
        </button>
      )}

      <ThemeToggle />
    </nav>
  );
}