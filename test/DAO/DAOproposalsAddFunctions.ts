import { expect } from "chai";
import { ProposalStatus } from "../../interfaces/DAO";

export default (): void => {
  it(`DAO-ADD: addProposal function works correctly (completed)`, async function (): Promise<void> {
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
    const { timestamp } = await this.hre.ethers.provider.getBlock("latest");
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
      0,
      0,
      0,
      this.testRecipient,
      callData,
      this.testDescription,
    ];
    expect(result).to.deep.equal(expectedResult);
  });
  it(`DAO-ADD: only owner can call addProposal function (reverted)`, async function (): Promise<void> {
    const callData = this.instanceZavod.interface.encodeFunctionData(
      "changeTransportType",
      [this.testType]
    );
    await expect(
      this.instanceDAO
        .connect(this.user1)
        .addProposal(callData, this.testRecipient, this.testDescription)
    ).to.be.revertedWith("AccessControl:");
  });
  it(`DAO-ADD: getProposal function works correctly (revert if proposal does not exist)`, async function (): Promise<void> {
    await expect(this.instanceDAO.getProposal(100)).to.be.revertedWith(
      "DAO: proposal does not exist"
    );
  });
};
