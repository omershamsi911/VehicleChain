import React, { useState, useEffect } from "react";
import { useWeb3 } from "../utils/Web3Context";
import S from "../styles/shared";

function Spinner() {
  return (
    <span style={{
      width: 14, height: 14, borderRadius: "50%",
      border: "2px solid rgba(255,255,255,0.3)",
      borderTopColor: "#fff", display: "inline-block",
      animation: "spin 0.7s linear infinite", flexShrink: 0
    }} />
  );
}

// Map logical app names to their contract instances in the Web3Context
const APP_CONTRACT_MAP = {
  registry: "vehicleRegistry",
  theft:    "theftReport",
  history:  "vehicleHistory",
  token:    "govToken",
  transfer: "ownershipTransfer"
};

// Map human-readable roles to their exact getter function names on the smart contracts
const APP_ROLES = {
  registry: [
    { label: "REGISTRAR_ROLE (Register vehicles)", method: "REGISTRAR_ROLE" },
    { label: "AUTHORITY_ROLE (Manage status/centers)", method: "AUTHORITY_ROLE" },
  ],
  theft: [
    { label: "FIR_FILER_ROLE (File stolen reports)", method: "FIR_FILER_ROLE" },
    { label: "RECOVERY_ROLE (Mark recovered)", method: "RECOVERY_ROLE" },
  ],
  history: [
    { label: "HISTORY_ADMIN_ROLE (Override records)", method: "HISTORY_ADMIN_ROLE" },
  ],
  token: [
    { label: "MINTER_ROLE (Mint VCT)", method: "MINTER_ROLE" },
    { label: "BURNER_ROLE (Burn VCT)", method: "BURNER_ROLE" },
    { label: "STAKING_MANAGER (Slash stakes)", method: "STAKING_MANAGER" },
  ],
  transfer: [
    { label: "TRANSFER_MANAGER_ROLE (Cancel transfers)", method: "TRANSFER_MANAGER_ROLE" },
  ]
};

