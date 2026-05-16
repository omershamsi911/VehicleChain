// src/pages/TransferPage.jsx
import React, { useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../utils/Web3Context";

const STATUS_LABEL = ["PENDING", "APPROVED", "CANCELLED", "COMPLETED"];
const STATUS_COLOR = ["amber", "blue", "red", "green"];

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
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "var(--text-muted)",
    margin: "0 0 40px 0",
    letterSpacing: "0.06em",
  },

  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    padding: 32,
    marginBottom: 24,
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

  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 24,
    alignItems: "start",
  },

  formGroup: {
    marginBottom: 20,
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
  },

  inputFlex: {
    flex: 1,
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
    minWidth: 0,
  },

  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    background: "var(--bg-inverted)",
    border: "none",
    borderRadius: 999,
    color: "var(--text-inv)",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    padding: "10px 18px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  btnSuccess: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(26,122,74,0.08)",
    border: "1px solid rgba(26,122,74,0.3)",
    borderRadius: 999,
    color: "#1A7A4A",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    padding: "9px 18px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  btnDanger: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    background: "var(--bg-inverted)",
    border: "1px solid rgba(255,80,80,0.4)",
    borderRadius: 999,
    color: "#FF6B6B",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    padding: "9px 18px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  btnGhost: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: 999,
    color: "var(--text-muted)",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    padding: "9px 18px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  alertSuccess: {
    padding: "14px 20px",
    background: "rgba(26,122,74,0.06)",
    border: "1px solid rgba(26,122,74,0.2)",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "#1A7A4A",
    marginBottom: 24,
    lineHeight: 1.5,
  },

  alertError: {
    padding: "14px 20px",
    background: "rgba(204,34,34,0.06)",
    border: "1px solid rgba(204,34,34,0.2)",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "#CC2222",
    marginBottom: 24,
    lineHeight: 1.5,
  },

  alertWarn: {
    padding: "14px 20px",
    background: "rgba(255,170,0,0.08)",
    border: "1px solid rgba(255,170,0,0.3)",
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "var(--text)",
    marginBottom: 24,
  },

  badgeAmber: {
    display: "inline-flex",
    alignItems: "center",
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#92600A",
    background: "rgba(146,96,10,0.08)",
    border: "1px solid rgba(146,96,10,0.2)",
    padding: "4px 10px",
    borderRadius: 999,
  },

  badgeBlue: {
    display: "inline-flex",
    alignItems: "center",
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#1A4A8A",
    background: "rgba(26,74,138,0.08)",
    border: "1px solid rgba(26,74,138,0.2)",
    padding: "4px 10px",
    borderRadius: 999,
  },

  badgeRed: {
    display: "inline-flex",
    alignItems: "center",
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#CC2222",
    background: "rgba(204,34,34,0.08)",
    border: "1px solid rgba(204,34,34,0.2)",
    padding: "4px 10px",
    borderRadius: 999,
  },

  badgeGreen: {
    display: "inline-flex",
    alignItems: "center",
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#1A7A4A",
    background: "rgba(26,122,74,0.08)",
    border: "1px solid rgba(26,122,74,0.2)",
    padding: "4px 10px",
    borderRadius: 999,
  },

  detailBox: {
    marginBottom: 20,
    padding: 16,
    background: "var(--bg)",
    border: "1px solid var(--border)",
    fontSize: 13,
    fontFamily: "var(--font-mono)",
    lineHeight: 2,
  },

  rulesItem: {
    fontSize: 13,
    color: "var(--text-muted)",
    fontFamily: "var(--font-sans)",
    lineHeight: 2,
  },
};

