// eslint-disable-next-line node/no-missing-import
import hre, { ethers, artifacts, waffle } from "hardhat";
import { Artifact } from "hardhat/types";
import erc20Arguments from "../../arguments/ERC20";
import daoArguments from "../../arguments/DAO";
import viewFunctions from "./DAOviewFunctions";
import depositFunctions from "./DAOdepositFunctions";
import proposalsAddFunctions from "./DAOproposalsAddFunctions";
import proposalsVoteFunctions from "./DAOproposalsVoteFunctions";
import proposalsFinishFunctions from "./DAOproposalsFinishFunctions";
import withdrawFunctions from "./DAOwithdrawFunctions";
import zavodArguments, {
  VehicleColor,
  VehicleType,
} from "../../arguments/Zavod";

export default describe("DAO contract testing", async function () {
  before(async function () {
    this.ethers = ethers;
    this.hre = hre;
    [this.owner, this.user1, this.user2, this.user3] =
      await ethers.getSigners();
    [
      this.tokenAddress,
      this.threshold,
      this.minimumQuorum,
      this.proposalDuration,
      this.requisiteMajority,
    ] = daoArguments;
    this.mintAmount = "900000000000000000000";
    this.smallMintAmount = "50000000000000000000";
    this.burnAmount = "400000000000000000000";
    this.depositAmount = "300000000000000000000";
    this.depositAmount2 = "150000000000000000000";
    this.withdrawAmount = "200000000000000000000";
    this.withdrawAmount2 = "100000000000000000000";
    this.withdrawAmount3 = "600000000000000000000";
    this.voteAmount1 = "100000000000000000000";
    this.voteAmount2 = "120000000000000000000";
    this.testType = VehicleType.CAR;
    this.testColor = VehicleColor.BLUE;
    this.testPrice = "200000000000000000000";
    this.testRecipient = this.owner.address;
    this.testDescription = "Test Description";
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
    // Zavod contract
    this.zavodArguments = zavodArguments;
    const artifactZavod: Artifact = await artifacts.readArtifact("Zavod");
    this.instanceZavod = await waffle.deployContract(
      this.owner,
      artifactZavod,
      this.zavodArguments
    );
  });
  viewFunctions();
  depositFunctions();
  withdrawFunctions();
  proposalsAddFunctions();
  proposalsVoteFunctions();
  proposalsFinishFunctions();
});
