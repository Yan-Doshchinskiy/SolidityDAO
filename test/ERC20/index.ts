// eslint-disable-next-line node/no-missing-import
import { ethers, artifacts, waffle } from "hardhat";
import { Artifact } from "hardhat/types";
import erc20Arguments from "../../arguments/ERC20";
import viewFunctions from "./ERC20viewFunctions";
import supplyFunctions from "./ERC20supplyFunctions";

export default describe("ERC20 contract testing", async function () {
  before(async function () {
    this.ethers = ethers;
    [this.owner, this.brridgeAccount, this.randomUser] =
      await ethers.getSigners();
    this.erc20Arguments = erc20Arguments;
    this.testMintAmount = "20000000000000000000000000";
    this.testBurnAmount = "5000000000000000000000000";
  });

  beforeEach(async function () {
    const artifactEthToken: Artifact = await artifacts.readArtifact(
      "ERC20ForDAO"
    );
    this.instance = await waffle.deployContract(
      this.owner,
      artifactEthToken,
      this.erc20Arguments
    );
  });
  viewFunctions();
  supplyFunctions();
});
