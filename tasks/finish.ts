import { task } from "hardhat/config";
import { Chains } from "../interfaces/enums";

// npx hardhat finish --calldata {bytes32} --recipient {address} --description {string} --network bscTestnet
task("finish")
  .addParam("id")
  .setAction(async ({ id }: { [key: string]: string }, hre) => {
    const net = await hre.network.name;
    if (net !== Chains.RINKEBY) {
      throw new Error(`Invalid chain. Expected chain: ${Chains.RINKEBY}`);
    }
    const Contract = await hre.ethers.getContractAt(
      "DAO",
      process.env.DAO_CONTRACT_ADDRESS as string
    );
    await Contract.finishProposal(id);
  });
