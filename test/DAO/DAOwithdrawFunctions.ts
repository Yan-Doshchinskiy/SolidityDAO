import { expect } from "chai";
import { BigNumber } from "ethers";
import { Decision } from "../../interfaces/DAO";

export default (): void => {
  it(`DAO-WITHDRAW: deposit function works correctly (reverted: "DAO: amount must be positive value")`, async function (): Promise<void> {
    await expect(
      this.instanceDAO.connect(this.user1).withdraw(0)
    ).to.be.revertedWith("DAO: amount must be positive value");
  });
  it(`DAO-WITHDRAW: deposit function works correctly (reverted: "DAO: amount must be less or equal then provided funds")`, async function (): Promise<void> {
    await expect(
      this.instanceDAO.connect(this.user1).withdraw(this.withdrawAmount)
    ).to.be.revertedWith(
      "DAO: amount must be less or equal then provided funds"
    );
  });
  it(`DAO-WITHDRAW: deposit function works correctly`, async function (): Promise<void> {
    await this.instanceToken.mint(this.user1.address, this.mintAmount);
    const balance = await this.instanceToken.balanceOf(this.user1.address);
    expect(balance).to.equal(this.mintAmount);
    await this.instanceToken
      .connect(this.user1)
      .approve(this.instanceDAO.address, this.mintAmount);
    await this.instanceDAO.connect(this.user1).deposit(this.mintAmount);
    const balanceAfterDeposit = await this.instanceToken.balanceOf(
      this.user1.address
    );
    expect(balanceAfterDeposit).to.equal(0);
    await this.instanceDAO.connect(this.user1).withdraw(this.withdrawAmount);
    const balanceAfterWithdraw = await this.instanceToken.balanceOf(
      this.user1.address
    );
    expect(balanceAfterWithdraw).to.equal(this.withdrawAmount);
    const expected = BigNumber.from(this.mintAmount).sub(this.withdrawAmount);
    const totalProvided = await this.instanceDAO.totalProvided();
    expect(totalProvided).to.equal(expected);
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
    const callData2 = this.instanceZavod.interface.encodeFunctionData(
      "changeTransportType",
      [this.testType]
    );
    const tx2 = await this.instanceDAO.addProposal(
      callData2,
      this.testRecipient,
      this.testDescription
    );
    const { events: events2 } = await tx2.wait();
    const event2 = events2.find(
      (singleEvent: any) => singleEvent.event === "ProposalAdded"
    );
    const { _id: _id2 } = event2.args;
    await this.instanceDAO
      .connect(this.user1)
      .vote(_id2, this.voteAmount2, Decision.FOR);
    await expect(
      this.instanceDAO.connect(this.user1).withdraw(this.withdrawAmount3)
    ).to.be.revertedWith("DAO: amount must be less then locked");
  });
};
