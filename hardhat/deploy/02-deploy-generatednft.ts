import { DeployFunction, DeployResult } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../hardhat-helper";
import { saveFrontEndFiles, saveConfig } from "./99-save-frontend-files";
import { ethers, network } from "hardhat";
import verify from "../utils/verify";
import { GeneratedNFT } from "../typechain";

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
  const COST = ethers.utils.parseUnits("0.1", "ether");
  const BASE_URI = "ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/";

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

  saveFrontEndFiles(generatedNftInstance, "GeneratedNFT");
  saveConfig(generatedNftInstance, "GeneratedNFT");

  log(`Deployed GeneratedNFT to ${generatedNftInstance.address}`);

  if (!isDevelopment && process.env.ETHERSCAN_API_KEY) {
    await verify(generatedNftInstance.address, args);
  }
};

deployGeneratedNFT.tags = ["all", "GeneratedNFT"];
export default deployGeneratedNFT;
