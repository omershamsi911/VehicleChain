// src/utils/contracts.js
// ─────────────────────────────────────────────────────────────────────────────
// Contract addresses from your deployment.
// Update these if you redeploy.
// ─────────────────────────────────────────────────────────────────────────────

export const ADDRESSES = {
  GOV_TOKEN:          "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  VEHICLE_REGISTRY:   "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  VEHICLE_HISTORY:    "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  THEFT_REPORT:       "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  OWNERSHIP_TRANSFER: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  DISPUTE_DAO:        "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
};


// ─────────────────────────────────────────────────────────────────────────────
// ABIs — kept as human-readable strings (ethers.js parses these fine).
// Every entry here matches the rewritten contracts exactly.
// AccessControl functions (hasRole, grantRole, getRoleAdmin) are included
// on every contract that extends it.
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared AccessControl fragment (included on every AC contract) ─────────────
const ACCESS_CONTROL_ABI = [
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function getRoleAdmin(bytes32 role) view returns (bytes32)",
  "function grantRole(bytes32 role, address account)",
  "function revokeRole(bytes32 role, address account)",
  "function renounceRole(bytes32 role, address callerConfirmation)",
  "event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)",
  "event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)",
];

// ── GovToken (ERC-20 + AccessControl + staking) ───────────────────────────────
export const GOV_TOKEN_ABI = [
  ...ACCESS_CONTROL_ABI,

  // ERC-20
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",

  // Roles
  "function MINTER_ROLE() view returns (bytes32)",
  "function BURNER_ROLE() view returns (bytes32)",
  "function STAKING_MANAGER() view returns (bytes32)",

  // Staking
  "function stakedBalance(address) view returns (uint256)",
  "function stake(uint256 amount)",
  "function unstake(uint256 amount)",

  // Admin actions (role-gated — MINTER_ROLE / BURNER_ROLE / STAKING_MANAGER)
  "function mint(address to, uint256 amount)",
  "function burn(address from, uint256 amount)",
  "function reward(address to, uint256 amount)",
  "function slashStake(address user, uint256 amount)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event Staked(address indexed user, uint256 amount)",
  "event Unstaked(address indexed user, uint256 amount)",
  "event StakeSlashed(address indexed user, uint256 amount)",
  "event Rewarded(address indexed user, uint256 amount)",
  "event Burned(address indexed user, uint256 amount)",
];

// ── VehicleRegistry (ERC-721 + AccessControl) ────────────────────────────────
export const VEHICLE_REGISTRY_ABI = [
  ...ACCESS_CONTROL_ABI,

  // ERC-721 standard
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",

  // Roles
  "function REGISTRAR_ROLE() view returns (bytes32)",
  "function AUTHORITY_ROLE() view returns (bytes32)",
  "function TRANSFER_CONTRACT() view returns (bytes32)",

  // Registration (REGISTRAR_ROLE)
  "function registerVehicle(string vin, address owner, string model, uint256 year) returns (uint256 tokenId)",

  // Ownership transfer (TRANSFER_CONTRACT role — called by OwnershipTransfer contract)
  "function transferVehicleOwnership(string vin, address newOwner)",

  // Stolen status (AUTHORITY_ROLE)
  "function setStolenStatus(string vin, bool stolen)",

  // Service centers (AUTHORITY_ROLE)
  "function addServiceCenter(address center)",
  "function removeServiceCenter(address center)",
  "function serviceCenters(address) view returns (bool)",

  // View — lookup by VIN
  "function getVehicleByVIN(string vin) view returns (uint256 tokenId, address owner, tuple(string vin, string model, uint256 year, bool isStolen, uint256 registeredAt) data)",

  // View — lookup by token ID
  "function getVehicleByTokenId(uint256 tokenId) view returns (address owner, tuple(string vin, string model, uint256 year, bool isStolen, uint256 registeredAt) data)",

  "function getVehicleOwner(string vin) view returns (address)",
  "function isStolen(string vin) view returns (bool)",
  "function vehicleRegistered(string vin) view returns (bool)",
  "function totalVehicles() view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",

  // Events
  "event VehicleRegistered(uint256 indexed tokenId, string indexed vin, address indexed owner, string model, uint256 year)",
  "event StolenStatusUpdated(string indexed vin, bool isStolen)",
  "event ServiceCenterAdded(address indexed center)",
  "event ServiceCenterRemoved(address indexed center)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
];

// ── VehicleHistory (AccessControl) ───────────────────────────────────────────
export const VEHICLE_HISTORY_ABI = [
  ...ACCESS_CONTROL_ABI,

  // Roles
  "function HISTORY_ADMIN_ROLE() view returns (bytes32)",

  // Write (service center or HISTORY_ADMIN_ROLE)
  "function addServiceRecord(string vin, string description)",
  "function addAccidentRecord(string vin, string description)",
  "function addMileageRecord(string vin, uint256 mileage, string description)",

  // View
  "function getHistory(string vin) view returns (tuple(uint8 recordType, string description, uint256 mileage, uint256 timestamp, address addedBy)[])",
  "function getHistoryCount(string vin) view returns (uint256)",
  "function getRecord(string vin, uint256 index) view returns (tuple(uint8 recordType, string description, uint256 mileage, uint256 timestamp, address addedBy))",
  "function lastMileage(string vin) view returns (uint256)",

  // Events
  "event ServiceRecordAdded(string indexed vin, address indexed addedBy, uint256 timestamp)",
  "event AccidentRecordAdded(string indexed vin, address indexed addedBy, uint256 timestamp)",
  "event MileageRecordAdded(string indexed vin, uint256 mileage, address indexed addedBy, uint256 timestamp)",
];

