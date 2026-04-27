// src/pages/TransferPage.jsx
import React, { useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../utils/Web3Context";

const STATUS_LABEL = ["PENDING", "APPROVED", "CANCELLED", "COMPLETED"];
const STATUS_COLOR = ["amber", "blue", "red", "green"];

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

  if (!isConnected) return <div className="alert alert-warn">Connect MetaMask first.</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⇄ Ownership Transfer</h1>
        <p className="page-sub">Secure two-step vehicle ownership transfer on-chain</p>
      </div>

      {msg && <div className={`alert alert-${msg.type === "success" ? "success" : "error"}`}>{msg.text}</div>}

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* Initiate */}
        <div className="card">
          <div className="card-title">Step 1 — Seller Initiates Transfer</div>
          <form onSubmit={handleInitiate}>
            <div className="form-group">
              <label className="label">Vehicle VIN</label>
              <input className="input" placeholder="1HGBH41JXMN109186" value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())} />
            </div>
            <div className="form-group">
              <label className="label">Buyer Address</label>
              <input className="input" placeholder="0x..." value={buyer}
                onChange={(e) => setBuyer(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Price in ETH (0 = gift)</label>
              <input className="input" type="number" step="0.001" placeholder="0.00" value={price}
                onChange={(e) => setPrice(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
              {loading ? <><span className="spinner" /> Processing…</> : "Initiate Transfer"}
            </button>
          </form>
        </div>

        {/* Approve / Cancel */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">Step 2 — Buyer Approves Transfer</div>
            <div className="form-group">
              <label className="label">Transfer ID</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="input" type="number" placeholder="e.g. 1" value={txId}
                  onChange={(e) => setTxId(e.target.value)} />
                <button type="button" className="btn btn-ghost btn-sm" onClick={lookupTransfer}>
                  Lookup
                </button>
              </div>
            </div>

            {detail && (
              <div style={{ marginBottom: 16, padding: 14, background: "var(--bg3)", borderRadius: 8, fontSize: 13, fontFamily: "var(--mono)" }}>
                <div>VIN: <strong>{detail.vin}</strong></div>
                <div>Seller: {shortAddress(detail.seller)}</div>
                <div>Buyer: {shortAddress(detail.buyer)}</div>
                <div>Price: {detail.price > 0n ? `${ethers.formatEther(detail.price)} ETH` : "Gift"}</div>
                <div>
                  Status: <span className={`badge badge-${STATUS_COLOR[Number(detail.status)]}`}>{STATUS_LABEL[Number(detail.status)]}</span>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-success" disabled={loading} onClick={handleApprove} style={{ flex: 1 }}>
                ✓ Approve & Complete
              </button>
              <button className="btn btn-danger btn-sm" disabled={loading} onClick={handleCancel}>
                ✕ Cancel
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-title">ℹ Transfer Rules</div>
            <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.8 }}>
              <div>• Stolen vehicles <strong style={{ color: "var(--red)" }}>cannot be transferred</strong></div>
              <div>• Only one pending transfer per vehicle</div>
              <div>• Buyer must approve within the window</div>
              <div>• Payment goes directly to seller (no middleman)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
