// src/components/Footer.jsx
import React from "react";

const FOOTER_LINKS = [
  {
    heading: "Platform",
    items: [
      { label: "Dashboard", id: "dashboard" },
      { label: "Register",  id: "register"  },
      { label: "Transfer",  id: "transfer"  },
      { label: "History",   id: "history"   },
    ],
  },
  {
    heading: "Governance",
    items: [
      { label: "DAO Votes", id: "dao"   },
      { label: "File FIR",  id: "theft" },
      { label: "Tokens",    id: "token" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "About", id: "about" },
      { label: "Help",  id: "help"  },
    ],
  },
];

export default function Footer({ navigate }) {
  return (
    <footer
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        padding: "56px 40px 28px",
        fontFamily: "var(--font-sans)",
        color: "var(--text-secondary)",
        marginTop: "auto",
      }}
    >
      {/* Main Grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 48,
          justifyContent: "space-between",
          marginBottom: 40,
        }}
      >
        {/* Brand Section */}
        <div style={{ maxWidth: 260, minWidth: 200 }}>
          <button
            onClick={() => navigate("dashboard")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              marginBottom: 18,
              color: "inherit",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-sm)",
                background: "linear-gradient(135deg, var(--accent), #15803d)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                }}
              >
                V
              </span>
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: 13,
                color: "var(--text)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              VehicleChain
            </span>
          </button>

          <p
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: "var(--text-secondary)",
              margin: "0 0 20px",
            }}
          >
            Decentralised vehicle ownership, immutable history, and on‑chain dispute governance.
          </p>

          {/* Status Indicators */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { dot: "var(--accent)", label: "Contracts Active" },
              { dot: "#FBBF24",       label: "Testnet" },
            ].map(({ dot, label }) => (
              <span
                key={label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  background: "var(--accent-light)",
                  border: "1px solid var(--border-strong)",
                  padding: "5px 12px",
                  borderRadius: 999,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: dot,
                    display: "inline-block",
                    boxShadow: `0 0 6px ${dot}`,
                  }}
                />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation Columns */}
        <div style={{ display: "flex", gap: 64, flexWrap: "wrap" }}>
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading} style={{ minWidth: 120 }}>
              <h4
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  margin: "0 0 16px",
                }}
              >
                {col.heading}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {col.items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => navigate(item.id)}
                      style={{
                        background: "none",
                        border: "none",
                        fontFamily: "var(--font-sans)",
                        fontSize: 14,
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        padding: 0,
                        textAlign: "left",
                        transition: "color 0.2s, transform 0.2s",
                        display: "inline-block",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--accent)";
                        e.currentTarget.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--text-secondary)";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "var(--border)",
          marginBottom: 24,
        }}
      />

      {/* Bottom Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          fontSize: 12,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-muted)",
            letterSpacing: "0.05em",
          }}
        >
          © {new Date().getFullYear()} VehicleChain — All rights reserved
        </span>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {["Privacy Policy", "Terms of Use", "Audit Report"].map((link) => (
            <button
              key={link}
              style={{
                background: "none",
                border: "none",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: 0,
                letterSpacing: "0.04em",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              {link}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}