// src/components/Sidebar.jsx
import React from "react";
import { useWeb3 } from "../utils/Web3Context";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",   icon: "⊞", group: "main" },
  { id: "register",  label: "Register",    icon: "＋", group: "main" },
  { id: "vehicle",   label: "Lookup VIN",  icon: "🔍", group: "main" },
  { id: "history",   label: "History",     icon: "📋", group: "main" },
  { id: "transfer",  label: "Transfer",    icon: "⇄",  group: "actions" },
  { id: "theft",     label: "File FIR",    icon: "🚨", group: "actions" },
  { id: "dao",       label: "DAO",         icon: "⚖",  group: "actions" },
  { id: "token",     label: "Tokens",      icon: "🪙", group: "actions" },
  { id: "about",     label: "About",       icon: "ℹ",  group: "info" },
  { id: "help",      label: "Help",        icon: "?",  group: "info" },
  { id: "admin",      label: "Admin",        icon: "?",  group: "actions" },
];

const GROUP_LABELS = {
  main:    "Core",
  actions: "Actions",
  info:    "Info",
};

export default function Sidebar({ navigate, currentPage, collapsed }) {
  const { isConnected } = useWeb3();

  const groups = ["main", "actions", "info"];
  const w = collapsed ? 60 : 220;

  return (
    <aside style={{
      width: w,
      minWidth: w,
      maxWidth: w,
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      position: "sticky",
      top: 60,
      height: "calc(100vh - 60px)",
      overflowY: "auto",
      overflowX: "hidden",
      transition: "width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s, max-width 0.25s",
      zIndex: 100,
    }}>

      <div style={{ padding: collapsed ? "16px 8px" : "16px 12px", flex: 1 }}>
        {groups.map((group, gi) => {
          const items = NAV_ITEMS.filter(i => i.group === group);
          return (
            <div key={group} style={{ marginBottom: 8 }}>
              {/* Group label */}
              {!collapsed && (
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  padding: "8px 10px 4px",
                  marginTop: gi > 0 ? 8 : 0,
                }}>
                  {GROUP_LABELS[group]}
                </div>
              )}
              {gi > 0 && collapsed && (
                <div style={{
                  height: 1,
                  background: "var(--border)",
                  margin: "8px 4px",
                }} />
              )}

              {items.map(item => {
                const active = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: collapsed ? 0 : 10,
                      width: "100%",
                      padding: collapsed ? "10px 0" : "9px 10px",
                      justifyContent: collapsed ? "center" : "flex-start",
                      borderRadius: "var(--radius-sm)",
                      border: "none",
                      background: active
                        ? "var(--accent-light)"
                        : "transparent",
                      color: active ? "var(--accent)" : "var(--text-muted)",
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      outline: "none",
                      textAlign: "left",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      position: "relative",
                      marginBottom: 2,
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.background = "var(--accent-light)";
                        e.currentTarget.style.color = "var(--accent)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--text-muted)";
                      }
                    }}
                  >
                    {/* Active indicator */}
                    {active && (
                      <span style={{
                        position: "absolute",
                        left: 0,
                        top: "20%",
                        height: "60%",
                        width: 3,
                        borderRadius: "0 3px 3px 0",
                        background: "var(--accent)",
                      }} />
                    )}

                    <span style={{
                      fontSize: item.id === "help" ? 13 : 14,
                      fontWeight: item.id === "help" ? 700 : "normal",
                      fontFamily: item.id === "help" ? "var(--font-mono)" : "inherit",
                      lineHeight: 1,
                      flexShrink: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 20,
                    }}>
                      {item.icon}
                    </span>

                    {!collapsed && (
                      <span style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ── Connection status dot at bottom ── */}
      <div style={{
        padding: collapsed ? "12px 0" : "12px 16px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        justifyContent: collapsed ? "center" : "flex-start",
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: isConnected ? "var(--accent)" : "var(--text-muted)",
          boxShadow: isConnected ? "0 0 6px var(--accent-glow)" : "none",
          flexShrink: 0,
          display: "block",
        }} />
        {!collapsed && (
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 600,
            color: isConnected ? "var(--accent)" : "var(--text-muted)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        )}
      </div>
    </aside>
  );
}