// src/pages/HistoryPage.jsx
import React, { useState } from "react";
import { useWeb3 } from "../utils/Web3Context";

export default function HistoryPage({ navigate }) {
  const { contracts, isConnected } = useWeb3();

  const [vin,     setVin]     = useState("");
  const [type,    setType]    = useState("service");
  const [desc,    setDesc]    = useState("");
  const [mileage, setMileage] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState(null);

  const showMsg = (t, text) => setMsg({ type: t, text });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!vin || !desc) return showMsg("error", "VIN and description are required.");
    if (type === "mileage" && !mileage) return showMsg("error", "Mileage value required.");

    setLoading(true);
    try {
      let tx;
      if (type === "service") {
        tx = await contracts.vehicleHistory.addServiceRecord(vin.toUpperCase(), desc);
      } else if (type === "accident") {
        tx = await contracts.vehicleHistory.addAccidentRecord(vin.toUpperCase(), desc);
      } else {
        tx = await contracts.vehicleHistory.addMileageRecord(vin.toUpperCase(), Number(mileage), desc);
      }
      await tx.wait();
      showMsg("success", `${type.charAt(0).toUpperCase() + type.slice(1)} record added for ${vin.toUpperCase()}.`);
      setDesc(""); setMileage("");
    } catch (err) {
      showMsg("error", err.reason || err.message);
    }
    setLoading(false);
  };

  if (!isConnected) return <div className="alert alert-warn">Connect MetaMask first.</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📋 Vehicle History</h1>
        <p className="page-sub">Add service, accident, and mileage records (service centers only)</p>
      </div>

      {msg && <div className={`alert alert-${msg.type === "success" ? "success" : "error"}`}>{msg.text}</div>}

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="card">
          <div className="card-title">Add History Record</div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Vehicle VIN</label>
              <input className="input" placeholder="1HGBH41JXMN109186" value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())} />
            </div>

            <div className="form-group">
              <label className="label">Record Type</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["service", "accident", "mileage"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`btn btn-sm ${type === t ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setType(t)}
                    style={{ flex: 1 }}
                  >
                    {t === "service" ? "🔧 Service" : t === "accident" ? "💥 Accident" : "📏 Mileage"}
                  </button>
                ))}
              </div>
            </div>

            {type === "mileage" && (
              <div className="form-group">
                <label className="label">Odometer Reading (km)</label>
                <input className="input" type="number" placeholder="45000" value={mileage}
                  onChange={(e) => setMileage(e.target.value)} />
              </div>
            )}

            <div className="form-group">
              <label className="label">
                {type === "service" ? "Service Description" : type === "accident" ? "Accident Report" : "Notes"}
              </label>
              <textarea className="textarea"
                placeholder={
                  type === "service" ? "Oil change, air filter replacement, brake inspection..."
                  : type === "accident" ? "Minor front bumper damage from rear collision at Signal Chowk..."
                  : "Routine mileage log — long trip Karachi to Lahore"
                }
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={4}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
              {loading ? <><span className="spinner" /> Recording…</> : "📋 Add to Blockchain"}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-title">ℹ Record Types</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ padding: 14, background: "rgba(59,130,246,0.08)", borderRadius: 8, borderLeft: "3px solid var(--accent)" }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>🔧 Service Records</div>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>Maintenance, inspections, repairs. Added by authorized service centers.</div>
            </div>
            <div style={{ padding: 14, background: "rgba(239,68,68,0.08)", borderRadius: 8, borderLeft: "3px solid var(--red)" }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>💥 Accident Reports</div>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>Damage reports, collision history. Critical for buyers evaluating vehicle.</div>
            </div>
            <div style={{ padding: 14, background: "rgba(245,158,11,0.08)", borderRadius: 8, borderLeft: "3px solid var(--amber)" }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>📏 Mileage Logs</div>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>Odometer readings over time. Monotonically enforced — cannot decrease.</div>
            </div>
            <div style={{ padding: 14, background: "var(--bg3)", borderRadius: 8 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>🔐 Access Control</div>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>Only addresses authorized as Service Centers in VehicleRegistry can add records.</div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("vehicle")}>
              View vehicle history →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
