// src/pages/AboutPage.jsx
import React from "react";
import S from "../styles/shared";

export const AboutPage = ({ navigate }) => {   // 👈 receive navigate prop
  const features = [
    { icon: "🔗", title: "Blockchain Verified", description: "All vehicle records are immutably stored on the blockchain for maximum transparency." },
    { icon: "🚗", title: "Complete History", description: "Track every ownership transfer, maintenance, and accident in one place." },
    { icon: "🛡️", title: "Fraud Prevention", description: "Cryptographic verification prevents odometer fraud and title washing." },
    { icon: "⚙️", title: "Smart Contracts", description: "Automated ownership transfers and dispute resolution through smart contracts." },
    { icon: "🗳️", title: "DAO Governance", description: "Community-driven governance through token-based voting mechanisms." },
    { icon: "💰", title: "Token Economics", description: "Earn rewards by participating in the network as a validator or token holder." },
  ];

  const team = [
    { name: "Syed Omer Ahmed Shamsi", role: "Founder & CEO", bio: "Blockchain enthusiast" },
    { name:"Umer Safee", role: "CTO", bio: "Smart contract expert and blockchain architect" },
    { name: "Musfirah Waseem", role: "Operations Lead", bio: "Experienced in regulatory compliance and partnerships" },
    { name: "Claude", role: "Community Manager", bio: "Building bridges between users and the protocol" },
  ];

  return (
    <div style={S.page}>
      {/* Page Header */}
      <div style={S.pageHeader}>
        <span style={S.pageEyebrow}>About VehicleChain</span>
        <h1 style={S.pageTitle}>Decentralised Vehicle Registry</h1>
        <p style={S.pageSub}>
          Revolutionizing vehicle ownership through transparent blockchain technology.
        </p>
      </div>

      {/* Mission & Vision */}
      <div style={{ ...S.grid2, marginBottom: 32 }}>
        <div style={S.card}>
          <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, marginBottom: "1rem", fontSize: "1.25rem" }}>
            Our Mission
          </h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
            To create a transparent, secure, and decentralized platform for vehicle ownership and history management. We believe that every vehicle owner deserves access to complete, tamper-proof records of their vehicle's history.
          </p>
          <p style={{ marginBottom: 0, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            VehicleChain eliminates fraud, builds trust, and empowers users with complete control over their vehicle data.
          </p>
        </div>
        <div style={S.card}>
          <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, marginBottom: "1rem", fontSize: "1.25rem" }}>
            Our Vision
          </h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
            A world where vehicle ownership is transparent, secure, and accessible to everyone. Through blockchain technology and community governance, we're building the future of automotive records.
          </p>
          <p style={{ marginBottom: 0, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Our vision extends beyond vehicles—creating a standard for asset verification that can be applied across industries.
          </p>
        </div>
      </div>

      {/* Key Features */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, marginBottom: "1.5rem", fontSize: "1.25rem" }}>
          Key Features
        </h2>
        <div style={S.grid3}>
          {features.map((feature, idx) => (
            <div key={idx} style={S.card}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{feature.icon}</div>
              <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 600, marginBottom: "0.5rem", fontSize: "1rem" }}>
                {feature.title}
              </h3>
              <p style={{ marginBottom: 0, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div style={{ ...S.card, marginBottom: 32 }}>
        <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, marginBottom: "1.5rem", fontSize: "1.25rem" }}>
          Why Choose VehicleChain?
        </h2>
        <div style={S.grid2}>
          {[
            { icon: "🔒", title: "Security First", desc: "Cryptographic hashing ensures your data cannot be altered or forged." },
            { icon: "⚡", title: "Real-time Verification", desc: "Instantly verify vehicle history and ownership across the network." },
            { icon: "🌍", title: "Global Standard", desc: "Blockchain technology enables international vehicle verification without intermediaries." },
            { icon: "💎", title: "Tokenized Incentives", desc: "Earn governance tokens by actively participating in the ecosystem." },
          ].map((item, idx) => (
            <div key={idx}>
              <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 600, marginBottom: "0.75rem", fontSize: "1rem" }}>
                {item.icon} {item.title}
              </h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, marginBottom: "1.5rem", fontSize: "1.25rem" }}>
          Meet Our Team
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20 }}>
          {team.map((member, idx) => (
            <div key={idx} style={{ ...S.card, textAlign: "center" }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--accent), rgba(16, 185, 129, 0.3))",
                  margin: "0 auto 1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                }}
              >
                👤
              </div>
              <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 600, marginBottom: "0.25rem", fontSize: "1rem" }}>
                {member.name}
              </h3>
              <p style={{ marginBottom: "0.75rem", color: "var(--accent)", fontWeight: 600, fontSize: "0.85rem" }}>
                {member.role}
              </p>
              <p style={{ marginBottom: 0, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline / Journey */}
      <div style={{ ...S.card, marginBottom: 32 }}>
        <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, marginBottom: "2rem", fontSize: "1.25rem" }}>
          Our Journey
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {[
            { year: "2026", title: "Founded", desc: "VehicleChain was founded by a team of blockchain and automotive experts." },
            { year: "2026", title: "Beta Launch", desc: "Released closed beta with initial pilot vehicles and partnerships." },
            { year: "2026", title: "Mainnet Launch", desc: "Launched on mainnet with full smart contract suite." },
            { year: "2026", title: "Ecosystem Growth", desc: "Expanding partnerships with dealers, insurers, and regulators worldwide." },
          ].map((milestone, idx) => (
            <div key={idx} style={{ display: "flex", gap: "1.5rem", alignItems: "start" }}>
              <div style={{ width: "80px", textAlign: "center", flexShrink: 0 }}>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)", marginBottom: 0 }}>
                  {milestone.year}
                </p>
              </div>
              <div style={{ flex: 1, paddingBottom: idx < 3 ? "1rem" : 0, borderBottom: idx < 3 ? "1px solid var(--border)" : "none" }}>
                <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 600, marginBottom: "0.25rem", fontSize: "1rem" }}>
                  {milestone.title}
                </h3>
                <p style={{ marginBottom: 0, color: "var(--text-secondary)" }}>{milestone.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA – using navigate prop instead of <Link> */}
      <div style={{ ...S.cardGreen, textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, marginBottom: "1rem", fontSize: "1.5rem" }}>
          Ready to Join the Revolution?
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "1.1rem" }}>
          Start managing your vehicle on the blockchain today.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("register")}
            style={S.btnPrimary}
          >
            Register Your Vehicle
          </button>
          <button
            onClick={() => navigate("dashboard")}
            style={S.btnSecondary}
          >
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};