const BADGE_STYLE = [S.badgeAmber, S.badgeBlue, S.badgeRed, S.badgeGreen];

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span style={{
      width: 14, height: 14,
      borderRadius: "50%",
      border: "2px solid rgba(0,0,0,0.08)",
      borderTopColor: "currentColor",
      display: "inline-block",
      animation: "spin 0.7s linear infinite",
      flexShrink: 0,
    }} />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TransferPage({ navigate }) {
  const { contracts, account, isConnected, shortAddress } = useWeb3();

  const [vin,     setVin]     = useState("");
  const [buyer,   setBuyer]   = useState("");
  const [price,   setPrice]   = useState("");
  const [txId,    setTxId]    = useState("");
  const [detail,  setDetail]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState(null);

  const showMsg = (type, text) => setMsg({ type, text });

  const handleInitiate = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!vin || !buyer) return showMsg("error", "VIN and buyer address are required.");
    setLoading(true);
    try {
      const priceWei = price ? ethers.parseEther(price) : 0n;
      const tx = await contracts.ownershipTransfer.initiateTransfer(vin.toUpperCase(), buyer, priceWei);
      await tx.wait();
      showMsg("success", `Transfer initiated! Ask buyer (${shortAddress(buyer)}) to approve.`);
      setVin(""); setBuyer(""); setPrice("");
    } catch (err) {
      showMsg("error", err.reason || err.message);
    }
    setLoading(false);
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!txId) return showMsg("error", "Enter transfer ID.");
    setLoading(true);
    try {
      const tx = await contracts.ownershipTransfer.getTransfer(Number(txId));
      const valueToSend = tx.price > 0n ? tx.price : 0n;
      const txn = await contracts.ownershipTransfer.approveTransfer(Number(txId), { value: valueToSend });
      await txn.wait();
      showMsg("success", "Transfer approved! Ownership updated on-chain.");
    } catch (err) {
      showMsg("error", err.reason || err.message);
    }
    setLoading(false);
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!txId) return showMsg("error", "Enter transfer ID.");
    setLoading(true);
    try {
      const txn = await contracts.ownershipTransfer.cancelTransfer(Number(txId));
      await txn.wait();
      showMsg("success", "Transfer cancelled.");
    } catch (err) {
      showMsg("error", err.reason || err.message);
    }
    setLoading(false);
  };

  const lookupTransfer = async () => {
    if (!txId) return;
    setLoading(true);
    try {
      const d = await contracts.ownershipTransfer.getTransfer(Number(txId));
      setDetail(d);
    } catch (err) {
      showMsg("error", "Transfer not found.");
      setDetail(null);
    }
    setLoading(false);
  };

  if (!isConnected) {
    return (
      <div style={{ padding: "48px 40px" }}>
        <div style={S.alertWarn}>Connect MetaMask first.</div>
      </div>
    );
  }

  return (
    <div style={S.page}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 40 }}>
        <span style={S.microLabel}>On-Chain · Two-Step</span>
        <h1 style={S.pageTitle}>Ownership Transfer</h1>
        <p style={S.pageSub}>Secure two-step vehicle ownership transfer on-chain</p>
      </div>

      {msg && (
        <div style={msg.type === "success" ? S.alertSuccess : S.alertError}>
          {msg.text}
        </div>
      )}

      <div style={S.grid2}>

        {/* ── Step 1: Initiate ── */}
        <div style={S.card}>
          <div style={S.cardTitle}>Step 1 — Seller Initiates Transfer</div>
          <form onSubmit={handleInitiate}>
            <div style={S.formGroup}>
              <label style={S.label}>Vehicle VIN</label>
              <input
                style={S.input}
                placeholder="1HGBH41JXMN109186"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
              />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Buyer Address</label>
              <input
                style={S.input}
                placeholder="0x..."
                value={buyer}
                onChange={(e) => setBuyer(e.target.value)}
              />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Price in ETH (0 = gift)</label>
              <input
                style={S.input}
                type="number"
                step="0.001"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <button
              type="submit"
              style={{ ...S.btnPrimary, width: "100%", justifyContent: "center" }}
              disabled={loading}
            >
              {loading ? <><Spinner /> Processing…</> : "Initiate Transfer"}
            </button>
          </form>
        </div>

        {/* ── Step 2: Approve / Cancel + Rules ── */}
        <div>
          <div style={S.card}>
            <div style={S.cardTitle}>Step 2 — Buyer Approves Transfer</div>

            <div style={S.formGroup}>
              <label style={S.label}>Transfer ID</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={S.inputFlex}
                  type="number"
                  placeholder="e.g. 1"
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                />
                <button
                  type="button"
                  style={S.btnGhost}
                  onClick={lookupTransfer}
                  disabled={loading}
                >
                  {loading ? <Spinner /> : "Lookup"}
                </button>
              </div>
            </div>

            {detail && (
              <div style={S.detailBox}>
                <div>VIN: <strong style={{ color: "var(--text)" }}>{detail.vin}</strong></div>
                <div>Seller: {shortAddress(detail.seller)}</div>
                <div>Buyer: {shortAddress(detail.buyer)}</div>
                <div>Price: {detail.price > 0n ? `${ethers.formatEther(detail.price)} ETH` : "Gift"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  Status:&nbsp;
                  <span style={BADGE_STYLE[Number(detail.status)]}>
                    {STATUS_LABEL[Number(detail.status)]}
                  </span>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                style={{ ...S.btnSuccess, flex: 1, justifyContent: "center" }}
                disabled={loading}
                onClick={handleApprove}
              >
                {loading ? <Spinner /> : "✓ Approve & Complete"}
              </button>
              <button
                style={S.btnDanger}
                disabled={loading}
                onClick={handleCancel}
              >
                ✕ Cancel
              </button>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.cardTitle}>Transfer Rules</div>
            <div>
              <div style={S.rulesItem}>· Stolen vehicles <strong style={{ color: "#CC2222" }}>cannot be transferred</strong></div>
              <div style={S.rulesItem}>· Only one pending transfer per vehicle</div>
              <div style={S.rulesItem}>· Buyer must approve within the window</div>
              <div style={S.rulesItem}>· Payment goes directly to seller (no middleman)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}