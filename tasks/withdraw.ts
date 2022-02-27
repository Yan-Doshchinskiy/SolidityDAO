import { task } from "hardhat/config";
import { Chains } from "../interfaces/enums";

// npx hardhat withdraw --amount {AMOUNT} --network rinkeby
task("withdraw")
  .addParam("amount")
  .setAction(async ({ amount }: { amount: string }, hre) => {
    const net = await hre.network.name;
    if (net !== Chains.RINKEBY) {
      throw new Error(`Invalid chain. Expected chain: ${Chains.RINKEBY}`);
    }
    const Contract = await hre.ethers.getContractAt(
      "DAO",
      process.env.DAO_CONTRACT_ADDRESS as string
    );
    await Contract.withdraw(amount);
  });
