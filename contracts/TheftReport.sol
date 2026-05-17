// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./VehicleRegistry.sol";

/**
 * @title TheftReport
 * @dev Handles FIR filing for stolen vehicles.
 *
 *      Changes from original:
 *        - Single `authority` replaced with AccessControl.
 *        - FIR_FILER_ROLE  : vehicle owners OR this role can file an FIR.
 *          In practice, grant this to police/authority addresses so they can
 *          file on behalf of owners who can't interact with the chain.
 *        - RECOVERY_ROLE   : can mark vehicles recovered (law enforcement only).
 *        - This contract must hold AUTHORITY_ROLE on VehicleRegistry so it can
 *          call setStolenStatus() (wired in deploy.js).
 *
 *      Roles:
 *        DEFAULT_ADMIN_ROLE  — grant/revoke roles
 *        FIR_FILER_ROLE      — can file FIRs (granted to police orgs + owner check below)
 *        RECOVERY_ROLE       — can mark vehicles recovered
 */
contract TheftReport is AccessControl {

    // ──────────────────────────────────────────────
    //  Roles
    // ──────────────────────────────────────────────
    bytes32 public constant FIR_FILER_ROLE = keccak256("FIR_FILER_ROLE");
    bytes32 public constant RECOVERY_ROLE  = keccak256("RECOVERY_ROLE");

    // ──────────────────────────────────────────────
    //  Structs
    // ──────────────────────────────────────────────
    struct FIR {
        string  vin;
        string  details;
        address filedBy;
        uint256 filedAt;
        bool    isResolved;
        uint256 resolvedAt;
        string  resolutionNote;
    }

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────
    VehicleRegistry public registry;

    // vin => FIR array
    mapping(string => FIR[]) private _firRecords;

    // vin => count of unresolved FIRs
    mapping(string => uint256) public activeFIRCount;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────
    event FIRFiled(string indexed vin, address indexed filedBy, uint256 firIndex, uint256 timestamp);
    event VehicleRecovered(string indexed vin, uint256 firIndex, uint256 timestamp);

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────
    constructor(address registryAddress) {
        require(registryAddress != address(0), "TheftReport: zero address");
        registry = VehicleRegistry(registryAddress);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FIR_FILER_ROLE,    msg.sender);
        _grantRole(RECOVERY_ROLE,     msg.sender);
    }

    // ──────────────────────────────────────────────
    //  FIR Filing
    // ──────────────────────────────────────────────

    /**
     * @notice File a First Information Report for a stolen vehicle.
     *         Caller must be either the vehicle's registered owner OR hold FIR_FILER_ROLE.
     *         FIR_FILER_ROLE is granted to police/authority addresses so they can file
     *         on behalf of owners who cannot interact with the chain directly.
     *
     * @param vin     Vehicle Identification Number
     * @param details Description of circumstances, location last seen, etc.
     */
    function fileFIR(string calldata vin, string calldata details) external {
        require(registry.vehicleRegistered(vin), "TheftReport: vehicle not found");
        require(bytes(details).length > 0,       "TheftReport: details required");
        require(!registry.isStolen(vin),         "TheftReport: already reported stolen");

        // Owner can always file; authorized orgs with FIR_FILER_ROLE can also file
        bool isOwner = registry.getVehicleOwner(vin) == msg.sender;
        bool isFiler = hasRole(FIR_FILER_ROLE, msg.sender);
        require(isOwner || isFiler, "TheftReport: not owner or authorized filer");

        _firRecords[vin].push(FIR({
            vin:            vin,
            details:        details,
            filedBy:        msg.sender,
            filedAt:        block.timestamp,
            isResolved:     false,
            resolvedAt:     0,
            resolutionNote: ""
        }));

        activeFIRCount[vin]++;

        // Mark stolen in registry — TheftReport holds AUTHORITY_ROLE on VehicleRegistry
        registry.setStolenStatus(vin, true);

        uint256 firIndex = _firRecords[vin].length - 1;
        emit FIRFiled(vin, msg.sender, firIndex, block.timestamp);
    }

    /**
     * @notice Mark a vehicle as recovered and resolve an FIR.
     *         Restricted to RECOVERY_ROLE (law enforcement, authority bodies).
     *         If no more active FIRs remain, clears the stolen flag in VehicleRegistry.
     *
     * @param vin            Vehicle Identification Number
     * @param firIndex       Index of the FIR being resolved
     * @param resolutionNote Description of how recovery was made
     */
    function markRecovered(
        string calldata vin,
        uint256         firIndex,
        string calldata resolutionNote
    ) external onlyRole(RECOVERY_ROLE) {
        require(registry.vehicleRegistered(vin),      "TheftReport: vehicle not found");
        require(firIndex < _firRecords[vin].length,   "TheftReport: invalid FIR index");
        require(bytes(resolutionNote).length > 0,     "TheftReport: resolution note required");

        FIR storage fir = _firRecords[vin][firIndex];
        require(!fir.isResolved, "TheftReport: FIR already resolved");

        fir.isResolved     = true;
        fir.resolvedAt     = block.timestamp;
        fir.resolutionNote = resolutionNote;

        if (activeFIRCount[vin] > 0) {
            activeFIRCount[vin]--;
        }

        // Only clear stolen status when all FIRs are resolved
        if (activeFIRCount[vin] == 0) {
            registry.setStolenStatus(vin, false);
        }

        emit VehicleRecovered(vin, firIndex, block.timestamp);
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    function getFIRCount(string calldata vin) external view returns (uint256) {
        return _firRecords[vin].length;
    }

    function getFIR(string calldata vin, uint256 index)
        external view
        returns (FIR memory)
    {
        require(index < _firRecords[vin].length, "TheftReport: invalid index");
        return _firRecords[vin][index];
    }

    function getAllFIRs(string calldata vin)
        external view
        returns (FIR[] memory)
    {
        return _firRecords[vin];
    }

    function hasActiveFIR(string calldata vin) external view returns (bool) {
        return activeFIRCount[vin] > 0;
    }
}
