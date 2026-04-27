// src/pages/TokenPage.jsx
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../utils/Web3Context";

export default function TokenPage({ navigate }) {
  const { contracts, account, isConnected, formatToken, parseToken, shortAddress } = useWeb3();

  const [bal,       setBal]       = useState("0");
  const [staked,    setStaked]    = useState("0");
  const [total,     setTotal]     = useState("0");
  const [loading,   setLoading]   = useState(false);
  const [msg,       setMsg]       = useState(null);

  const [mintTo,    setMintTo]    = useState("");
  const [mintAmt,   setMintAmt]   = useState("");
  const [sendTo,    setSendTo]    = useState("");
  const [sendAmt,   setSendAmt]   = useState("");
  const [stakeAmt,  setStakeAmt]  = useState("");
  const [unstakeAmt,setUnstakeAmt]= useState("");

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

  if (!isConnected) return <div className="alert alert-warn">Connect MetaMask first.</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🪙 Token Dashboard</h1>
        <p className="page-sub">VehicleChain Token (VCT) — ERC-20 Governance Token</p>
      </div>

      {msg && <div className={`alert alert-${msg.type === "success" ? "success" : "error"}`}>{msg.text}</div>}

      {/* Balances */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card stat-box">
          <div className="stat-num" style={{ color: "var(--green)" }}>{bal}</div>
          <div className="stat-label">VCT Balance</div>
        </div>
        <div className="card stat-box">
          <div className="stat-num" style={{ color: "var(--amber)" }}>{staked}</div>
          <div className="stat-label">Staked (Locked)</div>
        </div>
        <div className="card stat-box">
          <div className="stat-num" style={{ color: "var(--text2)", fontSize: 22 }}>{total}</div>
          <div className="stat-label">Total Supply</div>
        </div>
      </div>

      {/* Token Info */}
      <div className="alert alert-info" style={{ marginBottom: 24 }}>
        <div>
          <strong>VCT Utility:</strong> Stake 10 VCT to file disputes · Vote weight = token balance · 
          Earn 5 VCT for correct votes · 2 VCT burned for wrong votes · Service centers earn tokens for valid updates
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* Stake / Unstake */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">🔒 Stake Tokens (for DAO)</div>
            <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 16 }}>
              Staking locks your VCT and grants you the right to file disputes. Min 10 VCT required.
            </p>
            <form onSubmit={handleStake} style={{ display: "flex", gap: 8 }}>
              <input className="input" type="number" placeholder="Amount to stake" value={stakeAmt}
                onChange={(e) => setStakeAmt(e.target.value)} />
              <button type="submit" className="btn btn-amber" disabled={loading} style={{ whiteSpace: "nowrap" }}>
                🔒 Stake
              </button>
            </form>
          </div>

          <div className="card">
            <div className="card-title">🔓 Unstake Tokens</div>
            <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 16 }}>
              Unstake VCT to make it liquid again. Cannot unstake tokens locked by an active dispute.
            </p>
            <form onSubmit={handleUnstake} style={{ display: "flex", gap: 8 }}>
              <input className="input" type="number" placeholder="Amount to unstake" value={unstakeAmt}
                onChange={(e) => setUnstakeAmt(e.target.value)} />
              <button type="submit" className="btn btn-ghost" disabled={loading} style={{ whiteSpace: "nowrap" }}>
                🔓 Unstake
              </button>
            </form>
          </div>
        </div>

        <div>
          {/* Send */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">📤 Send VCT</div>
            <form onSubmit={handleSend}>
              <div className="form-group">
                <label className="label">Recipient Address</label>
                <input className="input" placeholder="0x..." value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Amount (VCT)</label>
                <input className="input" type="number" placeholder="0.00" value={sendAmt}
                  onChange={(e) => setSendAmt(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
                Send VCT
              </button>
            </form>
          </div>

          {/* Mint (Admin) */}
          <div className="card">
            <div className="card-title">⚙ Mint Tokens (Admin Only)</div>
            <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 16 }}>
              Only the contract admin can mint new VCT tokens.
            </p>
            <form onSubmit={handleMint}>
              <div className="form-group">
                <label className="label">Recipient Address</label>
                <input className="input" placeholder="0x..." value={mintTo}
                  onChange={(e) => setMintTo(e.target.value)} />
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 6 }}
                  onClick={() => setMintTo(account)}>
                  Use My Address
                </button>
              </div>
              <div className="form-group">
                <label className="label">Amount (VCT)</label>
                <input className="input" type="number" placeholder="1000" value={mintAmt}
                  onChange={(e) => setMintAmt(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-success" disabled={loading} style={{ width: "100%" }}>
                {loading ? <><span className="spinner" /> Minting…</> : "Mint VCT"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
