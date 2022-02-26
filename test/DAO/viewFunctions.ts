import { expect } from "chai";

export default (): void => {
  it(`DAO-VIEW: initial totalProvided value equal to zero`, async function (): Promise<void> {
    const totalProvided = await this.instanceDAO.totalProvided();
    expect(totalProvided).to.equal(0);
  });
  it(`DAO-VIEW: dao token address equal to constructor argument`, async function (): Promise<void> {
    const address = await this.instanceDAO.TokenDAO();
    expect(address).to.equal(this.daoArguments[0]);
  });
  it(`DAO-VIEW: minMemberBalance equal to constructor argument`, async function (): Promise<void> {
    const minMemberBalance = await this.instanceDAO.minMemberBalance();
    expect(minMemberBalance).to.equal(this.daoArguments[1]);
  });
  it(`DAO-VIEW: minimumQuorum equal to constructor argument`, async function (): Promise<void> {
    const quorum = await this.instanceDAO.minimumQuorum();
    expect(quorum).to.equal(this.daoArguments[2]);
  });
  it(`DAO-VIEW: proposalDuration equal to constructor argument`, async function (): Promise<void> {
    const duration = await this.instanceDAO.proposalDuration();
    expect(duration).to.equal(this.daoArguments[3]);
  });
  it(`DAO-VIEW: requisiteMajority equal to constructor argument`, async function (): Promise<void> {
    const majority = await this.instanceDAO.requisiteMajority();
    expect(majority).to.equal(this.daoArguments[4]);
  });
};
