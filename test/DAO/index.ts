// eslint-disable-next-line node/no-missing-import
import hre, { ethers, artifacts, waffle } from "hardhat";
import { Artifact } from "hardhat/types";
import erc20Arguments from "../../arguments/ERC20";
import daoArguments from "../../arguments/DAO";
import viewFunctions from "./viewFunctions";
import depositFunctions from "./depositFunctions";

export default describe("ERC20 contract testing", async function () {
  before(async function () {
    this.ethers = ethers;
    this.hre = hre;
    [this.owner, this.user1, this.user2, this.user3] =
      await ethers.getSigners();
    [
      this.tokenAddress,
      this.minMemberBalance,
      this.minimumQuorum,
      this.proposalDuration,
      this.requisiteMajority,
    ] = daoArguments;
    this.mintAmount = "900000000000000000000";
    this.smallMintAmount = "50000000000000000000";
    this.burnAmount = "400000000000000000000";
    this.depositAmount = "300000000000000000000";
  });
  beforeEach(async function () {
    // ERC20 token contract deploy
    this.erc20Arguments = erc20Arguments;
    const artifactToken: Artifact = await artifacts.readArtifact("ERC20ForDAO");
    this.instanceToken = await waffle.deployContract(
      this.owner,
      artifactToken,
      this.erc20Arguments
    );
    this.tokenAddress = this.instanceToken.address;
    // DAO contract deploy
    this.daoArguments = [
      this.tokenAddress,
      ...daoArguments.slice(1, daoArguments.length),
    ];
    const artifactEthToken: Artifact = await artifacts.readArtifact("DAO");
    this.instanceDAO = await waffle.deployContract(
      this.owner,
      artifactEthToken,
      this.daoArguments
    );
  });
  viewFunctions();
  depositFunctions();
});
