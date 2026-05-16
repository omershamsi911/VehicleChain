// src/pages/TokenPage.jsx
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../utils/Web3Context";
import S from "../styles/shared";

function Spinner() {
  return (
    <span style={{
      width: 14, height: 14,
      borderRadius: "50%",
      border: "2px solid rgba(255,255,255,0.3)",
      borderTopColor: "#fff",
      display: "inline-block",
      animation: "spin 0.7s linear infinite",
      flexShrink: 0,
    }} />
  );
}

export default function TokenPage({ navigate }) {
  const { contracts, account, isConnected, formatToken, parseToken, shortAddress } = useWeb3();

  const [bal, setBal] = useState("0");
  const [staked, setStaked] = useState("0");
  const [total, setTotal] = useState("0");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const [mintTo, setMintTo] = useState("");
  const [mintAmt, setMintAmt] = useState("");
  const [sendTo, setSendTo] = useState("");
  const [sendAmt, setSendAmt] = useState("");
  const [stakeAmt, setStakeAmt] = useState("");
  const [unstakeAmt, setUnstakeAmt] = useState("");

  const showMsg = (type, text) => setMsg({ type, text });

  useEffect(() => {
    if (isConnected && contracts.govToken) loadTokenData();
  }, [isConnected, contracts, account]);

  const loadTokenData = async () => {
    try {
      const [b, s, t] = await Promise.all([
        contracts.govToken.balanceOf(account),
        contracts.govToken.stakedBalance(account),
        contracts.govToken.totalSupply(),
      ]);
      setBal(formatToken(b));
      setStaked(formatToken(s));
      setTotal(formatToken(t));
    } catch (err) {
      console.error(err);
    }
  };

  const exec = async (action, successMsg) => {
    setMsg(null);
    setLoading(true);
    try {
      const tx = await action();
      await tx.wait();
      showMsg("success", successMsg);
      await loadTokenData();
    } catch (err) {
      showMsg("error", err.reason || err.message);
    }
    setLoading(false);
  };

  const handleMint = (e) => {
    e.preventDefault();
    if (!mintTo || !mintAmt) return showMsg("error", "Address and amount required.");
    exec(
      () => contracts.govToken.mint(mintTo, parseToken(mintAmt)),
      `Minted ${mintAmt} VCT to ${shortAddress(mintTo)}`
    );
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!sendTo || !sendAmt) return showMsg("error", "Address and amount required.");
    exec(
      () => contracts.govToken.transfer(sendTo, parseToken(sendAmt)),
      `Sent ${sendAmt} VCT to ${shortAddress(sendTo)}`
    );
  };

  const handleStake = (e) => {
    e.preventDefault();
    if (!stakeAmt) return showMsg("error", "Amount required.");
    exec(
      () => contracts.govToken.stake(parseToken(stakeAmt)),
      `Staked ${stakeAmt} VCT for DAO participation`
    );
  };

  const handleUnstake = (e) => {
    e.preventDefault();
    if (!unstakeAmt) return showMsg("error", "Amount required.");
    exec(
      () => contracts.govToken.unstake(parseToken(unstakeAmt)),
      `Unstaked ${unstakeAmt} VCT`
    );
  };

  if (!isConnected) {
    return (
      <div style={S.page}>
        <div style={S.alertWarnConnect}>Connect MetaMask first.</div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      {/* Page Header */}
      <div style={S.pageHeader}>
        <span style={S.pageEyebrow}>ERC-20 · Governance</span>
        <h1 style={S.pageTitle}>Token Dashboard</h1>
        <p style={S.pageSub}>VehicleChain Token (VCT)</p>
      </div>

      {msg && (
        <div style={msg.type === "success" ? S.alertSuccess : S.alertError}>
          {msg.text}
        </div>
      )}

      {/* Stats Row */}
      <div style={S.statsGrid}>
        <div style={S.statCard}>
          <span style={{ ...S.statNum, color: "var(--accent)" }}>{bal}</span>
          <span style={S.statLabel}>VCT Balance</span>
        </div>
        <div style={S.statCard}>
          <span style={{ ...S.statNum, color: "var(--text)" }}>{staked}</span>
          <span style={S.statLabel}>Staked (Locked)</span>
        </div>
        <div style={S.statCard}>
          <span style={{ ...S.statNum, color: "var(--text-muted)", fontSize: 32 }}>{total}</span>
          <span style={S.statLabel}>Total Supply</span>
        </div>
      </div>

      {/* Token Info */}
      <div style={S.alertInfo}>
        <strong>VCT Utility:</strong> Stake 10 VCT to file disputes · Vote weight = token balance ·
        Earn 5 VCT for correct votes · 2 VCT burned for wrong votes · Service centers earn tokens for valid updates
      </div>

      <div style={S.grid2}>
        {/* Left: Stake / Unstake */}
        <div>
          <div style={S.card}>
            <div style={S.cardTitle}>Stake Tokens</div>
            <p style={{ color: "var(--text-secondary)", marginBottom: 16, fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.6 }}>
              Staking locks your VCT and grants you the right to file disputes. Min 10 VCT required.
            </p>
            <form onSubmit={handleStake} style={{ display: "flex", gap: 8 }}>
              <input
                style={S.inputFlex}
                type="number"
                placeholder="Amount to stake"
                value={stakeAmt}
                onChange={(e) => setStakeAmt(e.target.value)}
              />
              <button type="submit" style={S.btnPrimary} disabled={loading}>
                {loading ? <Spinner /> : "🔒 Stake"}
              </button>
            </form>
          </div>

          <div style={S.card}>
            <div style={S.cardTitle}>Unstake Tokens</div>
            <p style={{ color: "var(--text-secondary)", marginBottom: 16, fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.6 }}>
              Unstake VCT to make it liquid again. Cannot unstake tokens locked by an active dispute.
            </p>
            <form onSubmit={handleUnstake} style={{ display: "flex", gap: 8 }}>
              <input
                style={S.inputFlex}
                type="number"
                placeholder="Amount to unstake"
                value={unstakeAmt}
                onChange={(e) => setUnstakeAmt(e.target.value)}
              />
              <button type="submit" style={S.btnGhost} disabled={loading}>
                {loading ? <Spinner /> : "🔓 Unstake"}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Send / Mint */}
        <div>
          <div style={S.card}>
            <div style={S.cardTitle}>Send VCT</div>
            <form onSubmit={handleSend}>
              <div style={S.formGroup}>
                <label style={S.label}>Recipient Address</label>
                <input
                  style={S.input}
                  placeholder="0x..."
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                />
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>Amount (VCT)</label>
                <input
                  style={S.input}
                  type="number"
                  placeholder="0.00"
                  value={sendAmt}
                  onChange={(e) => setSendAmt(e.target.value)}
                />
              </div>
              <button
                type="submit"
                style={{ ...S.btnPrimary, width: "100%", justifyContent: "center" }}
                disabled={loading}
              >
                {loading ? <><Spinner /> Sending…</> : "Send VCT"}
              </button>
            </form>
          </div>

          <div style={S.card}>
            <div style={S.cardTitle}>Mint Tokens — Admin Only</div>
            <p style={{ color: "var(--text-secondary)", marginBottom: 16, fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.6 }}>
              Only the contract admin can mint new VCT tokens.
            </p>
            <form onSubmit={handleMint}>
              <div style={S.formGroup}>
                <label style={S.label}>Recipient Address</label>
                <input
                  style={S.input}
                  placeholder="0x..."
                  value={mintTo}
                  onChange={(e) => setMintTo(e.target.value)}
                />
                <button
                  type="button"
                  style={{ ...S.btnSecondary, marginTop: 8, padding: "4px 12px", fontSize: 10 }}
                  onClick={() => setMintTo(account)}
                >
                  Use My Address
                </button>
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>Amount (VCT)</label>
                <input
                  style={S.input}
                  type="number"
                  placeholder="1000"
                  value={mintAmt}
                  onChange={(e) => setMintAmt(e.target.value)}
                />
              </div>
              <button
                type="submit"
                style={{ ...S.btnSuccess, width: "100%", justifyContent: "center" }}
                disabled={loading}
              >
                {loading ? <><Spinner /> Minting…</> : "Mint VCT"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}