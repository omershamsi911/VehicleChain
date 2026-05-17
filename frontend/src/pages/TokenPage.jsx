// src/pages/TokenPage.jsx
import React, { useState, useEffect } from "react";
import { useWeb3 } from "../utils/Web3Context";
import S from "../styles/shared";

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

export default function TokenPage() {
  const { contracts, account, isConnected, formatToken, parseToken, shortAddress } = useWeb3();

  const [bal,        setBal]        = useState("0");
  const [staked,     setStaked]     = useState("0");
  const [total,      setTotal]      = useState("0");
  const [isMinter,   setIsMinter]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [msg,        setMsg]        = useState(null);

  const [mintTo,     setMintTo]     = useState("");
  const [mintAmt,    setMintAmt]    = useState("");
  const [sendTo,     setSendTo]     = useState("");
  const [sendAmt,    setSendAmt]    = useState("");
  const [stakeAmt,   setStakeAmt]   = useState("");
  const [unstakeAmt, setUnstakeAmt] = useState("");

  const showMsg = (type, text) => setMsg({ type, text });

  useEffect(() => {
    if (isConnected && contracts.govToken) {
      loadTokenData();
    }
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

      // Only show mint panel if wallet holds MINTER_ROLE
      const MINTER_ROLE = await contracts.govToken.MINTER_ROLE();
      const hasMinter = await contracts.govToken.hasRole(MINTER_ROLE, account);
      setIsMinter(hasMinter);
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
      await loadTokenData(); // Refresh balances
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
      `Staked ${stakeAmt} VCT — you can now raise disputes (if you are a validator)`
    );
  };

  const handleUnstake = (e) => {
    e.preventDefault();
    if (!unstakeAmt) return showMsg("error", "Amount required.");
    exec(
      () => contracts.govToken.unstake(parseToken(unstakeAmt)), 
      `Unstaked ${unstakeAmt} VCT back to liquid balance`
    );
  };

  if (!isConnected) return (
    <div style={S.page}><div style={S.alertWarnConnect}>Connect MetaMask first.</div></div>
  );

  return (
    <div style={S.page}>
      <div style={S.pageHeader}>
        <span style={S.pageEyebrow}>ERC-20 · Governance</span>
        <h1 style={S.pageTitle}>Token Dashboard</h1>
        <p style={S.pageSub}>VehicleChain Token (VCT)</p>
      </div>

      {msg && (
        <div style={msg.type === "success" ? S.alertSuccess : S.alertError}>
          {msg.type === "success" ? "✓ " : "✕ "} {msg.text}
        </div>
      )}

      {/* Stats */}
      <div style={S.statsGrid}>
        <div style={S.statCard}>
          <span style={{ ...S.statNum, color: "var(--accent)" }}>{bal}</span>
          <span style={S.statLabel}>Liquid VCT Balance</span>
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

      {/* Token info — Correct economics aligned with DisputeDAO.sol */}
      <div style={S.alertInfo}>
        <strong>VCT Utility:</strong> Stake 10 VCT to raise disputes (validators only) ·
        Vote weight snapshotted at proposal creation — buying tokens after has no effect ·
        Max 20% weight per validator · Earn <strong>3 VCT</strong> for correct votes ·
        <strong> 5 VCT burned</strong> for wrong votes · Net deflationary per dispute
      </div>

      <div style={S.grid2}>
        {/* Left Column: Stake / Unstake */}
        <div>
          <div style={S.card}>
            <div style={S.cardTitle}>🔒 Stake Tokens</div>
            <p style={{ color: "var(--text-secondary)", marginBottom: 16, fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.6 }}>
              Staking burns VCT from your liquid balance and records it in the staked ledger.
              Minimum 10 VCT required to raise a dispute. Staked tokens cannot be transferred.
            </p>
            <form onSubmit={handleStake} style={{ display: "flex", gap: 8 }}>
              <input style={S.inputFlex} type="number" placeholder="Amount to stake"
                value={stakeAmt} onChange={(e) => setStakeAmt(e.target.value)} />
              <button type="submit" style={S.btnPrimary} disabled={loading}>
                {loading ? <Spinner /> : "🔒 Stake"}
              </button>
            </form>
          </div>

          <div style={S.card}>
            <div style={S.cardTitle}>🔓 Unstake Tokens</div>
            <p style={{ color: "var(--text-secondary)", marginBottom: 16, fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.6 }}>
              Returns staked VCT to liquid balance. Cannot unstake tokens locked by an active dispute.
            </p>
            <form onSubmit={handleUnstake} style={{ display: "flex", gap: 8 }}>
              <input style={S.inputFlex} type="number" placeholder="Amount to unstake"
                value={unstakeAmt} onChange={(e) => setUnstakeAmt(e.target.value)} />
              <button type="submit" style={S.btnGhost} disabled={loading}>
                {loading ? <Spinner /> : "🔓 Unstake"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Send + Minting */}
        <div>
          <div style={S.card}>
            <div style={S.cardTitle}>📤 Send VCT</div>
            <form onSubmit={handleSend}>
              <div style={S.formGroup}>
                <label style={S.label}>Recipient Address</label>
                <input style={S.input} placeholder="0x..." value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)} />
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>Amount (VCT)</label>
                <input style={S.input} type="number" placeholder="0.00" value={sendAmt}
                  onChange={(e) => setSendAmt(e.target.value)} />
              </div>
              <button type="submit" style={{ ...S.btnPrimary, width: "100%", justifyContent: "center" }} disabled={loading}>
                {loading ? <><Spinner /> Sending…</> : "Send VCT"}
              </button>
            </form>
          </div>

          {/* Mint panel — only rendered if wallet holds MINTER_ROLE */}
          {isMinter ? (
            <div style={S.card}>
              <div style={S.cardTitle}>⚙ Mint Tokens</div>
              <div style={{ ...S.alertError, background: "rgba(220,38,38,0.04)", fontSize: 12, marginBottom: 16 }}>
                ⚠ Your address holds MINTER_ROLE. In production this role belongs only to the
                DisputeDAO contract. Revoke it from your wallet before mainnet deployment.
              </div>
              <form onSubmit={handleMint}>
                <div style={S.formGroup}>
                  <label style={S.label}>Recipient Address</label>
                  <input style={S.input} placeholder="0x..." value={mintTo}
                    onChange={(e) => setMintTo(e.target.value)} />
                  <button type="button" style={{ ...S.btnSecondary, marginTop: 8, padding: "4px 12px", fontSize: 10 }}
                    onClick={() => setMintTo(account)}>
                    Use My Address
                  </button>
                </div>
                <div style={S.formGroup}>
                  <label style={S.label}>Amount (VCT)</label>
                  <input style={S.input} type="number" placeholder="1000" value={mintAmt}
                    onChange={(e) => setMintAmt(e.target.value)} />
                </div>
                <button type="submit" style={{ ...S.btnSuccess, width: "100%", justifyContent: "center" }} disabled={loading}>
                  {loading ? <><Spinner /> Minting…</> : "Mint VCT"}
                </button>
              </form>
            </div>
          ) : (
            <div style={{ ...S.card, background: "var(--accent-light)", border: "1px solid var(--border-strong)" }}>
              <div style={S.cardTitle}>⚙ Minting</div>
              <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.7 }}>
                VCT minting is role-gated. Only the <strong>DisputeDAO contract</strong> holds
                MINTER_ROLE and can mint tokens — exclusively as rewards for honest validators
                after a dispute resolves. This prevents unilateral inflation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}