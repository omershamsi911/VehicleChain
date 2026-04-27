// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GovToken
 * @dev ERC-20 Governance Token for Vehicle Chain DAO
 *      Used for staking disputes, voting power, and rewarding honest voters.
 */
contract GovToken {
    // ──────────────────────────────────────────────
    //  State Variables
    // ──────────────────────────────────────────────
    string public name     = "VehicleChain Token";
    string public symbol   = "VCT";
    uint8  public decimals = 18;

    uint256 public totalSupply;

    address public admin;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    // Track staked tokens per user (locked for DAO disputes)
    mapping(address => uint256) public stakedBalance;

    // ──────────────────────────────────────────────
    //  Events  (ERC-20 standard + custom)
    // ──────────────────────────────────────────────
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);

    // ──────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────
    modifier onlyAdmin() {
        require(msg.sender == admin, "GovToken: caller is not admin");
        _;
    }

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────
    constructor(uint256 initialSupply) {
        admin = msg.sender;
        _mint(msg.sender, initialSupply * 10 ** uint256(decimals));
    }

    // ──────────────────────────────────────────────
    //  ERC-20 Core
    // ──────────────────────────────────────────────

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(to != address(0), "GovToken: transfer to zero address");
        require(_balances[msg.sender] >= amount, "GovToken: insufficient balance");
        _transfer(msg.sender, to, amount);
        return true;
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        require(spender != address(0), "GovToken: approve to zero address");
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(to != address(0), "GovToken: transfer to zero address");
        require(_balances[from] >= amount, "GovToken: insufficient balance");
        require(_allowances[from][msg.sender] >= amount, "GovToken: insufficient allowance");

        _allowances[from][msg.sender] -= amount;
        _transfer(from, to, amount);
        return true;
    }

    // ──────────────────────────────────────────────
    //  Admin Functions
    // ──────────────────────────────────────────────

    /// @notice Mint new tokens to any address (admin only)
    function mint(address to, uint256 amount) external onlyAdmin {
        require(to != address(0), "GovToken: mint to zero address");
        require(amount > 0, "GovToken: amount must be > 0");
        _mint(to, amount);
    }

    /// @notice Burn tokens from an address (admin only, used by DAO for penalties)
    function burn(address from, uint256 amount) external onlyAdmin {
        require(_balances[from] >= amount, "GovToken: insufficient balance to burn");
        _balances[from] -= amount;
        totalSupply      -= amount;
        emit Burned(from, amount);
        emit Transfer(from, address(0), amount);
    }

    // ──────────────────────────────────────────────
    //  Staking (used by DisputeDAO)
    // ──────────────────────────────────────────────

    /// @notice Stake tokens to participate in DAO dispute filing
    function stake(uint256 amount) external {
        require(amount > 0, "GovToken: stake amount must be > 0");
        require(_balances[msg.sender] >= amount, "GovToken: insufficient balance");

        _balances[msg.sender] -= amount;
        stakedBalance[msg.sender] += amount;

        emit Staked(msg.sender, amount);
    }

    /// @notice Unstake tokens (only if not locked by active dispute)
    function unstake(uint256 amount) external {
        require(stakedBalance[msg.sender] >= amount, "GovToken: insufficient staked balance");
        stakedBalance[msg.sender] -= amount;
        _balances[msg.sender]     += amount;
        emit Unstaked(msg.sender, amount);
    }

    /// @notice Slash staked tokens (called by DisputeDAO for losing proposers)
    function slashStake(address user, uint256 amount) external onlyAdmin {
        require(stakedBalance[user] >= amount, "GovToken: insufficient staked balance");
        stakedBalance[user] -= amount;
        totalSupply          -= amount;
        emit Burned(user, amount);
    }

    /// @notice Reward a user with newly minted tokens (called by DisputeDAO)
    function reward(address to, uint256 amount) external onlyAdmin {
        require(to != address(0), "GovToken: reward to zero address");
        _mint(to, amount);
    }

    // ──────────────────────────────────────────────
    //  Internal
    // ──────────────────────────────────────────────

    function _transfer(address from, address to, uint256 amount) internal {
        _balances[from] -= amount;
        _balances[to]   += amount;
        emit Transfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal {
        _balances[to] += amount;
        totalSupply    += amount;
        emit Minted(to, amount);
        emit Transfer(address(0), to, amount);
    }
}
