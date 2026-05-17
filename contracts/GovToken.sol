// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title GovToken (VCT)
 * @dev ERC-20 Governance Token for VehicleChain DAO.
 *
 *      Roles:
 *        DEFAULT_ADMIN_ROLE  — can grant/revoke roles (multisig in prod)
 *        MINTER_ROLE         — can mint tokens (DisputeDAO for rewards)
 *        BURNER_ROLE         — can burn tokens (DisputeDAO for penalties)
 *        STAKING_MANAGER     — can slash staked balances (DisputeDAO)
 *
 *      Staking is tracked separately from balances so staked tokens
 *      are non-transferable while locked.
 */
contract GovToken is ERC20, AccessControl {

    // ──────────────────────────────────────────────
    //  Roles
    // ──────────────────────────────────────────────
    bytes32 public constant MINTER_ROLE      = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE      = keccak256("BURNER_ROLE");
    bytes32 public constant STAKING_MANAGER  = keccak256("STAKING_MANAGER");

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────

    // Staked balances are separate from liquid ERC-20 balance.
    // Staked tokens are locked — cannot be transferred while staked.
    mapping(address => uint256) public stakedBalance;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event StakeSlashed(address indexed user, uint256 amount);
    event Rewarded(address indexed user, uint256 amount);
    event Burned(address indexed user, uint256 amount);

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────
    constructor(uint256 initialSupply) ERC20("VehicleChain Token", "VCT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE,        msg.sender);
        _grantRole(BURNER_ROLE,        msg.sender);
        _grantRole(STAKING_MANAGER,    msg.sender);

        // Mint initial supply to deployer (distribute to treasury / liquidity)
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    // ──────────────────────────────────────────────
    //  Minting / Burning  (role-gated)
    // ──────────────────────────────────────────────

    /**
     * @notice Mint tokens — only MINTER_ROLE (DisputeDAO for voter rewards).
     *         Kept intentionally limited: DAO should mint conservatively.
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(to != address(0), "GovToken: mint to zero address");
        require(amount > 0,       "GovToken: zero amount");
        _mint(to, amount);
        emit Rewarded(to, amount);
    }

    /**
     * @notice Burn tokens from an address — only BURNER_ROLE (DisputeDAO for penalties).
     *         Can only burn from liquid balance, not staked balance.
     */
    function burn(address from, uint256 amount) external onlyRole(BURNER_ROLE) {
        require(balanceOf(from) >= amount, "GovToken: insufficient liquid balance");
        _burn(from, amount);
        emit Burned(from, amount);
    }

    // ──────────────────────────────────────────────
    //  Staking
    // ──────────────────────────────────────────────

    /**
     * @notice Stake liquid VCT to qualify as a dispute proposer.
     *         Staked tokens leave the ERC-20 balance and are locked.
     */
    function stake(uint256 amount) external {
        require(amount > 0,                    "GovToken: zero amount");
        require(balanceOf(msg.sender) >= amount, "GovToken: insufficient balance");

        _burn(msg.sender, amount);            // Remove from liquid supply
        stakedBalance[msg.sender] += amount;  // Record in staked ledger

        emit Staked(msg.sender, amount);
    }

    /**
     * @notice Unstake tokens back to liquid balance.
     *         The DisputeDAO should enforce that tokens locked in an
     *         active dispute cannot be unstaked (see DisputeDAO.raiseDispute lock).
     */
    function unstake(uint256 amount) external {
        require(stakedBalance[msg.sender] >= amount, "GovToken: insufficient staked");

        stakedBalance[msg.sender] -= amount;
        _mint(msg.sender, amount);  // Return to liquid supply

        emit Unstaked(msg.sender, amount);
    }

    /**
     * @notice Slash staked tokens from a losing proposer — STAKING_MANAGER only.
     *         Slashed tokens are burned (removed from total supply).
     */
    function slashStake(address user, uint256 amount) external onlyRole(STAKING_MANAGER) {
        require(stakedBalance[user] >= amount, "GovToken: insufficient staked to slash");
        stakedBalance[user] -= amount;
        // Burned: not returned to circulation — deflationary pressure
        emit StakeSlashed(user, amount);
    }

    /**
     * @notice Reward a user — convenience alias for DisputeDAO readability.
     *         Mints new tokens; use sparingly (see tokenomics note in DisputeDAO).
     */
    function reward(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(to != address(0), "GovToken: reward to zero address");
        _mint(to, amount);
        emit Rewarded(to, amount);
    }

    // ──────────────────────────────────────────────
    //  Transfer Guard
    //  Prevent transferring staked tokens — liquid balance only.
    // ──────────────────────────────────────────────

    /**
     * @dev Override to block transfers that would dip into staked tokens.
     *      (Staked tokens are already burned from ERC-20 supply, so this is
     *       a belt-and-suspenders check for accounting consistency.)
     */
    function _beforeTokenTransfer(
        address from,
        address /* to */,
        uint256 amount
    ) internal view override {
        if (from == address(0)) return; // minting — always ok
        // Liquid balance check: OZ ERC-20 already checks balanceOf,
        // but we re-assert it here for clarity with the staking system.
        require(
            balanceOf(from) >= amount,
            "GovToken: amount exceeds liquid balance"
        );
    }

    // ──────────────────────────────────────────────
    //  ERC-165
    // ──────────────────────────────────────────────
    function supportsInterface(bytes4 interfaceId)
        public view override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
