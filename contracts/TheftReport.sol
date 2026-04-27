// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VehicleRegistry.sol";

/**
 * @title TheftReport
 * @dev Handles FIR (First Information Report) filing for stolen vehicles.
 *      Owner or authority can file FIR. Authority can mark vehicle recovered.
 *      Buyers can query theft status before any purchase.
 */
contract TheftReport {
    // ──────────────────────────────────────────────
    //  Structs
    // ──────────────────────────────────────────────
    struct FIR {
        string  vin;
        string  details;        // Description of theft / location / circumstances
        address filedBy;        // Owner or authority
        uint256 filedAt;        // Timestamp
        bool    isResolved;     // Marked true when vehicle is recovered
        uint256 resolvedAt;     // Timestamp of recovery
        string  resolutionNote; // Details about recovery
    }

    // ──────────────────────────────────────────────
    //  State Variables
    // ──────────────────────────────────────────────
    VehicleRegistry public registry;
    address         public authority;

    // vin => array of FIRs
    mapping(string => FIR[]) private firRecords;

    // vin => count of active (unresolved) FIRs
    mapping(string => uint256) public activeFIRCount;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────
    event FIRFiled(string indexed vin, address indexed filedBy, uint256 firIndex, uint256 timestamp);
    event VehicleRecovered(string indexed vin, uint256 firIndex, uint256 timestamp);

    // ──────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────
    modifier onlyAuthority() {
        require(msg.sender == authority, "TheftReport: caller is not authority");
        _;
    }

    modifier vehicleExists(string memory vin) {
        require(registry.vehicleRegistered(vin), "TheftReport: vehicle not found");
        _;
    }

    modifier onlyOwnerOrAuthority(string memory vin) {
        require(
            registry.getVehicleOwner(vin) == msg.sender || msg.sender == authority,
            "TheftReport: caller is not owner or authority"
        );
        _;
    }

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────
    constructor(address registryAddress) {
        require(registryAddress != address(0), "TheftReport: zero address");
        registry  = VehicleRegistry(registryAddress);
        authority = msg.sender;
    }

    // ──────────────────────────────────────────────
    //  FIR Filing
    // ──────────────────────────────────────────────

    /**
     * @notice File an FIR for a stolen vehicle.
     *         Marks vehicle as stolen in VehicleRegistry.
     * @param vin     Vehicle Identification Number
     * @param details Description: location last seen, circumstances, etc.
     */
    function fileFIR(string memory vin, string memory details)
        external
        vehicleExists(vin)
        onlyOwnerOrAuthority(vin)
    {
        require(bytes(details).length > 0, "TheftReport: details cannot be empty");
        require(!registry.isStolen(vin),   "TheftReport: vehicle already reported stolen");

        firRecords[vin].push(FIR({
            vin:            vin,
            details:        details,
            filedBy:        msg.sender,
            filedAt:        block.timestamp,
            isResolved:     false,
            resolvedAt:     0,
            resolutionNote: ""
        }));

        activeFIRCount[vin]++;

        // Mark vehicle as stolen in registry (authority call proxied)
        registry.setStolenStatus(vin, true);

        uint256 firIndex = firRecords[vin].length - 1;
        emit FIRFiled(vin, msg.sender, firIndex, block.timestamp);
    }

    /**
     * @notice Mark vehicle as recovered and resolve FIR.
     *         Authority only — confirms police/official recovery.
     * @param vin            Vehicle Identification Number
     * @param firIndex       Index of the FIR being resolved
     * @param resolutionNote Note describing how recovery was made
     */
    function markRecovered(
        string memory vin,
        uint256       firIndex,
        string memory resolutionNote
    )
        external
        vehicleExists(vin)
        onlyAuthority
    {
        require(firIndex < firRecords[vin].length, "TheftReport: invalid FIR index");
        FIR storage fir = firRecords[vin][firIndex];
        require(!fir.isResolved, "TheftReport: FIR already resolved");
        require(bytes(resolutionNote).length > 0, "TheftReport: resolution note required");

        fir.isResolved     = true;
        fir.resolvedAt     = block.timestamp;
        fir.resolutionNote = resolutionNote;

        if (activeFIRCount[vin] > 0) activeFIRCount[vin]--;

        // If no more active FIRs, clear stolen flag
        if (activeFIRCount[vin] == 0) {
            registry.setStolenStatus(vin, false);
        }

        emit VehicleRecovered(vin, firIndex, block.timestamp);
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    function getFIRCount(string memory vin) external view returns (uint256) {
        return firRecords[vin].length;
    }

    function getFIR(string memory vin, uint256 index) external view returns (FIR memory) {
        require(index < firRecords[vin].length, "TheftReport: invalid index");
        return firRecords[vin][index];
    }

    function getAllFIRs(string memory vin) external view returns (FIR[] memory) {
        return firRecords[vin];
    }

    function hasActiveFIR(string memory vin) external view returns (bool) {
        return activeFIRCount[vin] > 0;
    }
}
