// src/components/Navbar.jsx
import React from "react";
import { useWeb3 } from "../utils/Web3Context";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",  icon: "⊞" },
  { id: "register",  label: "Register",   icon: "＋" },
  { id: "history",   label: "History",    icon: "📋" },
  { id: "transfer",  label: "Transfer",   icon: "⇄" },
  { id: "theft",     label: "FIR",        icon: "🚨" },
  { id: "dao",       label: "DAO",        icon: "⚖" },
  { id: "token",     label: "Tokens",     icon: "🪙" },
];

export default function Navbar({ navigate, currentPage }) {
  const { account, connectWallet, disconnectWallet, isConnected, connecting, shortAddress, network } = useWeb3();

  return (
    <nav style={{
      background: "var(--bg2)",
      borderBottom: "1px solid var(--border)",
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      gap: "0",
      height: "60px",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div
        onClick={() => navigate("dashboard")}
        style={{
          fontFamily: "var(--mono)",
          fontWeight: 700,
          fontSize: "15px",
          color: "var(--accent)",
          cursor: "pointer",
          marginRight: "32px",
          whiteSpace: "nowrap",
          letterSpacing: "0.03em",
        }}
      >
        ▣ VehicleChain
      </div>

      {/* Nav Links */}
      <div style={{ display: "flex", gap: "2px", flex: 1, overflowX: "auto" }}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            style={{
              background: currentPage === item.id ? "var(--bg3)" : "transparent",
              border: "none",
              borderRadius: "6px",
              color: currentPage === item.id ? "var(--text)" : "var(--text2)",
              cursor: "pointer",
              fontFamily: "var(--sans)",
              fontWeight: currentPage === item.id ? 700 : 400,
              fontSize: "13px",
              padding: "6px 12px",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            <span style={{ marginRight: 5 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Wallet */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "16px" }}>
        {isConnected && network && (
          <span style={{
            fontSize: "11px",
            fontFamily: "var(--mono)",
            color: "var(--green)",
            background: "rgba(34,197,94,0.1)",
            padding: "3px 8px",
            borderRadius: "999px",
          }}>
            ● {network.name || `Chain ${network.chainId}`}
          </span>
        )}
        {isConnected ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              fontFamily: "var(--mono)",
              fontSize: "12px",
              color: "var(--text2)",
              background: "var(--bg3)",
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid var(--border2)",
            }}>
              {shortAddress(account)}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={disconnectWallet}>
              Disconnect
            </button>
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={connectWallet} disabled={connecting}>
            {connecting ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Connecting…</> : "Connect MetaMask"}
          </button>
        )}
      </div>
    </nav>
  );
}
