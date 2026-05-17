// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

/**
 * @title VehicleRegistry
 * @dev Each vehicle is a unique NFT (ERC-721). Token ID = vehicle record on-chain.
 *      AccessControl replaces single-admin pattern:
 *        - DEFAULT_ADMIN_ROLE  : can grant/revoke all roles (multisig in prod)
 *        - REGISTRAR_ROLE      : can register new vehicles (DMV branches, gov bodies)
 *        - AUTHORITY_ROLE      : can set stolen status, authorize service centers
 *        - TRANSFER_CONTRACT   : internal role for the OwnershipTransfer contract
 */
contract VehicleRegistry is ERC721Enumerable, AccessControl {
    using Counters for Counters.Counter;

    // ──────────────────────────────────────────────
    //  Roles
    // ──────────────────────────────────────────────
    bytes32 public constant REGISTRAR_ROLE      = keccak256("REGISTRAR_ROLE");
    bytes32 public constant AUTHORITY_ROLE      = keccak256("AUTHORITY_ROLE");
    bytes32 public constant TRANSFER_CONTRACT   = keccak256("TRANSFER_CONTRACT");

    // ──────────────────────────────────────────────
    //  Structs
    // ──────────────────────────────────────────────
    struct VehicleData {
        string  vin;           // Vehicle Identification Number (unique)
        string  model;         // e.g. "Toyota Corolla"
        uint256 year;          // Manufacture year
        bool    isStolen;
        uint256 registeredAt;
    }

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────
    Counters.Counter private _tokenIdCounter;

    // tokenId => VehicleData
    mapping(uint256 => VehicleData) private _vehicleData;

    // vin => tokenId  (for lookup by VIN)
    mapping(string => uint256) private _vinToTokenId;

    // vin => exists guard
    mapping(string => bool) private _vinRegistered;

    // Authorized service centers
    mapping(address => bool) public serviceCenters;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────
    event VehicleRegistered(uint256 indexed tokenId, string indexed vin, address indexed owner, string model, uint256 year);
    event StolenStatusUpdated(string indexed vin, bool isStolen);
    event ServiceCenterAdded(address indexed center);
    event ServiceCenterRemoved(address indexed center);

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────
    constructor() ERC721("VehicleChain", "VCH") {
        // Deployer gets admin — should be transferred to a multisig post-deploy
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE,     msg.sender);
        _grantRole(AUTHORITY_ROLE,     msg.sender);
    }

    // ──────────────────────────────────────────────
    //  Vehicle Registration  (REGISTRAR_ROLE)
    // ──────────────────────────────────────────────

    /**
     * @notice Register a new vehicle and mint its NFT to the owner.
     * @param vin   Unique Vehicle Identification Number
     * @param owner Wallet that will receive the NFT (= vehicle title)
     * @param model Human-readable model string
     * @param year  Manufacture year
     * @return tokenId The minted NFT token ID
     */
    function registerVehicle(
        string memory vin,
        address       owner,
        string memory model,
        uint256       year
    ) external onlyRole(REGISTRAR_ROLE) returns (uint256 tokenId) {
        require(bytes(vin).length > 0,   "VehicleRegistry: VIN required");
        require(bytes(model).length > 0, "VehicleRegistry: model required");
        require(owner != address(0),     "VehicleRegistry: zero owner");
        require(!_vinRegistered[vin],    "VehicleRegistry: VIN already registered");
        require(
            year >= 1886 && year <= block.timestamp / 365 days + 1970 + 1,
            "VehicleRegistry: invalid year"
        );

        _tokenIdCounter.increment();
        tokenId = _tokenIdCounter.current();

        _safeMint(owner, tokenId);

        _vehicleData[tokenId] = VehicleData({
            vin:          vin,
            model:        model,
            year:         year,
            isStolen:     false,
            registeredAt: block.timestamp
        });

        _vinToTokenId[vin]  = tokenId;
        _vinRegistered[vin] = true;

        emit VehicleRegistered(tokenId, vin, owner, model, year);
    }

    // ──────────────────────────────────────────────
    //  Ownership Transfer  (TRANSFER_CONTRACT role)
    // ──────────────────────────────────────────────

    /**
     * @notice Transfer the vehicle NFT to a new owner.
     *         Only callable by the authorized OwnershipTransfer contract.
     */
    function transferVehicleOwnership(
        string memory vin,
        address       newOwner
    ) external onlyRole(TRANSFER_CONTRACT) {
        require(_vinRegistered[vin],        "VehicleRegistry: vehicle not found");
        require(newOwner != address(0),     "VehicleRegistry: zero new owner");

        uint256 tokenId = _vinToTokenId[vin];
        require(!_vehicleData[tokenId].isStolen, "VehicleRegistry: cannot transfer stolen vehicle");

        address currentOwner = ownerOf(tokenId);

        // ERC-721 internal transfer — bypasses approval because this contract holds the logic
        _transfer(currentOwner, newOwner, tokenId);
    }

    // ──────────────────────────────────────────────
    //  Stolen Status  (AUTHORITY_ROLE)
    // ──────────────────────────────────────────────

    function setStolenStatus(string memory vin, bool stolen)
        external
        onlyRole(AUTHORITY_ROLE)
    {
        require(_vinRegistered[vin], "VehicleRegistry: vehicle not found");
        uint256 tokenId = _vinToTokenId[vin];
        _vehicleData[tokenId].isStolen = stolen;
        emit StolenStatusUpdated(vin, stolen);
    }

    // ──────────────────────────────────────────────
    //  Service Centers  (AUTHORITY_ROLE)
    // ──────────────────────────────────────────────

    function addServiceCenter(address center) external onlyRole(AUTHORITY_ROLE) {
        require(center != address(0),    "VehicleRegistry: zero address");
        require(!serviceCenters[center], "VehicleRegistry: already authorized");
        serviceCenters[center] = true;
        emit ServiceCenterAdded(center);
    }

    function removeServiceCenter(address center) external onlyRole(AUTHORITY_ROLE) {
        require(serviceCenters[center], "VehicleRegistry: not a service center");
        serviceCenters[center] = false;
        emit ServiceCenterRemoved(center);
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    function getVehicleByVIN(string memory vin)
        external view
        returns (uint256 tokenId, address owner, VehicleData memory data)
    {
        require(_vinRegistered[vin], "VehicleRegistry: vehicle not found");
        tokenId = _vinToTokenId[vin];
        owner   = ownerOf(tokenId);
        data    = _vehicleData[tokenId];
    }

    function getVehicleByTokenId(uint256 tokenId)
        external view
        returns (address owner, VehicleData memory data)
    {
        require(_exists(tokenId), "VehicleRegistry: token does not exist");
        owner = ownerOf(tokenId);
        data  = _vehicleData[tokenId];
    }

    function getVehicleOwner(string memory vin) external view returns (address) {
        require(_vinRegistered[vin], "VehicleRegistry: vehicle not found");
        return ownerOf(_vinToTokenId[vin]);
    }

    function isStolen(string memory vin) external view returns (bool) {
        require(_vinRegistered[vin], "VehicleRegistry: vehicle not found");
        return _vehicleData[_vinToTokenId[vin]].isStolen;
    }

    function vehicleRegistered(string memory vin) external view returns (bool) {
        return _vinRegistered[vin];
    }

    function totalVehicles() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    function tokenURI(uint256 tokenId)
        public view override
        returns (string memory)
    {
        require(_exists(tokenId), "VehicleRegistry: token does not exist");
        // In production: return IPFS/Arweave URI with full vehicle metadata.
        // For now returns a placeholder; replace with your metadata server.
        return string(abi.encodePacked("https://api.vehiclechain.io/meta/", _uint2str(tokenId)));
    }

    // ──────────────────────────────────────────────
    //  ERC-165  (required by AccessControl + ERC-721)
    // ──────────────────────────────────────────────

    function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721Enumerable, AccessControl)
    returns (bool)
{
    return super.supportsInterface(interfaceId);
}

    // ──────────────────────────────────────────────
    //  Internal Helpers
    // ──────────────────────────────────────────────

    function _uint2str(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + value % 10));
            value /= 10;
        }
        return string(buffer);
    }
}
