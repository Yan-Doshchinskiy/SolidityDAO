//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./ERC20ForDAO.sol";

contract DAO is AccessControl {
    // enums

    enum ProposalStatus {
        NONE,
        PROGRESS,
        SUCCESS,
        REJECTED
    }
    enum ProposalType {
        ChangeA,
        ChangeB,
        ChangeC
    }

    // structs
    struct _Proposal {
        uint256 id;
        ProposalStatus status;
        ProposalType proposalType;
        uint256 startTime;
        uint256 endTime;
        uint256 votesCount;
        uint256 votesFor;
        uint256 votesAgainst;
        address recipient;
        uint256 amount;
        bytes32 transactionHash;
        string shortDescription;
        string descriptionHash;
    }
    struct _ProposalData {
        _Proposal data;
        mapping (address => uint256) votes;
    }

    struct _Participant {
        uint256 providedFunds;
        uint256 maxVote;
        uint256[] votingParticipation;
    }
    // ERC20 token
    ERC20ForDAO public TokenDAO;

    // variables
    uint256 public totalProvided;
    uint256 public minMemberBalance;
    uint256 public minimumQuorum;
    uint256 public proposalDuration;
    uint256 public requisiteMajority;
    uint256 private proposalsCount;

    // mappings
    mapping (uint256 => _ProposalData) private proposals;
    mapping (address => _Participant) private participants;



    // events
//    event ProposalAdded(uint256 proposalID, address recipient, uint256 amount, string description, string fullDescHash);
//    event Voted(uint256 proposalID, bool position, address voter, string justification);
//    event ProposalTallied(uint256 proposalID, uint256 votesSupport, uint256 votesAgainst, uint256 quorum, bool active);
//    event Payment(address indexed sender, uint256 amount);

//    modifier _onlyMembers {
//        require(participants[msg.sender].providedFunds > minMemberBalance);
//        _;
//    }

    constructor (address _Token, uint256 _minBalance, uint256 _minimumQuorum, uint256 _proposalDuration, uint256 _requisiteMajority) public {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        TokenDAO = ERC20ForDAO(_Token);
        minMemberBalance = _minBalance;
        minimumQuorum = _minimumQuorum;
        proposalDuration = _proposalDuration;
        requisiteMajority = _requisiteMajority;
    }

    function deposit(uint256 _amount) public {
        TokenDAO.transferFrom(msg.sender, address(this), _amount);
        _Participant storage user = participants[msg.sender];
        user.providedFunds += _amount;
        totalProvided += _amount;
    }
}
