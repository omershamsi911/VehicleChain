// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./VehicleRegistry.sol";

/**
 * @title VehicleHistory
 * @dev Immutable service, accident, and mileage records for vehicles.
 *
 *      Changes from original:
 *        - Single `authority` replaced with AccessControl.
 *        - HISTORY_ADMIN_ROLE : can add records regardless of service center status.
 *          Useful for authority-mandated records (e.g., mandatory inspection results).
 *        - Service center check still uses registry.serviceCenters() mapping —
 *          service centers are still managed by VehicleRegistry AUTHORITY_ROLE.
 *        - Added odometer fraud guard: mileage must monotonically increase.
 *
 *      Roles:
 *        DEFAULT_ADMIN_ROLE  — grant/revoke roles
 *        HISTORY_ADMIN_ROLE  — can add any record type (authority override)
 */
contract VehicleHistory is AccessControl {

    // ──────────────────────────────────────────────
    //  Roles
    // ──────────────────────────────────────────────
    bytes32 public constant HISTORY_ADMIN_ROLE = keccak256("HISTORY_ADMIN_ROLE");

    // ──────────────────────────────────────────────
    //  Enums & Structs
    // ──────────────────────────────────────────────
    enum RecordType { SERVICE, ACCIDENT, MILEAGE }

    struct HistoryRecord {
        RecordType  recordType;
        string      description;
        uint256     mileage;      // 0 for SERVICE and ACCIDENT records
        uint256     timestamp;
        address     addedBy;
    }

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────
    VehicleRegistry public registry;

    // vin => history records (append-only — immutable audit trail)
    mapping(string => HistoryRecord[]) private _vehicleHistory;

    // vin => last recorded mileage (for monotonic enforcement)
    mapping(string => uint256) public lastMileage;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────
    event ServiceRecordAdded(string indexed vin, address indexed addedBy, uint256 timestamp);
    event AccidentRecordAdded(string indexed vin, address indexed addedBy, uint256 timestamp);
    event MileageRecordAdded(string indexed vin, uint256 mileage, address indexed addedBy, uint256 timestamp);

    // ──────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────

    /**
     * @dev Authorized callers: registered service centers (via VehicleRegistry)
     *      OR addresses holding HISTORY_ADMIN_ROLE.
     */
    modifier onlyAuthorized() {
        require(
            registry.serviceCenters(msg.sender) || hasRole(HISTORY_ADMIN_ROLE, msg.sender),
            "VehicleHistory: not authorized (not a service center or admin)"
        );
        _;
    }

    modifier vehicleExists(string calldata vin) {
        require(registry.vehicleRegistered(vin), "VehicleHistory: vehicle not found");
        _;
    }

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────
    constructor(address registryAddress) {
        require(registryAddress != address(0), "VehicleHistory: zero address");
        registry = VehicleRegistry(registryAddress);

        _grantRole(DEFAULT_ADMIN_ROLE,  msg.sender);
        _grantRole(HISTORY_ADMIN_ROLE,  msg.sender);
    }

    // ──────────────────────────────────────────────
    //  Record Additions
    // ──────────────────────────────────────────────

    /**
     * @notice Add a service record (oil change, inspection, repair, etc.)
     *         Caller must be an authorized service center or HISTORY_ADMIN_ROLE.
     */
    function addServiceRecord(string calldata vin, string calldata description)
        external
        vehicleExists(vin)
        onlyAuthorized
    {
        require(bytes(description).length > 0, "VehicleHistory: description required");

        _vehicleHistory[vin].push(HistoryRecord({
            recordType:  RecordType.SERVICE,
            description: description,
            mileage:     0,
            timestamp:   block.timestamp,
            addedBy:     msg.sender
        }));

        emit ServiceRecordAdded(vin, msg.sender, block.timestamp);
    }

    /**
     * @notice Add an accident report.
     *         Caller must be an authorized service center or HISTORY_ADMIN_ROLE.
     */
    function addAccidentRecord(string calldata vin, string calldata description)
        external
        vehicleExists(vin)
        onlyAuthorized
    {
        require(bytes(description).length > 0, "VehicleHistory: description required");

        _vehicleHistory[vin].push(HistoryRecord({
            recordType:  RecordType.ACCIDENT,
            description: description,
            mileage:     0,
            timestamp:   block.timestamp,
            addedBy:     msg.sender
        }));

        emit AccidentRecordAdded(vin, msg.sender, block.timestamp);
    }

    /**
     * @notice Add a mileage entry.
     *         Mileage must be strictly greater than the last recorded value —
     *         enforces odometer fraud prevention on-chain.
     *         Caller must be an authorized service center or HISTORY_ADMIN_ROLE.
     */
    function addMileageRecord(
        string calldata vin,
        uint256         mileage,
        string calldata description
    )
        external
        vehicleExists(vin)
        onlyAuthorized
    {
        require(mileage > 0, "VehicleHistory: mileage must be > 0");
        require(
            mileage > lastMileage[vin],
            "VehicleHistory: mileage must exceed last recorded value (odometer fraud check)"
        );

        lastMileage[vin] = mileage;

        _vehicleHistory[vin].push(HistoryRecord({
            recordType:  RecordType.MILEAGE,
            description: description,
            mileage:     mileage,
            timestamp:   block.timestamp,
            addedBy:     msg.sender
        }));

        emit MileageRecordAdded(vin, mileage, msg.sender, block.timestamp);
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    function getHistory(string calldata vin)
        external view
        vehicleExists(vin)
        returns (HistoryRecord[] memory)
    {
        return _vehicleHistory[vin];
    }

    function getHistoryCount(string calldata vin)
        external view
        vehicleExists(vin)
        returns (uint256)
    {
        return _vehicleHistory[vin].length;
    }

    function getRecord(string calldata vin, uint256 index)
        external view
        vehicleExists(vin)
        returns (HistoryRecord memory)
    {
        require(index < _vehicleHistory[vin].length, "VehicleHistory: index out of bounds");
        return _vehicleHistory[vin][index];
    }
}
