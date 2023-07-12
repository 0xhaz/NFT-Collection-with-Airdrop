import { DeployFunction, DeployResult } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../hardhat-helper";
import { saveFrontEndFiles, saveConfig } from "../utils/99-save-frontend-files";
import { ethers, network } from "hardhat";
import verify from "../utils/verify";
import { GeneratedNFT, Airdrop } from "../typechain";

const deployGeneratedNFT: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId: number | undefined = network.config.chainId;
  let blockConfirmations;

  const isDevelopment = developmentChains.includes(network.name);

  const airdropContract = await deployments.get("Airdrop");
  const airdropAddress = airdropContract.address;

  const NAME = "AI Punks";
  const SYMBOL = "AIX";

  const args = [airdropAddress, NAME, SYMBOL];

  const generatedNft: DeployResult = await deploy("GeneratedNFT", {
    from: deployer,
    args: args,
    log: true,
  });

  const generatedNftInstance: GeneratedNFT = (await ethers.getContractAt(
    "GeneratedNFT",
    generatedNft.address
  )) as GeneratedNFT;

  //  Set approved contract address on Aidrop contract
  const airdropInstance: Airdrop = (await ethers.getContractAt(
    "Airdrop",
    airdropAddress
  )) as Airdrop;

  await airdropInstance.setApprovedContract(generatedNftInstance.address);

  log(`Set approved contract address on Airdrop contract`);
  log("---------------------------------------------------------------");

  const contracts = [
    {
      name: "GeneratedNFT",
      address: generatedNftInstance.address,
    },
  ];

  saveFrontEndFiles(generatedNftInstance, "GeneratedNFT");
  saveConfig(contracts);

  log(`Deployed GeneratedNFT to ${generatedNftInstance.address}`);
  log("---------------------------------------------------------------");

  if (!isDevelopment && process.env.ETHERSCAN_API_KEY) {
    await verify(generatedNftInstance.address, args);
    log(`Verified GeneratedNFT on Etherscan`);
    log("---------------------------------------------------------------");
  }
};

deployGeneratedNFT.tags = ["all", "GeneratedNFT"];
export default deployGeneratedNFT;
