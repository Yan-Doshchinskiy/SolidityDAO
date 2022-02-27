import { expect } from "chai";
import { Decision, ProposalStatus } from "../../interfaces/DAO";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

export default (): void => {
  it(`DAO-FINISH: finishProposal function works correctly (reverted with "DAO: proposal with this ID doesn't exist")`, async function (): Promise<void> {
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
      this.instanceDAO.connect(this.user1).finishProposal(0)
    ).to.be.revertedWith("DAO: proposal with this ID doesn't exist");
    await expect(
      this.instanceDAO.connect(this.user1).finishProposal(Number(_id) + 1)
    ).to.be.revertedWith("DAO: proposal with this ID doesn't exist");
  });
  it(`DAO-FINISH: finishProposal function works correctly (reverted with "DAO: the voting has not been completed yet")`, async function (): Promise<void> {
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
      this.instanceDAO.connect(this.user1).finishProposal(_id)
    ).to.be.revertedWith("DAO: the voting has not been completed yet");
  });
  it(`DAO-FINISH: finishProposal function works correctly (reverted with "DAO: already finished")`, async function (): Promise<void> {
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
    this.instanceDAO.connect(this.user1).finishProposal(_id);
    await expect(
      this.instanceDAO.connect(this.user1).finishProposal(_id)
    ).to.be.revertedWith("DAO: already finished");
  });
  it(`DAO-FINISH: finishProposal function works correctly (completed: Status Rejected with quorum)`, async function (): Promise<void> {
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
    await this.instanceDAO.connect(this.user1).vote(_id, 1, Decision.FOR);
    await ethers.provider.send("evm_increaseTime", [this.proposalDuration]);
    await this.instanceDAO.connect(this.user1).finishProposal(_id);
    const { status } = await this.instanceDAO.getProposal(_id);
    expect(status).to.be.equal(ProposalStatus.REJECTED);
  });
  it(`DAO-FINISH: finishProposal function works correctly (completed: Status Rejected with majority)`, async function (): Promise<void> {
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
      .vote(_id, this.depositAmount, Decision.AGAINST);
    await ethers.provider.send("evm_increaseTime", [this.proposalDuration]);
    await this.instanceDAO.connect(this.user1).finishProposal(_id);
    const { status } = await this.instanceDAO.getProposal(_id);
    expect(status).to.be.equal(ProposalStatus.REJECTED);
  });
  it(`DAO-FINISH: finishProposal function works correctly (completed: calldate executed)`, async function (): Promise<void> {
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
    const halfAmount = BigNumber.from(this.depositAmount)
      .div(100)
      .mul(100 - Number(this.requisiteMajority))
      .add(1)
      .toString();
    await this.instanceDAO
      .connect(this.user1)
      .vote(_id, halfAmount, Decision.FOR);
    await ethers.provider.send("evm_increaseTime", [this.proposalDuration]);
    await this.instanceDAO
      .connect(this.user1)
      .finishProposal(_id, { value: "1000000000000000000" });
    await ethers.provider.send("evm_increaseTime", [this.proposalDuration]);
    await ethers.provider.send("evm_increaseTime", [this.proposalDuration]);
    await this.instanceDAO.getProposal(_id);
    const { status } = await this.instanceDAO.getProposal(_id);
    expect(status).to.be.equal(ProposalStatus.SUCCESS);
  });
};
