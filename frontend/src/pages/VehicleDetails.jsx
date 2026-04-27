// src/pages/VehicleDetails.jsx
import React, { useState, useEffect } from "react";
import { useWeb3 } from "../utils/Web3Context";

const RECORD_LABELS = { 0: "SERVICE", 1: "ACCIDENT", 2: "MILEAGE" };
const RECORD_COLORS = { 0: "blue", 1: "red", 2: "amber" };
const RECORD_ICONS  = { 0: "🔧", 1: "💥", 2: "📏" };
const TRANSFER_STATUS = ["PENDING", "APPROVED", "CANCELLED", "COMPLETED"];

export default function VehicleDetails({ vin: propVin, navigate }) {
  const { contracts, account, isConnected, shortAddress } = useWeb3();
  const [vin,      setVin]      = useState(propVin || "");
  const [vehicle,  setVehicle]  = useState(null);
  const [history,  setHistory]  = useState([]);
  const [firs,     setFirs]     = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [searched, setSearched] = useState(!!propVin);

  useEffect(() => {
    if (propVin && isConnected && contracts.vehicleRegistry) {
      loadVehicle(propVin);
    }
  }, [propVin, isConnected, contracts]);

  const loadVehicle = async (targetVin) => {
    setLoading(true);
    setError("");
    try {
      const v = await contracts.vehicleRegistry.getVehicle(targetVin);
      setVehicle(v);

      const [hist, firList, txIds] = await Promise.all([
        contracts.vehicleHistory.getHistory(targetVin),
        contracts.theftReport.getAllFIRs(targetVin),
        contracts.ownershipTransfer.getTransferHistory(targetVin),
      ]);

      setHistory([...hist].reverse());
      setFirs([...firList].reverse());

      if (txIds.length > 0) {
        const txDetails = await Promise.all(
          txIds.map((id) => contracts.ownershipTransfer.getTransfer(id))
        );
        setTransfers([...txDetails].reverse());
      }
    } catch (err) {
      setError("Vehicle not found or not registered.");
      setVehicle(null);
    }
    setLoading(false);
    setSearched(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (vin.trim()) loadVehicle(vin.trim().toUpperCase());
  };

  const fmtDate = (ts) =>
    ts ? new Date(Number(ts) * 1000).toLocaleString() : "—";

  const isOwner = vehicle && account &&
    vehicle.owner?.toLowerCase() === account?.toLowerCase();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🚗 Vehicle Details</h1>
        <p className="page-sub">Full immutable history, ownership & FIR status</p>
      </div>

      {/* VIN Search */}
      <div className="card" style={{ marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 12 }}>
          <input
            className="input"
            placeholder="Enter VIN number"
            value={vin}
            onChange={(e) => setVin(e.target.value.toUpperCase())}
          />
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ whiteSpace: "nowrap" }}>
            {loading ? <span className="spinner" /> : "🔍 Lookup"}
          </button>
        </form>
      </div>

      {error && <div className="alert alert-error">⚠ {error}</div>}

      {vehicle && (
        <>
          {/* Stolen Banner */}
          {vehicle.isStolen && (
            <div className="stolen-banner">
              <div className="stolen-banner-icon">🚨</div>
              <div>
                <div className="stolen-banner-title">⚠ THIS VEHICLE IS REPORTED STOLEN</div>
                <div className="stolen-banner-sub">Do not purchase this vehicle. Contact authorities.</div>
              </div>
            </div>
          )}

          {/* Vehicle Info */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">Vehicle Information</div>
            <div className="grid-2">
              <div>
                <div className="label">VIN</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 15, marginBottom: 16 }}>{vehicle.vin}</div>

                <div className="label">Model</div>
                <div style={{ fontSize: 15, marginBottom: 16 }}>{vehicle.model}</div>

                <div className="label">Year</div>
                <div style={{ fontFamily: "var(--mono)", marginBottom: 16 }}>{vehicle.year?.toString()}</div>
              </div>
              <div>
                <div className="label">Current Owner</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 13, marginBottom: 16 }}>
                  {vehicle.owner}
                  {isOwner && <span className="badge badge-blue" style={{ marginLeft: 8 }}>You</span>}
                </div>

                <div className="label">Registered</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 13, marginBottom: 16 }}>{fmtDate(vehicle.registeredAt)}</div>

                <div className="label">Status</div>
                <div>
                  {vehicle.isStolen
                    ? <span className="badge badge-red">🚨 STOLEN</span>
                    : <span className="badge badge-green">✓ Clean Title</span>
                  }
                </div>
              </div>
            </div>

            {isOwner && (
              <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn btn-primary btn-sm" onClick={() => navigate("transfer")}>⇄ Transfer Ownership</button>
                <button className="btn btn-danger btn-sm"  onClick={() => navigate("theft")}>🚨 File FIR</button>
                <button className="btn btn-ghost btn-sm"   onClick={() => navigate("history")}>📋 Add History</button>
              </div>
            )}
          </div>

          {/* History Timeline */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">📋 Vehicle History ({history.length} records)</div>
            {history.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-text">No history records yet</div>
              </div>
            ) : (
              <div className="timeline">
                {history.map((rec, i) => (
                  <div key={i} className="timeline-item">
                    <div className={`timeline-dot timeline-dot-${RECORD_COLORS[rec.recordType] || "blue"}`} />
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span>{RECORD_ICONS[rec.recordType]}</span>
                      <span className={`badge badge-${RECORD_COLORS[rec.recordType] || "blue"}`}>
                        {RECORD_LABELS[rec.recordType]}
                      </span>
                      {rec.mileage > 0 && (
                        <span className="badge badge-purple">{rec.mileage.toString()} km</span>
                      )}
                    </div>
                    <div className="timeline-desc">{rec.description}</div>
                    <div className="timeline-meta">
                      {fmtDate(rec.timestamp)} · by {shortAddress(rec.addedBy)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FIR Records */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">🚨 FIR / Theft Reports ({firs.length})</div>
            {firs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✅</div>
                <div className="empty-state-text">No theft reports on file</div>
              </div>
            ) : (
              <div className="timeline">
                {firs.map((fir, i) => (
                  <div key={i} className="timeline-item">
                    <div className={`timeline-dot ${fir.isResolved ? "timeline-dot-green" : "timeline-dot-red"}`} />
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <span className={`badge ${fir.isResolved ? "badge-green" : "badge-red"}`}>
                        {fir.isResolved ? "✓ Recovered" : "🚨 Active FIR"}
                      </span>
                    </div>
                    <div className="timeline-desc">{fir.details}</div>
                    <div className="timeline-meta">Filed {fmtDate(fir.filedAt)} · by {shortAddress(fir.filedBy)}</div>
                    {fir.isResolved && (
                      <div className="timeline-meta" style={{ color: "var(--green)", marginTop: 4 }}>
                        Recovered: {fmtDate(fir.resolvedAt)} · {fir.resolutionNote}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transfer History */}
          <div className="card">
            <div className="card-title">⇄ Ownership Transfer History ({transfers.length})</div>
            {transfers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">⇄</div>
                <div className="empty-state-text">No transfers recorded</div>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>From</th>
                      <th>To</th>
                      <th>Status</th>
                      <th>Price (ETH)</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((tx, i) => (
                      <tr key={i}>
                        <td>{shortAddress(tx.seller)}</td>
                        <td>{shortAddress(tx.buyer)}</td>
                        <td>
                          <span className={`badge badge-${tx.status === 3n ? "green" : tx.status === 2n ? "red" : "amber"}`}>
                            {TRANSFER_STATUS[Number(tx.status)]}
                          </span>
                        </td>
                        <td>{tx.price > 0n ? `${Number(tx.price) / 1e18} ETH` : "Gift"}</td>
                        <td>{fmtDate(tx.initiatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {searched && !vehicle && !loading && !error && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-text">Enter a VIN to look up vehicle details</div>
        </div>
      )}
    </div>
  );
}
