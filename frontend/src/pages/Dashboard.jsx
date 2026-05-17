// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useWeb3 } from "../utils/Web3Context";
import S from "../styles/shared";

function Spinner() {
  return (
    <span style={{
      width: 18, height: 18, borderRadius: "50%",
      border: "2px solid var(--border-strong)",
      borderTopColor: "var(--accent)",
      display: "inline-block",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}

function QuickAction({ icon, label, desc, onClick, variant = "default" }) {
  const isGreen = variant === "green";
  const isDanger = variant === "danger";
  const [hovered, setHovered] = React.useState(false);

  const bg = isGreen
    ? (hovered ? "var(--accent)" : "linear-gradient(135deg, var(--accent), #15803d)")
    : isDanger
      ? (hovered ? "var(--danger)" : "var(--danger-bg)")
      : (hovered ? "var(--accent-light)" : "var(--surface)");

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "flex-start",
        gap: 6, padding: "18px 20px", background: bg,
        border: `1px solid ${isDanger ? "var(--danger-border)" : isGreen ? "transparent" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)", cursor: "pointer",
        transition: "all 0.2s", textAlign: "left",
        boxShadow: isGreen ? "var(--shadow-green)" : "var(--shadow-sm)",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: isGreen ? "#fff" : isDanger ? "var(--danger)" : "var(--text)", marginBottom: 2 }}>{label}</div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: isGreen ? "rgba(255,255,255,0.75)" : isDanger ? "var(--danger)" : "var(--text-muted)", lineHeight: 1.4 }}>{desc}</div>
      </div>
    </button>
  );
}

export default function Dashboard({ navigate }) {
  const { contracts, account, isConnected, formatToken, shortAddress } = useWeb3();

  const [myVINs,    setMyVINs]    = useState([]);
  const [vehicles,  setVehicles]  = useState([]);
  const [tokenBal,  setTokenBal]  = useState("0");
  const [stakedBal, setStakedBal] = useState("0");
  const [totalVeh,  setTotalVeh]  = useState("0");
  const [loading,   setLoading]   = useState(false);
  const [searchVIN, setSearchVIN] = useState("");

  useEffect(() => {
    if (!isConnected || !contracts.vehicleRegistry) return;
    loadDashboard();
  }, [isConnected, contracts, account]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      // Get standard balances
      const [bal, staked, total] = await Promise.all([
        contracts.govToken.balanceOf(account),
        contracts.govToken.stakedBalance(account),
        contracts.vehicleRegistry.totalVehicles(), // FIXED method name
      ]);
      
      setTokenBal(formatToken(bal));
      setStakedBal(formatToken(staked));
      setTotalVeh(total.toString());

      // Fetch user's vehicles via ERC721Enumerable
      const nftBalance = await contracts.vehicleRegistry.balanceOf(account);
      const ownedVins = [];
      const ownedVehicles = [];

      for (let i = 0; i < Number(nftBalance); i++) {
        const tokenId = await contracts.vehicleRegistry.tokenOfOwnerByIndex(account, i);
        const vData = await contracts.vehicleRegistry.getVehicleByTokenId(tokenId);
        
        ownedVins.push(vData.data.vin);
        ownedVehicles.push({
          owner: vData.owner,
          vin: vData.data.vin,
          model: vData.data.model,
          year: vData.data.year,
          isStolen: vData.data.isStolen,
          registeredAt: vData.data.registeredAt
        });
      }

      setMyVINs(ownedVins);
      setVehicles(ownedVehicles);
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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: "60px 24px", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "var(--radius-xl)", background: "linear-gradient(135deg, var(--accent), #15803d)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", boxShadow: "var(--shadow-green)" }}>
          <span style={{ fontSize: 32, color: "#fff" }}>🚗</span>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", display: "block", marginBottom: 12 }}>Decentralised Vehicle Registry</span>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 48, fontWeight: 700, color: "var(--text)", margin: "0 0 14px", lineHeight: 1.1, maxWidth: 480 }}>VehicleChain</h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--text-secondary)", marginBottom: 36, maxWidth: 380, lineHeight: 1.75 }}>Ownership · History · Dispute Governance — all on-chain, immutable, and transparent.</p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Connect MetaMask to continue →</p>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.pageHeader}>
        <span style={S.pageEyebrow}>Overview · Connected</span>
        <h1 style={S.pageTitle}>Dashboard</h1>
        <p style={{ ...S.pageSub, fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.04em" }}>{shortAddress(account)}</p>
      </div>

      <div style={S.statsGrid}>
        {[
          { num: myVINs.length, label: "Your Vehicles", color: "var(--accent)" },
          { num: tokenBal,      label: "VCT Balance",   color: "var(--text)"   },
          { num: stakedBal,     label: "VCT Staked",    color: "var(--text-secondary)" },
          { num: totalVeh,      label: "Total on Chain",color: "var(--text-muted)" },
        ].map(({ num, label, color }) => (
          <div key={label} style={S.statCard}>
            <span style={{ ...S.statNum, color }}>{num}</span>
            <span style={S.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>🔍 Search Vehicle by VIN</div>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 10 }}>
          <input style={{ ...S.inputFlex, fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.04em" }} placeholder="Enter VIN — e.g. 1HGBH41JXMN109186" value={searchVIN} onChange={(e) => setSearchVIN(e.target.value)} />
          <button type="submit" style={S.btnPrimary}>View Details →</button>
        </form>
      </div>

      <div style={{ ...S.card, marginBottom: 20 }}>
        <div style={S.cardTitle}>⚡ Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          <QuickAction icon="➕" label="Register Vehicle" desc="Add to blockchain" onClick={() => navigate("register")} variant="green" />
          <QuickAction icon="⇄" label="Transfer" desc="Change ownership" onClick={() => navigate("transfer")} />
          <QuickAction icon="📋" label="Add History" desc="Service records" onClick={() => navigate("history")} />
          <QuickAction icon="🚨" label="File FIR" desc="Report theft" onClick={() => navigate("theft")} variant="danger" />
          <QuickAction icon="⚖" label="DAO Votes" desc="Raise disputes" onClick={() => navigate("dao")} />
          <QuickAction icon="🪙" label="Tokens" desc="Stake & manage VCT" onClick={() => navigate("token")} />
        </div>
      </div>

      <div style={S.card}>
        <div style={{ ...S.cardTitle, justifyContent: "space-between" }}>
          <span>🚗 Your Vehicles</span>
          <button style={S.btnSecondary} onClick={() => navigate("register")}>+ Register New</button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}><Spinner /></div>
        ) : vehicles.length === 0 ? (
          <div style={S.emptyState}>
            <span style={S.emptyIcon}>🚗</span>
            <p style={S.emptyText}>No vehicles registered to your address yet</p>
            <button style={S.btnPrimary} onClick={() => navigate("register")}>Register First Vehicle</button>
          </div>
        ) : (
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead><tr>{["VIN", "Model", "Year", "Status", "Action"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {vehicles.map((v, i) => (
                  <tr key={i} style={{ transition: "background 0.1s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--accent-light)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={S.tdMono}>{v.vin}</td>
                    <td style={S.td}>{v.model}</td>
                    <td style={S.tdMono}>{v.year?.toString()}</td>
                    <td style={S.td}>{v.isStolen ? <span style={S.badgeRed}>● Stolen</span> : <span style={S.badgeGreen}>✓ Clear</span>}</td>
                    <td style={S.td}><button style={S.btnSecondary} onClick={() => navigate("vehicle", v.vin)}>View →</button></td>
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