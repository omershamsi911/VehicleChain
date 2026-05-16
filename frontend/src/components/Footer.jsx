// src/components/Footer.jsx
import React from "react";

const FOOTER_LINKS = [
  {
    heading: "Platform",
    items: [
      { label: "Dashboard",        id: "dashboard" },
      { label: "Register Vehicle", id: "register"  },
      { label: "Transfer",         id: "transfer"  },
      { label: "History",          id: "history"   },
    ],
  },
  {
    heading: "Governance",
    items: [
      { label: "DAO Votes",  id: "dao"   },
      { label: "File FIR",   id: "theft" },
      { label: "Tokens",     id: "token" },
    ],
  },
];

const LEGAL_LINKS = ["Privacy Policy", "Terms of Use", "Audit Report"];

export default function Footer({ navigate }) {
  return (
    <footer style={{
      background: "var(--bg-inverted)",
      borderTop: "1px solid var(--border-inv)",
      padding: "48px 40px 28px",
      marginTop: "auto",
    }}>

      {/* ── Top row: brand + nav columns ── */}
      <div style={{
        display: "flex",
        gap: 64,
        flexWrap: "wrap",
        marginBottom: 40,
      }}>

        {/* Brand block */}
        <div style={{ flex: "1 1 220px", minWidth: 180 }}>
          <button
            onClick={() => navigate("dashboard")}
            style={{
              background: "transparent", border: "none", outline: "none",
              fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13,
              color: "var(--accent)", textTransform: "uppercase",
              letterSpacing: "0.18em", cursor: "pointer",
              userSelect: "none", padding: 0, display: "block",
              marginBottom: 16,
            }}
          >
            ▣ VehicleChain
          </button>

          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            color: "var(--text-inv-muted)",
            lineHeight: 1.8,
            margin: 0,
            maxWidth: 220,
          }}>
            Decentralised vehicle ownership, history, and dispute governance — immutable and on-chain.
          </p>

          {/* Accent divider */}
          <div style={{
            width: 32, height: 2,
            background: "var(--accent)",
            marginTop: 20,
          }} />
        </div>

        {/* Nav columns */}
        {FOOTER_LINKS.map((col) => (
          <div key={col.heading} style={{ flex: "0 0 auto" }}>
            <span style={{
              display: "block",
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 16,
            }}>
              {col.heading}
            </span>

            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {col.items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => navigate(item.id)}
                    style={{
                      background: "transparent", border: "none", outline: "none",
                      fontFamily: "var(--font-sans)", fontSize: 12,
                      color: "var(--text-inv-muted)",
                      cursor: "pointer", padding: 0,
                      letterSpacing: "0.03em",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--text-inv)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-inv-muted)"}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Network status block */}
        <div style={{ flex: "0 0 auto", marginLeft: "auto" }}>
          <span style={{
            display: "block",
            fontFamily: "var(--font-mono)",
            fontSize: 9, fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--accent)", marginBottom: 16,
          }}>
            Network
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { dot: "#4ADE80", label: "Smart Contracts Active" },
              { dot: "#4ADE80", label: "IPFS Nodes Online"      },
              { dot: "#FFDE00", label: "Testnet Available"      },
            ].map(({ dot, label }) => (
              <span key={label} style={{
                display: "flex", alignItems: "center", gap: 8,
                fontFamily: "var(--font-mono)", fontSize: 10,
                color: "var(--text-inv-muted)", letterSpacing: "0.05em",
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: dot, flexShrink: 0,
                  boxShadow: `0 0 6px ${dot}88`,
                }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{
        height: 1,
        background: "var(--border-inv)",
        marginBottom: 20,
      }} />

      {/* ── Bottom row: copyright + legal ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          color: "var(--text-inv-muted)", letterSpacing: "0.08em",
        }}>
          © {new Date().getFullYear()} VehicleChain — All rights reserved
        </span>

        <div style={{ display: "flex", gap: 24 }}>
          {LEGAL_LINKS.map((link) => (
            <button
              key={link}
              style={{
                background: "transparent", border: "none", outline: "none",
                fontFamily: "var(--font-mono)", fontSize: 10,
                color: "var(--text-inv-muted)", letterSpacing: "0.08em",
                cursor: "pointer", padding: 0,
                transition: "color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--text-inv)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-inv-muted)"}
            >
              {link}
            </button>
          ))}
        </div>
      </div>

    </footer>
  );
}