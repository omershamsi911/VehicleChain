// src/pages/RegisterVehicle.jsx
import React, { useState } from "react";
import { useWeb3 } from "../utils/Web3Context";

export default function RegisterVehicle({ navigate }) {
  const { contracts, account, isConnected, shortAddress } = useWeb3();

  const [form, setForm] = useState({ vin: "", owner: "", model: "", year: "" });
  const [scAddress, setScAddress] = useState("");
  const [loading, setLoading]   = useState(false);
  const [msg,     setMsg]       = useState(null); // {type, text}

  const update = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg(null);
    const { vin, owner, model, year } = form;
    if (!vin || !owner || !model || !year) return setMsg({ type: "error", text: "All fields are required." });
    if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return setMsg({ type: "error", text: "VIN must be 17 alphanumeric characters." });
    setLoading(true);
    try {
      const tx = await contracts.vehicleRegistry.registerVehicle(vin.toUpperCase(), owner, model, Number(year));
      await tx.wait();
      setMsg({ type: "success", text: `Vehicle ${vin.toUpperCase()} registered successfully!` });
      setForm({ vin: "", owner: "", model: "", year: "" });
    } catch (err) {
      setMsg({ type: "error", text: err.reason || err.message || "Transaction failed." });
    }
    setLoading(false);
  };

  const handleAddServiceCenter = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!scAddress) return setMsg({ type: "error", text: "Enter service center address." });
    setLoading(true);
    try {
      const tx = await contracts.vehicleRegistry.addServiceCenter(scAddress);
      await tx.wait();
      setMsg({ type: "success", text: `Service center ${shortAddress(scAddress)} authorized!` });
      setScAddress("");
    } catch (err) {
      setMsg({ type: "error", text: err.reason || err.message || "Transaction failed." });
    }
    setLoading(false);
  };

  if (!isConnected) return <div className="alert alert-warn">Connect MetaMask to register vehicles.</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">＋ Register Vehicle</h1>
        <p className="page-sub">Authority-only: add new vehicles to the blockchain registry</p>
      </div>

      {msg && (
        <div className={`alert alert-${msg.type === "success" ? "success" : "error"}`}>
          {msg.text}
        </div>
      )}

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* Register Vehicle */}
        <div className="card">
          <div className="card-title">🚗 Register New Vehicle</div>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="label">VIN (17 characters)</label>
              <input className="input" placeholder="1HGBH41JXMN109186" value={form.vin}
                onChange={(e) => update("vin", e.target.value.toUpperCase())} maxLength={17} />
            </div>
            <div className="form-group">
              <label className="label">Owner Address</label>
              <input className="input" placeholder="0x..." value={form.owner}
                onChange={(e) => update("owner", e.target.value)} />
              <div style={{ marginTop: 6 }}>
                <button type="button" className="btn btn-ghost btn-sm"
                  onClick={() => update("owner", account)}>
                  Use My Address
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="label">Model</label>
              <input className="input" placeholder="Toyota Corolla 2.0" value={form.model}
                onChange={(e) => update("model", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Year</label>
              <input className="input" type="number" placeholder="2020" value={form.year}
                min="1886" max="2026"
                onChange={(e) => update("year", e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
              {loading ? <><span className="spinner" /> Processing…</> : "Register on Blockchain"}
            </button>
          </form>
        </div>

        {/* Authority Panel */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">🏢 Authorize Service Center</div>
            <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 16 }}>
              Only authority can authorize service centers to add history records.
            </p>
            <form onSubmit={handleAddServiceCenter}>
              <div className="form-group">
                <label className="label">Service Center Address</label>
                <input className="input" placeholder="0x..." value={scAddress}
                  onChange={(e) => setScAddress(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-success" disabled={loading} style={{ width: "100%" }}>
                {loading ? <><span className="spinner" /> Processing…</> : "Authorize Service Center"}
              </button>
            </form>
          </div>

          <div className="card">
            <div className="card-title">ℹ How Registration Works</div>
            <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.8 }}>
              <div style={{ marginBottom: 8 }}>① Only the <strong style={{ color: "var(--text)" }}>authority</strong> (contract deployer) can register vehicles.</div>
              <div style={{ marginBottom: 8 }}>② Each VIN must be unique — duplicate VINs are rejected on-chain.</div>
              <div style={{ marginBottom: 8 }}>③ Service centers must be authorized before adding history records.</div>
              <div>④ Once registered, all ownership and history is immutable.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
