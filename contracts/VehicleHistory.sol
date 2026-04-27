// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VehicleRegistry.sol";

/**
 * @title VehicleHistory
 * @dev Records immutable service, accident, and mileage history for vehicles.
 *      Only authorized service centers (registered in VehicleRegistry) can add entries.
 */
contract VehicleHistory {
    // ──────────────────────────────────────────────
    //  Enums & Structs
    // ──────────────────────────────────────────────
    enum RecordType { SERVICE, ACCIDENT, MILEAGE }

    struct HistoryRecord {
        RecordType  recordType;
        string      description;
        uint256     mileage;       // 0 if not a mileage record
        uint256     timestamp;
        address     addedBy;       // Service center or authority address
    }

    // ──────────────────────────────────────────────
    //  State Variables
    // ──────────────────────────────────────────────
    VehicleRegistry public registry;
    address         public authority;

    // vin => array of history records
    mapping(string => HistoryRecord[]) private vehicleHistory;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────
    event ServiceRecordAdded(string indexed vin, address indexed addedBy, uint256 timestamp);
    event AccidentRecordAdded(string indexed vin, address indexed addedBy, uint256 timestamp);
    event MileageRecordAdded(string indexed vin, uint256 mileage, uint256 timestamp);

    // ──────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────
    modifier onlyServiceCenterOrAuthority() {
        require(
            registry.serviceCenters(msg.sender) || msg.sender == authority,
            "VehicleHistory: caller is not authorized"
        );
        _;
    }

    modifier vehicleExists(string memory vin) {
        require(registry.vehicleRegistered(vin), "VehicleHistory: vehicle not found");
        _;
    }

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────
    constructor(address registryAddress) {
        require(registryAddress != address(0), "VehicleHistory: zero address");
        registry  = VehicleRegistry(registryAddress);
        authority = msg.sender;
    }

    // ──────────────────────────────────────────────
    //  Record Additions
    // ──────────────────────────────────────────────

    /// @notice Add a service record (oil change, inspection, repair, etc.)
    function addServiceRecord(string memory vin, string memory description)
        external
        vehicleExists(vin)
        onlyServiceCenterOrAuthority
    {
        require(bytes(description).length > 0, "VehicleHistory: description cannot be empty");

        vehicleHistory[vin].push(HistoryRecord({
            recordType:  RecordType.SERVICE,
            description: description,
            mileage:     0,
            timestamp:   block.timestamp,
            addedBy:     msg.sender
        }));

        emit ServiceRecordAdded(vin, msg.sender, block.timestamp);
    }

    /// @notice Add an accident report
    function addAccidentRecord(string memory vin, string memory description)
        external
        vehicleExists(vin)
        onlyServiceCenterOrAuthority
    {
        require(bytes(description).length > 0, "VehicleHistory: description cannot be empty");

        vehicleHistory[vin].push(HistoryRecord({
            recordType:  RecordType.ACCIDENT,
            description: description,
            mileage:     0,
            timestamp:   block.timestamp,
            addedBy:     msg.sender
        }));

        emit AccidentRecordAdded(vin, msg.sender, block.timestamp);
    }

    /// @notice Add a mileage log entry
    function addMileageRecord(string memory vin, uint256 mileage, string memory description)
        external
        vehicleExists(vin)
        onlyServiceCenterOrAuthority
    {
        require(mileage > 0, "VehicleHistory: mileage must be > 0");

        // Enforce mileage monotonically increases
        HistoryRecord[] storage history = vehicleHistory[vin];
        for (uint256 i = history.length; i > 0; i--) {
            if (history[i-1].recordType == RecordType.MILEAGE) {
                require(mileage > history[i-1].mileage, "VehicleHistory: mileage cannot decrease");
                break;
            }
        }

        vehicleHistory[vin].push(HistoryRecord({
            recordType:  RecordType.MILEAGE,
            description: description,
            mileage:     mileage,
            timestamp:   block.timestamp,
            addedBy:     msg.sender
        }));

        emit MileageRecordAdded(vin, mileage, block.timestamp);
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    /// @notice Get all history records for a vehicle
    function getHistory(string memory vin)
        external
        view
        vehicleExists(vin)
        returns (HistoryRecord[] memory)
    {
        return vehicleHistory[vin];
    }

    /// @notice Get the count of history records
    function getHistoryCount(string memory vin)
        external
        view
        vehicleExists(vin)
        returns (uint256)
    {
        return vehicleHistory[vin].length;
    }

    /// @notice Get a single history record by index
    function getRecord(string memory vin, uint256 index)
        external
        view
        vehicleExists(vin)
        returns (HistoryRecord memory)
    {
        require(index < vehicleHistory[vin].length, "VehicleHistory: index out of bounds");
        return vehicleHistory[vin][index];
    }
}
