// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VehicleRegistry.sol";

/**
 * @title OwnershipTransfer
 * @dev Two-step (seller initiates, buyer approves) secure vehicle ownership transfer.
 *      Prevents unauthorized transfers. Stolen vehicles cannot be transferred.
 *      Optionally records transfer history on-chain.
 */
contract OwnershipTransfer {
    // ──────────────────────────────────────────────
    //  Enums & Structs
    // ──────────────────────────────────────────────
    enum TransferStatus { PENDING, APPROVED, CANCELLED, COMPLETED }

    struct TransferRequest {
        string         vin;
        address        seller;
        address        buyer;
        TransferStatus status;
        uint256        initiatedAt;
        uint256        completedAt;
        uint256        price;      // Optional: price in wei (0 = gift)
    }

    // ──────────────────────────────────────────────
    //  State Variables
    // ──────────────────────────────────────────────
    VehicleRegistry public registry;
    address         public authority;

    // transfer ID counter
    uint256 public transferCount;

    // transferId => TransferRequest
    mapping(uint256 => TransferRequest) public transfers;

    // vin => active transfer ID (0 = none)
    mapping(string => uint256) public activeTransfer;
    mapping(string => bool)    public hasActiveTransfer;

    // vin => complete history of transfer IDs
    mapping(string => uint256[]) public transferHistory;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────
    event TransferInitiated(uint256 indexed transferId, string indexed vin, address seller, address buyer, uint256 price);
    event TransferApproved(uint256 indexed transferId, string indexed vin, address buyer);
    event TransferCancelled(uint256 indexed transferId, string indexed vin, address cancelledBy);
    event TransferCompleted(uint256 indexed transferId, string indexed vin, address from, address to);

    // ──────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────
    modifier onlyAuthority() {
        require(msg.sender == authority, "OwnershipTransfer: not authority");
        _;
    }

    modifier validTransfer(uint256 transferId) {
        require(transferId > 0 && transferId <= transferCount, "OwnershipTransfer: invalid transfer ID");
        _;
    }

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────
    constructor(address registryAddress) {
        require(registryAddress != address(0), "OwnershipTransfer: zero address");
        registry  = VehicleRegistry(registryAddress);
        authority = msg.sender;
    }

    // ──────────────────────────────────────────────
    //  Transfer Lifecycle
    // ──────────────────────────────────────────────

    /**
     * @notice Step 1 — Seller initiates a transfer request.
     * @param vin   Vehicle Identification Number
     * @param buyer Ethereum address of intended buyer
     * @param price Optional asking price in wei (0 for gift)
     */
    function initiateTransfer(string memory vin, address buyer, uint256 price)
        external
    {
        require(registry.vehicleRegistered(vin),         "OwnershipTransfer: vehicle not found");
        require(registry.getVehicleOwner(vin) == msg.sender, "OwnershipTransfer: caller is not owner");
        require(!registry.isStolen(vin),                 "OwnershipTransfer: cannot transfer stolen vehicle");
        require(buyer != address(0),                     "OwnershipTransfer: buyer is zero address");
        require(buyer != msg.sender,                     "OwnershipTransfer: buyer cannot be seller");
        require(!hasActiveTransfer[vin],                 "OwnershipTransfer: transfer already pending");

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
     * @notice Step 2 — Buyer approves the transfer (and optionally pays).
     * @param transferId ID of the pending transfer
     */
    function approveTransfer(uint256 transferId)
        external
        payable
        validTransfer(transferId)
    {
        TransferRequest storage req = transfers[transferId];
        require(req.status == TransferStatus.PENDING,  "OwnershipTransfer: transfer not pending");
        require(req.buyer == msg.sender,               "OwnershipTransfer: caller is not buyer");
        require(!registry.isStolen(req.vin),           "OwnershipTransfer: vehicle was stolen");

        // If price > 0, buyer must pay exactly
        if (req.price > 0) {
            require(msg.value == req.price, "OwnershipTransfer: incorrect payment");
        }

        req.status      = TransferStatus.APPROVED;
        req.completedAt = block.timestamp;

        // Execute ownership change in registry
        registry.transferOwnership(req.vin, req.buyer);

        // Clear active transfer
        hasActiveTransfer[req.vin] = false;

        // Send payment to seller if applicable
        if (req.price > 0 && msg.value > 0) {
            payable(req.seller).transfer(msg.value);
        }

        req.status = TransferStatus.COMPLETED;

        emit TransferApproved(transferId, req.vin, msg.sender);
        emit TransferCompleted(transferId, req.vin, req.seller, req.buyer);
    }

    /**
     * @notice Cancel a pending transfer (seller or authority can cancel).
     * @param transferId ID of the transfer to cancel
     */
    function cancelTransfer(uint256 transferId)
        external
        validTransfer(transferId)
    {
        TransferRequest storage req = transfers[transferId];
        require(req.status == TransferStatus.PENDING,  "OwnershipTransfer: not pending");
        require(
            msg.sender == req.seller || msg.sender == authority,
            "OwnershipTransfer: unauthorized"
        );

        req.status             = TransferStatus.CANCELLED;
        hasActiveTransfer[req.vin] = false;

        emit TransferCancelled(transferId, req.vin, msg.sender);
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    function getTransfer(uint256 transferId)
        external
        view
        validTransfer(transferId)
        returns (TransferRequest memory)
    {
        return transfers[transferId];
    }

    function getTransferHistory(string memory vin)
        external
        view
        returns (uint256[] memory)
    {
        return transferHistory[vin];
    }

    function getActiveTransfer(string memory vin)
        external
        view
        returns (uint256)
    {
        return hasActiveTransfer[vin] ? activeTransfer[vin] : 0;
    }
}
