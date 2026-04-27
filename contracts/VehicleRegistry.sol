// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VehicleRegistry
 * @dev Handles vehicle registration, ownership records, and service-center authorization.
 *      Central registry that other contracts reference.
 */
contract VehicleRegistry {
    // ──────────────────────────────────────────────
    //  Structs
    // ──────────────────────────────────────────────
    struct Vehicle {
        string  vin;          // Vehicle Identification Number (unique)
        address owner;        // Current owner
        string  model;        // e.g. "Toyota Corolla"
        uint256 year;         // Manufacture year
        bool    isStolen;     // Set by TheftReport contract
        bool    exists;       // Guard for duplicate check
        uint256 registeredAt; // Block timestamp of registration
    }

    // ──────────────────────────────────────────────
    //  State Variables
    // ──────────────────────────────────────────────
    address public authority;   // Contract deployer / government authority

    // vin => Vehicle
    mapping(string => Vehicle) private vehicles;

    // owner => list of VINs
    mapping(address => string[]) private ownerVehicles;

    // Authorized service centers
    mapping(address => bool) public serviceCenters;

    // Authorized transfer contract address
    address public transferContract;

    // All registered VINs (for enumeration)
    string[] public allVINs;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────
    event VehicleRegistered(string indexed vin, address indexed owner, string model, uint256 year);
    event OwnershipTransferred(string indexed vin, address indexed from, address indexed to);
    event StolenStatusUpdated(string indexed vin, bool isStolen);
    event ServiceCenterAdded(address indexed center);
    event ServiceCenterRemoved(address indexed center);

    // ──────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────
    modifier onlyAuthority() {
        require(msg.sender == authority, "VehicleRegistry: caller is not authority");
        _;
    }

    modifier onlyTransferContract() {
        require(msg.sender == transferContract, "VehicleRegistry: caller is not transfer contract");
        _;
    }

    modifier vehicleExists(string memory vin) {
        require(vehicles[vin].exists, "VehicleRegistry: vehicle not found");
        _;
    }

    modifier onlyVehicleOwner(string memory vin) {
        require(vehicles[vin].owner == msg.sender, "VehicleRegistry: caller is not vehicle owner");
        _;
    }

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────
    constructor() {
        authority = msg.sender;
    }

    // ──────────────────────────────────────────────
    //  Authority Administration
    // ──────────────────────────────────────────────

    /// @notice Set the address of the OwnershipTransfer contract (called once after deploy)
    function setTransferContract(address _transferContract) external onlyAuthority {
        require(_transferContract != address(0), "VehicleRegistry: zero address");
        transferContract = _transferContract;
    }

    /// @notice Authorize a service center
    function addServiceCenter(address center) external onlyAuthority {
        require(center != address(0), "VehicleRegistry: zero address");
        require(!serviceCenters[center], "VehicleRegistry: already a service center");
        serviceCenters[center] = true;
        emit ServiceCenterAdded(center);
    }

    /// @notice Remove a service center
    function removeServiceCenter(address center) external onlyAuthority {
        require(serviceCenters[center], "VehicleRegistry: not a service center");
        serviceCenters[center] = false;
        emit ServiceCenterRemoved(center);
    }

    // ──────────────────────────────────────────────
    //  Vehicle Registration
    // ──────────────────────────────────────────────

    /// @notice Register a new vehicle (authority only)
    function registerVehicle(
        string memory vin,
        address owner,
        string memory model,
        uint256 year
    ) external onlyAuthority {
        require(bytes(vin).length > 0,   "VehicleRegistry: VIN cannot be empty");
        require(bytes(model).length > 0, "VehicleRegistry: model cannot be empty");
        require(year >= 1886 && year <= block.timestamp / 365 days + 1970 + 1,
                                         "VehicleRegistry: invalid year");
        require(owner != address(0),     "VehicleRegistry: owner is zero address");
        require(!vehicles[vin].exists,   "VehicleRegistry: VIN already registered");

        vehicles[vin] = Vehicle({
            vin:          vin,
            owner:        owner,
            model:        model,
            year:         year,
            isStolen:     false,
            exists:       true,
            registeredAt: block.timestamp
        });

        ownerVehicles[owner].push(vin);
        allVINs.push(vin);

        emit VehicleRegistered(vin, owner, model, year);
    }

    // ──────────────────────────────────────────────
    //  Ownership Transfer (called by OwnershipTransfer contract)
    // ──────────────────────────────────────────────

    /// @notice Transfer ownership — only callable by the OwnershipTransfer contract
    function transferOwnership(string memory vin, address newOwner)
        external
        vehicleExists(vin)
        onlyTransferContract
    {
        require(newOwner != address(0), "VehicleRegistry: new owner is zero address");
        require(!vehicles[vin].isStolen, "VehicleRegistry: cannot transfer stolen vehicle");

        address previousOwner = vehicles[vin].owner;
        vehicles[vin].owner   = newOwner;

        // Update owner index
        ownerVehicles[newOwner].push(vin);
        _removeFromOwnerList(previousOwner, vin);

        emit OwnershipTransferred(vin, previousOwner, newOwner);
    }

    // ──────────────────────────────────────────────
    //  Theft Status (called by TheftReport contract)
    // ──────────────────────────────────────────────

    /// @notice Mark vehicle as stolen or recovered (authority only)
    function setStolenStatus(string memory vin, bool stolen)
        external
        vehicleExists(vin)
        onlyAuthority
    {
        vehicles[vin].isStolen = stolen;
        emit StolenStatusUpdated(vin, stolen);
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    function getVehicle(string memory vin)
        external
        view
        vehicleExists(vin)
        returns (Vehicle memory)
    {
        return vehicles[vin];
    }

    function getVehicleOwner(string memory vin)
        external
        view
        vehicleExists(vin)
        returns (address)
    {
        return vehicles[vin].owner;
    }

    function isStolen(string memory vin)
        external
        view
        vehicleExists(vin)
        returns (bool)
    {
        return vehicles[vin].isStolen;
    }

    function getOwnerVehicles(address owner) external view returns (string[] memory) {
        return ownerVehicles[owner];
    }

    function getTotalVehicles() external view returns (uint256) {
        return allVINs.length;
    }

    function vehicleRegistered(string memory vin) external view returns (bool) {
        return vehicles[vin].exists;
    }

    // ──────────────────────────────────────────────
    //  Internal Helpers
    // ──────────────────────────────────────────────

    function _removeFromOwnerList(address owner, string memory vin) internal {
        string[] storage list = ownerVehicles[owner];
        for (uint256 i = 0; i < list.length; i++) {
            if (keccak256(bytes(list[i])) == keccak256(bytes(vin))) {
                list[i] = list[list.length - 1];
                list.pop();
                break;
            }
        }
    }
}
