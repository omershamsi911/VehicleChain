// src/pages/DAOPage.jsx
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../utils/Web3Context";

const STATUS_LABELS = ["ACTIVE", "PASSED", "REJECTED", "EXECUTED", "CANCELLED"];
const STATUS_ICONS  = ["🗳", "✅", "❌", "⚡", "🚫"];

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
    marginBottom: 24,
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
    width: "100%",
  },

  textarea: {
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
    resize: "vertical",
  },

  // ── Buttons ──
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
    gap: 8,
    background: "rgba(26,122,74,0.08)",
    border: "1px solid rgba(26,122,74,0.3)",
    borderRadius: 999,
    color: "#1A7A4A",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    padding: "7px 14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  btnDanger: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "var(--bg-inverted)",
    border: "1px solid rgba(255,80,80,0.4)",
    borderRadius: 999,
    color: "#FF6B6B",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    padding: "7px 14px",
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
    padding: "7px 14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  // ── Alerts ──
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
    padding: "12px 16px",
    background: "rgba(11,11,11,0.04)",
    border: "1px solid var(--border)",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    color: "var(--text-muted)",
    marginBottom: 20,
    lineHeight: 1.6,
  },

  // ── Badges ──
  badgeAmber: {
    display: "inline-flex", alignItems: "center",
    fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
    letterSpacing: "0.1em", textTransform: "uppercase",
    color: "#92600A", background: "rgba(146,96,10,0.08)",
    border: "1px solid rgba(146,96,10,0.2)",
    padding: "4px 10px", borderRadius: 999,
  },
  badgeGreen: {
    display: "inline-flex", alignItems: "center",
    fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
    letterSpacing: "0.1em", textTransform: "uppercase",
    color: "#1A7A4A", background: "rgba(26,122,74,0.08)",
    border: "1px solid rgba(26,122,74,0.2)",
    padding: "4px 10px", borderRadius: 999,
  },
  badgeRed: {
    display: "inline-flex", alignItems: "center",
    fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
    letterSpacing: "0.1em", textTransform: "uppercase",
    color: "#CC2222", background: "rgba(204,34,34,0.08)",
    border: "1px solid rgba(204,34,34,0.2)",
    padding: "4px 10px", borderRadius: 999,
  },
  badgeBlue: {
    display: "inline-flex", alignItems: "center",
    fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
    letterSpacing: "0.1em", textTransform: "uppercase",
    color: "#1A4A8A", background: "rgba(26,74,138,0.08)",
    border: "1px solid rgba(26,74,138,0.2)",
    padding: "4px 10px", borderRadius: 999,
  },
  badgePurple: {
    display: "inline-flex", alignItems: "center",
    fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
    letterSpacing: "0.1em", textTransform: "uppercase",
    color: "#6B3FA0", background: "rgba(107,63,160,0.08)",
    border: "1px solid rgba(107,63,160,0.2)",
    padding: "4px 10px", borderRadius: 999,
  },

  // ── Empty state ──
  emptyState: { textAlign: "center", padding: "48px 24px" },
  emptyIcon:  { fontSize: 40, marginBottom: 16, opacity: 0.3 },
  emptyText:  {
    fontFamily: "var(--font-sans)", fontSize: 14,
    color: "var(--text-muted)", marginBottom: 24,
  },

  // ── Proposal card ──
  proposalCard: {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    padding: 24,
    marginBottom: 16,
  },

  mono: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "var(--text-muted)",
  },

  divider: {
    borderTop: "1px solid var(--border)",
    margin: "20px 0",
  },
};

