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
    uint256 private precision;


    // mappings
    mapping(uint256 => _ProposalData) private proposals;
    mapping(address => _Participant) private participants;



    // events
    event Deposit(address _from, uint256 _amount);
    event Withdraw(address _to, uint256 _amount);
    event ProposalAdded(uint256 _id, uint256 _startTime, uint256 _endTime, address _recipient, string _description);
    event Voted(address _from, uint256 _id, uint256 _amount, Decision _decision);
    event ProposalFinished(uint256 _id, ProposalStatus _status, bool _isQuorumPassed, bool _isMajorityPassed);

    constructor (address _Token, uint256 _minBalance, uint256 _minimumQuorum, uint256 _proposalDuration, uint256 _requisiteMajority) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        TokenDAO = ERC20ForDAO(_Token);
        threshold = _minBalance;
        minimumQuorum = _minimumQuorum;
        proposalDuration = _proposalDuration;
        requisiteMajority = _requisiteMajority;
        precision = TokenDAO.decimals();
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

    // withdraw function
    function withdraw(uint256 _amount) external {
        require(_amount > 0, "DAO: amount must be positive value");
        _Participant storage user = participants[msg.sender];
        require(_amount <= user.providedFunds, "DAO: amount must be less or equal then provided funds");
        uint256 locked;
        for (uint256 i = 0; i < user.votingParticipation.length; i++) {
            uint256 _id = user.votingParticipation[i];
            _ProposalData storage currentProposal = proposals[_id];
            if (currentProposal.data.status == ProposalStatus.PROGRESS) {
                uint256 voteAmount = currentProposal.votes[msg.sender].amount;
                if (voteAmount > locked) {
                    locked = voteAmount;
                }
            } else if (_id != 0) {
                user.votingParticipation[i] = 0;
            }
        }
        require(user.providedFunds - _amount >= locked, "DAO: amount must be less then locked");
        user.providedFunds -= _amount;
        TokenDAO.transfer(msg.sender, _amount);
        totalProvided -= _amount;
        emit Withdraw(msg.sender, _amount);
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

    // finish proposal function
    function finishProposal(uint256 _id) public payable {
        require(_id > 0 && _id <= proposalsCount, "DAO: proposal with this ID doesn't exist");
        _ProposalData storage currentProposal = proposals[_id];
        require(currentProposal.data.endTime <= block.timestamp, "DAO: the voting has not been completed yet");
        require(
            currentProposal.data.status == ProposalStatus.PROGRESS,
            "DAO: already finished"
        );
        bool isQuorumPassed = _isQuorumPassed(_id);
        bool isMajorityPassed = _isMajorityPassed(_id);
        if (isQuorumPassed && isMajorityPassed) {
//            (bool sent,) = currentOffer.owner.call{value : price}("");
            (bool sent,) = currentProposal.data.recipient.call(currentProposal.data.callData);
            require(sent, "transaction failedd");
            currentProposal.data.status = ProposalStatus.SUCCESS;
            emit ProposalFinished(_id, ProposalStatus.SUCCESS, isQuorumPassed, isMajorityPassed);

        } else {
            currentProposal.data.status = ProposalStatus.REJECTED;
            emit ProposalFinished(_id, ProposalStatus.REJECTED, isQuorumPassed, isMajorityPassed);
        }
    }

    // utility functions

    function _getMemberPart(address _user) view internal returns (uint256) {
        _Participant memory currentUser = participants[_user];
        if (totalProvided > 0) {
            return currentUser.providedFunds * 100 / totalProvided;
        }
        return 0;
    }
    function _isQuorumPassed(uint256 _id) view internal returns (bool) {
        _ProposalData storage currentProposal = proposals[_id];
        if (totalProvided > 0) {
            return uint256(currentProposal.data.votesCount * 100 / totalProvided) >= minimumQuorum;
        }
        return false;
    }
    function _isMajorityPassed(uint256 _id) view internal returns (bool) {
        _ProposalData storage currentProposal = proposals[_id];
        if (currentProposal.data.votesCount > 0 && currentProposal.data.votesFor > 0) {
            uint256 part = uint256((currentProposal.data.votesFor - 1) * 100 / currentProposal.data.votesCount);
            return part >= requisiteMajority;
        }
        return false;
    }
}
