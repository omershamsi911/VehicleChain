// src/pages/DAOPage.jsx
import React, { useState, useEffect } from "react";
import { useWeb3 } from "../utils/Web3Context";
import S from "../styles/shared";

const STATUS_LABELS = ["ACTIVE", "PASSED", "REJECTED", "EXECUTED", "CANCELLED"];
const STATUS_ICONS  = ["🗳", "✅", "❌", "⚡", "🚫"];
const STATUS_BADGE_STYLES = [
  // active amber
  { fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#b45309", background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.20)", padding: "3px 9px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4 },
  // passed green
  { fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#15803d", background: "rgba(22,163,74,0.10)", border: "1px solid rgba(22,163,74,0.25)", padding: "3px 9px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4 },
  // rejected red
  { fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#dc2626", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.20)", padding: "3px 9px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4 },
  // executed blue
  { fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1d4ed8", background: "rgba(29,78,216,0.07)", border: "1px solid rgba(29,78,216,0.18)", padding: "3px 9px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4 },
  // cancelled muted
  { fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", background: "var(--bg-secondary)", border: "1px solid var(--border)", padding: "3px 9px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4 },
];

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

export default function DAOPage({ navigate }) {
  const { contracts, account, isConnected, shortAddress, formatToken } = useWeb3();

  const [proposals, setProposals] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [msg,       setMsg]       = useState(null);
  const [minStake,  setMinStake]  = useState("10");
  const [dVin,      setDVin]      = useState("");
  const [dDesc,     setDDesc]     = useState("");

  const showMsg = (type, text) => setMsg({ type, text });

  useEffect(() => {
    if (isConnected && contracts.disputeDAO && contracts.govToken) {
      loadAll();
    }
  }, [isConnected, contracts, account]);

  const loadAll = async () => {
    setLoading(true);
    try {
      // Check validator status for connected wallet
      const VALIDATOR_ROLE = await contracts.disputeDAO.VALIDATOR_ROLE();
      const validatorStatus = await contracts.disputeDAO.hasRole(VALIDATOR_ROLE, account);
      setIsValidator(validatorStatus);

      // Load staked balance (needed to raise disputes)
      const staked = await contracts.govToken.stakedBalance(account);
      setStakedBal(formatToken(staked));

      const ms = await contracts.disputeDAO.MIN_STAKE();
      setMinStake(formatToken(ms));

      await loadProposals();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const loadProposals = async () => {
    try {
      const count = await contracts.disputeDAO.proposalCount();
      const ms    = await contracts.disputeDAO.MIN_STAKE();
      setMinStake(formatToken(ms));
      const all = [];

      for (let i = Number(count); i >= 1; i--) {
        const p      = await contracts.disputeDAO.getProposal(i);
        const myVote = await contracts.disputeDAO.getVote(i, account);
        all.push({ ...p, myVote });
      }
      setProposals(all);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleRaiseDispute = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!dVin || !dDesc) return showMsg("error", "VIN and description are required.");
    if (!isValidator)     return showMsg("error", "Only whitelisted validators can raise disputes.");
    setLoading(true);
    try {
      const tx = await contracts.disputeDAO.raiseDispute(dVin.toUpperCase(), dDesc);
      await tx.wait();
      showMsg("success", "Dispute raised. Validator voting period started (3 days).");
      setDVin(""); setDDesc("");
      await loadProposals();
    } catch (err) { showMsg("error", err.reason || err.message); }
    setLoading(false);
  };

  const handleVote = async (proposalId, inFavor) => {
    setMsg(null); setLoading(true);
    try {
      const tx = await contracts.disputeDAO.vote(proposalId, inFavor);
      await tx.wait();
      showMsg("success", `Vote cast: ${inFavor ? "FOR ✓" : "AGAINST ✗"}`);
      await loadProposals();
    } catch (err) { showMsg("error", err.reason || err.message); }
    setLoading(false);
  };

  const handleFinalize = async (proposalId) => {
    setLoading(true);
    try {
      const tx = await contracts.disputeDAO.finalizeProposal(proposalId);
      await tx.wait();
      showMsg("success", "Proposal finalized.");
      await loadProposals();
    } catch (err) { showMsg("error", err.reason || err.message); }
    setLoading(false);
  };

  const handleDistributeRewards = async (proposalId) => {
    setLoading(true);
    try {
      const tx = await contracts.disputeDAO.distributeRewards(proposalId);
      await tx.wait();
      showMsg("success", "Rewards distributed to honest validators.");
      await loadProposals();
    } catch (err) { showMsg("error", err.reason || err.message); }
    setLoading(false);
  };

  const handleExecute = async (proposalId) => {
    setLoading(true);
    try {
      const tx = await contracts.disputeDAO.executeProposal(proposalId);
      await tx.wait();
      showMsg("success", "Proposal executed.");
      await loadProposals();
    } catch (err) { showMsg("error", err.reason || err.message); }
    setLoading(false);
  };

  const timeLeft = (endTime) => {
    const diff = Number(endTime) * 1000 - Date.now();
    if (diff <= 0) return "Voting ended";
    const hours = Math.floor(diff / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m remaining`;
  };

  const votePercent = (proposal) => {
    const total = Number(proposal.votesFor) + Number(proposal.votesAgainst);
    if (total === 0) return { forPct: 0, againstPct: 0 };
    return {
      forPct:     Math.round((Number(proposal.votesFor) / total) * 100),
      againstPct: Math.round((Number(proposal.votesAgainst) / total) * 100),
    };
  };

  if (!isConnected) return (
    <div style={S.alertWarnConnect}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🔐</div>
      Connect MetaMask to participate in governance.
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.pageHeader}>
        <span style={S.pageEyebrow}>Token-Weighted · Governance</span>
        <h1 style={S.pageTitle}>Dispute DAO</h1>
        <p style={S.pageSub}>Token-weighted governance for vehicle disputes</p>
      </div>

      {msg && (
        <div style={msg.type === "success" ? S.alertSuccess : S.alertError}>
          {msg.type === "success" ? "✓ " : "✕ "}{msg.text}
        </div>
      )}

      <div style={S.grid2}>
        {/* Raise Dispute */}
        <div style={S.card}>
          <div style={S.cardTitle}>⚖ Raise Dispute</div>
          <div style={S.alertInfo}>
            ⓘ Requires {minStake} VCT staked. Go to Token Dashboard to stake first.
          </div>
          <form onSubmit={handleRaiseDispute}>
            <div style={S.formGroup}>
              <label style={S.label}>Vehicle VIN in Dispute</label>
              <input
                style={{ ...S.input, fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}
                placeholder="1HGBH41JXMN109186"
                value={dVin}
                onChange={(e) => setDVin(e.target.value.toUpperCase())}
              />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Dispute Description</label>
              <textarea
                style={{ ...S.textarea, minHeight: 100 }}
                rows={4}
                placeholder="Describe the dispute: ownership claim, fraudulent record, incorrect VIN..."
                value={dDesc}
                onChange={(e) => setDDesc(e.target.value)}
              />
            </div>
            <button
              type="submit"
              style={{ ...S.btnFullPrimary, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? <><Spinner /> Processing…</> : `⚖ Raise Dispute (Stake ${minStake} VCT)`}
            </button>
          </form>
        </div>

        {/* DAO Parameters */}
        <div style={{ ...S.card, background: "var(--accent-light)", border: "1px solid var(--border-strong)" }}>
          <div style={{ ...S.cardTitle, borderBottomColor: "var(--border-strong)" }}>📊 DAO Parameters</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["Minimum Stake",         `${minStake} VCT`, S.badgeAmber],
              ["Voting Period",         "3 Days",          S.badgeBlue],
              ["Voter Reward",          "5 VCT",           S.badgeGreen],
              ["Wrong Vote Penalty",    "2 VCT burned",    S.badgeRed],
              ["Proposer Stake Return", "On PASS",         S.badgeGreen],
              ["Proposer Slash",        "On REJECT",       S.badgeRed],
            ].map(([label, value, style]) => (
              <div key={label} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: "1px solid var(--border)",
              }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-secondary)" }}>
                  {label}
                </span>
                <span style={style}>{value}</span>
              </div>
            ))}
          </div>
          <div style={{ ...S.divider }} />
          <p style={{ ...S.mono, lineHeight: 1.7 }}>
            Voting weight = token balance at time of vote. One vote per address per proposal.
          </p>
        </div>
      </div>

      {/* Proposals */}
      <div style={S.card}>
        <div style={{ ...S.cardTitle, justifyContent: "space-between" }}>
          <span>🗳 All Proposals ({proposals.length})</span>
          <button style={S.btnSecondary} onClick={loadProposals} disabled={loading}>
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ display: "inline-block", width: 24, height: 24, borderRadius: "50%", border: "3px solid var(--border-strong)", borderTopColor: "var(--accent)", animation: "spin 0.7s linear infinite" }} />
          </div>
        ) : proposals.length === 0 ? (
          <div style={S.emptyState}>
            <span style={S.emptyIcon}>⚖</span>
            <p style={S.emptyText}>No disputes raised yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {proposals.map((p) => {
              const { forPct, againstPct } = votePercent(p);
              const statusIdx  = Number(p.status);
              const isActive   = statusIdx === 0 && Date.now() < Number(p.endTime) * 1000;
              const myVoted    = p.myVote?.weight > 0n;
              const isProposer = p.proposer?.toLowerCase() === account?.toLowerCase();

              const snapshotTotal = formatToken(p.totalValidatorWeightSnapshot);
              const myCapped      = isValidator && p.previewWeight
                ? formatToken(p.previewWeight.capped)
                : null;

              return (
                <div key={p.id.toString()} style={{
                  padding: 22,
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={S.mono}>#{p.id.toString()}</span>
                        <span style={STATUS_BADGE_STYLES[statusIdx]}>
                          {STATUS_ICONS[statusIdx]} {STATUS_LABELS[statusIdx]}
                        </span>
                        {myVoted && (
                          <span style={S.badgePurple}>
                            You voted: {p.myVote.inFavor ? "FOR" : "AGAINST"}
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, marginBottom: 4, color: "var(--text)" }}>
                        VIN: {p.vin}
                      </div>
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        {p.description}
                      </div>
                    </div>
                    <div style={{ ...S.mono, textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                      <div>by {shortAddress(p.proposer)}</div>
                      <div style={{ marginTop: 4, color: isActive ? "var(--warning)" : "var(--text-muted)" }}>
                        {isActive ? timeLeft(p.endTime) : "Voting ended"}
                      </div>
                      {myCapped && !myVoted && isActive && (
                        <div style={{ marginTop: 4, color: "var(--green)" }}>
                          Your capped weight: {myCapped} VCT
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vote bars */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>
                        ✓ FOR {forPct}%
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--danger)", fontWeight: 600 }}>
                        {againstPct}% AGAINST ✗
                      </span>
                    </div>
                    <div style={{ display: "flex", height: 6, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ width: `${forPct}%`, background: "var(--accent)", borderRadius: 999, transition: "width 0.5s ease" }} />
                      <div style={{ width: `${againstPct}%`, background: "var(--danger)", transition: "width 0.5s ease" }} />
                    </div>
                    <div style={{ ...S.mono, marginTop: 5 }}>
                      {formatToken(p.votesFor)} VCT FOR · {formatToken(p.votesAgainst)} VCT AGAINST
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {isActive && !myVoted && !isProposer && isValidator && (
                      <>
                        <button style={S.btnSuccess} disabled={loading} onClick={() => handleVote(p.id, true)}>
                          ✓ Vote FOR
                        </button>
                        <button style={S.btnDanger} disabled={loading} onClick={() => handleVote(p.id, false)}>
                          ✗ Vote AGAINST
                        </button>
                      </>
                    )}
                    {statusIdx === 0 && Date.now() >= Number(p.endTime) * 1000 && (
                      <button style={S.btnPrimary} disabled={loading} onClick={() => handleFinalize(p.id)}>
                        Finalize Proposal
                      </button>
                    )}
                    {(statusIdx === 1 || statusIdx === 2) && !p.rewardsDistributed && (
                      <button style={S.btnSecondary} disabled={loading} onClick={() => handleDistributeRewards(p.id)}>
                        Distribute Rewards
                      </button>
                    )}
                    {statusIdx === 1 && p.rewardsDistributed && (
                      <button style={S.btnPrimary} disabled={loading} onClick={() => handleExecute(p.id)}>
                        ⚡ Execute
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}