const STATUS_BADGE = [S.badgeAmber, S.badgeGreen, S.badgeRed, S.badgeBlue, S.badgePurple];

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span style={{
      width: 16, height: 16,
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
export default function DAOPage({ navigate }) {
  const { contracts, account, isConnected, shortAddress, formatToken } = useWeb3();

  const [proposals, setProposals] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [msg,       setMsg]       = useState(null);
  const [minStake,  setMinStake]  = useState("10");

  const [dVin,  setDVin]  = useState("");
  const [dDesc, setDDesc] = useState("");

  const showMsg = (type, text) => setMsg({ type, text });

  useEffect(() => {
    if (isConnected && contracts.disputeDAO) loadProposals();
  }, [isConnected, contracts]);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const count = await contracts.disputeDAO.proposalCount();
      const ms    = await contracts.disputeDAO.MIN_STAKE();
      setMinStake(formatToken(ms));

      const all = [];
      for (let i = Number(count); i >= 1; i--) {
        const p = await contracts.disputeDAO.getProposal(i);
        const myVote = await contracts.disputeDAO.getVote(i, account);
        all.push({
          id: p.id,
          vin: p.vin,
          proposer: p.proposer,
          description: p.description,
          stakedAmount: p.stakedAmount,
          votesFor: p.votesFor,
          votesAgainst: p.votesAgainst,
          startTime: p.startTime,
          endTime: p.endTime,
          status: p.status,
          rewardsDistributed: p.rewardsDistributed,
          myVote,
        });
      }
      setProposals(all);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleRaiseDispute = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!dVin || !dDesc) return showMsg("error", "VIN and description required.");
    setLoading(true);
    try {
      const tx = await contracts.disputeDAO.raiseDispute(dVin.toUpperCase(), dDesc);
      await tx.wait();
      showMsg("success", "Dispute raised! DAO voting period started (3 days).");
      setDVin(""); setDDesc("");
      await loadProposals();
    } catch (err) {
      showMsg("error", err.reason || err.message);
    }
    setLoading(false);
  };

  const handleVote = async (proposalId, inFavor) => {
    setMsg(null);
    setLoading(true);
    try {
      const tx = await contracts.disputeDAO.vote(proposalId, inFavor);
      await tx.wait();
      showMsg("success", `Vote cast: ${inFavor ? "FOR ✓" : "AGAINST ✗"}`);
      await loadProposals();
    } catch (err) {
      showMsg("error", err.reason || err.message);
    }
    setLoading(false);
  };

  const handleFinalize = async (proposalId) => {
    setLoading(true);
    try {
      const tx = await contracts.disputeDAO.finalizeProposal(proposalId);
      await tx.wait();
      showMsg("success", "Proposal finalized!");
      await loadProposals();
    } catch (err) {
      showMsg("error", err.reason || err.message);
    }
    setLoading(false);
  };

  const handleDistributeRewards = async (proposalId) => {
    setLoading(true);
    try {
      const tx = await contracts.disputeDAO.distributeRewards(proposalId);
      await tx.wait();
      showMsg("success", "Rewards distributed to honest voters!");
      await loadProposals();
    } catch (err) {
      showMsg("error", err.reason || err.message);
    }
    setLoading(false);
  };

  const handleExecute = async (proposalId) => {
    setLoading(true);
    try {
      const tx = await contracts.disputeDAO.executeProposal(proposalId);
      await tx.wait();
      showMsg("success", "Proposal executed!");
      await loadProposals();
    } catch (err) {
      showMsg("error", err.reason || err.message);
    }
    setLoading(false);
  };

  const timeLeft = (endTime) => {
    const diff = Number(endTime) * 1000 - Date.now();
    if (diff <= 0) return "Ended";
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
        <span style={S.microLabel}>Token-Weighted · Governance</span>
        <h1 style={S.pageTitle}>Dispute DAO</h1>
        <p style={S.pageSub}>Token-weighted governance for vehicle disputes</p>
      </div>

      {msg && (
        <div style={msg.type === "success" ? S.alertSuccess : S.alertError}>
          {msg.text}
        </div>
      )}

      <div style={S.grid2}>

        {/* ── Raise Dispute ── */}
        <div style={S.card}>
          <div style={S.cardTitle}>Raise Dispute</div>
          <div style={S.alertInfo}>
            ⓘ Requires {minStake} VCT staked. Go to Token Dashboard to stake first.
          </div>
          <form onSubmit={handleRaiseDispute}>
            <div style={S.formGroup}>
              <label style={S.label}>Vehicle VIN in Dispute</label>
              <input
                style={S.input}
                placeholder="1HGBH41JXMN109186"
                value={dVin}
                onChange={(e) => setDVin(e.target.value.toUpperCase())}
              />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Dispute Description</label>
              <textarea
                style={S.textarea}
                rows={4}
                placeholder="Describe the dispute in detail: e.g., ownership claim, fraudulent history record, incorrect VIN registration..."
                value={dDesc}
                onChange={(e) => setDDesc(e.target.value)}
              />
            </div>
            <button
              type="submit"
              style={{ ...S.btnAccent, width: "100%", justifyContent: "center" }}
              disabled={loading}
            >
              {loading ? <><Spinner /> Processing…</> : "⚖ Raise Dispute (Stake 10 VCT)"}
            </button>
          </form>
        </div>

        {/* ── DAO Parameters ── */}
        <div style={S.card}>
          <div style={S.cardTitle}>DAO Parameters</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              ["Minimum Stake",         `${minStake} VCT`, S.badgeAmber],
              ["Voting Period",         "3 Days",          S.badgeBlue],
              ["Voter Reward",          "5 VCT",           S.badgeGreen],
              ["Wrong Vote Penalty",    "2 VCT burned",    S.badgeRed],
              ["Proposer Stake Return", "On PASS",         S.badgeGreen],
              ["Proposer Slash",        "On REJECT",       S.badgeRed],
            ].map(([label, value, badgeStyle]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-muted)" }}>
                  {label}
                </span>
                <span style={badgeStyle}>{value}</span>
              </div>
            ))}
          </div>

          <div style={S.divider} />

          <p style={{ ...S.mono, lineHeight: 1.7 }}>
            Voting weight = token balance at time of vote. One vote per address per proposal.
          </p>
        </div>
      </div>

      {/* ── Proposals List ── */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 700, color: "var(--text)" }}>
            All Proposals ({proposals.length})
          </span>
          <button style={S.btnGhost} onClick={loadProposals} disabled={loading}>
            {loading ? <Spinner /> : "↻ Refresh"}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spinner />
          </div>
        ) : proposals.length === 0 ? (
          <div style={S.emptyState}>
            <div style={S.emptyIcon}>⚖</div>
            <p style={S.emptyText}>No disputes raised yet</p>
          </div>
        ) : (
          <div>
            {proposals.map((p) => {
              const { forPct, againstPct } = votePercent(p);
              const statusIdx  = Number(p.status);
              const isActive   = statusIdx === 0 && Date.now() < Number(p.endTime) * 1000;
              const myVoted    = p.myVote?.weight > 0n;
              const isProposer = p.proposer?.toLowerCase() === account?.toLowerCase();

              return (
                <div key={p.id.toString()} style={S.proposalCard}>

                  {/* ── Header row ── */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={S.mono}>#{p.id.toString()}</span>
                        <span style={STATUS_BADGE[statusIdx]}>
                          {STATUS_ICONS[statusIdx]} {STATUS_LABELS[statusIdx]}
                        </span>
                        {myVoted && (
                          <span style={S.badgePurple}>
                            You voted: {p.myVote.inFavor ? "FOR" : "AGAINST"}
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, marginBottom: 4, color: "var(--text)" }}>
                        VIN: {p.vin}
                      </div>
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                        {p.description}
                      </div>
                    </div>
                    <div style={{ ...S.mono, textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                      <div>by {shortAddress(p.proposer)}</div>
                      <div style={{ marginTop: 4, color: isActive ? "#92600A" : "var(--text-muted)" }}>
                        {isActive ? timeLeft(p.endTime) : "Voting ended"}
                      </div>
                    </div>
                  </div>

                  {/* ── Vote bars ── */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#1A7A4A", fontWeight: 600 }}>
                        ✓ FOR {forPct}%
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#CC2222", fontWeight: 600 }}>
                        {againstPct}% AGAINST ✗
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 2, height: 4, background: "var(--border)", overflow: "hidden" }}>
                      <div style={{ width: `${forPct}%`, background: "#1A7A4A" }} />
                      <div style={{ width: `${againstPct}%`, background: "#CC2222" }} />
                    </div>
                    <div style={{ ...S.mono, marginTop: 6 }}>
                      {formatToken(p.votesFor)} VCT FOR · {formatToken(p.votesAgainst)} VCT AGAINST
                    </div>
                  </div>

                  {/* ── Actions ── */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {isActive && !myVoted && !isProposer && (
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
                      <button style={S.btnAccent} disabled={loading} onClick={() => handleFinalize(p.id)}>
                        Finalize Proposal
                      </button>
                    )}
                    {(statusIdx === 1 || statusIdx === 2) && !p.rewardsDistributed && (
                      <button style={S.btnPrimary} disabled={loading} onClick={() => handleDistributeRewards(p.id)}>
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