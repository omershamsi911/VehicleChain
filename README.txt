VehicleChain — Decentralized Vehicle History, Ownership & Dispute System
=========================================================================
CT-403 Blockchain Technologies | NED University | Spring 2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROBLEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Traditional vehicle registries are centralized, opaque, and prone to fraud.
Buyers cannot verify ownership history, accident records, or theft status
before purchasing. VehicleChain solves this with an immutable on-chain
registry + DAO governance.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARCHITECTURE (6 Smart Contracts)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. GovToken.sol          — ERC-20 token (VCT) for staking, voting, rewards
2. VehicleRegistry.sol   — Register vehicles, manage service centers
3. VehicleHistory.sol    — Immutable service/accident/mileage records
4. TheftReport.sol       — File FIRs, mark vehicles stolen/recovered
5. OwnershipTransfer.sol — Two-step secure ownership transfers
6. DisputeDAO.sol        — Token-weighted DAO voting for disputes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — DEPLOY CONTRACTS IN REMIX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to https://remix.ethereum.org
2. Create a new workspace
3. Upload ALL .sol files from the contracts/ folder
4. In Remix: Solidity Compiler tab
   - Compiler: 0.8.20
   - Click "Compile All"
5. Switch to "Deploy & Run Transactions" tab
   - Environment: Injected Provider (MetaMask)
   - Make sure MetaMask is on a testnet (e.g. Sepolia or Remix VM)

DEPLOY IN THIS EXACT ORDER:
-----------------------------

A) Deploy GovToken
   - Constructor arg: initialSupply = 1000000  (1 million tokens)
   - Copy deployed address → paste in frontend/src/utils/contracts.js → GOV_TOKEN

B) Deploy VehicleRegistry
   - No constructor args
   - Copy address → VEHICLE_REGISTRY

C) Deploy VehicleHistory
   - Constructor arg: registryAddress = <VehicleRegistry address>
   - Copy address → VEHICLE_HISTORY

D) Deploy TheftReport
   - Constructor arg: registryAddress = <VehicleRegistry address>
   - Copy address → THEFT_REPORT

E) Deploy OwnershipTransfer
   - Constructor arg: registryAddress = <VehicleRegistry address>
   - Copy address → OWNERSHIP_TRANSFER

F) Deploy DisputeDAO
   - Constructor arg: tokenAddress = <GovToken address>
   - Copy address → DISPUTE_DAO

POST-DEPLOY SETUP:
------------------
G) In VehicleRegistry contract (Remix), call:
   setTransferContract(<OwnershipTransfer address>)
   → This authorizes OwnershipTransfer to update ownership in registry

H) In GovToken, call:
   mint(<your MetaMask address>, 10000000000000000000000)
   → This mints 10,000 VCT to yourself for testing
   (or use the Token Dashboard in the DApp)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — PASTE ADDRESSES INTO FRONTEND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Open: frontend/src/utils/contracts.js

Replace all "PASTE_..._ADDRESS_HERE" with your deployed addresses:

export const ADDRESSES = {
  GOV_TOKEN:          "0xYourGovTokenAddress",
  VEHICLE_REGISTRY:   "0xYourVehicleRegistryAddress",
  VEHICLE_HISTORY:    "0xYourVehicleHistoryAddress",
  THEFT_REPORT:       "0xYourTheftReportAddress",
  OWNERSHIP_TRANSFER: "0xYourOwnershipTransferAddress",
  DISPUTE_DAO:        "0xYourDisputeDAOAddress",
};

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — RUN THE FRONTEND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Prerequisites: Node.js 18+ installed

cd frontend
npm install
npm start

App opens at http://localhost:3000
Connect MetaMask → same network as deployed contracts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEMO WALKTHROUGH (for viva)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NORMAL FLOW:
1. Token Dashboard → Mint 10,000 VCT to yourself
2. Register tab → Register vehicle (VIN: 1HGBH41JXMN109186, Toyota Corolla, 2020)
3. History tab → Add service record (Oil change) + mileage log (45000km)
4. Vehicle Details → Search VIN → see full immutable history
5. Transfer tab → Initiate transfer to another MetaMask account
6. (Switch account in MetaMask) → Approve Transfer
7. Vehicle Details → ownership updated on-chain

THEFT FLOW:
1. FIR tab → File FIR for VIN
2. Vehicle Details → Red "STOLEN" banner appears
3. Transfer tab → Try to transfer → blocked on-chain
4. FIR tab → Mark recovered (authority)
5. Stolen flag cleared, transfers re-enabled

DAO FLOW:
1. Token tab → Stake 10 VCT
2. DAO tab → Raise dispute for a VIN
3. (Other accounts) → Vote FOR / AGAINST
4. Wait for voting period (or use Remix VM time manipulation)
5. Finalize → Distribute Rewards → Execute
6. Honest voters get 5 VCT, wrong voters lose 2 VCT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OOP DESIGN (mention in viva)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Contracts       = Classes
- Structs         = Objects / Data Models
- Mappings        = Hash Maps / Dictionaries
- Modifiers       = Access Control decorators
- Events          = Immutable audit logs
- require()       = Input validation / guards
- Inter-contract  = Dependency injection (VehicleHistory imports VehicleRegistry)

SECURITY FEATURES:
- require() on every input
- Role-based modifiers: onlyAuthority, onlyServiceCenter, onlyAdmin, onlyTransferContract
- Duplicate VIN prevention
- Stolen vehicle transfer block
- Mileage monotonically enforced
- One-vote-per-address in DAO
- Proposer cannot vote on own proposal
- Token stake anti-spam for disputes

TOKEN UTILITY (not decorative):
- Raise Dispute → requires 10 VCT staked
- Voting Power  → weight = token balance
- Honest Voters → +5 VCT reward
- Wrong Voters  → -2 VCT penalty
- Proposer PASS → stake returned
- Proposer FAIL → stake slashed
