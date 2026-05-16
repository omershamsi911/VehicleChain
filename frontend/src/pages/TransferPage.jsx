// src/pages/TransferPage.jsx
import React, { useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../utils/Web3Context";
import S from "../styles/shared";

const STATUS_LABEL = ["PENDING", "APPROVED", "CANCELLED", "COMPLETED"];
const BADGE_FOR_STATUS = [S.badgeAmber, S.badgeBlue, S.badgeRed, S.badgeGreen];

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

  if (!isConnected) return (
    <div style={S.alertWarnConnect}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🔐</div>
      Connect MetaMask to manage transfers.
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.pageHeader}>
        <span style={S.pageEyebrow}>On-Chain · Two-Step</span>
        <h1 style={S.pageTitle}>Ownership Transfer</h1>
        <p style={S.pageSub}>Secure two-step vehicle ownership transfer on-chain</p>
      </div>

      {msg && (
        <div style={msg.type === "success" ? S.alertSuccess : S.alertError}>
          {msg.type === "success" ? "✓ " : "✕ "}{msg.text}
        </div>
      )}

      <div style={S.grid2}>
        {/* Step 1 */}
        <div style={S.card}>
          <div style={S.cardTitle}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 22, height: 22, borderRadius: "50%",
              background: "var(--accent)", color: "#fff",
              fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)",
            }}>1</span>
            Seller Initiates Transfer
          </div>
          <form onSubmit={handleInitiate}>
            <div style={S.formGroup}>
              <label style={S.label}>Vehicle VIN</label>
              <input
                style={{ ...S.input, fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}
                placeholder="1HGBH41JXMN109186"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
              />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Buyer Address</label>
              <input style={S.input} placeholder="0x..." value={buyer} onChange={e => setBuyer(e.target.value)} />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Price in ETH (0 = gift)</label>
              <input style={S.input} type="number" step="0.001" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
            <button type="submit" style={{ ...S.btnFullPrimary, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? <><Spinner /> Processing…</> : "Initiate Transfer →"}
            </button>
          </form>
        </div>

        {/* Step 2 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={S.card}>
            <div style={S.cardTitle}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 22, height: 22, borderRadius: "50%",
                background: "var(--accent)", color: "#fff",
                fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)",
              }}>2</span>
              Buyer Approves Transfer
            </div>

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
                <button type="button" style={S.btnSecondary} onClick={lookupTransfer} disabled={loading}>
                  Lookup
                </button>
              </div>
            </div>

            {detail && (
              <div style={{
                padding: 16,
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                marginBottom: 16,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                lineHeight: 2,
                color: "var(--text-secondary)",
              }}>
                <div>VIN: <strong style={{ color: "var(--text)" }}>{detail.vin}</strong></div>
                <div>Seller: {shortAddress(detail.seller)}</div>
                <div>Buyer: {shortAddress(detail.buyer)}</div>
                <div>Price: {detail.price > 0n ? `${ethers.formatEther(detail.price)} ETH` : "Gift"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  Status: <span style={BADGE_FOR_STATUS[Number(detail.status)]}>{STATUS_LABEL[Number(detail.status)]}</span>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...S.btnSuccess, flex: 1, justifyContent: "center" }} disabled={loading} onClick={handleApprove}>
                {loading ? <Spinner /> : "✓ Approve & Complete"}
              </button>
              <button style={S.btnDanger} disabled={loading} onClick={handleCancel}>
                ✕ Cancel
              </button>
            </div>
          </div>

          {/* Rules */}
          <div style={{ ...S.card, background: "var(--accent-light)", border: "1px solid var(--border-strong)" }}>
            <div style={{ ...S.cardTitle, borderBottomColor: "var(--border-strong)" }}>📋 Transfer Rules</div>
            {[
              { icon: "🚫", text: "Stolen vehicles cannot be transferred" },
              { icon: "1️⃣", text: "Only one pending transfer per vehicle" },
              { icon: "⏳", text: "Buyer must approve within the window" },
              { icon: "💸", text: "Payment goes directly to seller (no middleman)" },
            ].map(({ icon, text }) => (
              <div key={text} style={{
                display: "flex", gap: 10, alignItems: "flex-start",
                padding: "7px 0",
                borderBottom: "1px solid var(--border)",
                fontSize: 13,
                color: "var(--text-secondary)",
                lineHeight: 1.5,
              }}>
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}