// ── TheftReport (AccessControl) ───────────────────────────────────────────────
export const THEFT_REPORT_ABI = [
  ...ACCESS_CONTROL_ABI,

  // Roles
  "function FIR_FILER_ROLE() view returns (bytes32)",
  "function RECOVERY_ROLE() view returns (bytes32)",

  // Write
  "function fileFIR(string vin, string details)",
  "function markRecovered(string vin, uint256 firIndex, string resolutionNote)",

  // View
  "function getFIRCount(string vin) view returns (uint256)",
  "function getFIR(string vin, uint256 index) view returns (tuple(string vin, string details, address filedBy, uint256 filedAt, bool isResolved, uint256 resolvedAt, string resolutionNote))",
  "function getAllFIRs(string vin) view returns (tuple(string vin, string details, address filedBy, uint256 filedAt, bool isResolved, uint256 resolvedAt, string resolutionNote)[])",
  "function hasActiveFIR(string vin) view returns (bool)",
  "function activeFIRCount(string vin) view returns (uint256)",

  // Events
  "event FIRFiled(string indexed vin, address indexed filedBy, uint256 firIndex, uint256 timestamp)",
  "event VehicleRecovered(string indexed vin, uint256 firIndex, uint256 timestamp)",
];

// ── OwnershipTransfer (AccessControl) ────────────────────────────────────────
export const OWNERSHIP_TRANSFER_ABI = [
  ...ACCESS_CONTROL_ABI,

  // Roles
  "function TRANSFER_MANAGER_ROLE() view returns (bytes32)",

  // Write
  "function initiateTransfer(string vin, address buyer, uint256 price)",
  "function approveTransfer(uint256 transferId) payable",
  "function cancelTransfer(uint256 transferId)",

  // View
  "function transferCount() view returns (uint256)",
  "function hasActiveTransfer(string vin) view returns (bool)",
  "function activeTransfer(string vin) view returns (uint256)",
  "function getTransfer(uint256 transferId) view returns (tuple(string vin, address seller, address buyer, uint8 status, uint256 initiatedAt, uint256 completedAt, uint256 price))",
  "function getTransferHistory(string vin) view returns (uint256[])",
  "function getActiveTransfer(string vin) view returns (uint256)",

  // Events
  "event TransferInitiated(uint256 indexed transferId, string indexed vin, address seller, address buyer, uint256 price)",
  "event TransferCompleted(uint256 indexed transferId, string indexed vin, address from, address to)",
  "event TransferCancelled(uint256 indexed transferId, string indexed vin, address cancelledBy)",
];

// ── DisputeDAO (AccessControl) ────────────────────────────────────────────────
export const DISPUTE_DAO_ABI = [
  ...ACCESS_CONTROL_ABI,

  // Roles
  "function VALIDATOR_ROLE() view returns (bytes32)",

  // Validator management (DEFAULT_ADMIN_ROLE)
  "function addValidator(address validator)",
  "function removeValidator(address validator)",
  "function getValidators() view returns (address[])",

  // Constants
  "function MIN_STAKE() view returns (uint256)",
  "function VOTING_PERIOD() view returns (uint256)",
  "function REWARD_AMOUNT() view returns (uint256)",
  "function PENALTY_AMOUNT() view returns (uint256)",
  "function MAX_VOTE_WEIGHT_PCT() view returns (uint256)",

  // State
  "function proposalCount() view returns (uint256)",
  "function validatorSnapshot(address validator) view returns (uint256)",

  // Proposal lifecycle
  "function raiseDispute(string vin, string description)",
  "function vote(uint256 proposalId, bool inFavor)",
  "function finalizeProposal(uint256 proposalId)",
  "function distributeRewards(uint256 proposalId)",
  "function executeProposal(uint256 proposalId)",
  "function cancelProposal(uint256 proposalId)",

  // View
  // NOTE: Proposal tuple now includes totalValidatorWeightSnapshot
  "function getProposal(uint256 proposalId) view returns (tuple(uint256 id, string vin, address proposer, string description, uint256 stakedAmount, uint256 votesFor, uint256 votesAgainst, uint256 startTime, uint256 endTime, uint8 status, bool rewardsDistributed, uint256 totalValidatorWeightSnapshot))",

  // NOTE: Vote tuple now includes cappedWeight
  "function getVote(uint256 proposalId, address voter) view returns (tuple(bool inFavor, uint256 weight, uint256 cappedWeight, bool rewarded))",

  "function getVoterList(uint256 proposalId) view returns (address[])",
  "function isVotingActive(uint256 proposalId) view returns (bool)",
  "function previewVoteWeight(uint256 proposalId, address validator) view returns (uint256 raw, uint256 capped)",

  // Events
  "event ValidatorAdded(address indexed validator)",
  "event ValidatorRemoved(address indexed validator)",
  "event ProposalCreated(uint256 indexed proposalId, string indexed vin, address proposer, uint256 endTime, uint256 totalSnapshotWeight)",
  "event Voted(uint256 indexed proposalId, address indexed voter, bool inFavor, uint256 cappedWeight)",
  "event ProposalFinalized(uint256 indexed proposalId, uint8 status, uint256 votesFor, uint256 votesAgainst)",
  "event RewardsDistributed(uint256 indexed proposalId, uint256 rewarded, uint256 penalized)",
  "event ProposalExecuted(uint256 indexed proposalId)",
  "event ProposalCancelled(uint256 indexed proposalId)",
];