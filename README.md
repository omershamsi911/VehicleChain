# 🚗 VehicleChain

<div align="center">

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge\&logo=solidity\&logoColor=white)](https://soliditylang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)](https://react.dev)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia_Testnet-3C3C3D?style=for-the-badge\&logo=ethereum\&logoColor=white)](https://ethereum.org)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-5.x-4E5EE4?style=for-the-badge\&logo=openzeppelin\&logoColor=white)](https://openzeppelin.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![NED University](https://img.shields.io/badge/NED-UET-002D72?style=for-the-badge)](https://www.neduet.edu.pk)

# VehicleChain

### Decentralised Vehicle Registry & Governance Platform

**Immutable Vehicle Ownership · Transparent Service History · DAO-Based Dispute Resolution**

CT-403 Blockchain Technologies
NED University of Engineering & Technology, Karachi
Spring 2026

</div>

---

## 📖 Table of Contents

* [🎯 Problem Statement](#-problem-statement)
* [💡 Project Vision](#-project-vision)
* [✨ Key Features](#-key-features)
* [🏗 System Architecture](#-system-architecture)
* [📦 Smart Contracts](#-smart-contracts)
* [🔐 Security & Fraud Prevention](#-security--fraud-prevention)
* [🛠 Technology Stack](#-technology-stack)
* [⚙️ Installation & Setup](#️-installation--setup)

  * [1. Deploy Smart Contracts](#1-deploy-smart-contracts)
  * [2. Configure Frontend](#2-configure-frontend)
  * [3. Start the Frontend](#3-start-the-frontend)
* [🎮 Complete Workflow Demo](#-complete-workflow-demo)

  * [🚘 Vehicle Registration Flow](#-vehicle-registration-flow)
  * [🔄 Ownership Transfer Flow](#-ownership-transfer-flow)
  * [🚨 Theft & Recovery Flow](#-theft--recovery-flow)
  * [🗳 DAO Governance Flow](#-dao-governance-flow)
* [🧠 OOP Concepts in Solidity](#-oop-concepts-in-solidity)
* [🧪 Testing Strategy](#-testing-strategy)
* [📁 Project Structure](#-project-structure)
* [🚀 Future Scope](#-future-scope)
* [👥 Team Members](#-team-members)
* [📄 License](#-license)

---

# 🎯 Problem Statement

Pakistan's vehicle ecosystem still relies heavily on **paper-based ownership records**, fragmented provincial databases, and manual verification systems.

This creates several critical issues:

* ❌ Vehicle title fraud using *open transfer letters*
* ❌ Odometer rollback and hidden accident history
* ❌ Forged maintenance records
* ❌ Slow dispute resolution processes
* ❌ No real-time public verification system
* ❌ Centralised databases vulnerable to corruption and tampering

A buyer currently has no reliable way to verify:

* Who truly owns a vehicle
* Whether the vehicle was stolen
* Whether the mileage is authentic
* Whether major accidents were hidden
* Whether service history is legitimate

VehicleChain addresses these problems using blockchain-enforced trust.

---

# 💡 Project Vision

VehicleChain transforms every registered vehicle into a unique on-chain identity powered by Ethereum smart contracts.

Instead of trusting paperwork or middlemen, users trust:

* 🔐 Cryptographic ownership
* ⛓ Immutable blockchain records
* 🧾 Transparent service history
* 🚨 Real-time theft status
* 🗳 Decentralised dispute governance

The system ensures that once data is written to the blockchain:

> No government official, admin, developer, or attacker can secretly modify or delete it.

---

# ✨ Key Features

## 🚘 NFT-Based Vehicle Ownership

Each vehicle is represented as a unique ERC-721 NFT.
Owning the NFT means owning the vehicle title.

---

## 📜 Immutable Vehicle History

Vehicle service logs, accident records, and mileage updates are permanently stored on-chain.

---

## 🚨 Blockchain-Based FIR System

Vehicles reported stolen are instantly marked on-chain.
Stolen vehicles cannot be transferred until officially recovered.

---

## 🔄 Secure Two-Step Ownership Transfer

Transfers require:

1. Seller initiation
2. Buyer cryptographic approval

This eliminates Pakistan's dangerous “open letter” loophole.

---

## 🗳 DAO-Based Dispute Resolution

Verified validators vote on disputes using VCT governance tokens.

Features include:

* Snapshot voting
* Vote weight caps
* Anti-whale governance
* Reward & penalty economics

---

## 🔐 Role-Based Access Control

Different permissions exist for:

* Registrars
* Service centres
* Police authorities
* Validators
* Admins
* Vehicle owners

All enforced directly in Solidity smart contracts.

---

# 🏗 System Architecture

VehicleChain follows a modern three-layer Web3 architecture.

```text
┌──────────────────────────────┐
│         React Frontend       │
│  Dashboard • DAO • History   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│        Ethers.js v6          │
│   MetaMask Wallet Provider   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      Ethereum Blockchain     │
│      Sepolia Test Network    │
└──────────────┬───────────────┘
               │
 ┌─────────────┼─────────────────────────────┐
 ▼             ▼             ▼               ▼
VehicleRegistry VehicleHistory TheftReport OwnershipTransfer
                     │
                     ▼
                 DisputeDAO
                     │
                     ▼
                  GovToken
```

---

# 📦 Smart Contracts

VehicleChain consists of six modular Solidity smart contracts.

| # | Contract                | Purpose                                       |
| - | ----------------------- | --------------------------------------------- |
| 1 | `GovToken.sol`          | ERC-20 governance token (VCT)                 |
| 2 | `VehicleRegistry.sol`   | NFT vehicle registry and ownership management |
| 3 | `VehicleHistory.sol`    | Immutable service, accident, and mileage logs |
| 4 | `TheftReport.sol`       | On-chain FIR reporting and recovery system    |
| 5 | `OwnershipTransfer.sol` | Secure two-step NFT ownership transfer        |
| 6 | `DisputeDAO.sol`        | DAO governance and dispute resolution         |

---

## 📘 VehicleRegistry.sol

Main NFT registry contract.

### Responsibilities

* Register vehicles
* Mint ERC-721 vehicle NFTs
* Track ownership
* Manage stolen status
* Authorise service centres

### Important Features

* Duplicate VIN prevention
* ERC-721Enumerable support
* Role-based permissions
* Real-time ownership lookup

---

## 📘 VehicleHistory.sol

Append-only immutable vehicle history ledger.

### Supports

* Service records
* Accident reports
* Mileage updates

### Anti-Fraud Protection

Mileage rollback prevention:

```solidity
require(
    mileage > lastMileage[vin],
    "Mileage rollback detected"
);
```

This makes odometer fraud computationally impossible.

---

## 📘 TheftReport.sol

Blockchain-based FIR system.

### Features

* File theft reports
* Mark vehicles recovered
* Cross-contract stolen status updates
* Real-time transfer blocking

Once a vehicle is marked stolen:

```solidity
registry.setStolenStatus(vin, true);
```

Transfers immediately fail.

---

## 📘 OwnershipTransfer.sol

Two-step cryptographic transfer system.

### Transfer Lifecycle

```text
Seller Initiates Transfer
            ↓
Buyer Approves Transaction
            ↓
NFT + ETH Transfer Happens Atomically
```

### Security Guarantees

* No open-letter fraud
* No double-selling
* Buyer approval mandatory
* Atomic ETH settlement

---

## 📘 DisputeDAO.sol

Decentralised governance contract.

### DAO Features

* Validator whitelist
* Snapshot voting
* Vote caps
* Proposal finalisation
* Reward/penalty distribution

### Governance Security

* One validator cannot dominate voting
* Proposal creator cannot vote
* Snapshot prevents vote manipulation

---

## 📘 GovToken.sol (VCT)

ERC-20 governance token powering the DAO.

### Used For

* Voting
* Staking
* Rewards
* Penalties
* Governance participation

### Token Economics

| Feature             | Value  |
| ------------------- | ------ |
| Symbol              | VCT    |
| Standard            | ERC-20 |
| Decimals            | 18     |
| Minimum Stake       | 10 VCT |
| Honest Voter Reward | +3 VCT |
| Wrong Voter Penalty | -5 VCT |

---

# 🔐 Security & Fraud Prevention

VehicleChain focuses heavily on security and anti-fraud guarantees.

| Threat                     | Protection                       |
| -------------------------- | -------------------------------- |
| Duplicate VIN registration | On-chain uniqueness validation   |
| Odometer rollback          | Monotonic mileage enforcement    |
| Open-letter fraud          | Buyer approval mandatory         |
| Double-selling             | One active transfer per VIN      |
| Whale governance attacks   | 20% vote cap                     |
| Vote manipulation          | Snapshot voting                  |
| Stolen vehicle transfer    | Smart contract transfer blocking |
| Role abuse                 | OpenZeppelin AccessControl       |
| Centralised corruption     | Public immutable blockchain      |

---

# 🛠 Technology Stack

| Layer            | Technology                    |
| ---------------- | ----------------------------- |
| Blockchain       | Ethereum Sepolia              |
| Smart Contracts  | Solidity ^0.8.20              |
| Libraries        | OpenZeppelin 5.x              |
| Frontend         | React.js 18                   |
| Web3 Integration | Ethers.js v6                  |
| Wallet           | MetaMask                      |
| Development      | Hardhat + Remix IDE           |
| Styling          | CSS Variables + Responsive UI |
| Package Manager  | npm                           |

---

# ⚙️ Installation & Setup

## Prerequisites

Install the following before starting:

* Node.js 18+
* MetaMask browser extension
* Remix IDE or Hardhat
* Git

---

# 1. Deploy Smart Contracts

Open Remix IDE and upload all Solidity files from the `contracts/` folder.

Compile using:

```bash
Solidity Compiler Version: 0.8.20
```

Deploy contracts in the following exact order:

```bash
1. GovToken.sol
2. VehicleRegistry.sol
3. VehicleHistory.sol
4. TheftReport.sol
5. OwnershipTransfer.sol
6. DisputeDAO.sol
```

---

## Example Deployment Sequence

```bash
A) GovToken
Constructor:
initialSupply = 1000000

B) VehicleRegistry
No constructor arguments

C) VehicleHistory
Constructor:
registryAddress = <VehicleRegistry Address>

D) TheftReport
Constructor:
registryAddress = <VehicleRegistry Address>

E) OwnershipTransfer
Constructor:
registryAddress = <VehicleRegistry Address>

F) DisputeDAO
Constructor:
tokenAddress = <GovToken Address>
```

---

## Post Deployment Configuration

### Authorise Transfer Contract

```bash
VehicleRegistry.setTransferContract(
    <OwnershipTransfer Address>
)
```

### Mint Test Tokens

```bash
GovToken.mint(
    <MetaMask Address>,
    10000000000000000000000
)
```

---

# 2. Configure Frontend

Open:

```bash
frontend/src/utils/contracts.js
```

Replace placeholder addresses:

```javascript
export const ADDRESSES = {
  GOV_TOKEN: "0xYourGovTokenAddress",
  VEHICLE_REGISTRY: "0xYourVehicleRegistryAddress",
  VEHICLE_HISTORY: "0xYourVehicleHistoryAddress",
  THEFT_REPORT: "0xYourTheftReportAddress",
  OWNERSHIP_TRANSFER: "0xYourOwnershipTransferAddress",
  DISPUTE_DAO: "0xYourDisputeDAOAddress",
};
```

---

# 3. Start the Frontend

```bash
cd frontend
npm install
npm start
```

Application runs at:

```bash
http://localhost:3000
```

Connect MetaMask to the same blockchain network.

---

# 🎮 Complete Workflow Demo

# 🚘 Vehicle Registration Flow

### Step 1

Mint governance tokens.

### Step 2

Register a vehicle:

```text
VIN: 1HGBH41JXMN109186
Model: Toyota Corolla
Year: 2020
```

### Step 3

Vehicle NFT is minted to owner wallet.

### Step 4

Vehicle becomes searchable publicly.

---

# 🔄 Ownership Transfer Flow

### Seller

* Initiates transfer
* Specifies buyer address
* Sets ETH price

### Buyer

* Reviews transfer
* Approves transaction
* Receives NFT ownership

### Smart Contract Guarantees

* ETH and NFT exchanged atomically
* No unilateral transfer possible
* No blank-recipient fraud

---

# 🚨 Theft & Recovery Flow

### Theft Reporting

* File FIR on-chain
* Vehicle immediately flagged stolen
* Transfer attempts revert automatically

### Recovery

* Recovery officer marks vehicle recovered
* Stolen flag removed
* Transfers re-enabled

---

# 🗳 DAO Governance Flow

### Step 1

Validator stakes VCT.

### Step 2

Raise dispute proposal.

### Step 3

Validators vote FOR or AGAINST.

### Step 4

Proposal finalised after voting period.

### Step 5

Rewards and penalties distributed.

---

# 🧠 OOP Concepts in Solidity

VehicleChain applies object-oriented programming concepts directly inside Solidity.

| OOP Concept           | Solidity Equivalent           |
| --------------------- | ----------------------------- |
| Class                 | Smart Contract                |
| Object                | Struct Instance               |
| Encapsulation         | Private/Internal State        |
| Inheritance           | OpenZeppelin Extensions       |
| Access Modifiers      | Solidity Modifiers            |
| Polymorphism          | Interface-Based Interactions  |
| Constructor Injection | Contract Address Dependencies |

---

# 🧪 Testing Strategy

VehicleChain uses both unit testing and integration testing.

## Smart Contract Tests

* VIN duplication checks
* Role validation
* Odometer rollback prevention
* Transfer approval validation
* DAO vote logic
* Reward distribution

---

## Integration Tests

### End-to-End Scenarios

* Vehicle registration
* Service history updates
* Ownership transfers
* Theft reporting
* DAO dispute resolution

---

## Frontend Testing

* Wallet connection
* Role-based UI
* Search functionality
* Transaction feedback
* Transfer previews

---

# 📁 Project Structure

```bash
VehicleChain/
│
├── contracts/
│   ├── GovToken.sol
│   ├── VehicleRegistry.sol
│   ├── VehicleHistory.sol
│   ├── TheftReport.sol
│   ├── OwnershipTransfer.sol
│   └── DisputeDAO.sol
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── utils/
│   │   └── styles/
│   └── package.json
│
├── scripts/
├── test/
├── README.md
└── package.json
```

---

# 🚀 Future Scope

VehicleChain is designed as a scalable production-ready architecture.

Future enhancements include:

* 🌐 IPFS integration for document storage
* 📱 Mobile application
* 🔗 Real Excise Department integration
* 🛰 IoT-based mileage verification
* ⚡ Layer-2 deployment (Polygon / Arbitrum)
* 🪪 ERC-4337 smart wallets
* 🤖 AI-powered fraud analytics
* 📊 Insurance company APIs

---

# 👥 Team Members

This project was developed for:

### CT-403 — Blockchain Technologies

### NED University of Engineering & Technology

### Spring 2026

---

## Contributors

| Name                   | Role                     |
| ---------------------- | ------------------------ |
| Syed Omer Ahmed Shamsi | Frontend Developer       |
| Muhammad Umer Safee    | Blockchain Architect     |
| Musfirah Waseem        | Smart Contract Developer |
| Samia Masood Awan      | Course Instructor        |

---

# 📄 License

This project is licensed under the MIT License.

See the `LICENSE` file for complete details.

---

<div align="center">

## 🚗 Built for a Transparent Automotive Future

**VehicleChain — Trust Through Blockchain**

Made with 💚 using Solidity, React & Ethereum.

</div>
