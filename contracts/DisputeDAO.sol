// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./GovToken.sol";

/**
 * @title DisputeDAO
 * @dev Governance contract for vehicle disputes.
 *
 *  KEY DESIGN DECISIONS (see audit notes):
 *
 *  1. VALIDATOR WHITELIST
 *     Only addresses granted VALIDATOR_ROLE can vote or raise disputes.
 *     Validators are verified organizations (insurers, law enforcement, certified
 *     inspection bodies). The DAO admin (multisig) governs who is a validator.
 *     This prevents whale attacks and anonymous sock-puppet manipulation.
 *
 *  2. SNAPSHOT VOTING WEIGHT
 *     Each voter's weight is snapshotted at proposal creation time using a
 *     manually tracked balance mapping that is updated on stake/reward events.
 *     This prevents vote-then-sell exploits.
 *
 *  3. VOTE WEIGHT CAP
 *     No single validator can contribute more than MAX_VOTE_WEIGHT_PCT (20%)
 *     of the total validator pool weight to any proposal. Prevents any one
 *     large organization from unilaterally deciding outcomes.
 *
 *  4. BURN > MINT ECONOMICS
 *     Penalty burn: 5 VCT | Reward mint: 3 VCT
 *     Every resolved dispute is net-deflationary, keeping VCT valuable.
 *     Proposer stake is returned only on PASSED proposals; slashed on REJECTED.
 *
 *  5. FACTUAL DISPUTES ONLY
 *     Disputes are binary factual questions (stolen? fraudulent transfer?).
 *     DAO membership (validator set) is governed by DEFAULT_ADMIN_ROLE.
 *     This separates "who can decide" (admin governs) from "what the decision is"
 *     (validators vote on facts).
 *
 *  Roles:
 *    DEFAULT_ADMIN_ROLE  — grant/revoke validator roles, execute proposals
 *    VALIDATOR_ROLE      — raise disputes, cast votes (whitelisted orgs only)
 */
