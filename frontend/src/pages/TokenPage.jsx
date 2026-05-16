// src/pages/TokenPage.jsx
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../utils/Web3Context";

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

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 24,
  },

  statCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    padding: "28px 32px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  statNum: {
    fontFamily: "var(--font-serif)",
    fontSize: 40,
    fontWeight: 700,
    lineHeight: 1,
  },

  statLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
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

  btnAccent: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    background: "var(--accent)",
    border: "none",
    borderRadius: 999,
    color: "var(--text)",
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

  btnSmGhost: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: 999,
    color: "var(--text-muted)",
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    padding: "5px 12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    marginTop: 6,
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

  alertInfo: {
    padding: "14px 20px",
    background: "rgba(11,11,11,0.04)",
    border: "1px solid var(--border)",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "var(--text)",
    marginBottom: 24,
    lineHeight: 1.7,
  },

  bodySmall: {
    fontSize: 13,
    color: "var(--text-muted)",
    marginBottom: 16,
    lineHeight: 1.6,
    fontFamily: "var(--font-sans)",
  },
};

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
export default function TokenPage({ navigate }) {
  const { contracts, account, isConnected, formatToken, parseToken, shortAddress } = useWeb3();

  const [bal,        setBal]        = useState("0");
  const [staked,     setStaked]     = useState("0");
  const [total,      setTotal]      = useState("0");
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
      <div style={{ padding: "48px 40px" }}>
        <div style={S.alertWarn}>Connect MetaMask first.</div>
      </div>
    );
  }

  return (
    <div style={S.page}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 40 }}>
        <span style={S.microLabel}>ERC-20 · Governance</span>
        <h1 style={S.pageTitle}>Token Dashboard</h1>
        <p style={S.pageSub}>VehicleChain Token (VCT)</p>
      </div>

      {msg && (
        <div style={msg.type === "success" ? S.alertSuccess : S.alertError}>
          {msg.text}
        </div>
      )}

      {/* ── Stats Row ── */}
      <div style={S.statsGrid}>
        <div style={S.statCard}>
          <span style={{ ...S.statNum, color: "#1A7A4A" }}>{bal}</span>
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

      {/* ── Token Info ── */}
      <div style={S.alertInfo}>
        <strong>VCT Utility:</strong> Stake 10 VCT to file disputes · Vote weight = token balance ·
        Earn 5 VCT for correct votes · 2 VCT burned for wrong votes · Service centers earn tokens for valid updates
      </div>

      <div style={S.grid2}>

        {/* ── Left: Stake / Unstake ── */}
        <div>
          <div style={S.card}>
            <div style={S.cardTitle}>Stake Tokens</div>
            <p style={S.bodySmall}>
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
              <button type="submit" style={S.btnAccent} disabled={loading}>
                {loading ? <Spinner /> : "🔒 Stake"}
              </button>
            </form>
          </div>

          <div style={S.card}>
            <div style={S.cardTitle}>Unstake Tokens</div>
            <p style={S.bodySmall}>
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

        {/* ── Right: Send / Mint ── */}
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
            <p style={S.bodySmall}>Only the contract admin can mint new VCT tokens.</p>
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
                  style={S.btnSmGhost}
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