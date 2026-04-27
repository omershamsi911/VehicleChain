// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useWeb3 } from "../utils/Web3Context";
import { ethers } from "ethers";

export default function Dashboard({ navigate }) {
  const { contracts, account, isConnected, formatToken, shortAddress } = useWeb3();
  const [myVINs,     setMyVINs]     = useState([]);
  const [vehicles,   setVehicles]   = useState([]);
  const [tokenBal,   setTokenBal]   = useState("0");
  const [stakedBal,  setStakedBal]  = useState("0");
  const [totalVeh,   setTotalVeh]   = useState("0");
  const [loading,    setLoading]    = useState(false);
  const [searchVIN,  setSearchVIN]  = useState("");

  useEffect(() => {
    if (!isConnected || !contracts.vehicleRegistry) return;
    loadDashboard();
  }, [isConnected, contracts, account]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [vins, bal, staked, total] = await Promise.all([
        contracts.vehicleRegistry.getOwnerVehicles(account),
        contracts.govToken.balanceOf(account),
        contracts.govToken.stakedBalance(account),
        contracts.vehicleRegistry.getTotalVehicles(),
      ]);
      setMyVINs(vins);
      setTokenBal(formatToken(bal));
      setStakedBal(formatToken(staked));
      setTotalVeh(total.toString());

      const details = await Promise.all(
        vins.map((vin) => contracts.vehicleRegistry.getVehicle(vin))
      );
      setVehicles(details);
    } catch (err) {
      console.error("Dashboard load error:", err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVIN.trim()) navigate("vehicle", searchVIN.trim().toUpperCase());
  };

  if (!isConnected) {
    return (
      <div style={{ textAlign: "center", paddingTop: "80px" }}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>▣</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10 }}>VehicleChain</h1>
        <p style={{ color: "var(--text2)", marginBottom: 28, fontSize: 15 }}>
          Decentralized Vehicle Registry · Ownership · Dispute Governance
        </p>
        <p style={{ color: "var(--text3)", fontFamily: "var(--mono)", fontSize: 13 }}>
          Connect MetaMask to continue →
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">Welcome back, {shortAddress(account)}</p>
      </div>

      {/* Stats Row */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card stat-box">
          <div className="stat-num" style={{ color: "var(--accent)" }}>{myVINs.length}</div>
          <div className="stat-label">Your Vehicles</div>
        </div>
        <div className="card stat-box">
          <div className="stat-num" style={{ color: "var(--green)" }}>{tokenBal}</div>
          <div className="stat-label">VCT Balance</div>
        </div>
        <div className="card stat-box">
          <div className="stat-num" style={{ color: "var(--amber)" }}>{stakedBal}</div>
          <div className="stat-label">VCT Staked</div>
        </div>
      </div>

      {/* VIN Search */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">🔍 Search Vehicle by VIN</div>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 12 }}>
          <input
            className="input"
            placeholder="Enter VIN number (e.g. 1HGBH41JXMN109186)"
            value={searchVIN}
            onChange={(e) => setSearchVIN(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
            View Details
          </button>
        </form>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">⚡ Quick Actions</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => navigate("register")}>＋ Register Vehicle</button>
          <button className="btn btn-ghost" onClick={() => navigate("transfer")}>⇄ Transfer Ownership</button>
          <button className="btn btn-danger" onClick={() => navigate("theft")}>🚨 File FIR</button>
          <button className="btn btn-ghost" onClick={() => navigate("dao")}>⚖ DAO Votes</button>
          <button className="btn btn-amber" onClick={() => navigate("token")}>🪙 Token Dashboard</button>
        </div>
      </div>

      {/* My Vehicles */}
      <div className="card">
        <div className="card-title">🚗 Your Vehicles</div>
        {loading ? (
          <div style={{ textAlign: "center", padding: 32 }}><span className="spinner" /></div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚗</div>
            <div className="empty-state-text">No vehicles registered to your address</div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("register")}>
              Register First Vehicle
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>VIN</th>
                  <th>Model</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v, i) => (
                  <tr key={i}>
                    <td>{v.vin}</td>
                    <td style={{ fontFamily: "var(--sans)", color: "var(--text)" }}>{v.model}</td>
                    <td>{v.year?.toString()}</td>
                    <td>
                      {v.isStolen
                        ? <span className="badge badge-red">🚨 STOLEN</span>
                        : <span className="badge badge-green">✓ Clear</span>
                      }
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate("vehicle", v.vin)}
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
