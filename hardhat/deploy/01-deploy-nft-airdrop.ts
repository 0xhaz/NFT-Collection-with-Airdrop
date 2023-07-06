import { DeployFunction, DeployResult } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../hardhat-helper";
import { saveFrontEndFiles, saveConfig } from "../utils/99-save-frontend-files";
import { network, ethers } from "hardhat";
import verify from "../utils/verify";
import { generateMerkleTree } from "../scripts/00-generate-merkle-tree";
import { MerkleTree } from "merkletreejs";
import { Airdrop } from "../typechain";

const deployAirdrop: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId: number | undefined = network.config.chainId;
  let blockConfirmations;

  const isDevelopment = developmentChains.includes(network.name);

  const nftContract = await deployments.get("NFT");
  const nftAddress = nftContract.address;

  const tree: MerkleTree = await generateMerkleTree();

  const root = tree.getHexRoot();
  const nftTokenURIs: string =
    "ipfs://QmT9JJuUya27XKThLvnsB7r1BxTHAyAwRaZc56Ji54h3Fx/";

  const args = [root, nftTokenURIs, nftAddress];

  const airdrop: DeployResult = await deploy("Airdrop", {
    from: deployer,
    args: args,
    log: true,
  });

  const airdropInstance: Airdrop = (await ethers.getContractAt(
    "Airdrop",
    airdrop.address
  )) as Airdrop;

  const contracts = [{ name: "Airdrop", address: airdropInstance.address }];

  saveFrontEndFiles(airdropInstance, "Airdrop");
  saveConfig(contracts);

  log(`Deployed Airdrop to ${airdropInstance.address}`);

  if (!isDevelopment && process.env.ETHERSCAN_API_KEY) {
    await verify(airdrop.address, args);
  }
};

deployAirdrop.tags = ["all", "Airdrop"];
export default deployAirdrop;
