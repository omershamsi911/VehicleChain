// src/pages/DAOPage.jsx
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../utils/Web3Context";

const STATUS_LABELS = ["ACTIVE", "PASSED", "REJECTED", "EXECUTED", "CANCELLED"];
const STATUS_COLORS = ["amber", "green", "red", "blue", "purple"];
const STATUS_ICONS  = ["🗳", "✅", "❌", "⚡", "🚫"];

export default function DAOPage({ navigate }) {
  const { contracts, account, isConnected, shortAddress, formatToken } = useWeb3();

  const [proposals,  setProposals]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [msg,        setMsg]        = useState(null);
  const [minStake,   setMinStake]   = useState("10");

  // Raise dispute form
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
        
        // Fix: Explicitly map the properties instead of using { ...p }
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
          myVote
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

  if (!isConnected) return <div className="alert alert-warn">Connect MetaMask first.</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚖ Dispute DAO</h1>
        <p className="page-sub">Token-weighted governance for vehicle disputes</p>
      </div>

      {msg && <div className={`alert alert-${msg.type === "success" ? "success" : "error"}`}>{msg.text}</div>}

      <div className="grid-2" style={{ alignItems: "start", marginBottom: 24 }}>
        {/* Raise Dispute */}
        <div className="card">
          <div className="card-title">🗳 Raise Dispute</div>
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            ⓘ Requires {minStake} VCT staked. Go to Token Dashboard to stake first.
          </div>
          <form onSubmit={handleRaiseDispute}>
            <div className="form-group">
              <label className="label">Vehicle VIN in Dispute</label>
              <input className="input" placeholder="1HGBH41JXMN109186" value={dVin}
                onChange={(e) => setDVin(e.target.value.toUpperCase())} />
            </div>
            <div className="form-group">
              <label className="label">Dispute Description</label>
              <textarea className="textarea" rows={4}
                placeholder="Describe the dispute in detail: e.g., ownership claim, fraudulent history record, incorrect VIN registration..."
                value={dDesc}
                onChange={(e) => setDDesc(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-amber" disabled={loading} style={{ width: "100%" }}>
              {loading ? <><span className="spinner" /> Processing…</> : "⚖ Raise Dispute (Stake 10 VCT)"}
            </button>
          </form>
        </div>

        {/* DAO Info */}
        <div className="card">
          <div className="card-title">⚙ DAO Parameters</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["Minimum Stake",   `${minStake} VCT`, "amber"],
              ["Voting Period",   "3 Days",           "blue"],
              ["Voter Reward",    "5 VCT",            "green"],
              ["Wrong Vote Penalty", "2 VCT burned", "red"],
              ["Proposer Stake Return", "On PASS",   "green"],
              ["Proposer Slash",  "On REJECT",        "red"],
            ].map(([label, value, color]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--text2)" }}>{label}</span>
                <span className={`badge badge-${color}`}>{value}</span>
              </div>
            ))}
          </div>
          <div className="divider" />
          <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--mono)" }}>
            Voting weight = token balance at time of vote. One vote per address per proposal.
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div className="card-title" style={{ margin: 0 }}>All Proposals ({proposals.length})</div>
          <button className="btn btn-ghost btn-sm" onClick={loadProposals} disabled={loading}>
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 32 }}><span className="spinner" /></div>
        ) : proposals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚖</div>
            <div className="empty-state-text">No disputes raised yet</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {proposals.map((p) => {
              const { forPct, againstPct } = votePercent(p);
              const statusIdx = Number(p.status);
              const isActive  = statusIdx === 0 && Date.now() < Number(p.endTime) * 1000;
              const myVoted   = p.myVote?.weight > 0n;
              const isProposer = p.proposer?.toLowerCase() === account?.toLowerCase();

              return (
                <div key={p.id.toString()} style={{
                  background: "var(--bg3)",
                  border: "1px solid var(--border2)",
                  borderRadius: 10,
                  padding: 20,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text3)" }}>#{p.id.toString()}</span>
                        <span className={`badge badge-${STATUS_COLORS[statusIdx]}`}>
                          {STATUS_ICONS[statusIdx]} {STATUS_LABELS[statusIdx]}
                        </span>
                        {myVoted && <span className="badge badge-purple">You voted: {p.myVote.inFavor ? "FOR" : "AGAINST"}</span>}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>VIN: {p.vin}</div>
                      <div style={{ fontSize: 13, color: "var(--text2)" }}>{p.description}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--mono)", textAlign: "right" }}>
                      <div>by {shortAddress(p.proposer)}</div>
                      <div style={{ marginTop: 4, color: isActive ? "var(--amber)" : "var(--text3)" }}>
                        {isActive ? timeLeft(p.endTime) : "Voting ended"}
                      </div>
                    </div>
                  </div>

                  {/* Vote Bars */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "var(--green)" }}>✓ FOR {forPct}%</span>
                      <span style={{ color: "var(--red)" }}>{againstPct}% AGAINST ✗</span>
                    </div>
                    <div style={{ display: "flex", gap: 2, height: 6, borderRadius: 999, overflow: "hidden", background: "var(--border)" }}>
                      <div style={{ width: `${forPct}%`, background: "var(--green)", borderRadius: 999 }} />
                      <div style={{ width: `${againstPct}%`, background: "var(--red)", borderRadius: 999 }} />
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--mono)", marginTop: 4 }}>
                      {formatToken(p.votesFor)} VCT FOR · {formatToken(p.votesAgainst)} VCT AGAINST
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {isActive && !myVoted && !isProposer && (
                      <>
                        <button className="btn btn-success btn-sm" disabled={loading} onClick={() => handleVote(p.id, true)}>
                          ✓ Vote FOR
                        </button>
                        <button className="btn btn-danger btn-sm" disabled={loading} onClick={() => handleVote(p.id, false)}>
                          ✗ Vote AGAINST
                        </button>
                      </>
                    )}
                    {statusIdx === 0 && Date.now() >= Number(p.endTime) * 1000 && (
                      <button className="btn btn-amber btn-sm" disabled={loading} onClick={() => handleFinalize(p.id)}>
                        Finalize Proposal
                      </button>
                    )}
                    {(statusIdx === 1 || statusIdx === 2) && !p.rewardsDistributed && (
                      <button className="btn btn-primary btn-sm" disabled={loading} onClick={() => handleDistributeRewards(p.id)}>
                        Distribute Rewards
                      </button>
                    )}
                    {statusIdx === 1 && p.rewardsDistributed && (
                      <button className="btn btn-primary btn-sm" disabled={loading} onClick={() => handleExecute(p.id)}>
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
