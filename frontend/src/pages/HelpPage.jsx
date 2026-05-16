// src/pages/HelpPage.jsx
import React, { useState } from "react";
import S from "../styles/shared";

export const HelpPage = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      category: "Getting Started",
      items: [
        {
          q: "How do I register my vehicle?",
          a: 'Go to the "Register Vehicle" page and fill in your vehicle details including VIN, make, model, year, and license plate. Your vehicle will be recorded on the blockchain immediately.',
        },
        {
          q: "What information do I need to register?",
          a: "You will need: VIN (Vehicle Identification Number), Make, Model, Year, Color, License Plate, and Registration Number. Additional details like owner name and purchase date are optional.",
        },
        {
          q: "Is there a fee to register?",
          a: "Yes, there is a small blockchain transaction fee (gas fee) that varies depending on network conditions. Current fee: ~0.1 ETH.",
        },
      ],
    },
    {
      category: "Vehicle Management",
      items: [
        {
          q: "How do I transfer my vehicle to another owner?",
          a: 'Go to the "Transfer Ownership" page, select your vehicle, enter the new owner\'s wallet address, and confirm. The new owner will receive a transfer notification.',
        },
        {
          q: "Can I update my vehicle information?",
          a: "Yes, you can add events to your vehicle's history through the History page. Major information changes may require verification.",
        },
        {
          q: "How do I report a stolen vehicle?",
          a: 'Visit the "Report Theft" page, select the vehicle, provide theft details, and submit. This creates an immutable theft record on the blockchain.',
        },
        {
          q: "What happens if there's a dispute?",
          a: "Our DAO governance system handles disputes. Token holders can vote on disputed vehicles, and decisions are enforced automatically by smart contracts.",
        },
      ],
    },
    {
      category: "History & Records",
      items: [
        {
          q: "What can I track in vehicle history?",
          a: "You can track: ownership transfers, maintenance records, repairs, inspections, accidents, mileage, and any other significant events.",
        },
        {
          q: "Is the history immutable?",
          a: "Yes! Once recorded on the blockchain, history cannot be altered or deleted. This prevents fraud and odometer tampering.",
        },
        {
          q: "Can others see my vehicle history?",
          a: "Your vehicle records are publicly verifiable on the blockchain (for security purposes), but only you can modify them as the owner.",
        },
      ],
    },
    {
      category: "Tokens & Governance",
      items: [
        {
          q: "What are VCH tokens used for?",
          a: "VCH tokens give you voting rights in platform governance, grant access to premium features, provide fee discounts, and earn staking rewards.",
        },
        {
          q: "How do I earn tokens?",
          a: "You can earn tokens by: staking your current tokens (15% APY), participating in platform activities, or purchasing them on exchanges.",
        },
        {
          q: "How do I stake my tokens?",
          a: "Go to the Token page, navigate to Staking, enter your stake amount (minimum 10 VCH), and confirm. You'll earn rewards over the lock period.",
        },
        {
          q: "Can I vote on proposals?",
          a: "Yes! If you hold VCH tokens, you can vote on governance proposals. Each token equals one vote.",
        },
      ],
    },
    {
      category: "Technical",
      items: [
        {
          q: "What blockchain does VehicleChain use?",
          a: "VehicleChain is built on Ethereum, leveraging its security and global adoption for vehicle records.",
        },
        {
          q: "Is my data secure?",
          a: "Yes. Your data is encrypted and stored on a decentralized blockchain network. Private keys ensure only you can modify your records.",
        },
        {
          q: "What wallet do I need?",
          a: "You need an Ethereum-compatible wallet (MetaMask, WalletConnect, etc.) to interact with the platform.",
        },
        {
          q: "What are gas fees?",
          a: "Gas fees are blockchain transaction costs paid in ETH. They vary based on network congestion. Check current gas prices before transactions.",
        },
      ],
    },
    {
      category: "Troubleshooting",
      items: [
        {
          q: "My transaction failed. What should I do?",
          a: "Check your wallet balance, ensure you have enough ETH for gas fees, and try again. If it persists, contact support with your transaction hash.",
        },
        {
          q: "I forgot my password. How do I recover my account?",
          a: "VehicleChain uses blockchain wallets—use your wallet's recovery phrase to regain access. Never share your seed phrase with anyone.",
        },
        {
          q: "How do I contact support?",
          a: "Email us at support@vehiclechain.io or join our Discord community for immediate assistance.",
        },
        {
          q: "Where can I report a bug?",
          a: "Report bugs on our GitHub repository or email security@vehiclechain.io for security-related issues.",
        },
      ],
    },
  ];

  return (
    <div style={S.page}>
      {/* Page Header */}
      <div style={S.pageHeader}>
        <span style={S.pageEyebrow}>Support</span>
        <h1 style={S.pageTitle}>Help & Support</h1>
        <p style={S.pageSub}>
          Find answers to common questions and learn how to use VehicleChain.
        </p>
      </div>

      {/* Quick Links */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 14,
          marginBottom: 32,
        }}
      >
        {[
          { icon: "📝", title: "Getting Started", color: "var(--accent)" },
          { icon: "🚗", title: "Vehicle Management", color: "var(--accent)" },
          { icon: "📊", title: "History & Records", color: "var(--accent)" },
          { icon: "🪙", title: "Tokens & Governance", color: "var(--accent)" },
        ].map((item, idx) => (
          <div key={idx} style={{ ...S.card, textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{item.icon}</div>
            <p style={{ marginBottom: 0, fontWeight: 600, color: item.color }}>
              {item.title}
            </p>
          </div>
        ))}
      </div>

      {/* FAQs by Category */}
      {faqs.map((category, catIdx) => (
        <div key={catIdx} style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              marginBottom: "1rem",
              paddingBottom: "0.75rem",
              borderBottom: "2px solid var(--accent)",
              fontFamily: "var(--font-sans)",
              fontWeight: 700,
            }}
          >
            {category.category}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {category.items.map((faq, idx) => {
              const faqId = `${catIdx}-${idx}`;
              const isExpanded = expandedFaq === faqId;

              return (
                <div key={faqId} style={S.card}>
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : faqId)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      color: "inherit",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1rem",
                        marginBottom: 0,
                        textAlign: "left",
                        fontFamily: "var(--font-sans)",
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      {faq.q}
                    </h3>
                    <span
                      style={{
                        fontSize: "1.25rem",
                        color: "var(--accent)",
                        flexShrink: 0,
                        marginLeft: "1rem",
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      ↓
                    </span>
                  </button>

                  {isExpanded && (
                    <div
                      style={{
                        marginTop: "1rem",
                        paddingTop: "1rem",
                        borderTop: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                        fontFamily: "var(--font-sans)",
                        lineHeight: 1.7,
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Contact Section */}
      <div style={{ marginTop: "3rem" }}>
        <div style={{ ...S.card, background: "var(--accent-light)", border: "1px solid var(--border-strong)" }}>
          <h2 style={{ marginBottom: "1rem", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
            Can't Find Your Answer?
          </h2>
          <p style={{ marginBottom: "1.5rem", color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>
            Our support team is here to help. Reach out through any of these channels:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
            {[
              { label: "Email", value: "support@vehiclechain.io", link: "mailto:support@vehiclechain.io" },
              { label: "Discord", value: "Join Community", link: "#discord" },
              { label: "Twitter", value: "@VehicleChain", link: "#twitter" },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "1rem",
                  backgroundColor: "var(--bg)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                }}
              >
                <p style={{ marginBottom: "0.5rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em" }}>
                  {item.label}
                </p>
                <a
                  href={item.link}
                  style={{
                    fontWeight: 600,
                    color: "var(--accent)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {item.value}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};