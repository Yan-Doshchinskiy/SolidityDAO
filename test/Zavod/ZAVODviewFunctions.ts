import { expect } from "chai";

export default (): void => {
  it(`ZAVOD-VIEW: type equal to constructor argument`, async function (): Promise<void> {
    const type = await this.instanceZavod.getTransportType();
    expect(type).to.equal(this.zavodArguments[0]);
  });
  it(`ZAVOD-VIEW: color equal to constructor argument`, async function (): Promise<void> {
    const color = await this.instanceZavod.getTransportColor();
    expect(color).to.equal(this.zavodArguments[1]);
  });
  it(`ZAVOD-VIEW: price equal to constructor argument`, async function (): Promise<void> {
    const price = await this.instanceZavod.getTransportPrice();
    expect(price).to.equal(this.zavodArguments[2]);
  });
};