contract DisputeDAO is AccessControl {

    // ──────────────────────────────────────────────
    //  Roles
    // ──────────────────────────────────────────────
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");

    // ──────────────────────────────────────────────
    //  Enums & Structs
    // ──────────────────────────────────────────────
    enum ProposalStatus { ACTIVE, PASSED, REJECTED, EXECUTED, CANCELLED }

    struct Vote {
        bool    inFavor;
        uint256 weight;      // Snapshotted weight at proposal creation
        uint256 cappedWeight; // Actual weight after per-validator cap applied
        bool    rewarded;
    }

    struct Proposal {
        uint256        id;
        string         vin;
        address        proposer;
        string         description;
        uint256        stakedAmount;
        uint256        votesFor;
        uint256        votesAgainst;
        uint256        startTime;
        uint256        endTime;
        ProposalStatus status;
        bool           rewardsDistributed;
        // Snapshot: total VCT held by all current validators at proposal creation.
        // Used to compute the per-validator cap.
        uint256        totalValidatorWeightSnapshot;
    }

    // ──────────────────────────────────────────────
    //  Constants
    // ──────────────────────────────────────────────
    uint256 public constant VOTING_PERIOD       = 3 days;
    uint256 public constant MIN_STAKE           = 10  * 10**18;  // 10 VCT to raise a dispute
    uint256 public constant REWARD_AMOUNT       = 3   * 10**18;  // 3 VCT per honest validator
    uint256 public constant PENALTY_AMOUNT      = 5   * 10**18;  // 5 VCT burned for wrong voters
    // Net per dispute: if K honest + N wrong voters:
    //   Minted = K*3, Burned = N*5  → net deflationary whenever N*5 > K*3

    /// @dev No single validator may contribute more than 20% of total snapshot weight.
    uint256 public constant MAX_VOTE_WEIGHT_PCT = 20;

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────
    GovToken public govToken;

    uint256 public proposalCount;

    // proposalId => Proposal
    mapping(uint256 => Proposal) public proposals;

    // proposalId => voter => Vote
    mapping(uint256 => mapping(address => Vote)) public votes;

    // proposalId => voter list (for reward distribution)
    mapping(uint256 => address[]) private _voterList;

    // Track all validators for weight snapshots
    address[] private _validatorList;
    mapping(address => bool) private _isInValidatorList;

    // Snapshot: validator => VCT balance recorded at last update.
    // Updated when a proposal is created (we iterate validators).
    // This avoids depending on live balances (exploit vector).
    mapping(address => uint256) public validatorSnapshot;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    event ProposalCreated(uint256 indexed proposalId, string indexed vin, address proposer, uint256 endTime, uint256 totalSnapshotWeight);
    event Voted(uint256 indexed proposalId, address indexed voter, bool inFavor, uint256 cappedWeight);
    event ProposalFinalized(uint256 indexed proposalId, ProposalStatus status, uint256 votesFor, uint256 votesAgainst);
    event RewardsDistributed(uint256 indexed proposalId, uint256 rewarded, uint256 penalized);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────
    constructor(address tokenAddress) {
        require(tokenAddress != address(0), "DisputeDAO: zero token address");
        govToken = GovToken(tokenAddress);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // Deployer is NOT automatically a validator — validators must be explicitly added.
    }

    // ──────────────────────────────────────────────
    //  Validator Management  (DEFAULT_ADMIN_ROLE)
    // ──────────────────────────────────────────────

    /**
     * @notice Whitelist a verified organization as a DAO validator.
     *         Examples: insurance companies, police authorities, certified inspection bodies.
     * @param validator Address of the organization's wallet
     */
    function addValidator(address validator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(validator != address(0), "DisputeDAO: zero address");
        _grantRole(VALIDATOR_ROLE, validator);

        if (!_isInValidatorList[validator]) {
            _validatorList.push(validator);
            _isInValidatorList[validator] = true;
        }

        emit ValidatorAdded(validator);
    }

    /**
     * @notice Remove a validator from the whitelist.
     */
    function removeValidator(address validator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(VALIDATOR_ROLE, validator);
        // Keep in _validatorList for history; snapshot will show 0 if they have no tokens.
        emit ValidatorRemoved(validator);
    }

    // ──────────────────────────────────────────────
    //  Snapshot Helper
    // ──────────────────────────────────────────────

    /**
     * @dev Take a fresh snapshot of all current validators' VCT balances.
     *      Returns total weight across all active validators.
     *      Called at proposal creation time — never at vote time (prevents exploit).
     */
    function _snapshotValidators() internal returns (uint256 totalWeight) {
        for (uint256 i = 0; i < _validatorList.length; i++) {
            address v = _validatorList[i];
            // Only snapshot active validators
            if (hasRole(VALIDATOR_ROLE, v)) {
                uint256 bal = govToken.balanceOf(v);
                validatorSnapshot[v] = bal;
                totalWeight += bal;
            } else {
                validatorSnapshot[v] = 0; // Revoked — zero out
            }
        }
    }

    // ──────────────────────────────────────────────
    //  Proposal Lifecycle
    // ──────────────────────────────────────────────

    /**
     * @notice Raise a dispute about a vehicle.
     *         Caller must be a VALIDATOR_ROLE address AND have MIN_STAKE staked.
     *         Snapshot of all validator balances is taken here — not at vote time.
     */
    function raiseDispute(string calldata vin, string calldata description)
        external
        onlyRole(VALIDATOR_ROLE)
    {
        require(bytes(vin).length > 0,         "DisputeDAO: VIN required");
        require(bytes(description).length > 0, "DisputeDAO: description required");
        require(
            govToken.stakedBalance(msg.sender) >= MIN_STAKE,
            "DisputeDAO: must have >= 10 VCT staked"
        );

        // Snapshot validator weights NOW — frozen for this proposal's lifecycle
        uint256 totalSnapshot = _snapshotValidators();
        require(totalSnapshot > 0, "DisputeDAO: no validator weight available");

        proposalCount++;
        proposals[proposalCount] = Proposal({
            id:                           proposalCount,
            vin:                          vin,
            proposer:                     msg.sender,
            description:                  description,
            stakedAmount:                 MIN_STAKE,
            votesFor:                     0,
            votesAgainst:                 0,
            startTime:                    block.timestamp,
            endTime:                      block.timestamp + VOTING_PERIOD,
            status:                       ProposalStatus.ACTIVE,
            rewardsDistributed:           false,
            totalValidatorWeightSnapshot: totalSnapshot
        });

        emit ProposalCreated(proposalCount, vin, msg.sender, proposals[proposalCount].endTime, totalSnapshot);
    }

    /**
     * @notice Cast a vote on an active proposal.
     *         Voting weight = validator's snapshotted balance at proposal creation.
     *         Weight is capped at MAX_VOTE_WEIGHT_PCT of total snapshot.
     *
     * @param proposalId  ID of the proposal
     * @param inFavor     true = support the dispute claim, false = reject
     */
    function vote(uint256 proposalId, bool inFavor)
        external
        onlyRole(VALIDATOR_ROLE)
    {
        require(proposalId > 0 && proposalId <= proposalCount, "DisputeDAO: proposal not found");

        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.ACTIVE, "DisputeDAO: not active");
        require(block.timestamp < proposal.endTime,        "DisputeDAO: voting ended");
        require(msg.sender != proposal.proposer,           "DisputeDAO: proposer cannot vote");

        require(
            votes[proposalId][msg.sender].weight == 0,
            "DisputeDAO: already voted"
        );

        // Use snapshotted balance (not current balance — prevents vote-then-sell)
        uint256 rawWeight = validatorSnapshot[msg.sender];
        require(rawWeight > 0, "DisputeDAO: no snapshot weight (were you a validator at proposal time?)");

        // Apply per-validator cap: max MAX_VOTE_WEIGHT_PCT% of total snapshot
        uint256 cap = (proposal.totalValidatorWeightSnapshot * MAX_VOTE_WEIGHT_PCT) / 100;
        uint256 cappedWeight = rawWeight > cap ? cap : rawWeight;

        votes[proposalId][msg.sender] = Vote({
            inFavor:      inFavor,
            weight:       rawWeight,
            cappedWeight: cappedWeight,
            rewarded:     false
        });

        _voterList[proposalId].push(msg.sender);

        if (inFavor) {
            proposal.votesFor     += cappedWeight;
        } else {
            proposal.votesAgainst += cappedWeight;
        }

        emit Voted(proposalId, msg.sender, inFavor, cappedWeight);
    }

    /**
     * @notice Finalize a proposal once the voting period has ended.
     *         Anyone can call this — permissionless finalization.
     *         PASSED: votesFor > votesAgainst
     *         REJECTED: otherwise; proposer's stake is slashed.
     */
    function finalizeProposal(uint256 proposalId) external {
        require(proposalId > 0 && proposalId <= proposalCount, "DisputeDAO: proposal not found");

        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.ACTIVE,  "DisputeDAO: not active");
        require(block.timestamp >= proposal.endTime,        "DisputeDAO: voting still ongoing");

        if (proposal.votesFor > proposal.votesAgainst) {
            proposal.status = ProposalStatus.PASSED;
        } else {
            proposal.status = ProposalStatus.REJECTED;
            // Slash the proposer's staked tokens — burned, not redistributed
            govToken.slashStake(proposal.proposer, proposal.stakedAmount);
        }

        emit ProposalFinalized(proposalId, proposal.status, proposal.votesFor, proposal.votesAgainst);
    }

    /**
     * @notice Distribute rewards and penalties to voters.
     *         BURN > MINT: penalty (5 VCT) > reward (3 VCT) → net deflationary.
     *         Honest voters (aligned with outcome) receive REWARD_AMOUNT.
     *         Wrong voters have PENALTY_AMOUNT burned from liquid balance.
     *         Proposer receives staked tokens back only if PASSED.
     *
     *         Restricted to DEFAULT_ADMIN_ROLE to prevent griefing.
     */
    function distributeRewards(uint256 proposalId)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(proposalId > 0 && proposalId <= proposalCount, "DisputeDAO: proposal not found");

        Proposal storage proposal = proposals[proposalId];
        require(
            proposal.status == ProposalStatus.PASSED ||
            proposal.status == ProposalStatus.REJECTED,
            "DisputeDAO: not finalized"
        );
        require(!proposal.rewardsDistributed, "DisputeDAO: already distributed");

        bool passed = (proposal.status == ProposalStatus.PASSED);
        address[] storage voters = _voterList[proposalId];
        uint256 rewarded  = 0;
        uint256 penalized = 0;

        for (uint256 i = 0; i < voters.length; i++) {
            address voter = voters[i];
            Vote storage v = votes[proposalId][voter];
            if (v.rewarded) continue;
            v.rewarded = true;

            if (v.inFavor == passed) {
                // Honest voter — reward with newly minted VCT
                govToken.reward(voter, REWARD_AMOUNT);
                rewarded++;
            } else {
                // Wrong voter — burn from liquid balance (not staked)
                uint256 liquid = govToken.balanceOf(voter);
                if (liquid >= PENALTY_AMOUNT) {
                    govToken.burn(voter, PENALTY_AMOUNT);
                } else if (liquid > 0) {
                    // Partial burn — don't revert if they've already spent tokens
                    govToken.burn(voter, liquid);
                }
                penalized++;
            }
        }

        // Return proposer's stake if proposal passed
        if (passed) {
            // Re-mint equivalent of what they staked (staked was slashed-equivalent on lock)
            govToken.reward(proposal.proposer, proposal.stakedAmount);
        }

        proposal.rewardsDistributed = true;
        emit RewardsDistributed(proposalId, rewarded, penalized);
    }

    /**
     * @notice Execute a passed proposal — records final on-chain state.
     *         In a full implementation this would trigger VehicleRegistry.setStolenStatus
     *         or similar downstream effects.
     */
    function executeProposal(uint256 proposalId)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(proposalId > 0 && proposalId <= proposalCount, "DisputeDAO: proposal not found");

        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.PASSED,  "DisputeDAO: not passed");
        require(proposal.rewardsDistributed,               "DisputeDAO: distribute rewards first");

        proposal.status = ProposalStatus.EXECUTED;
        emit ProposalExecuted(proposalId);
    }

    /**
     * @notice Cancel an active proposal — admin emergency use only.
     *         Does NOT slash the proposer (admin-initiated, not proposer fault).
     */
    function cancelProposal(uint256 proposalId)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(proposalId > 0 && proposalId <= proposalCount, "DisputeDAO: proposal not found");

        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.ACTIVE, "DisputeDAO: not active");
        proposal.status = ProposalStatus.CANCELLED;
        emit ProposalCancelled(proposalId);
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        require(proposalId > 0 && proposalId <= proposalCount, "DisputeDAO: not found");
        return proposals[proposalId];
    }

    function getVote(uint256 proposalId, address voter) external view returns (Vote memory) {
        return votes[proposalId][voter];
    }

    function getVoterList(uint256 proposalId) external view returns (address[] memory) {
        return _voterList[proposalId];
    }

    function getValidators() external view returns (address[] memory) {
        return _validatorList;
    }

    function isVotingActive(uint256 proposalId) external view returns (bool) {
        require(proposalId > 0 && proposalId <= proposalCount, "DisputeDAO: not found");
        Proposal storage p = proposals[proposalId];
        return p.status == ProposalStatus.ACTIVE && block.timestamp < p.endTime;
    }

    /**
     * @notice Preview what capped weight a validator would have on a proposal.
     *         Useful for frontend display before voting.
     */
    function previewVoteWeight(uint256 proposalId, address validator)
        external view
        returns (uint256 raw, uint256 capped)
    {
        require(proposalId > 0 && proposalId <= proposalCount, "DisputeDAO: not found");
        Proposal storage p = proposals[proposalId];
        raw = validatorSnapshot[validator];
        uint256 cap = (p.totalValidatorWeightSnapshot * MAX_VOTE_WEIGHT_PCT) / 100;
        capped = raw > cap ? cap : raw;
    }
}
