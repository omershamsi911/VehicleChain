// src/utils/contracts.js
// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: After deploying all contracts in Remix, paste the deployed 
// addresses below. Deploy in this order:
//   1. GovToken        → paste address in ADDRESSES.GOV_TOKEN
//   2. VehicleRegistry → paste address in ADDRESSES.VEHICLE_REGISTRY
//   3. VehicleHistory  → paste address in ADDRESSES.VEHICLE_HISTORY
//   4. TheftReport     → paste address in ADDRESSES.THEFT_REPORT
//   5. OwnershipTransfer → paste address in ADDRESSES.OWNERSHIP_TRANSFER
//   6. DisputeDAO      → paste address in ADDRESSES.DISPUTE_DAO
//
// Then in Remix call VehicleRegistry.setTransferContract(OwnershipTransfer address)
// ─────────────────────────────────────────────────────────────────────────────

export const ADDRESSES = {
  GOV_TOKEN:          "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  VEHICLE_REGISTRY:   "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  VEHICLE_HISTORY:    "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  THEFT_REPORT:       "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  OWNERSHIP_TRANSFER: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  DISPUTE_DAO:        "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
};

// ─── ABIs ────────────────────────────────────────────────────────────────────

export const GOV_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function stakedBalance(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function stake(uint256 amount)",
  "function unstake(uint256 amount)",
  "function mint(address to, uint256 amount)",
  "function burn(address from, uint256 amount)",
  "function reward(address to, uint256 amount)",
  "function slashStake(address user, uint256 amount)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Staked(address indexed user, uint256 amount)",
  "event Unstaked(address indexed user, uint256 amount)",
];

export const VEHICLE_REGISTRY_ABI = [
  "function authority() view returns (address)",
  "function registerVehicle(string vin, address owner, string model, uint256 year)",
  "function transferOwnership(string vin, address newOwner)",
  "function setStolenStatus(string vin, bool stolen)",
  "function addServiceCenter(address center)",
  "function removeServiceCenter(address center)",
  "function setTransferContract(address _transferContract)",
  "function getVehicle(string vin) view returns (tuple(string vin, address owner, string model, uint256 year, bool isStolen, bool exists, uint256 registeredAt))",
  "function getVehicleOwner(string vin) view returns (address)",
  "function isStolen(string vin) view returns (bool)",
  "function getOwnerVehicles(address owner) view returns (string[])",
  "function getTotalVehicles() view returns (uint256)",
  "function vehicleRegistered(string vin) view returns (bool)",
  "function serviceCenters(address) view returns (bool)",
  "function allVINs(uint256) view returns (string)",
  "event VehicleRegistered(string indexed vin, address indexed owner, string model, uint256 year)",
  "event OwnershipTransferred(string indexed vin, address indexed from, address indexed to)",
  "event ServiceCenterAdded(address indexed center)",
];

export const VEHICLE_HISTORY_ABI = [
  "function addServiceRecord(string vin, string description)",
  "function addAccidentRecord(string vin, string description)",
  "function addMileageRecord(string vin, uint256 mileage, string description)",
  "function getHistory(string vin) view returns (tuple(uint8 recordType, string description, uint256 mileage, uint256 timestamp, address addedBy)[])",
  "function getHistoryCount(string vin) view returns (uint256)",
  "function getRecord(string vin, uint256 index) view returns (tuple(uint8 recordType, string description, uint256 mileage, uint256 timestamp, address addedBy))",
  "event ServiceRecordAdded(string indexed vin, address indexed addedBy, uint256 timestamp)",
  "event AccidentRecordAdded(string indexed vin, address indexed addedBy, uint256 timestamp)",
  "event MileageRecordAdded(string indexed vin, uint256 mileage, uint256 timestamp)",
];

export const THEFT_REPORT_ABI = [
  "function fileFIR(string vin, string details)",
  "function markRecovered(string vin, uint256 firIndex, string resolutionNote)",
  "function getFIRCount(string vin) view returns (uint256)",
  "function getFIR(string vin, uint256 index) view returns (tuple(string vin, string details, address filedBy, uint256 filedAt, bool isResolved, uint256 resolvedAt, string resolutionNote))",
  "function getAllFIRs(string vin) view returns (tuple(string vin, string details, address filedBy, uint256 filedAt, bool isResolved, uint256 resolvedAt, string resolutionNote)[])",
  "function hasActiveFIR(string vin) view returns (bool)",
  "function activeFIRCount(string vin) view returns (uint256)",
  "event FIRFiled(string indexed vin, address indexed filedBy, uint256 firIndex, uint256 timestamp)",
  "event VehicleRecovered(string indexed vin, uint256 firIndex, uint256 timestamp)",
];

export const OWNERSHIP_TRANSFER_ABI = [
  "function initiateTransfer(string vin, address buyer, uint256 price)",
  "function approveTransfer(uint256 transferId) payable",
  "function cancelTransfer(uint256 transferId)",
  "function getTransfer(uint256 transferId) view returns (tuple(string vin, address seller, address buyer, uint8 status, uint256 initiatedAt, uint256 completedAt, uint256 price))",
  "function getTransferHistory(string vin) view returns (uint256[])",
  "function getActiveTransfer(string vin) view returns (uint256)",
  "function transferCount() view returns (uint256)",
  "function hasActiveTransfer(string) view returns (bool)",
  "event TransferInitiated(uint256 indexed transferId, string indexed vin, address seller, address buyer, uint256 price)",
  "event TransferCompleted(uint256 indexed transferId, string indexed vin, address from, address to)",
  "event TransferCancelled(uint256 indexed transferId, string indexed vin, address cancelledBy)",
];

export const DISPUTE_DAO_ABI = [
  "function raiseDispute(string vin, string description)",
  "function vote(uint256 proposalId, bool inFavor)",
  "function finalizeProposal(uint256 proposalId)",
  "function distributeRewards(uint256 proposalId)",
  "function executeProposal(uint256 proposalId)",
  "function cancelProposal(uint256 proposalId)",
  "function getProposal(uint256 proposalId) view returns (tuple(uint256 id, string vin, address proposer, string description, uint256 stakedAmount, uint256 votesFor, uint256 votesAgainst, uint256 startTime, uint256 endTime, uint8 status, bool rewardsDistributed))",
  "function getVote(uint256 proposalId, address voter) view returns (tuple(bool inFavor, uint256 weight, bool rewarded))",
  "function getVoterList(uint256 proposalId) view returns (address[])",
  "function isVotingActive(uint256 proposalId) view returns (bool)",
  "function proposalCount() view returns (uint256)",
  "function MIN_STAKE() view returns (uint256)",
  "function VOTING_PERIOD() view returns (uint256)",
  "event ProposalCreated(uint256 indexed proposalId, string indexed vin, address proposer, uint256 stake, uint256 endTime)",
  "event Voted(uint256 indexed proposalId, address indexed voter, bool inFavor, uint256 weight)",
  "event ProposalFinalized(uint256 indexed proposalId, uint8 status, uint256 votesFor, uint256 votesAgainst)",
];
