import { DeployFunction, DeployResult } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../hardhat-helper";
import { ethers, network } from "hardhat";
import verify from "../utils/verify";
import { saveFrontEndFiles, saveConfig } from "../utils/99-save-frontend-files";
import { NFT, NFT__factory } from "../typechain";

type Contract = NFT;

const contractName = "NFT";

const deployNFT: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId: number | undefined = network.config.chainId;
  let blockConfirmations;

  const isDevelopment = developmentChains.includes(network.name);

  const NAME = "Dapp Punks";
  const SYMBOL = "DPX";
  const COST = ethers.utils.parseUnits("0.01", "ether");
  const MAX_SUPPLY = 10000;
  const MAX_AMOUNT = 10;
  const BASE_URI = "ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/";

  const args = [NAME, SYMBOL, COST, MAX_SUPPLY, MAX_AMOUNT, BASE_URI];

  const nftContract: DeployResult = await deploy("NFT", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: blockConfirmations || 1,
  });

  const nftInstance: NFT = (await ethers.getContractAt(
    "NFT",
    nftContract.address
  )) as NFT;

  const contracts = [
    {
      name: "NFT",
      address: nftInstance.address,
    },
  ];

  saveFrontEndFiles(nftInstance, contractName);
  saveConfig(contracts);

  log(`Deployed NFT to ${nftInstance.address}`);
  log("---------------------------------------------------------------");

  if (!isDevelopment && process.env.ETHERSCAN_API_KEY) {
    await verify(nftInstance.address, args);
    log(`Verified NFT on Etherscan`);
    log("---------------------------------------------------------------");
  }
};

deployNFT.tags = ["all", "Airdrop"];
export default deployNFT;
