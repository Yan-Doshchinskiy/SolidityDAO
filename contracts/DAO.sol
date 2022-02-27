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

    enum Decision {
        NONE,
        FOR,
        AGAINST
    }

    // structs
    struct _Proposal {
        uint256 id;
        ProposalStatus status;
        uint256 startTime;
        uint256 endTime;
        uint256 votesCount;
        uint256 votesFor;
        uint256 votesAgainst;
        address recipient;
        bytes callData;
        string description;
    }
    struct Vote {
        uint256 amount;
        Decision decision;
    }

    struct _ProposalData {
        _Proposal data;
        mapping(address => Vote) votes;
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
    uint256 public threshold;
    uint256 public minimumQuorum;
    uint256 public proposalDuration;
    uint256 public requisiteMajority;
    uint256 private proposalsCount;

    // mappings
    mapping(uint256 => _ProposalData) private proposals;
    mapping(address => _Participant) private participants;



    // events
    event Deposit(address _from, uint256 _amount);
    event ProposalAdded(uint256 _id, uint256 _startTime, uint256 _endTime, address _recipient, string _description);
    event Voted(address _from, uint256 _id, uint256 _amount, Decision _decision);
//    event ProposalTallied(uint256 proposalID, uint256 votesSupport, uint256 votesAgainst, uint256 quorum, bool active);
//    event Payment(address indexed sender, uint256 amount);

    constructor (address _Token, uint256 _minBalance, uint256 _minimumQuorum, uint256 _proposalDuration, uint256 _requisiteMajority) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        TokenDAO = ERC20ForDAO(_Token);
        threshold = _minBalance;
        minimumQuorum = _minimumQuorum;
        proposalDuration = _proposalDuration;
        requisiteMajority = _requisiteMajority;
    }

    // view functions
    function getProposal(uint256 _id) view external returns (_Proposal memory) {
        _Proposal memory proposalData = proposals[_id].data;
        require(proposalData.status != ProposalStatus.NONE, 'DAO: proposal does not exist');
        return proposalData;
    }


    // deposit function
    function deposit(uint256 _amount) external {
        TokenDAO.transferFrom(msg.sender, address(this), _amount);
        _Participant storage user = participants[msg.sender];
        user.providedFunds += _amount;
        totalProvided += _amount;
        emit Deposit(msg.sender, _amount);
    }


    // addProposal function
    function addProposal(
        bytes calldata _callData,
        address _recipient,
        string memory _description
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        proposalsCount += 1;
        _ProposalData storage newProposal = proposals[proposalsCount];
        newProposal.data = _Proposal({
            id : proposalsCount,
            status : ProposalStatus.PROGRESS,
            startTime : block.timestamp,
            endTime : block.timestamp + proposalDuration,
            votesCount : 0,
            votesFor : 0,
            votesAgainst : 0,
            recipient : _recipient,
            callData : _callData,
            description : _description
        });
        emit ProposalAdded(newProposal.data.id, newProposal.data.startTime, newProposal.data.endTime, newProposal.data.recipient, newProposal.data.description);
    }

    // vote function
    function vote(uint256 _id, uint256 _amount, Decision _decision) external {
        _ProposalData storage currentProposal = proposals[_id];
        _Participant storage currentUser = participants[msg.sender];
        require(_id > 0 && _id <= proposalsCount, "DAO: proposal with this ID doesn't exist");
        require(currentProposal.data.endTime > block.timestamp, "DAO: the voting is over");
        require(_getMemberPart(msg.sender) >= threshold, "DAO: the balance is less than the threshold value");
        require(
            currentProposal.votes[msg.sender].decision == Decision.NONE,
            "DAO: already voted"
        );
        currentUser.votingParticipation.push(_id);
        currentProposal.votes[msg.sender]= Vote({
            amount: _amount,
            decision: _decision
        });
        currentProposal.data.votesCount += _amount;
        if (_decision == Decision.FOR) {
            currentProposal.data.votesFor += _amount;
        } else if (_decision == Decision.AGAINST) {
            currentProposal.data.votesAgainst += _amount;
        }
        emit Voted(msg.sender, _id, _amount, _decision);
    }


    // utility functions

    function _getMemberPart(address _user) view internal returns (uint256) {
        require(totalProvided > 0, "DAO: totalProvided amount eqaul to zero");
        _Participant memory currentUser = participants[_user];
        uint256 result = currentUser.providedFunds * 100 / totalProvided;
        return result;
    }
}
