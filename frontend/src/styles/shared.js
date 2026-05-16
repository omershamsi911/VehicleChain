// src/styles/shared.js
// Shared style objects and helper components used across all pages

export const S = {
  // ── Page wrapper ──
  page: {
    minHeight: "100%",
    animation: "fadeUp 0.3s ease both",
  },

  // ── Page header ──
  pageEyebrow: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "var(--accent)",
    display: "block",
    marginBottom: 8,
  },

  pageTitle: {
    fontFamily: "var(--font-serif)",
    fontSize: 32,
    fontWeight: 700,
    color: "var(--text)",
    margin: "0 0 6px",
    lineHeight: 1.15,
  },

  pageSub: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--text-secondary)",
    margin: 0,
    lineHeight: 1.6,
  },

  pageHeader: {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottom: "1px solid var(--border)",
  },

  // ── Cards ──
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: 28,
    marginBottom: 20,
    boxShadow: "var(--shadow-sm)",
  },

  cardGreen: {
    background: "var(--accent-light)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-lg)",
    padding: 28,
    marginBottom: 20,
  },

  cardTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 15,
    fontWeight: 700,
    color: "var(--text)",
    marginBottom: 20,
    paddingBottom: 14,
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  // ── Stats ──
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 14,
    marginBottom: 24,
  },

  statCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "22px 24px",
    boxShadow: "var(--shadow-sm)",
  },

  statNum: {
    fontFamily: "var(--font-serif)",
    fontSize: 38,
    fontWeight: 700,
    lineHeight: 1,
    color: "var(--accent)",
    display: "block",
    marginBottom: 6,
  },

  statLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    display: "block",
  },

  // ── Grid layouts ──
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 20,
    alignItems: "start",
  },

  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
  },

  // ── Form ──
  formGroup: { marginBottom: 20 },

  label: {
    display: "block",
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--text-secondary)",
    marginBottom: 7,
  },

  input: {
    width: "100%",
    padding: "11px 14px",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--text)",
    background: "var(--bg)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-sm)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },

  inputFlex: {
    flex: 1,
    padding: "11px 14px",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--text)",
    background: "var(--bg)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-sm)",
    outline: "none",
    boxSizing: "border-box",
    minWidth: 0,
    transition: "border-color 0.15s, box-shadow 0.15s",
  },

  textarea: {
    width: "100%",
    padding: "11px 14px",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--text)",
    background: "var(--bg)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-sm)",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
    lineHeight: 1.6,
    transition: "border-color 0.15s",
  },

  // ── Buttons ──
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    background: "linear-gradient(135deg, var(--accent), #15803d)",
    border: "none",
    borderRadius: 999,
    color: "#fff",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "opacity 0.15s, transform 0.15s",
    boxShadow: "var(--shadow-green)",
    letterSpacing: "0.02em",
  },

  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 18px",
    background: "var(--accent-light)",
    border: "1px solid var(--border-strong)",
    borderRadius: 999,
    color: "var(--accent)",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s",
    letterSpacing: "0.02em",
  },

  btnGhost: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 18px",
    background: "transparent",
    border: "1px solid var(--border-strong)",
    borderRadius: 999,
    color: "var(--text-secondary)",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s",
    letterSpacing: "0.02em",
  },

  btnDanger: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 18px",
    background: "var(--danger-bg)",
    border: "1px solid var(--danger-border)",
    borderRadius: 999,
    color: "var(--danger)",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s",
    letterSpacing: "0.02em",
  },

  btnSuccess: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 18px",
    background: "rgba(22,163,74,0.08)",
    border: "1px solid rgba(22,163,74,0.3)",
    borderRadius: 999,
    color: "var(--accent)",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s",
    letterSpacing: "0.02em",
  },

  btnFullPrimary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    padding: "12px 20px",
    background: "linear-gradient(135deg, var(--accent), #15803d)",
    border: "none",
    borderRadius: "var(--radius)",
    color: "#fff",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.15s, transform 0.15s",
    boxShadow: "var(--shadow-green)",
    letterSpacing: "0.02em",
  },

  // ── Badges ──
  badgeGreen: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#15803d",
    background: "rgba(22,163,74,0.10)",
    border: "1px solid rgba(22,163,74,0.25)",
    padding: "3px 9px",
    borderRadius: 999,
  },

  badgeRed: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#dc2626",
    background: "rgba(220,38,38,0.08)",
    border: "1px solid rgba(220,38,38,0.20)",
    padding: "3px 9px",
    borderRadius: 999,
  },

  badgeAmber: {
    display: "inline-flex",
    alignItems: "center",
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#b45309",
    background: "rgba(217,119,6,0.08)",
    border: "1px solid rgba(217,119,6,0.20)",
    padding: "3px 9px",
    borderRadius: 999,
  },

  badgeBlue: {
    display: "inline-flex",
    alignItems: "center",
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#1d4ed8",
    background: "rgba(29,78,216,0.07)",
    border: "1px solid rgba(29,78,216,0.18)",
    padding: "3px 9px",
    borderRadius: 999,
  },

  badgePurple: {
    display: "inline-flex",
    alignItems: "center",
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#7c3aed",
    background: "rgba(124,58,237,0.07)",
    border: "1px solid rgba(124,58,237,0.18)",
    padding: "3px 9px",
    borderRadius: 999,
  },

  // ── Alerts ──
  alertSuccess: {
    padding: "13px 18px",
    background: "rgba(22,163,74,0.06)",
    border: "1px solid rgba(22,163,74,0.20)",
    borderLeft: "3px solid var(--accent)",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "var(--accent)",
    marginBottom: 20,
    lineHeight: 1.5,
  },

  alertError: {
    padding: "13px 18px",
    background: "var(--danger-bg)",
    border: "1px solid var(--danger-border)",
    borderLeft: "3px solid var(--danger)",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "var(--danger)",
    marginBottom: 20,
    lineHeight: 1.5,
  },

  alertWarn: {
    padding: "13px 18px",
    background: "var(--warning-bg)",
    border: "1px solid var(--warning-border)",
    borderLeft: "3px solid var(--warning)",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "var(--warning)",
    marginBottom: 20,
    lineHeight: 1.5,
  },

  alertInfo: {
    padding: "13px 18px",
    background: "var(--accent-light)",
    border: "1px solid var(--border-strong)",
    borderLeft: "3px solid var(--accent)",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "var(--text-secondary)",
    marginBottom: 20,
    lineHeight: 1.6,
  },

  alertWarnConnect: {
    padding: "32px 28px",
    background: "var(--accent-light)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-lg)",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--text-secondary)",
    textAlign: "center",
    margin: 40,
    lineHeight: 1.7,
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
    padding: "0 14px 12px 0",
    borderBottom: "1px solid var(--border)",
    textAlign: "left",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "13px 14px 13px 0",
    borderBottom: "1px solid var(--border)",
    color: "var(--text)",
    verticalAlign: "middle",
    fontSize: 13,
  },

  tdMono: {
    padding: "13px 14px 13px 0",
    borderBottom: "1px solid var(--border)",
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "var(--text-secondary)",
    verticalAlign: "middle",
    letterSpacing: "0.03em",
  },

  // ── Empty state ──
  emptyState: {
    textAlign: "center",
    padding: "48px 24px",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
    opacity: 0.35,
    display: "block",
  },
  emptyText: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--text-muted)",
    marginBottom: 20,
    lineHeight: 1.6,
  },

  // ── Mono helper ──
  mono: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--text-muted)",
    letterSpacing: "0.04em",
  },

  divider: {
    height: 1,
    background: "var(--border)",
    margin: "20px 0",
  },
};

// Re-export for convenience
export default S;