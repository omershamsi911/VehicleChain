// src/pages/RegisterVehicle.jsx
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

function Step({ number, children }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        minWidth: 24, height: 24,
        background: "var(--accent-light)",
        border: "1px solid var(--border-strong)",
        borderRadius: "50%",
        fontFamily: "var(--font-mono)", fontSize: 10,
        color: "var(--accent)", fontWeight: 700,
        flexShrink: 0,
      }}>
        {number}
      </span>
      <span style={{
        fontFamily: "var(--font-sans)", fontSize: 13,
        color: "var(--text-secondary)", lineHeight: 1.65,
      }}>
        {children}
      </span>
    </div>
  );
}

export default function RegisterVehicle({ navigate }) {
  const { contracts, account, isConnected, shortAddress } = useWeb3();

  const [form, setForm]               = useState({ vin: "", owner: "", model: "", year: "" });
  const [scAddress, setScAddress]     = useState("");
  const [isRegistrar, setIsRegistrar] = useState(false);
  const [isAuthority, setIsAuthority] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [msg, setMsg]                 = useState(null);

  const update = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  // Check roles on mount and when account/contracts change
  useEffect(() => {
    if (isConnected && contracts?.vehicleRegistry && account) {
      checkRoles();
    }
  }, [isConnected, contracts, account]);

  const checkRoles = async () => {
    try {
      // Fetch role identifiers from the contract
      const [REGISTRAR_ROLE, AUTHORITY_ROLE] = await Promise.all([
        contracts.vehicleRegistry.REGISTRAR_ROLE(),
        contracts.vehicleRegistry.AUTHORITY_ROLE(),
      ]);
      
      // Check if the current account has these roles
      const [isReg, isAuth] = await Promise.all([
        contracts.vehicleRegistry.hasRole(REGISTRAR_ROLE, account),
        contracts.vehicleRegistry.hasRole(AUTHORITY_ROLE, account),
      ]);
      
      setIsRegistrar(isReg);
      setIsAuthority(isAuth);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg(null);
    const { vin, owner, model, year } = form;
    
    if (!vin || !owner || !model || !year) return setMsg({ type: "error", text: "All fields are required." });
    if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return setMsg({ type: "error", text: "VIN must be 17 valid alphanumeric characters." });
    
    setLoading(true);
    try {
      const tx = await contracts.vehicleRegistry.registerVehicle(vin.toUpperCase(), owner, model, Number(year));
      await tx.wait(); // Wait for transaction to be mined
      setMsg({ type: "success", text: `Vehicle ${vin.toUpperCase()} registered — NFT minted to ${shortAddress(owner)}.` });
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
      setMsg({ type: "success", text: `Service center ${shortAddress(scAddress)} authorized.` });
      setScAddress("");
    } catch (err) {
      setMsg({ type: "error", text: err.reason || err.message || "Transaction failed." });
    }
    setLoading(false);
  };

  if (!isConnected) return (
    <div style={S.alertWarnConnect}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🔐</div>
      <strong>Wallet Required</strong><br />
      Connect MetaMask to register vehicles.
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.pageHeader}>
        <span style={S.pageEyebrow}>Vehicle Registry · Authority Panel</span>
        <h1 style={S.pageTitle}>Register Vehicle</h1>
        <p style={S.pageSub}>Register new vehicles — each is minted as a unique NFT representing its title</p>
      </div>

      {/* Role banners */}
      {!isRegistrar && (
        <div style={{ ...S.alertError, background: "rgba(220,38,38,0.04)", marginBottom: 16 }}>
          🔒 Your address does not hold <strong>REGISTRAR_ROLE</strong>. Registration requires
          this role, granted to authorized government bodies (DMV branches etc.) by the admin.
        </div>
      )}
      {isRegistrar && (
        <div style={{ ...S.alertSuccess ?? S.alertInfo, marginBottom: 16 }}>
          ✅ Your address holds <strong>REGISTRAR_ROLE</strong> — you can register vehicles.
        </div>
      )}

      {msg && (
        <div style={msg.type === "success" ? S.alertSuccess : S.alertError}>
          {msg.type === "success" ? "✓ " : "✕ "}{msg.text}
        </div>
      )}

      <div style={S.grid2}>
        {/* Register form */}
        <div style={S.card}>
          <div style={S.cardTitle}>➕ Register New Vehicle</div>
          <form onSubmit={handleRegister}>
            <div style={S.formGroup}>
              <label style={S.label}>VIN (17 characters)</label>
              <input 
                style={{ ...S.input, fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}
                placeholder="1HGBH41JXMN109186" 
                value={form.vin}
                onChange={(e) => update("vin", e.target.value.toUpperCase())} 
                maxLength={17}
                disabled={!isRegistrar} 
              />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Owner Wallet Address</label>
              <input 
                style={S.input} 
                placeholder="0x..." 
                value={form.owner}
                onChange={(e) => update("owner", e.target.value)} 
                disabled={!isRegistrar} 
              />
              <button 
                type="button" 
                style={{ ...S.btnGhost, marginTop: 8, fontSize: 11 }}
                onClick={() => update("owner", account)} 
                disabled={!isRegistrar}
              >
                ↙ Use My Address
              </button>
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Model</label>
              <input 
                style={S.input} 
                placeholder="Toyota Corolla 2.0" 
                value={form.model}
                onChange={(e) => update("model", e.target.value)} 
                disabled={!isRegistrar} 
              />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Year</label>
              <input 
                style={S.input} 
                type="number" 
                placeholder="2020" 
                value={form.year}
                min="1886" max="2026" 
                onChange={(e) => update("year", e.target.value)}
                disabled={!isRegistrar} 
              />
            </div>
            <button 
              type="submit"
              style={{ ...S.btnFullPrimary, opacity: loading || !isRegistrar ? 0.5 : 1, cursor: loading || !isRegistrar ? "not-allowed" : "pointer" }}
              disabled={loading || !isRegistrar}
            >
              {loading ? <><Spinner /> Processing…</> : "Register on Blockchain (Mint NFT) →"}
            </button>
          </form>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Service center */}
          <div style={S.card}>
            <div style={S.cardTitle}>🔑 Authorize Service Center</div>
            {!isAuthority && (
              <div style={{ ...S.alertError, background: "rgba(220,38,38,0.04)", fontSize: 12, marginBottom: 12 }}>
                🔒 Requires <strong>AUTHORITY_ROLE</strong>.
              </div>
            )}
            <p style={{ ...S.pageSub, marginBottom: 16, fontSize: 13 }}>
              Authorized service centers can add service, accident, and mileage records to any vehicle.
            </p>
            <form onSubmit={handleAddServiceCenter}>
              <div style={S.formGroup}>
                <label style={S.label}>Service Center Address</label>
                <input 
                  style={S.input} 
                  placeholder="0x..." 
                  value={scAddress}
                  onChange={(e) => setScAddress(e.target.value)} 
                  disabled={!isAuthority} 
                />
              </div>
              <button 
                type="submit"
                style={{ ...S.btnFullPrimary, opacity: loading || !isAuthority ? 0.5 : 1, cursor: loading || !isAuthority ? "not-allowed" : "pointer" }}
                disabled={loading || !isAuthority}
              >
                {loading ? <><Spinner /> Processing…</> : "Authorize Center →"}
              </button>
            </form>
          </div>

          {/* How it works */}
          <div style={{ ...S.card, background: "var(--accent-light)", border: "1px solid var(--border-strong)" }}>
            <div style={{ ...S.cardTitle, borderBottomColor: "var(--border-strong)" }}>📖 How Registration Works</div>
            <Step number="01">Each vehicle is minted as a unique <strong style={{ color: "var(--accent)" }}>NFT (ERC-721)</strong>. The token ID is the on-chain title — transferring the NFT transfers ownership.</Step>
            <Step number="02">Only addresses with <strong style={{ color: "var(--accent)" }}>REGISTRAR_ROLE</strong> can register. This is granted to authorized government bodies by the admin. Multiple registrars can exist.</Step>
            <Step number="03">VINs are unique — duplicate registrations are rejected on-chain.</Step>
            <Step number="04">Service centers must hold <strong style={{ color: "var(--accent)" }}>AUTHORITY_ROLE</strong> approval before adding history records to any vehicle.</Step>
            <Step number="05">In production, the admin role should be held by a <strong style={{ color: "var(--accent)" }}>multisig wallet</strong>.</Step>
          </div>
        </div>
      </div>
    </div>
  );
}