import { expect } from "chai";
import { Decision, ProposalStatus } from "../../interfaces/DAO";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

export default (): void => {
  it(`DAO-VOTE: vote function works correctly (completed)`, async function (): Promise<void> {
    await this.instanceToken.mint(this.user1.address, this.depositAmount);
    await this.instanceToken
      .connect(this.user1)
      .approve(this.instanceDAO.address, this.depositAmount);
    await this.instanceDAO.connect(this.user1).deposit(this.depositAmount);
    await this.instanceToken.mint(this.user2.address, this.depositAmount2);
    await this.instanceToken
      .connect(this.user2)
      .approve(this.instanceDAO.address, this.depositAmount2);
    await this.instanceDAO.connect(this.user2).deposit(this.depositAmount2);

    const callData = this.instanceZavod.interface.encodeFunctionData(
      "changeTransportType",
      [this.testType]
    );
    const tx = await this.instanceDAO.addProposal(
      callData,
      this.testRecipient,
      this.testDescription
    );
    const { events } = await tx.wait();
    const event = events.find(
      (singleEvent: any) => singleEvent.event === "ProposalAdded"
    );
    const { _id } = event.args;
    const { timestamp } = await this.hre.ethers.provider.getBlock("latest");
    await this.instanceDAO
      .connect(this.user1)
      .vote(_id, this.voteAmount1, Decision.FOR);
    const {
      id: resId,
      status: resStatus,
      startTime: resStartTime,
      endTime: resEndTime,
      votesCount: resVotesCount,
      votesFor: resVotesFor,
      votesAgainst: resVotesAgainst,
      recipient: resRecipient,
      callData: resCalldata,
      description: resDescription,
    } = await this.instanceDAO.getProposal(_id);

    const result = [
      Number(resId),
      resStatus,
      Number(resStartTime),
      Number(resEndTime),
      Number(resVotesCount),
      Number(resVotesFor),
      Number(resVotesAgainst),
      resRecipient,
      resCalldata,
      resDescription,
    ];
    const expectedResult = [
      Number(_id),
      ProposalStatus.PROGRESS,
      timestamp,
      Number(timestamp) + Number(this.daoArguments[3]),
      Number(this.voteAmount1),
      Number(this.voteAmount1),
      0,
      this.testRecipient,
      callData,
      this.testDescription,
    ];
    expect(result).to.deep.equal(expectedResult);
    await this.instanceDAO
      .connect(this.user2)
      .vote(_id, this.voteAmount2, Decision.AGAINST);
    const {
      votesCount: resVotesCount2,
      votesFor: resVotesFor2,
      votesAgainst: resVotesAgainst2,
    } = await this.instanceDAO.getProposal(_id);
    const result2 = [
      Number(resVotesCount2),
      Number(resVotesFor2),
      Number(resVotesAgainst2),
    ];
    const expected2 = [
      Number(BigNumber.from(resVotesCount).add(this.voteAmount2)),
      Number(resVotesFor),
      Number(BigNumber.from(resVotesAgainst).add(this.voteAmount2)),
    ];
    expect(result2).to.deep.equal(expected2);
  });
  it(`DAO-VOTE: vote function works correctly (reverted with "DAO: proposal with this ID doesn't exist")`, async function (): Promise<void> {
    await this.instanceToken.mint(this.user1.address, this.depositAmount);
    await this.instanceToken
      .connect(this.user1)
      .approve(this.instanceDAO.address, this.depositAmount);
    await this.instanceDAO.connect(this.user1).deposit(this.depositAmount);
    const callData = this.instanceZavod.interface.encodeFunctionData(
      "changeTransportType",
      [this.testType]
    );
    const tx = await this.instanceDAO.addProposal(
      callData,
      this.testRecipient,
      this.testDescription
    );
    const { events } = await tx.wait();
    const event = events.find(
      (singleEvent: any) => singleEvent.event === "ProposalAdded"
    );
    const { _id } = event.args;
    await expect(
      this.instanceDAO
        .connect(this.user1)
        .vote(0, this.voteAmount1, Decision.FOR)
    ).to.be.revertedWith("DAO: proposal with this ID doesn't exist");
    await expect(
      this.instanceDAO
        .connect(this.user1)
        .vote(Number(_id) + 1, this.voteAmount1, Decision.FOR)
    ).to.be.revertedWith("DAO: proposal with this ID doesn't exist");
  });
  it(`DAO-VOTE: vote function works correctly (reverted with "DAO: the voting is over")`, async function (): Promise<void> {
    await this.instanceToken.mint(this.user1.address, this.depositAmount);
    await this.instanceToken
      .connect(this.user1)
      .approve(this.instanceDAO.address, this.depositAmount);
    await this.instanceDAO.connect(this.user1).deposit(this.depositAmount);
    const callData = this.instanceZavod.interface.encodeFunctionData(
      "changeTransportType",
      [this.testType]
    );
    const tx = await this.instanceDAO.addProposal(
      callData,
      this.testRecipient,
      this.testDescription
    );
    await ethers.provider.send("evm_increaseTime", [this.proposalDuration]);
    const { events } = await tx.wait();
    const event = events.find(
      (singleEvent: any) => singleEvent.event === "ProposalAdded"
    );
    const { _id } = event.args;
    await expect(
      this.instanceDAO
        .connect(this.user1)
        .vote(_id, this.voteAmount1, Decision.FOR)
    ).to.be.revertedWith("DAO: the voting is over");
  });
  it(`DAO-VOTE: vote function works correctly (reverted with "DAO: the balance is less than the threshold value" if less)`, async function (): Promise<void> {
    await this.instanceToken.mint(this.user1.address, this.depositAmount);
    await this.instanceToken
      .connect(this.user1)
      .approve(this.instanceDAO.address, this.depositAmount);
    await this.instanceDAO.connect(this.user1).deposit(this.depositAmount);
    const bigAmount = BigNumber.from(this.depositAmount)
      .div(this.threshold)
      .mul(100 - Number(this.threshold))
      .add(1)
      .toString();
    await this.instanceToken.mint(this.user2.address, bigAmount);
    await this.instanceToken
      .connect(this.user2)
      .approve(this.instanceDAO.address, bigAmount);
    await this.instanceDAO.connect(this.user2).deposit(bigAmount);
    const callData = this.instanceZavod.interface.encodeFunctionData(
      "changeTransportType",
      [this.testType]
    );
    const tx = await this.instanceDAO.addProposal(
      callData,
      this.testRecipient,
      this.testDescription
    );
    const { events } = await tx.wait();
    const event = events.find(
      (singleEvent: any) => singleEvent.event === "ProposalAdded"
    );
    const { _id } = event.args;
    await expect(
      this.instanceDAO
        .connect(this.user1)
        .vote(_id, this.voteAmount1, Decision.FOR)
    ).to.be.revertedWith("DAO: the balance is less than the threshold value");
  });
  it(`DAO-VOTE: vote function works correctly (completed with if equal threshold equal to constructor value)`, async function (): Promise<void> {
    await this.instanceToken.mint(this.user1.address, this.depositAmount);
    await this.instanceToken
      .connect(this.user1)
      .approve(this.instanceDAO.address, this.depositAmount);
    await this.instanceDAO.connect(this.user1).deposit(this.depositAmount);
    const bigAmount = BigNumber.from(this.depositAmount)
      .div(this.threshold)
      .mul(100 - Number(this.threshold))
      .toString();
    await this.instanceToken.mint(this.user2.address, bigAmount);
    await this.instanceToken
      .connect(this.user2)
      .approve(this.instanceDAO.address, bigAmount);
    await this.instanceDAO.connect(this.user2).deposit(bigAmount);
    const callData = this.instanceZavod.interface.encodeFunctionData(
      "changeTransportType",
      [this.testType]
    );
    const tx = await this.instanceDAO.addProposal(
      callData,
      this.testRecipient,
      this.testDescription
    );
    const { events } = await tx.wait();
    const event = events.find(
      (singleEvent: any) => singleEvent.event === "ProposalAdded"
    );
    const { _id } = event.args;
    await expect(
      this.instanceDAO
        .connect(this.user1)
        .vote(_id, this.voteAmount1, Decision.FOR)
    ).to.be.ok;
  });
  it(`DAO-VOTE: vote function works correctly (reverted with "DAO: already voted")`, async function (): Promise<void> {
    await this.instanceToken.mint(this.user1.address, this.depositAmount);
    await this.instanceToken
      .connect(this.user1)
      .approve(this.instanceDAO.address, this.depositAmount);
    await this.instanceDAO.connect(this.user1).deposit(this.depositAmount);
    const callData = this.instanceZavod.interface.encodeFunctionData(
      "changeTransportType",
      [this.testType]
    );
    const tx = await this.instanceDAO.addProposal(
      callData,
      this.testRecipient,
      this.testDescription
    );
    const { events } = await tx.wait();
    const event = events.find(
      (singleEvent: any) => singleEvent.event === "ProposalAdded"
    );
    const { _id } = event.args;
    await this.instanceDAO
      .connect(this.user1)
      .vote(_id, this.voteAmount1, Decision.FOR);
    await expect(
      this.instanceDAO
        .connect(this.user1)
        .vote(_id, this.voteAmount1, Decision.FOR)
    ).to.be.revertedWith("DAO: already voted");
  });
};
