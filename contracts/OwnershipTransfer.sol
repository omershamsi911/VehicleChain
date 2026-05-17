// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./VehicleRegistry.sol";

/**
 * @title OwnershipTransfer
 * @dev Two-step (seller initiates, buyer approves) vehicle ownership transfer.
 *
 *      Changes from original:
 *        - Single `authority` address replaced with AccessControl.
 *        - TRANSFER_MANAGER_ROLE can cancel any pending transfer (replaces authority-only cancel).
 *        - Calls registry.transferVehicleOwnership() (new ERC-721 interface).
 *        - This contract must hold TRANSFER_CONTRACT role on VehicleRegistry (set in deploy).
 *
 *      Roles:
 *        DEFAULT_ADMIN_ROLE     — grant/revoke roles
 *        TRANSFER_MANAGER_ROLE  — can cancel pending transfers (authority equivalent)
 */
contract OwnershipTransfer is AccessControl {

    // ──────────────────────────────────────────────
    //  Roles
    // ──────────────────────────────────────────────
    bytes32 public constant TRANSFER_MANAGER_ROLE = keccak256("TRANSFER_MANAGER_ROLE");

    // ──────────────────────────────────────────────
    //  Enums & Structs
    // ──────────────────────────────────────────────
    enum TransferStatus { PENDING, COMPLETED, CANCELLED }

    struct TransferRequest {
        string         vin;
        address        seller;
        address        buyer;
        TransferStatus status;
        uint256        initiatedAt;
        uint256        completedAt;
        uint256        price;        // Optional price in wei (0 = gift)
    }

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────
    VehicleRegistry public registry;

    uint256 public transferCount;

    // transferId => TransferRequest
    mapping(uint256 => TransferRequest) public transfers;

    // vin => active transfer ID (0 = none active)
    mapping(string => uint256) public activeTransfer;
    mapping(string => bool)    public hasActiveTransfer;

    // vin => full transfer history
    mapping(string => uint256[]) public transferHistory;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────
    event TransferInitiated(uint256 indexed transferId, string indexed vin, address seller, address buyer, uint256 price);
    event TransferCompleted(uint256 indexed transferId, string indexed vin, address from, address to);
    event TransferCancelled(uint256 indexed transferId, string indexed vin, address cancelledBy);

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────
    constructor(address registryAddress) {
        require(registryAddress != address(0), "OwnershipTransfer: zero address");
        registry = VehicleRegistry(registryAddress);

        _grantRole(DEFAULT_ADMIN_ROLE,    msg.sender);
        _grantRole(TRANSFER_MANAGER_ROLE, msg.sender);
    }

    // ──────────────────────────────────────────────
    //  Transfer Lifecycle
    // ──────────────────────────────────────────────

    /**
     * @notice Step 1 — Current vehicle owner initiates a transfer to a specific buyer.
     *         The caller must be the NFT owner of the vehicle (confirmed via registry).
     * @param vin   Vehicle Identification Number
     * @param buyer Intended buyer's address
     * @param price Optional asking price in wei; buyer must pay exactly this (0 = gift)
     */
    function initiateTransfer(string calldata vin, address buyer, uint256 price)
        external
    {
        require(registry.vehicleRegistered(vin),              "OwnershipTransfer: vehicle not found");
        require(registry.getVehicleOwner(vin) == msg.sender,  "OwnershipTransfer: caller is not owner");
        require(!registry.isStolen(vin),                      "OwnershipTransfer: vehicle is stolen");
        require(buyer != address(0),                          "OwnershipTransfer: zero buyer address");
        require(buyer != msg.sender,                          "OwnershipTransfer: buyer cannot be seller");
        require(!hasActiveTransfer[vin],                      "OwnershipTransfer: transfer already pending");

        transferCount++;
        transfers[transferCount] = TransferRequest({
            vin:         vin,
            seller:      msg.sender,
            buyer:       buyer,
            status:      TransferStatus.PENDING,
            initiatedAt: block.timestamp,
            completedAt: 0,
            price:       price
        });

        activeTransfer[vin]    = transferCount;
        hasActiveTransfer[vin] = true;
        transferHistory[vin].push(transferCount);

        emit TransferInitiated(transferCount, vin, msg.sender, buyer, price);
    }

    /**
     * @notice Step 2 — Buyer approves and completes the transfer.
     *         If a price was set, buyer must send exactly that value in ETH.
     *         Payment is forwarded to the seller atomically.
     * @param transferId ID of the pending transfer request
     */
    function approveTransfer(uint256 transferId)
        external
        payable
    {
        require(transferId > 0 && transferId <= transferCount, "OwnershipTransfer: invalid ID");

        TransferRequest storage req = transfers[transferId];
        require(req.status == TransferStatus.PENDING, "OwnershipTransfer: not pending");
        require(req.buyer == msg.sender,              "OwnershipTransfer: caller is not buyer");
        require(!registry.isStolen(req.vin),          "OwnershipTransfer: vehicle is now stolen");

        // Verify current ownership hasn't changed since initiation
        require(
            registry.getVehicleOwner(req.vin) == req.seller,
            "OwnershipTransfer: seller is no longer owner"
        );

        if (req.price > 0) {
            require(msg.value == req.price, "OwnershipTransfer: incorrect payment amount");
        }

        // Execute the NFT transfer in VehicleRegistry
        // (This contract holds TRANSFER_CONTRACT role on VehicleRegistry)
        registry.transferVehicleOwnership(req.vin, req.buyer);

        req.status      = TransferStatus.COMPLETED;
        req.completedAt = block.timestamp;

        hasActiveTransfer[req.vin] = false;

        // Forward payment to seller
        if (req.price > 0 && msg.value > 0) {
            (bool sent, ) = payable(req.seller).call{value: msg.value}("");
            require(sent, "OwnershipTransfer: ETH transfer to seller failed");
        }

        emit TransferCompleted(transferId, req.vin, req.seller, req.buyer);
    }

    /**
     * @notice Cancel a pending transfer.
     *         Seller can cancel their own request.
     *         TRANSFER_MANAGER_ROLE can cancel any pending transfer (authority override).
     * @param transferId ID of the transfer to cancel
     */
    function cancelTransfer(uint256 transferId) external {
        require(transferId > 0 && transferId <= transferCount, "OwnershipTransfer: invalid ID");

        TransferRequest storage req = transfers[transferId];
        require(req.status == TransferStatus.PENDING, "OwnershipTransfer: not pending");
        require(
            msg.sender == req.seller || hasRole(TRANSFER_MANAGER_ROLE, msg.sender),
            "OwnershipTransfer: not authorized"
        );

        req.status             = TransferStatus.CANCELLED;
        hasActiveTransfer[req.vin] = false;

        emit TransferCancelled(transferId, req.vin, msg.sender);
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    function getTransfer(uint256 transferId)
        external view
        returns (TransferRequest memory)
    {
        require(transferId > 0 && transferId <= transferCount, "OwnershipTransfer: invalid ID");
        return transfers[transferId];
    }

    function getTransferHistory(string calldata vin)
        external view
        returns (uint256[] memory)
    {
        return transferHistory[vin];
    }

    function getActiveTransfer(string calldata vin)
        external view
        returns (uint256)
    {
        return hasActiveTransfer[vin] ? activeTransfer[vin] : 0;
    }
}
