// eslint-disable-next-line node/no-missing-import
import { ethers, artifacts, waffle } from "hardhat";
import { Artifact } from "hardhat/types";
import zavodArguments, {
  VehicleColor,
  VehicleType,
} from "../../arguments/Zavod";
import viewFunctions from "./ZAVODviewFunctions";
import changeFunctions from "./ZAVODchangeFunctions";

export default describe("Zavod contract testing", async function () {
  before(async function () {
    this.ethers = ethers;
    [this.owner] = await ethers.getSigners();
    this.zavodArguments = zavodArguments;
    this.testType = VehicleType.CAR;
    this.testColor = VehicleColor.BLUE;
    this.testPrice = "200000000000000000000";
  });
  beforeEach(async function () {
    const artifactZavod: Artifact = await artifacts.readArtifact("Zavod");
    this.instanceZavod = await waffle.deployContract(
      this.owner,
      artifactZavod,
      this.zavodArguments
    );
  });
  viewFunctions();
  changeFunctions();
});
