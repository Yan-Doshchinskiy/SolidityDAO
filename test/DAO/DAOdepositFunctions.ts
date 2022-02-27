import { expect } from "chai";

export default (): void => {
  it(`DAO-DEPOSIT: deposit function works correctly`, async function (): Promise<void> {
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
    const daoBalance = await this.instanceToken.balanceOf(
      this.instanceDAO.address
    );
    expect(daoBalance).to.equal(this.mintAmount);
    const totalProvided = await this.instanceDAO.totalProvided();
    expect(totalProvided).to.equal(this.mintAmount);
  });
};
