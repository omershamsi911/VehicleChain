// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GovToken.sol";

/**
 * @title DisputeDAO
 * @dev Token-weighted voting DAO for vehicle disputes.
 *      Proposers stake tokens to raise disputes (anti-spam).
 *      Voters are rewarded or penalized based on alignment with final decision.
 *      Admin executes finalized proposals.
 */
contract DisputeDAO {
    // ──────────────────────────────────────────────
    //  Enums & Structs
    // ──────────────────────────────────────────────
    enum ProposalStatus { ACTIVE, PASSED, REJECTED, EXECUTED, CANCELLED }

    struct Vote {
        bool    inFavor;
        uint256 weight;    // Token weight at time of vote
        bool    rewarded;  // Whether reward/penalty has been applied
    }

    struct Proposal {
        uint256        id;
        string         vin;            // Vehicle in dispute
        address        proposer;
        string         description;    // What is disputed
        uint256        stakedAmount;   // Tokens staked by proposer
        uint256        votesFor;       // Weighted votes in favor
        uint256        votesAgainst;   // Weighted votes against
        uint256        startTime;
        uint256        endTime;        // Voting deadline
        ProposalStatus status;
        bool           rewardsDistributed;
    }

    // ──────────────────────────────────────────────
    //  State Variables
    // ──────────────────────────────────────────────
    GovToken public govToken;
    address  public admin;

    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD     = 3 days;
    uint256 public constant MIN_STAKE         = 10 * 10**18;  // 10 VCT tokens
    uint256 public constant REWARD_AMOUNT     = 5  * 10**18;  // 5 VCT per honest voter
    uint256 public constant PENALTY_AMOUNT    = 2  * 10**18;  // 2 VCT burn for wrong voters

    // proposalId => Proposal
    mapping(uint256 => Proposal) public proposals;

    // proposalId => voter => Vote
    mapping(uint256 => mapping(address => Vote)) public votes;

    // proposalId => list of voters (for reward distribution)
    mapping(uint256 => address[]) private voterList;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────
    event ProposalCreated(uint256 indexed proposalId, string indexed vin, address proposer, uint256 stake, uint256 endTime);
    event Voted(uint256 indexed proposalId, address indexed voter, bool inFavor, uint256 weight);
    event ProposalFinalized(uint256 indexed proposalId, ProposalStatus status, uint256 votesFor, uint256 votesAgainst);
    event RewardsDistributed(uint256 indexed proposalId, uint256 rewardedVoters);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId, address cancelledBy);

    // ──────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────
    modifier onlyAdmin() {
        require(msg.sender == admin, "DisputeDAO: not admin");
        _;
    }

    modifier proposalExists(uint256 id) {
        require(id > 0 && id <= proposalCount, "DisputeDAO: proposal not found");
        _;
    }

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────
    constructor(address tokenAddress) {
        require(tokenAddress != address(0), "DisputeDAO: zero address");
        govToken = GovToken(tokenAddress);
        admin    = msg.sender;
    }

    // ──────────────────────────────────────────────
    //  Proposal Lifecycle
    // ──────────────────────────────────────────────

    /**
     * @notice Raise a dispute about a vehicle.
     *         Caller must have staked >= MIN_STAKE tokens in GovToken.
     * @param vin         Vehicle Identification Number in dispute
     * @param description Detailed description of the dispute
     */
    function raiseDispute(string memory vin, string memory description)
        external
    {
        require(bytes(vin).length > 0,         "DisputeDAO: VIN required");
        require(bytes(description).length > 0, "DisputeDAO: description required");
        require(
            govToken.stakedBalance(msg.sender) >= MIN_STAKE,
            "DisputeDAO: insufficient staked tokens (min 10 VCT)"
        );

        proposalCount++;
        proposals[proposalCount] = Proposal({
            id:                  proposalCount,
            vin:                 vin,
            proposer:            msg.sender,
            description:         description,
            stakedAmount:        MIN_STAKE,
            votesFor:            0,
            votesAgainst:        0,
            startTime:           block.timestamp,
            endTime:             block.timestamp + VOTING_PERIOD,
            status:              ProposalStatus.ACTIVE,
            rewardsDistributed:  false
        });

        emit ProposalCreated(proposalCount, vin, msg.sender, MIN_STAKE, proposals[proposalCount].endTime);
    }

    /**
     * @notice Cast a weighted vote on an active proposal.
     *         Voting power = caller's token balance (ERC-20 balance, NOT staked).
     * @param proposalId ID of the proposal
     * @param inFavor    true = support the dispute, false = reject
     */
    function vote(uint256 proposalId, bool inFavor)
        external
        proposalExists(proposalId)
    {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.ACTIVE,    "DisputeDAO: voting not active");
        require(block.timestamp < proposal.endTime,           "DisputeDAO: voting period ended");
        require(votes[proposalId][msg.sender].weight == 0,    "DisputeDAO: already voted");
        require(msg.sender != proposal.proposer,              "DisputeDAO: proposer cannot vote");

        // Voting weight = liquid balance (not staked)
        uint256 weight = govToken.balanceOf(msg.sender);
        require(weight > 0, "DisputeDAO: no token balance");

        votes[proposalId][msg.sender] = Vote({
            inFavor:  inFavor,
            weight:   weight,
            rewarded: false
        });

        voterList[proposalId].push(msg.sender);

        if (inFavor) {
            proposal.votesFor     += weight;
        } else {
            proposal.votesAgainst += weight;
        }

        emit Voted(proposalId, msg.sender, inFavor, weight);
    }

    /**
     * @notice Finalize a proposal after voting period ends.
     *         Anyone can call this — sets PASSED or REJECTED status.
     * @param proposalId ID of the proposal to finalize
     */
    function finalizeProposal(uint256 proposalId)
        external
        proposalExists(proposalId)
    {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.ACTIVE,   "DisputeDAO: not active");
        require(block.timestamp >= proposal.endTime,         "DisputeDAO: voting still ongoing");

        if (proposal.votesFor > proposal.votesAgainst) {
            proposal.status = ProposalStatus.PASSED;
        } else {
            proposal.status = ProposalStatus.REJECTED;
            // Slash proposer stake on rejection
            govToken.slashStake(proposal.proposer, proposal.stakedAmount);
        }

        emit ProposalFinalized(proposalId, proposal.status, proposal.votesFor, proposal.votesAgainst);
    }

    /**
     * @notice Distribute rewards/penalties to voters after finalization.
     *         Honest voters (aligned with outcome) get REWARD_AMOUNT.
     *         Wrong voters get PENALTY_AMOUNT burned.
     *         Proposer gets staked tokens back if proposal PASSED.
     * @param proposalId ID of the finalized proposal
     */
    function distributeRewards(uint256 proposalId)
        external
        proposalExists(proposalId)
        onlyAdmin
    {
        Proposal storage proposal = proposals[proposalId];
        require(
            proposal.status == ProposalStatus.PASSED || proposal.status == ProposalStatus.REJECTED,
            "DisputeDAO: not finalized"
        );
        require(!proposal.rewardsDistributed, "DisputeDAO: rewards already distributed");

        bool proposalPassed = (proposal.status == ProposalStatus.PASSED);
        address[] storage voters = voterList[proposalId];
        uint256 rewarded = 0;

        for (uint256 i = 0; i < voters.length; i++) {
            address voter = voters[i];
            Vote storage v = votes[proposalId][voter];
            if (v.rewarded) continue;

            bool votedCorrectly = (v.inFavor == proposalPassed);
            v.rewarded = true;

            if (votedCorrectly) {
                govToken.reward(voter, REWARD_AMOUNT);
                rewarded++;
            } else {
                // Penalize by burning from balance
                uint256 bal = govToken.balanceOf(voter);
                if (bal >= PENALTY_AMOUNT) {
                    govToken.burn(voter, PENALTY_AMOUNT);
                }
            }
        }

        // Return stake to proposer if passed
        if (proposalPassed) {
            govToken.reward(proposal.proposer, proposal.stakedAmount);
        }

        proposal.rewardsDistributed = true;
        emit RewardsDistributed(proposalId, rewarded);
    }

    /**
     * @notice Execute a passed proposal (record final action).
     * @param proposalId ID of the PASSED proposal
     */
    function executeProposal(uint256 proposalId)
        external
        proposalExists(proposalId)
        onlyAdmin
    {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.PASSED,  "DisputeDAO: not passed");
        require(proposal.rewardsDistributed,               "DisputeDAO: distribute rewards first");

        proposal.status = ProposalStatus.EXECUTED;
        emit ProposalExecuted(proposalId);
    }

    /**
     * @notice Cancel an ACTIVE proposal (admin only — emergencies).
     */
    function cancelProposal(uint256 proposalId)
        external
        proposalExists(proposalId)
        onlyAdmin
    {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.ACTIVE, "DisputeDAO: not active");
        proposal.status = ProposalStatus.CANCELLED;
        emit ProposalCancelled(proposalId, msg.sender);
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    function getProposal(uint256 proposalId)
        external
        view
        proposalExists(proposalId)
        returns (Proposal memory)
    {
        return proposals[proposalId];
    }

    function getVote(uint256 proposalId, address voter)
        external
        view
        returns (Vote memory)
    {
        return votes[proposalId][voter];
    }

    function getVoterList(uint256 proposalId)
        external
        view
        returns (address[] memory)
    {
        return voterList[proposalId];
    }

    function isVotingActive(uint256 proposalId)
        external
        view
        proposalExists(proposalId)
        returns (bool)
    {
        Proposal storage p = proposals[proposalId];
        return p.status == ProposalStatus.ACTIVE && block.timestamp < p.endTime;
    }
}
