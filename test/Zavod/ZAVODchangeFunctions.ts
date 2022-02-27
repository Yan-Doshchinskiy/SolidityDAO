import { expect } from "chai";

export default (): void => {
  it(`ZAVOD-CHANGE: changeTransportType function works correctly`, async function (): Promise<void> {
    const type = await this.instanceZavod.getTransportType();
    expect(type).to.equal(this.zavodArguments[0]);
    await this.instanceZavod.changeTransportType(this.testType);
    const newType = await this.instanceZavod.getTransportType();
    expect(newType).to.equal(this.testType);
  });
  it(`ZAVOD-CHANGE: changeTransportColor function works correctly`, async function (): Promise<void> {
    const color = await this.instanceZavod.getTransportColor();
    expect(color).to.equal(this.zavodArguments[1]);
    await this.instanceZavod.changeTransportColor(this.testColor);
    const newColor = await this.instanceZavod.getTransportColor();
    expect(newColor).to.equal(this.testColor);
  });
  it(`ZAVOD-CHANGE: changeTransportPrice function works correctly`, async function (): Promise<void> {
    const price = await this.instanceZavod.getTransportPrice();
    expect(price).to.equal(this.zavodArguments[2]);
    await this.instanceZavod.changeTransportPrice(this.testPrice);
    const newPrice = await this.instanceZavod.getTransportPrice();
    expect(newPrice).to.equal(this.testPrice);
  });
};