export default function AdminPage() {
  const { contracts, account, isConnected, shortAddress } = useWeb3();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState(null);

  // System Roles State
  const [targetApp, setTargetApp]   = useState("registry");
  const [targetRole, setTargetRole] = useState("REGISTRAR_ROLE");
  const [roleAddress, setRoleAddress] = useState("");

  // Validator State
  const [validatorAddress, setValidatorAddress] = useState("");
  const [activeValidators, setActiveValidators] = useState([]);

  // Service Center State
  const [centerAddress, setCenterAddress] = useState("");

  const showMsg = (type, text) => setMsg({ type, text });

  useEffect(() => {
    if (isConnected && contracts.vehicleRegistry) {
      checkAdminAndLoadData();
    }
  }, [isConnected, contracts, account]);

  // When changing apps, reset the default selected role dropdown
  useEffect(() => {
    setTargetRole(APP_ROLES[targetApp][0].method);
  }, [targetApp]);

  const checkAdminAndLoadData = async () => {
    try {
      // Check if user has DEFAULT_ADMIN_ROLE on the registry
      const DEFAULT_ADMIN_ROLE = await contracts.vehicleRegistry.DEFAULT_ADMIN_ROLE();
      const adminStatus = await contracts.vehicleRegistry.hasRole(DEFAULT_ADMIN_ROLE, account);
      setIsAdmin(adminStatus);

      if (adminStatus) {
        await fetchValidators();
      }
    } catch (err) {
      console.error("Admin check failed:", err);
    }
  };

  const fetchValidators = async () => {
    try {
      const vals = await contracts.disputeDAO.getValidators();
      // Filter out removed validators (optional, but good for UI)
      const VALIDATOR_ROLE = await contracts.disputeDAO.VALIDATOR_ROLE();
      const active = [];
      for (let v of vals) {
        const hasRole = await contracts.disputeDAO.hasRole(VALIDATOR_ROLE, v);
        if (hasRole) active.push(v);
      }
      setActiveValidators(active);
    } catch (err) {
      console.error(err);
    }
  };

  const execTx = async (action, successText) => {
    setMsg(null); setLoading(true);
    try {
      const tx = await action();
      await tx.wait();
      showMsg("success", successText);
      await fetchValidators(); // Refresh state
    } catch (err) {
      showMsg("error", err.reason || err.message);
    }
    setLoading(false);
  };

  // --- Handlers ---

  const handleGrantRole = (e) => {
    e.preventDefault();
    if (!roleAddress) return showMsg("error", "Address required.");
    const contract = contracts[APP_CONTRACT_MAP[targetApp]];
    execTx(async () => {
      const roleBytes = await contract[targetRole]();
      return await contract.grantRole(roleBytes, roleAddress);
    }, `Granted ${targetRole} to ${shortAddress(roleAddress)}`);
  };

  const handleRevokeRole = (e) => {
    e.preventDefault();
    if (!roleAddress) return showMsg("error", "Address required.");
    const contract = contracts[APP_CONTRACT_MAP[targetApp]];
    execTx(async () => {
      const roleBytes = await contract[targetRole]();
      return await contract.revokeRole(roleBytes, roleAddress);
    }, `Revoked ${targetRole} from ${shortAddress(roleAddress)}`);
  };

  const handleAddValidator = (e) => {
    e.preventDefault();
    if (!validatorAddress) return showMsg("error", "Address required.");
    execTx(
      () => contracts.disputeDAO.addValidator(validatorAddress),
      `Added ${shortAddress(validatorAddress)} as a DAO Validator`
    );
  };

  const handleRemoveValidator = (addressToRemove) => {
    execTx(
      () => contracts.disputeDAO.removeValidator(addressToRemove),
      `Removed ${shortAddress(addressToRemove)} from DAO Validators`
    );
  };

  const handleAddServiceCenter = (e) => {
    e.preventDefault();
    if (!centerAddress) return showMsg("error", "Address required.");
    execTx(
      () => contracts.vehicleRegistry.addServiceCenter(centerAddress),
      `Authorized ${shortAddress(centerAddress)} as a Service Center`
    );
  };

  const handleRemoveServiceCenter = (e) => {
    e.preventDefault();
    if (!centerAddress) return showMsg("error", "Address required.");
    execTx(
      () => contracts.vehicleRegistry.removeServiceCenter(centerAddress),
      `Revoked Service Center status for ${shortAddress(centerAddress)}`
    );
  };

  if (!isConnected) return (
    <div style={S.page}>
      <div style={S.alertWarnConnect}>Connect MetaMask as an Administrator.</div>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.pageHeader}>
        <span style={S.pageEyebrow}>System Control</span>
        <h1 style={S.pageTitle}>Admin Dashboard</h1>
        <p style={S.pageSub}>Manage roles, validators, and service centers.</p>
      </div>

      {!isAdmin && (
        <div style={{ ...S.alertError, marginBottom: 20 }}>
          <strong>Access Denied:</strong> The connected wallet ({shortAddress(account)}) does not hold the DEFAULT_ADMIN_ROLE. Transactions will fail.
        </div>
      )}

      {msg && (
        <div style={msg.type === "success" ? S.alertSuccess : S.alertError}>
          {msg.type === "success" ? "✓ " : "✕ "} {msg.text}
        </div>
      )}

      <div style={S.grid2}>
        
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* System Roles Assignment */}
          <div style={S.card}>
            <div style={S.cardTitle}>🔑 Manage System Roles</div>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16 }}>
              Grant or revoke AccessControl roles across the ecosystem contracts.
            </p>
            
            <form>
              <div style={S.formGroup}>
                <label style={S.label}>Select Contract</label>
                <select style={S.input} value={targetApp} onChange={(e) => setTargetApp(e.target.value)}>
                  <option value="registry">Vehicle Registry</option>
                  <option value="theft">Theft Report</option>
                  <option value="history">Vehicle History</option>
                  <option value="token">Gov Token (VCT)</option>
                  <option value="transfer">Ownership Transfer</option>
                </select>
              </div>

              <div style={S.formGroup}>
                <label style={S.label}>Select Role</label>
                <select style={S.input} value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
                  {APP_ROLES[targetApp].map(role => (
                    <option key={role.method} value={role.method}>{role.label}</option>
                  ))}
                </select>
              </div>

              <div style={S.formGroup}>
                <label style={S.label}>Target Wallet Address</label>
                <input 
                  style={S.input} 
                  placeholder="0x..." 
                  value={roleAddress} 
                  onChange={(e) => setRoleAddress(e.target.value)} 
                />
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button type="submit" style={S.btnPrimary} disabled={loading} onClick={handleGrantRole}>
                  {loading ? <Spinner /> : "Grant Role"}
                </button>
                <button type="button" style={S.btnDanger} disabled={loading} onClick={handleRevokeRole}>
                  {loading ? <Spinner /> : "Revoke Role"}
                </button>
              </div>
            </form>
          </div>

          {/* Service Centers */}
          <div style={S.card}>
            <div style={S.cardTitle}>🔧 Manage Service Centers</div>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16 }}>
              Service centers are authorized to append maintenance and mileage records to the Vehicle History contract.
            </p>
            <form>
              <div style={S.formGroup}>
                <label style={S.label}>Center Wallet Address</label>
                <input 
                  style={S.input} 
                  placeholder="0x..." 
                  value={centerAddress} 
                  onChange={(e) => setCenterAddress(e.target.value)} 
                />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button type="submit" style={S.btnSuccess} disabled={loading} onClick={handleAddServiceCenter}>
                  {loading ? <Spinner /> : "Authorize Center"}
                </button>
                <button type="button" style={S.btnDanger} disabled={loading} onClick={handleRemoveServiceCenter}>
                  {loading ? <Spinner /> : "Remove Center"}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* DAO Validators */}
          <div style={{ ...S.card, background: "var(--accent-light)", border: "1px solid var(--border-strong)" }}>
            <div style={S.cardTitle}>⚖ DAO Validators</div>
            <div style={{ ...S.alertInfo, fontSize: 12, marginBottom: 16 }}>
              <strong>Important:</strong> Always use `addValidator` to grant validator rights. Do not use generic grantRole, as DisputeDAO requires explicit tracking for vote weight snapshots.
            </div>
            
            <form onSubmit={handleAddValidator} style={{ marginBottom: 20 }}>
              <div style={S.formGroup}>
                <label style={S.label}>Validator Organization Address</label>
                <input 
                  style={S.input} 
                  placeholder="0x..." 
                  value={validatorAddress} 
                  onChange={(e) => setValidatorAddress(e.target.value)} 
                />
              </div>
              <button type="submit" style={S.btnFullPrimary} disabled={loading}>
                {loading ? <Spinner /> : "Add DAO Validator"}
              </button>
            </form>

            <div style={S.divider} />
            
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>
              Active Validators ({activeValidators.length})
            </div>
            
            {activeValidators.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No validators whitelisted.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {activeValidators.map(v => (
                  <div key={v} style={{ 
                    display: "flex", justifyContent: "space-between", alignItems: "center", 
                    padding: "10px 12px", background: "var(--bg)", 
                    borderRadius: "var(--radius)", border: "1px solid var(--border)"
                  }}>
                    <span style={S.mono}>{shortAddress(v)}</span>
                    <button 
                      style={{ ...S.btnDanger, padding: "4px 8px", fontSize: 11 }}
                      disabled={loading}
                      onClick={() => handleRemoveValidator(v)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}