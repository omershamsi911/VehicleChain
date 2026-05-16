# 🚗 VehicleChain

<div align="center">

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity&logoColor=white)](https://soliditylang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Ethereum](https://img.shields.io/badge/Ethereum-Testnet-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white)](https://ethereum.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![NED University](https://img.shields.io/badge/NED-UET-002D72?style=for-the-badge)](https://www.neduet.edu.pk)

**Decentralised Vehicle History, Ownership & Dispute Resolution**  
*Immutable. Transparent. Community-Governed.*

CT-403 Blockchain Technologies | NED University | Spring 2026

</div>

---

## 📖 Table of Contents

- [🎯 The Problem](#-the-problem)
- [💡 Solution](#-solution)
- [🏗 Architecture & Smart Contracts](#-architecture--smart-contracts)
- [⚙️ Quick Start](#️-quick-start)
  - [1. Deploy Contracts (Remix)](#1-deploy-contracts-remix)
  - [2. Configure Frontend](#2-configure-frontend)
  - [3. Run the DApp](#3-run-the-dapp)
- [🎮 Demo Walkthrough](#-demo-walkthrough)
  - [🚦 Normal Flow](#-normal-flow)
  - [🚨 Theft Flow](#-theft-flow)
  - [🗳 DAO Flow](#-dao-flow)
- [🧠 OOP Design & Security](#-oop-design--security)
- [🛠 Tech Stack](#-tech-stack)
- [👥 Team & Context](#-team--context)
- [📄 License](#-license)

---

## 🎯 The Problem

Traditional vehicle registries are **centralised, opaque, and prone to fraud**.  
Buyers cannot reliably verify ownership history, accident records, or theft status before purchasing.  
Odometer tampering, title washing, and forged documents cost billions annually.

---

## 💡 Solution

**VehicleChain** replaces centralised trust with **blockchain-verified truth**.  
Every vehicle lives as an on-chain token with:

- ✅ **Immutable history** – service, accident, mileage  
- 🔐 **Cryptographic ownership** – transfers only via smart contract  
- 🚨 **On-chain theft reports** (FIR)  
- 🗳 **DAO governance** – community-driven dispute resolution  

No single authority can alter records. Trust is built into the protocol.

---

## 🏗 Architecture & Smart Contracts

The system consists of **6 Solidity contracts** that interact through clean interfaces:

| # | Contract | Purpose |
|---|----------|---------|
| 1 | `GovToken.sol` | ERC-20 governance token (VCT) – staking, voting, rewards |
| 2 | `VehicleRegistry.sol` | Register vehicles, manage authorised service centres |
| 3 | `VehicleHistory.sol` | Immutable log of service, accident, mileage events |
| 4 | `TheftReport.sol` | File / resolve FIRs; mark vehicles stolen/recovered |
| 5 | `OwnershipTransfer.sol` | Two-step secure transfer (initiate → approve) |
| 6 | `DisputeDAO.sol` | Token-weighted voting on disputes, with economic incentives |

All contracts are deployed on **Ethereum-compatible testnets** (Sepolia / local VM).

---

## ⚙️ Quick Start

### Prerequisites

- [Node.js 18+](https://nodejs.org)
- [MetaMask](https://metamask.io) browser extension
- [Remix IDE](https://remix.ethereum.org) (or Hardhat/Foundry)

---

### 1. Deploy Contracts (Remix)

1. Upload all `.sol` files from the `contracts/` folder to Remix.
2. Set **Solidity compiler** to `0.8.20` → Compile all.
3. Switch to **Injected Provider (MetaMask)** – ensure you’re on a testnet.

**Deploy in this exact order:**

```bash
A) GovToken
   Constructor: initialSupply = 1000000 (1 million tokens)
   → Copy deployed address → GOV_TOKEN

B) VehicleRegistry
   → Copy → VEHICLE_REGISTRY

C) VehicleHistory
   Constructor: registryAddress = <VehicleRegistry address>
   → Copy → VEHICLE_HISTORY

D) TheftReport
   Constructor: registryAddress = <VehicleRegistry address>
   → Copy → THEFT_REPORT

E) OwnershipTransfer
   Constructor: registryAddress = <VehicleRegistry address>
   → Copy → OWNERSHIP_TRANSFER

F) DisputeDAO
   Constructor: tokenAddress = <GovToken address>
   → Copy → DISPUTE_DAO
```

**Post-deployment setup:**

```bash
G) In VehicleRegistry, call:
   setTransferContract(<OwnershipTransfer address>)
   // Authorises OwnershipTransfer to update registry

H) In GovToken, call:
   mint(<your MetaMask address>, 10000000000000000000000)
   // Gives you 10,000 VCT for testing
```

---

### 2. Configure Frontend

Open `frontend/src/utils/contracts.js` and replace all placeholder addresses:

```js
export const ADDRESSES = {
  GOV_TOKEN:          "0xYourGovTokenAddress",
  VEHICLE_REGISTRY:   "0xYourVehicleRegistryAddress",
  VEHICLE_HISTORY:    "0xYourVehicleHistoryAddress",
  THEFT_REPORT:       "0xYourTheftReportAddress",
  OWNERSHIP_TRANSFER: "0xYourOwnershipTransferAddress",
  DISPUTE_DAO:        "0xYourDisputeDAOAddress",
};
```

---

### 3. Run the DApp

```bash
cd frontend
npm install
npm start
```

App opens at [http://localhost:3000](http://localhost:3000).  
Connect **MetaMask** to the same network where the contracts are deployed.

---

## 🎮 Demo Walkthrough

### 🚦 Normal Flow

1. **Token Dashboard** → Mint 10,000 VCT to your wallet.
2. **Register** → Add vehicle: VIN `1HGBH41JXMN109186`, Toyota Corolla, 2020.
3. **History** → Add service record (Oil change) + mileage log (45,000 km).
4. **Vehicle Details** → Search VIN → see complete, immutable history.
5. **Transfer** → Initiate transfer to a second MetaMask account.
6. (Switch account) → **Approve Transfer**.
7. **Vehicle Details** → Ownership updated on-chain.

### 🚨 Theft Flow

1. **File FIR** → Report VIN as stolen.
2. **Vehicle Details** → Red **STOLEN** banner appears.
3. **Transfer** → Attempt to transfer → **blocked by smart contract**.
4. **File FIR** → Authority marks vehicle as recovered.
5. Stolen flag cleared, transfers re-enabled.

### 🗳 DAO Flow

1. **Token** → Stake 10 VCT.
2. **DAO** → Raise a dispute against a VIN.
3. (Other accounts) → Vote **FOR** or **AGAINST**.
4. Wait for voting period (or manipulate block time in Remix VM).
5. **Finalize** → **Execute** → rewards distributed:
   - Honest voters receive **+5 VCT**
   - Wrong voters lose **2 VCT**
   - Proposal **passes** → staker gets deposit back
   - Proposal **fails** → staker’s deposit is slashed

---

## 🧠 OOP Design & Security

VehicleChain is built with **object-oriented principles** natively in Solidity:

| OOP Concept | Solidity Implementation |
|-------------|-------------------------|
| **Class** | Each `.sol` contract |
| **Object / Data Model** | `struct` definitions (Vehicle, Record, FIR, Proposal) |
| **Hash Map / Dictionary** | `mapping` type |
| **Access Control Decorator** | `modifier` (onlyOwner, onlyAuthority, etc.) |
| **Immutable Audit Log** | `event` emissions |
| **Input Validation / Guards** | `require()` statements |
| **Dependency Injection** | Passing contract addresses to constructors (e.g. `VehicleHistory` receives `VehicleRegistry`) |

### Security Features

- `require()` on every input – no invalid data ever stored.
- **Role-based modifiers** – only authorised addresses can perform critical actions.
- **Duplicate VIN prevention** – registration checks for existing VIN.
- **Stolen vehicle transfer block** – on-chain, not just UI.
- **Monotonically increasing mileage** – cannot roll back odometer.
- **One vote per address** in DAO.
- **Proposer cannot vote** on their own dispute.
- **Economic anti-spam** – disputes require 10 VCT staked.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Blockchain** | Ethereum (Sepolia / Remix VM) |
| **Smart Contracts** | Solidity 0.8.20 |
| **Frontend** | React 18, React Router |
| **Web3 Integration** | ethers.js v6 |
| **Styling** | CSS Variables, Custom Theme (Light/Dark) |
| **Wallet** | MetaMask (Browser Extension) |
| **Dev Tools** | Remix IDE, Git, npm |

---

## 👥 Team & Context

This project is developed as part of **CT-403 Blockchain Technologies** at **NED University of Engineering & Technology**, Spring 2026.

### Contributors

- Muhammad Umer Safee – Blockchain Architect  
- Musfirah Waseem – Smart Contract Developer  
- Syed Omer Ahmed Shamsi – Frontend Developer  
- Claude – Documentation & Testing  

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
Made with 💚 for a transparent automotive future.
</div>
